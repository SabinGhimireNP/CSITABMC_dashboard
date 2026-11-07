"use client";

import React, { use } from "react";
import { usePermission } from "@/hooks/usePermission";
import { AccessDenied } from "@/components/common/AccessDenied";
import { ActivityLogsPageContent } from "../_components/ActivityLogsPageContent";

export default function ActivityLogDetailPage({ params }) {
  const unwrappedParams = typeof use === "function" ? use(params) : params;
  const { can } = usePermission();

  if (!can("activity_logs.view")) {
    return (
      <AccessDenied
        requiredAction="view system activity logs"
        description="Only users with Superadmin or Admin privileges are authorized to view the system activity audit trail."
      />
    );
  }

  return (
    <ActivityLogsPageContent
      initialModalMode={{
        isOpen: true,
        action: "view",
        id: unwrappedParams?.id,
      }}
    />
  );
}
