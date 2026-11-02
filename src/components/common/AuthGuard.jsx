"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useTokenRefresh } from "@/hooks/useAuth";
import { canAccessRoute } from "@/lib/permissions";
import { AccessDenied } from "./AccessDenied";


/**
 * AuthGuard
 *
 * Wraps authenticated routes. Immediately redirects unauthenticated visitors
 * to /login with returnUrl preserved.
 *
 * Also checks role permissions against the current route, displaying AccessDenied
 * if the user role is not permitted for the section.
 *
 * Mounts the background token-refresh schedule so the access token is
 * silently renewed before it expires.
 */
export function AuthGuard({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  
  // Mount background refresh timer and get initialization state
  const { isInitializing } = useTokenRefresh();

  useEffect(() => {
    // Wait for zustand persist to rehydrate from localStorage before deciding.
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      const returnParam = pathname && pathname !== "/login" ? `?returnUrl=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${returnParam}`);
    }
  }, [isAuthenticated, hasHydrated, router, pathname]);

  // While hydrating or refreshing tokens on initial load, block rendering
  if (!hasHydrated || !isAuthenticated || isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Check route-level permissions
  if (!canAccessRoute(user, pathname)) {
    return <AccessDenied />;
  }


  return children;
}
