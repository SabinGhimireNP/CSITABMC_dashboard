"use client";

import { usePermission } from "@/hooks/usePermission";
import { AccessDenied } from "@/components/common/AccessDenied";
import { AdminsPageContent } from "./_components/AdminsPageContent";

export default function AdminAccessPage() {
  const { isSuperadmin } = usePermission();

  if (!isSuperadmin) {
    return (
      <AccessDenied
        requiredAction="manage administrative accounts"
        description="Only users with the Superadmin role are authorized to view and manage user accounts and system credentials."
      />
    );
  }

  return <AdminsPageContent />;
}