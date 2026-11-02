"use client";

import React from "react";

export default function AnnouncementsSkeleton() {
  return (
    <div className="w-full space-y-4 p-4 sm:p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded-md mb-2" />
          <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>

      {/* Search Toolbar Skeleton */}
      <div className="h-10 w-full sm:w-80 bg-slate-100 dark:bg-slate-800 rounded-lg" />

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="h-12 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800" />
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 space-x-4"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
