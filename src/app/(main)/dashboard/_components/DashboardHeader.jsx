"use client";

import React, { useState, useEffect } from "react";

export default function DashboardHeader() {
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const now = new Date();
    setCurrentDateTime(
      now.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  }, []);

  return (
    <header className="w-full bg-card border border-border p-4 sm:p-6 2xl:p-8 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
      <div>
        <h1 className="text-xl sm:text-2xl 2xl:text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-xs sm:text-sm 2xl:text-base text-brand-text mt-0.5">Welcome back! Here's an overview of your platform collections.</p>
      </div>

      <div className="flex flex-col text-left sm:text-right bg-muted border border-border px-4 py-2 rounded-lg self-start sm:self-auto">
        <span className="text-[9px] sm:text-[10px] 2xl:text-xs font-bold text-brand-text uppercase tracking-wider">System Sync</span>
        <span className="text-xs 2xl:text-sm font-semibold text-foreground mt-0.5 tabular-numbers">{currentDateTime}</span>
      </div>
    </header>
  );
}