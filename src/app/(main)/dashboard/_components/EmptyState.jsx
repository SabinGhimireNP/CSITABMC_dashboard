"use strict";

import React from "react";

export default function EmptyState({ icon: Icon, description }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-lg bg-muted/40">
      {Icon && <Icon className="w-5 h-5 text-brand-text/60 mb-2" />}
      <p className="text-xs font-semibold text-foreground">No records found</p>
      {description && <p className="text-[11px] text-brand-text mt-0.5">{description}</p>}
    </div>
  );
}