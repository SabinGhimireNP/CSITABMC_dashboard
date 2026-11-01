"use client";

import React from "react";
import { Search } from "lucide-react";

const TABS = [
  { id: "all", label: "All Articles" },
  { id: "published", label: "Published", dot: "bg-emerald-500" },
  { id: "draft", label: "Drafts", dot: "bg-amber-500" },
];

export function BlogTabs({ activeTab, onTabChange, searchQuery, onSearchChange }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
      <div
        role="tablist"
        aria-label="Filter by publication status"
        className="inline-flex items-center bg-slate-100/80 p-1 rounded-xl max-w-full overflow-x-auto scrollbar-none select-none shrink-0"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`h-8 px-4 text-xs font-medium tracking-tight rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-white text-indigo-600 font-semibold shadow-xs border border-slate-200/40"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              {tab.label}
              {tab.dot && (
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-indigo-600 animate-pulse" : tab.dot}`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          aria-label="Search blogs by title or ID"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or ID (ART-0001)..."
          className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-2xs"
        />
      </div>
    </div>
  );
}
