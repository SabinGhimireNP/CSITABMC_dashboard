import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  // Do NOT hardcode Content-Type here. Axios auto-detects the correct header
  // per request:
  //   - plain objects/JSON → "application/json"
  //   - FormData → "multipart/form-data" (with boundary, required by the
  //     backend's MultiPartParser for file uploads)
  //   - URLSearchParams → "application/x-www-form-urlencoded"
  // A hardcoded "application/json" default breaks file uploads because the
  // backend receives the FormData body without the proper multipart encoding.
  // The Django backend authenticates via httpOnly cookies; credentials must
  // be included on cross-origin requests for the existing auth to work.
  withCredentials: true,
});

// ── Refresh-token handling ────────────────────────────────────────────────
// The backend uses cookie-based JWT auth. When the access token expires the
// API responds 401. Instead of forcing the user to log in again, we call the
// refresh endpoint (which reads the httpOnly refresh_token cookie, rotates it
// and sets a fresh access_token cookie), then retry the original request.
//
// One shared single-flight promise serves both this interceptor and the
// background refresh timer, so concurrent 401s and a firing timer never send
// more than one refresh request at a time.

const REFRESH_URL = "/users/refresh-token/";

/** Matches the backend's 1-hour ACCESS_TOKEN_LIFETIME. */
export const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;

let refreshPromise = null;
// When the last successful refresh completed; requests sent before it carried
// the old access token and can simply be retried.
let lastRefreshAt = 0;

// Clear the persisted auth state so the app redirects to login.
export function clearAuth() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("auth-storage");
    } catch (e) {
      /* ignore */
    }
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
}

/**
 * Refresh the session once, sharing the in-flight request with every caller.
 * Resolves true on success, false on failure (the backend has then cleared
 * the session cookies).
 */
export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        await apiClient.post(REFRESH_URL);
        lastRefreshAt = Date.now();
        const { useAuthStore } = await import("@/lib/store/authStore");
        useAuthStore.getState().setAccessTokenExpiry(Date.now() + ACCESS_TOKEN_TTL_MS);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  config._sentAt = Date.now();
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt a refresh for 401 responses that:
    // 1. Haven't already retried (prevents infinite loops)
    // 2. Are not the refresh endpoint itself
    // 3. Are not the login endpoint (we handle login errors differently)
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes(REFRESH_URL) ||
      originalRequest.url?.includes("/login/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Sent with an access token that a refresh has since replaced: retry as is.
    if (originalRequest._sentAt && originalRequest._sentAt < lastRefreshAt) {
      return apiClient(originalRequest);
    }

    const refreshed = await refreshSession();
    if (!refreshed) {
      clearAuth();
      return Promise.reject(error);
    }
    return apiClient(originalRequest);
  }
);

export default apiClient;
