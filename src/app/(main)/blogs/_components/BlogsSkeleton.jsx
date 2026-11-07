"use client";

import React from "react";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

export default function BlogsSkeleton() {
  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <Skeleton className="h-8 w-56 rounded-md" />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 grid grid-cols-6 gap-4">
          <Skeleton className="h-4 w-36 col-span-2" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12 ml-auto" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-slate-100 dark:border-slate-800/80 bg-card p-4 grid grid-cols-6 gap-4 items-center">
            <div className="col-span-2 flex items-center gap-3">
              <Skeleton className="h-10 w-16 rounded-lg" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-full max-w-48" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-2 justify-end">
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
