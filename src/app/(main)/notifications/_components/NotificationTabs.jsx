"use client";

import React from "react";
import { Search } from "lucide-react";

export function NotificationTabs({
  activeTab,
  onTabChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
  searchQuery,
  onSearchChange,
}) {
  const tabs = [
    { id: "all", label: "All Notifications" },
    { id: "announcement", label: "Announcements" },
    { id: "notice", label: "System Notices" },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 w-full">
      {/* Tabs Container */}
      <div className="inline-flex items-center bg-muted p-1 rounded-xl border border-border max-w-full overflow-x-auto scrollbar-none select-none shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`h-8 px-4 text-xs font-medium tracking-tight rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-card dark:bg-[#1f232b] text-primary font-semibold shadow-2xs border border-border/80 dark:border-white/12"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/40"
              }`}
            >
              {tab.label}

              {/* Status indicator badge dot */}
              {tab.id === "announcement" && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? "bg-primary animate-pulse" : "bg-purple-500"
                  }`}
                />
              )}
              {tab.id === "notice" && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? "bg-primary animate-pulse" : "bg-emerald-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="h-9 px-3 bg-background border border-input rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="partially_sent">Partially Sent</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-9 px-3 bg-background border border-input rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => onDateChange("")}
              className="text-[11px] text-destructive hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Embedded Search Input */}
        <div className="relative flex-1 sm:w-64 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notifications..."
            className="w-full h-9 pl-9 pr-4 bg-background border border-input rounded-xl text-xs placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
}
