"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function EmptyState({ description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 py-6 px-4 border border-dashed border-border rounded-md bg-muted/40">
      <p className="text-sm text-muted-foreground">{description || "No records found."}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          {action.label}
        </Link>
      )}
    </div>
  );
}
