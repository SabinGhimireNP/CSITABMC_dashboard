"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { AdminsPageContent } from "./_components/AdminsPageContent";

export default function AdminAccessPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.user_role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || user.user_role !== "admin") {
    return null; // Or a loading spinner
  }

  return <AdminsPageContent />;
}