"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

/**
 * GuestGuard
 *
 * Wraps unauthenticated routes (login). Redirects already-authenticated
 * users to the dashboard so they can't accidentally hit /login while
 * logged in.
 */
export function GuestGuard({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    // Wait for rehydration: on a refresh the store briefly reports logged-out.
    // Redirecting before hydration would bounce an authenticated user from
    // their current page → /login → /dashboard.
    if (!hasHydrated) return;
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, hasHydrated, router]);

  // While hydrating, show a spinner instead of flashing the login page to an
  // already-authenticated user (and don't render login when authenticated).
  if (!hasHydrated || isAuthenticated) {
    if (!hasHydrated) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      );
    }
    return null;
  }

  return children;
}
