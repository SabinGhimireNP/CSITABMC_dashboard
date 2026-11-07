"use client";

import { usePermission } from "@/hooks/usePermission";
import { AccessDenied } from "@/components/common/AccessDenied";
import { AdminsPageContent } from "./_components/AdminsPageContent";

export default function AdminAccessPage() {
  const { can } = usePermission();

  if (!can("admin_access.view")) {
    return (
      <AccessDenied
        message="You do not have permission to view or manage accounts."
        requiredRole="Admin"
      />
    );
  }

  return <AdminsPageContent />;
}
