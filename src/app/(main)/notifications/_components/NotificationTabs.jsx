"use client";

import React from "react";
import { Search, Inbox, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

export function NotificationTabs({
  activeView = "inbox", // "inbox" | "sent"
  onViewChange,
  readFilter = "all", // "all" | "false" | "true"
  onReadFilterChange,
  sourceModule = "all",
  onSourceModuleChange,
  searchQuery = "",
  onSearchChange,
  unreadCount = 0,
}) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top Bar: Primary View Tabs (Inbox vs Sent) + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Inbox / Sent Tab Switcher */}
        <div className="inline-flex items-center bg-muted p-1 rounded-xl border border-border select-none shrink-0">
          <button
            type="button"
            onClick={() => onViewChange("inbox")}
            className={`h-9 px-4 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              activeView === "inbox"
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-card/40"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Inbox</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onViewChange("sent")}
            className={`h-9 px-4 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              activeView === "sent"
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-card/40"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Sent</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={activeView === "inbox" ? "Search notifications, sender..." : "Search sent notifications..."}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs bg-card"
          />
        </div>
      </div>

      {/* Sub-Filters: Read/Unread and Module Filter (Inbox only) */}
      {activeView === "inbox" && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50 text-xs">
          <span className="text-[11px] font-medium text-muted-foreground mr-1">Status:</span>
          {[
            { id: "all", label: "All" },
            { id: "false", label: "Unread" },
            { id: "true", label: "Read" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onReadFilterChange(st.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                readFilter === st.id
                  ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                  : "bg-muted/40 text-muted-foreground border-transparent hover:text-foreground hover:bg-muted"
              }`}
            >
              {st.label}
            </button>
          ))}

          <span className="text-[11px] font-medium text-muted-foreground ml-3 mr-1">Type:</span>
          {[
            { id: "all", label: "All Types" },
            { id: "direct", label: "Direct" },
            { id: "announcement", label: "Announcement" },
            { id: "notice", label: "Notice" },
          ].map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSourceModuleChange(mod.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                sourceModule === mod.id
                  ? "bg-secondary text-secondary-foreground border-border font-semibold"
                  : "bg-muted/40 text-muted-foreground border-transparent hover:text-foreground hover:bg-muted"
              }`}
            >
              {mod.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
