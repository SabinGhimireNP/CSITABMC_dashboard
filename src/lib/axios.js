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
let pendingQueue = [];

const REFRESH_URL = "/users/refresh-token/";

// Clear the persisted auth state so the app redirects to login.
function clearAuth() {
  if (typeof window !== "undefined") {
    try {
      // Remove the persisted zustand auth store from localStorage.
      localStorage.removeItem("auth-storage");
    } catch (e) {
      /* ignore */
    }
    window.location.href = "/login";
  }
}

// Resolve (or reject) all queued requests once the refresh completes.
function flushQueue(error) {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve()
  );
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt a refresh for 401 responses that haven't already retried.
    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes(REFRESH_URL)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another request is already refreshing — wait for it, then retry.
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      // The backend reads the httpOnly refresh_token cookie and sets a new
      // access_token cookie. withCredentials handles the cookie round-trip.
      await apiClient.post(REFRESH_URL);
      flushQueue(null);
      return apiClient(originalRequest);
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