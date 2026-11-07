"use client";

import React, { useMemo } from "react";
import { Check, Circle } from "lucide-react";

export function PasswordRequirements({ password = "" }) {
  const requirements = useMemo(() => {
    const val = password || "";
    return [
      {
        id: "length",
        label: "At least 8 characters long",
        met: val.length >= 8,
      },
      {
        id: "uppercase",
        label: "At least one uppercase letter (A-Z)",
        met: /[A-Z]/.test(val),
      },
      {
        id: "number",
        label: "At least one number (0-9)",
        met: /[0-9]/.test(val),
      },
      {
        id: "special",
        label: "At least one special character",
        met: /[^A-Za-z0-9]/.test(val),
      },
    ];
  }, [password]);

  return (
    <div
      className="mt-2.5 p-3 rounded-lg border border-border/60 bg-muted/30 dark:bg-muted/15 text-xs transition-colors"
      aria-live="polite"
    >
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Password Requirements:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
        {requirements.map((req) => (
          <div
            key={req.id}
            className={`flex items-center gap-1.5 text-[11px] transition-colors ${
              req.met
                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                : "text-muted-foreground"
            }`}
          >
            {req.met ? (
              <Check className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />
            ) : (
              <Circle className="h-2.5 w-2.5 shrink-0 text-muted-foreground/50 fill-muted-foreground/20" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
