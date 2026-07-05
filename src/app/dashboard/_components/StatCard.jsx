"use strict";

import React from "react";

export default function StatCard({ title, value, icon: Icon, brandingType, statusText }) {
  // Uses your exact branding tokens from theme variables
  const brandThemes = {
    primary: {
      border: "border-l-brand-primary",
      icon: "text-brand-primary bg-brand-primary/10"
    },
    secondary: {
      border: "border-l-brand-secondary",
      icon: "text-brand-secondary bg-brand-secondary/10"
    },
    tertiary: {
      border: "border-l-brand-tertiary",
      icon: "text-brand-tertiary bg-brand-tertiary/10"
    },
    foreground: {
      border: "border-l-accent-foreground",
      icon: "text-accent-foreground bg-accent"
    }
  };

  const activeTheme = brandThemes[brandingType] || brandThemes.primary;

  return (
    <div className={`w-full bg-card border border-border border-l-4 ${activeTheme.border} rounded-xl p-6 flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5`}>
      <div className="space-y-1.5 min-w-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text block truncate">
          {title}
        </span>
        <span className="text-3xl font-extrabold text-foreground block font-mono tracking-tight tabular-numbers">
          {value}
        </span>
        <span className="text-xs font-medium text-brand-text block truncate">
          {statusText}
        </span>
      </div>
      
      <div className={`p-3 border border-border/60 rounded-xl shadow-2xs shrink-0 ${activeTheme.icon}`}>
        <Icon className="w-5 h-5 stroke-[2]" />
      </div>
    </div>
  );
}