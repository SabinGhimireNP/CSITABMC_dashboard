"use client";

import React from "react";
import { Search } from "lucide-react";

export function MembersTabs({
  activeTab = "all",
  onTabChange,
  searchQuery,
  onSearchChange,
  tabCounts = {},
}) {
  const tabs = [
    { id: "all", label: "All Members", count: tabCounts.all },
    { id: "published", label: "Published", count: tabCounts.published },
    { id: "draft", label: "Draft", count: tabCounts.draft },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
      {/* Tabs Container */}
      <div className="inline-flex items-center bg-muted p-1 rounded-xl border border-border max-w-full overflow-x-auto scrollbar-none select-none shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={`h-8 px-4 text-xs font-medium tracking-tight rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-card dark:bg-[#1f232b] text-primary font-semibold shadow-2xs border border-border/80 dark:border-white/12"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/40"
              }`}
            >
              {tab.label}
              {typeof tab.count === "number" && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Embedded Search Input */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search members by name or email..."
          className="w-full h-9 pl-9 pr-4 bg-background border border-input rounded-xl text-xs placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-2xs"
        />
      </div>
    </div>
  );
}
