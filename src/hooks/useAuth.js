"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient, { clearAuth, silentRefresh } from "@/lib/axios";
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
      // Store user profile and approximate access token expiry (15 min).
      // The backend sets httpOnly cookies — we track expiry client-side so
      // we can proactively refresh without waiting for a 401.
      const accessTokenExpiry = Date.now() + 15 * 60 * 1000;
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
 * Mount this ONCE at the top of the authenticated layout. It:
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
        const ok = await silentRefresh();
        if (!ok) {
          clearAuth();
        } else {
          setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
        timerRef.current = setTimeout(() => {
          silentRefresh().then((ok) => {
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