"use client";

import React, { useMemo } from "react";
import { Search } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { getUserRole } from "@/lib/roles";

export function AdminTabs({ activeTab, onTabChange, searchQuery, onSearchChange }) {
  const currentUser = useAuthStore((state) => state.user);
  const currentRole = getUserRole(currentUser);

  const tabs = useMemo(() => {
    const list = [{ id: "all", label: "All Accounts" }];

    // Superadmin accounts are never managed through Admin Access.
    // Regular Admins only see ordinary CMS user roles.
    if (currentRole === "superadmin") {
      list.push({ id: "admin", label: "Admin" });
    }

    list.push(
      { id: "cms_user", label: "CMS User" },
      { id: "operations", label: "Operations" },
      { id: "papers", label: "Papers" },
      { id: "notice", label: "Notice" },
      { id: "blog", label: "Blog" }
    );

    return list;
  }, [currentRole]);

  return (
    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 w-full min-w-0">
      <div className="inline-flex items-center bg-muted p-1 rounded-xl border border-border max-w-full min-w-0 self-start overflow-x-auto scrollbar-none select-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`h-8 px-3 shrink-0 text-xs font-medium tracking-tight rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                isActive
                  ? "bg-card dark:bg-[#1f232b] text-primary font-semibold shadow-2xs border border-border/80 dark:border-white/12"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/40"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="relative w-full sm:max-w-xs xl:shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={currentRole === "admin" ? "Search CMS users..." : "Search accounts..."}
          className="w-full h-9 pl-9 pr-4 bg-background border border-input rounded-xl text-xs placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-2xs"
        />
      </div>
    </div>
  );
}