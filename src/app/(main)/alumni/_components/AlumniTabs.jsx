"use client";

import React from "react";
import { Search } from "lucide-react";

export function AlumniTabs({ activeTab, onTabChange, searchQuery, onSearchChange }) {
  const tabs = [
    { id: "all", label: "All Alumni" },
    { id: "active", label: "Active" },
    { id: "draft", label: "Drafts" },
  ];

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Tab Pills */}
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
              {tab.id === "active" && (
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-primary animate-pulse" : "bg-emerald-500"}`} />
              )}
              {tab.id === "draft" && (
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-primary animate-pulse" : "bg-amber-500"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search alumni..."
          className="w-full h-9 pl-9 pr-4 bg-background border border-input rounded-xl text-xs placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-2xs"
        />
      </div>
    </div>
  );
}