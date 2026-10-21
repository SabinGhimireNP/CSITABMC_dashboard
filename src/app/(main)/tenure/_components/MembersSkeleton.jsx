"use strict";

import React from "react";

export default function MembersSkeleton() {
  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-slate-200" />
        </div>
        <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-200" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1.5">
                <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
                <div className="h-3.5 w-40 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="flex gap-1">
                <div className="h-7 w-7 animate-pulse rounded bg-slate-200" />
                <div className="h-7 w-7 animate-pulse rounded bg-slate-200" />
                <div className="h-7 w-7 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}