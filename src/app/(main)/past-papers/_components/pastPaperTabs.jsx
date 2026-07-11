"use client";

import React from "react";
import { Search } from "lucide-react";

export function PastPaperTabs({ 
  activeTab, // Will be either: "all", "board", or "model"
  onTabChange, 
  searchQuery, 
  onSearchChange 
}) {
  const tabs = [
    { id: "all", label: "All Papers" },
    { id: "board", label: "Board Exams" },
    { id: "model", label: "Model Sets" },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
      {/* Primary Board vs Model Toggle Tabs */}
      <div className="inline-flex items-center bg-slate-100/80 p-1 rounded-xl max-w-full overflow-x-auto scrollbar-none select-none shrink-0 gap-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`h-8 px-4 text-xs font-semibold tracking-tight rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-white text-indigo-600 shadow-xs border border-slate-200/40"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Simple Search Input */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by subject or code..."
          className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-2xs"
        />
      </div>
    </div>
  );
}