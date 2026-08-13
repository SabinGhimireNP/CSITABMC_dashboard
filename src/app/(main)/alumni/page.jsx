"use client";

import { Suspense } from "react";
import { AlumniPageContent } from "./_components/AlumniPageContent";
import AlumniSkeleton from "./_components/AlumniSkeleton";

export default function AlumniPage() {
  return (
    <Suspense fallback={<AlumniSkeleton />}>
      <AlumniPageContent />
    </Suspense>
  );
}