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
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Don't render the login page if the user is authenticated.
  if (isAuthenticated) return null;

  return children;
}
