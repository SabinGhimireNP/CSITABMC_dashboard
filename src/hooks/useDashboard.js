"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/lib/store/authStore";
import { getUserRole } from "@/lib/roles";

/**
 * Role-aware dashboard overview.
 *
 * The backend aggregates statistics and the latest records for every module the
 * authenticated user can view and omits the rest, so the response shape is
 * `{ role, modules: { [key]: { stats, recent } | { error: true } } }`.
 *
 * The query key keeps the "dashboard" prefix so existing
 * `invalidateQueries({ queryKey: ["dashboard"] })` calls still refresh it.
 */
export const useDashboardOverview = () => {
  const user = useAuthStore((state) => state.user);
  const role = getUserRole(user);

  return useQuery({
    queryKey: ["dashboard", "overview", role],
    queryFn: async () => {
      const { data } = await apiClient.get("/dashboard/overview/");
      return data;
    },
    enabled: !!role,
    staleTime: 60 * 1000,
  });
};

/** Authenticated user's own profile (display name etc.). */
export const useCurrentUser = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["users", "me", user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get("/users/me/");
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};
