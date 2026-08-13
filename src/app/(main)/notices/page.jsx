"use client";

import { Suspense } from "react";
import { NoticesPageContent } from "./_components/NoticesPageContent";
import NoticesSkeleton from "./_components/NoticesSkeleton";

export default function NoticeHistoryPage() {
  return (
    <Suspense fallback={<NoticesSkeleton />}>
      <NoticesPageContent />
    </Suspense>
  );
}