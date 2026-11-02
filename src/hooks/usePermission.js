"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { hasPermission, canAccessRoute } from "@/lib/permissions";
import { getUserRole } from "@/lib/roles";

export function usePermission() {
  const user = useAuthStore((state) => state.user);

  return useMemo(() => {
    const role = getUserRole(user);
    return {
      role,
      roleLabel: user?.role_label || role || "",
      user,
      isSuperadmin: role === "superadmin",
      isAdmin: role === "superadmin" || role === "admin",
      can: (permission) => hasPermission(user, permission),
      canAccess: (path) => canAccessRoute(user, path),
    };
  }, [user]);
}
