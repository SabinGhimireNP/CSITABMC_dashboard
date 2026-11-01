"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { AdminsPageContent } from "./_components/AdminsPageContent";
import { isAdminRole } from "@/lib/roles";

export default function AdminAccessPage() {
  const { user } = useAuthStore();
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    // Wait for rehydration: `user` is null on first render after a refresh.
    // Redirecting on null would bounce an admin from /admins → /dashboard.
    // Superadmins and Admins may stay; CMS users are sent back to the dashboard.
    if (!hasHydrated) return;
    if (user && !isAdminRole(user)) {
      router.replace("/dashboard");
    }
  }, [user, hasHydrated, router]);

  if (!hasHydrated || !user || !isAdminRole(user)) {
    return null; // Or a loading spinner
  }

  return <AdminsPageContent />;
}