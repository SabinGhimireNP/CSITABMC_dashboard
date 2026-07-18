"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_URL;

const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  return response.json();
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Store user data in localStorage and react-query cache
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.setQueryData(["auth", "user"], data.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  const logout = () => {
    localStorage.removeItem("user");
    queryClient.setQueryData(["auth", "user"], null);
    queryClient.clear();
  };

  return logout;
};

export const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useUser = () => {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: () => getStoredUser(),
    initialData: getStoredUser,
    staleTime: Infinity,
  });
};