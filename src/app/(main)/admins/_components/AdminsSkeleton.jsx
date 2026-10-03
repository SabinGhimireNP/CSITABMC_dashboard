"use strict";

import React from "react";

export default function AdminsSkeleton() {
  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-md bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-slate-200" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-200" />
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex gap-2">
          <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="h-9 w-64 animate-pulse rounded-xl bg-slate-200" />
      </div>

      {/* Table */}
      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200/80 bg-slate-50/70 px-4 py-3 flex gap-4">
          {[8, 22, 25, 14, 13, 6].map((w, i) => (
            <div key={i} className={`h-4 w-[${w}%] animate-pulse rounded bg-slate-200`} />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-slate-100 bg-white">
            <div className="h-4 w-[8%] animate-pulse rounded bg-slate-100" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100 shrink-0" />
            <div className="h-4 flex-1 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-[25%] animate-pulse rounded bg-slate-100" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-[13%] animate-pulse rounded bg-slate-100" />
            <div className="h-6 w-6 animate-pulse rounded bg-slate-100 ml-auto" />
          </div>
        ))}
        {/* Pagination skeleton */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/30 border-t border-slate-200/80">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-7 w-7 animate-pulse rounded bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
