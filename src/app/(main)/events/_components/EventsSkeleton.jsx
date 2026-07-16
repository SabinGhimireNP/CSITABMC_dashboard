"use strict";

import React from "react";

export default function EventsSkeleton() {
  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-slate-200" />
        </div>
        <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-200" />
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-20 animate-pulse rounded-md bg-slate-200" />
          <div className="h-8 w-20 animate-pulse rounded-md bg-slate-200" />
          <div className="h-8 w-20 animate-pulse rounded-md bg-slate-200" />
        </div>
        <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200" />
      </div>
      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-4 grid grid-cols-7 gap-4">
          <div className="h-4 w-12 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200 ml-auto" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-slate-100 p-4 grid grid-cols-7 gap-4 items-center">
            <div className="h-4 w-10 animate-pulse rounded bg-slate-200" />
            <div className="space-y-1">
              <div className="h-3.5 w-36 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-14 animate-pulse rounded-full bg-slate-200" />
            <div className="flex gap-2 justify-end">
              <div className="h-7 w-7 animate-pulse rounded bg-slate-200" />
              <div className="h-7 w-7 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, j) => (
            <div key={j} className="h-8 w-8 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}