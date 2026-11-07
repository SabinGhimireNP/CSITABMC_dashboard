"use client";

import React from "react";

function greetingFor(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardWelcome({ name, roleLabel }) {
  // The dashboard renders client-side behind AuthGuard; suppressHydrationWarning
  // covers the rare case where the server and client clocks straddle a boundary.
  const greeting = greetingFor(new Date().getHours());

  return (
    <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1
          suppressHydrationWarning
          className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-words"
        >
          {greeting}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Here&apos;s an overview of your workspace.</p>
      </div>
      {roleLabel && (
        <span className="self-start sm:self-auto text-xs font-medium text-muted-foreground border border-border rounded-md px-2 py-1 bg-card">
          {roleLabel}
        </span>
      )}
    </header>
  );
}
