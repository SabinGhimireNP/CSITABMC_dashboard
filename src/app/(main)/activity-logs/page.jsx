"use client";

import { usePermission } from "@/hooks/usePermission";
import { AccessDenied } from "@/components/common/AccessDenied";
import { ActivityLogsPageContent } from "./_components/ActivityLogsPageContent";

export default function ActivityLogsPage() {
  const { can } = usePermission();

  if (!can("activity_logs.view")) {
    return (
      <AccessDenied
        requiredAction="view system activity logs"
        description="Only users with Superadmin or Admin privileges are authorized to view the system activity audit trail."
      />
    );
  }

  return <ActivityLogsPageContent />;
}
