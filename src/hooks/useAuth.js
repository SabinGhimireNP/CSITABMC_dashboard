"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/lib/store/authStore";
import { createThrottle } from "@/lib/throttle";

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
      // Store user profile in the zustand auth store (persisted to localStorage)
      setUser(data.user);
    },
  });
};

export const useLogout = () => {
  const clearUser = useAuthStore((state) => state.clearUser);
  const queryClient = useQueryClient();

  const logout = () => {
    // Clear the user profile from the zustand auth store
    clearUser();
    // Clear any cached server data (notices, members, etc.)
    queryClient.clear();
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