"use client";

import { Suspense } from "react";
import { NotificationsPageContent } from "./_components/NotificationsPageContent";
import NotificationsSkeleton from "./_components/NotificationsSkeleton";

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <NotificationsPageContent />
    </Suspense>
  );
}
