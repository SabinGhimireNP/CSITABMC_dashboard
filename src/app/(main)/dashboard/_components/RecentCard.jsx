"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CHIPS = {
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

/** Section container for one module's recent records. */
export default function RecentCard({ title, icon: Icon, accent, viewAllHref, children }) {
  return (
    <section className="bg-card border border-border rounded-xl p-4 flex flex-col min-w-0 shadow-2xs transition-shadow duration-300 hover:shadow-sm">
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-border">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground min-w-0">
          {Icon && (
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md shrink-0 ${CHIPS[accent] || "bg-muted text-muted-foreground"}`}>
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          )}
          <span className="truncate">{title}</span>
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 shrink-0 py-1"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="mt-1 flex-1">{children}</div>
    </section>
  );
}
