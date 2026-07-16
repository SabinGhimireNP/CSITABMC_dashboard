"use strict";

import React from "react";

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 ${className}`}
    />
  );
}

function StatCardSkeleton() {
  return (
    <div className="w-full bg-white border border-slate-200 border-l-4 border-l-slate-300 rounded-xl p-6 flex items-center justify-between shadow-xs">
      <div className="space-y-3 min-w-0 flex-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl shrink-0 ml-4" />
    </div>
  );
}

function RecentCardSkeleton() {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full ml-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <main className="min-h-screen w-full bg-slate-50/40 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto space-y-8 md:space-y-10">
        {/* Header Skeleton */}
        <div className="w-full bg-white border border-slate-200 p-4 sm:p-6 2xl:p-8 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
          <div className="space-y-2">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg">
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Recent Activity Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          <RecentCardSkeleton />
          <RecentCardSkeleton />
          <RecentCardSkeleton />
        </div>
      </div>
    </main>
  );
}