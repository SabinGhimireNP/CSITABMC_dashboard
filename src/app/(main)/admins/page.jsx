"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { AdminsPageContent } from "./_components/AdminsPageContent";

export default function AdminAccessPage() {
  const { user } = useAuthStore();
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    // Wait for rehydration: `user` is null on first render after a refresh.
    // Redirecting on null would bounce an admin from /admins → /dashboard.
    if (!hasHydrated) return;
    if (user && user.user_role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, hasHydrated, router]);

  if (!hasHydrated || !user || user.user_role !== "admin") {
    return null; // Or a loading spinner
  }

  return <AdminsPageContent />;
}