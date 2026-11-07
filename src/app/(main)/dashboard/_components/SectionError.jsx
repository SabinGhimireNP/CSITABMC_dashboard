"use client";

import React from "react";
import { AlertCircle, RotateCw } from "lucide-react";

export default function SectionError({ message = "This section couldn't be loaded.", onRetry, retrying }) {
  return (
    <div
      role="alert"
      className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between py-4 px-4 border border-destructive/30 bg-destructive/5 rounded-md"
    >
      <p className="flex items-center gap-2 text-sm text-foreground">
        <AlertCircle className="w-4 h-4 text-destructive shrink-0" aria-hidden="true" />
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-medium border border-border rounded-md bg-card hover:bg-muted disabled:opacity-60 shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
