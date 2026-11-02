"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function QuickActions({ actions }) {
  if (!actions.length) return null;

  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="text-sm font-semibold text-foreground mb-2">
        Quick actions
      </h2>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted hover:border-primary/40 transition-colors"
          >
            <Plus className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
