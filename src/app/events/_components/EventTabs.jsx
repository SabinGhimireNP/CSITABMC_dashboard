"use client";

import React from "react";
import { Search } from "lucide-react";

export function EventTabs({ activeTab, onTabChange, searchQuery, onSearchChange }) {
  const tabs = [
    { id: "all", label: "All Events" },
    { id: "open", label: "Registration Open" },
    { id: "closed", label: "Registration Closed" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
      {/* Tabs Container */}
      <div className="inline-flex items-center bg-slate-100/80 dark:bg-slate-900/50 p-1 rounded-xl max-w-full overflow-x-auto scrollbar-none select-none shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`h-8 px-4 text-xs font-medium tracking-tight rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-white text-indigo-600 font-semibold shadow-xs border border-slate-200/40"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}

              {tab.id === "open" && (
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-indigo-600 animate-pulse" : "bg-emerald-500"}`} />
              )}
              {tab.id === "closed" && (
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-indigo-600 animate-pulse" : "bg-rose-400"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Embedded Search Input Element */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events..."
          className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-2xs"
        />
      </div>
    </div>
  );
}