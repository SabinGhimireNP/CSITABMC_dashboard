"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient, { ACCESS_TOKEN_TTL_MS, clearAuth, refreshSession } from "@/lib/axios";
import { useAuthStore } from "@/lib/store/authStore";
import { createThrottle } from "@/lib/throttle";

// How many ms before expiry to proactively refresh (2 minutes).
const REFRESH_BUFFER_MS = 2 * 60 * 1000;

const loginUser = createThrottle(async (credentials) => {
  const response = await apiClient.post("/login/", credentials);
  return response.data;
});

export const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationKey: ["login"],
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Store user profile and approximate access token expiry (1 hour, the
      // backend's ACCESS_TOKEN_LIFETIME). The backend sets httpOnly cookies —
      // we track expiry client-side so we can refresh before a 401.
      const accessTokenExpiry = Date.now() + ACCESS_TOKEN_TTL_MS;
      setUser(data.user, accessTokenExpiry);
    },
  });
};

export const useLogout = () => {
  const clearUser = useAuthStore((state) => state.clearUser);
  const queryClient = useQueryClient();
  const router = useRouter();

  const logout = async () => {
    try {
      // Tell the backend to blacklist the refresh token and clear cookies.
      await apiClient.post("/users/logout/");
    } catch {
      // Best-effort — clear client state regardless.
    } finally {
      clearUser();
      queryClient.clear();
      router.replace("/login");
    }
  };

  return logout;
};

/**
 * Returns the authenticated user's profile from the zustand store.
 * The data is persisted to localStorage so it survives page refreshes.
 */
export const useUser = () => {
  return useAuthStore((state) => state.user);
};

/**
 * Returns whether a user is currently authenticated.
 */
export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.isAuthenticated);
};

/**
 * Background token refresh hook.
 *
 * Mounted ONCE, by AuthGuard. It shares the interceptor's single-flight
 * refresh, so the timer and concurrent 401s never refresh twice. It:
 * 1. On mount: immediately checks if the token is close to expiry and refreshes.
 * 2. Sets a timer to refresh again 2 minutes before the next expiry.
 * 3. If refresh fails the user is silently cleared and redirected to login.
 */
export const useTokenRefresh = () => {
  const accessTokenExpiry = useAuthStore((state) => state.accessTokenExpiry);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const timerRef = useRef(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsInitializing(false);
      return;
    }

    const scheduleRefresh = async (expiry) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      if (!expiry) {
        setIsInitializing(false);
        return;
      }

      const msUntilRefresh = expiry - Date.now() - REFRESH_BUFFER_MS;

      if (msUntilRefresh <= 0) {
        // Token is already within the buffer window (or expired) — refresh now.
        const ok = await refreshSession();
        if (!ok) {
          clearAuth();
        } else {
          setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
        timerRef.current = setTimeout(() => {
          refreshSession().then((ok) => {
            if (!ok) clearAuth();
          });
        }, msUntilRefresh);
      }
    };

    scheduleRefresh(accessTokenExpiry);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, accessTokenExpiry]);

  return { isInitializing };
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/users/password-reset/", payload);
      return data;
    },
  });
};

export const useConfirmPasswordReset = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/users/password-reset-confirm/", payload);
      return data;
    },
  });
};

export const useChangePassword = () => {
  const setAccessTokenExpiry = useAuthStore((state) => state.setAccessTokenExpiry);
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/users/change-password/", payload);
      return data;
    },
    // The backend signs out other sessions and re-issues this browser's cookies.
    onSuccess: () => setAccessTokenExpiry(Date.now() + ACCESS_TOKEN_TTL_MS),
  });
};

/** Re-reads the signed-in user (role, label, permissions) from the backend. */
export async function fetchCurrentUser() {
  const { data } = await apiClient.get("/users/me/");
  return data;
}