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

function hasUserChanged(current, incoming) {
  if (!current || !incoming) return false;
  if (current.id !== incoming.id) return true;
  if (current.role !== incoming.role) return true;
  if (current.email !== incoming.email) return true;
  if (current.name !== incoming.name) return true;
  if (current.first_name !== incoming.first_name) return true;
  if (current.last_name !== incoming.last_name) return true;
  if (current.username !== incoming.username) return true;
  if (current.role_label !== incoming.role_label) return true;

  const currPerms = Array.isArray(current.permissions) ? current.permissions : [];
  const nextPerms = Array.isArray(incoming.permissions) ? incoming.permissions : [];
  if (currPerms.length !== nextPerms.length) return true;
  for (let i = 0; i < currPerms.length; i++) {
    if (currPerms[i] !== nextPerms[i]) return true;
  }
  return false;
}

/** Authenticated user's own profile (display name etc.). */
export const useCurrentUser = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["users", "me", user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get("/users/me/");
      const currentUser = useAuthStore.getState().user;
      if (currentUser && hasUserChanged(currentUser, data)) {
        useAuthStore.getState().updateUser(data);
      }
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};
