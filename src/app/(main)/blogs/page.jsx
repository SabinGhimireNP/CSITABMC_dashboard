"use client";

import { Suspense } from "react";
import { BlogsPageContent } from "./_components/BlogsPageContent";
import BlogsSkeleton from "./_components/BlogsSkeleton";

export default function BlogsPage() {
  return (
    <Suspense fallback={<BlogsSkeleton />}>
      <BlogsPageContent />
    </Suspense>
  );
}
