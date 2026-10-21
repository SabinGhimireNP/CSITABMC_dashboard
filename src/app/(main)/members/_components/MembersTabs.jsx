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
      <div className="inline-flex items-center bg-slate-100/80 p-1 rounded-xl max-w-full overflow-x-auto scrollbar-none select-none shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={`h-8 px-4 text-xs font-medium tracking-tight rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-white text-indigo-600 font-semibold shadow-xs border border-slate-200/40"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              {tab.label}
              {typeof tab.count === "number" && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-200/70 text-slate-700"
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search members by name or email..."
          className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-2xs"
        />
      </div>
    </div>
  );
}
