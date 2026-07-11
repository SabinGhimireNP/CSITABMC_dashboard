"use strict";

import React from "react";

export default function RecentItem({ title, subtitle, badgeText }) {
  const isStatusOpen = badgeText === "Published" || badgeText === "Open" || badgeText === true;
  
  return (
    <div className="flex items-center justify-between gap-4 p-2.5 rounded-lg hover:bg-muted border border-transparent hover:border-border/30 transition-all">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-foreground truncate">{title}</p>
        <p className="text-[11px] text-brand-text truncate mt-0.5">{subtitle}</p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border tracking-wider uppercase shrink-0 ${
        isStatusOpen 
          ? "bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20" 
          : "bg-muted text-brand-text border-border"
      }`}>
        {typeof badgeText === "boolean" ? (badgeText ? "Done" : "Pending") : badgeText}
      </span>
    </div>
  );
}