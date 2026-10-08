"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useTokenRefresh } from "@/hooks/useAuth";

/**
 * AuthGuard
 *
 * Wraps authenticated routes. Immediately redirects unauthenticated visitors
 * to /login — even if they manually type a URL into the address bar.
 *
 * Also mounts the background token-refresh schedule so the access token is
 * silently renewed before it expires, keeping the session alive proactively.
 */
export function AuthGuard({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();
  
  // Mount background refresh timer and get initialization state
  const { isInitializing } = useTokenRefresh();

  useEffect(() => {
    // Wait for zustand persist to rehydrate from localStorage before
    // deciding. Otherwise a refresh reads isAuthenticated === false and
    // bounces to /login, which then bounces to /dashboard.
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, hasHydrated, router]);

  // While Zustand hydrates from localStorage on first render, or while the token
  // is being proactively refreshed, block rendering of the dashboard to prevent
  // data leakage on stale sessions.
  if (!hasHydrated || !isAuthenticated || isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return children;
}
