"use strict";

import React from "react";

export default function SectionHeader({ title, icon: Icon }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 mb-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-brand-text stroke-[2]" />}
        <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
      </div>
    </div>
  );
}