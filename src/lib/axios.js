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
// refresh endpoint (which reads the httpOnly refresh_token cookie and sets a
// fresh access_token cookie), then retry the original request.
//
// A single-flight guard prevents multiple concurrent 401s from firing several
// refresh requests at once.

let isRefreshing = false;
let failedQueue = [];

const REFRESH_URL = "/users/refresh-token/";

// Clear the persisted auth state so the app redirects to login.
export function clearAuth() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("auth-storage");
    } catch (e) {
      /* ignore */
    }
    window.location.href = "/login";
  }
}

// Resolve (or reject) all queued requests once the refresh completes.
function flushQueue(error) {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve()
  );
  failedQueue = [];
}

/**
 * Attempt a silent token refresh. Returns true on success, false on failure.
 * Updates the accessTokenExpiry in the store on success.
 */
export async function silentRefresh() {
  try {
    await apiClient.post(REFRESH_URL);
    // Update the expiry in the store. The backend's ACCESS_TOKEN_LIFETIME is
    // read from settings — we approximate it here as 15 minutes (900s) which is
    // the typical simplejwt default. Adjust if your backend uses a different value.
    const { useAuthStore } = await import("@/lib/store/authStore");
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    useAuthStore.getState().setAccessTokenExpiry(expiry);
    return true;
  } catch {
    return false;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt a refresh for 401 responses that:
    // 1. Haven't already retried (prevents infinite loop)
    // 2. Are not the refresh endpoint itself
    // 3. Are not the login endpoint (we handle login errors differently)
    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes(REFRESH_URL) ||
      originalRequest?.url?.includes("/login/")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another request is already refreshing — wait for it, then retry.
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest))
        .catch(() => Promise.reject(error));
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const refreshed = await silentRefresh();
      if (refreshed) {
        flushQueue(null);
        return apiClient(originalRequest);
      } else {
        flushQueue(new Error("Refresh failed"));
        clearAuth();
        return Promise.reject(error);
      }
    } catch (refreshError) {
      flushQueue(refreshError);
      clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;