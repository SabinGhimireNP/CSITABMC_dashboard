"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

// Subtle per-module tints: icon chip, hover border and progress fill.
const ACCENTS = {
  indigo: { chip: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20", bar: "bg-indigo-500", hover: "hover:border-indigo-500/30", glow: "from-indigo-500/10" },
  violet: { chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-violet-500/20", bar: "bg-violet-500", hover: "hover:border-violet-500/30", glow: "from-violet-500/10" },
  sky: { chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/20", bar: "bg-sky-500", hover: "hover:border-sky-500/30", glow: "from-sky-500/10" },
  teal: { chip: "bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-teal-500/20", bar: "bg-teal-500", hover: "hover:border-teal-500/30", glow: "from-teal-500/10" },
  amber: { chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20", bar: "bg-amber-500", hover: "hover:border-amber-500/30", glow: "from-amber-500/10" },
  rose: { chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20", bar: "bg-rose-500", hover: "hover:border-rose-500/30", glow: "from-rose-500/10" },
  emerald: { chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20", bar: "bg-emerald-500", hover: "hover:border-emerald-500/30", glow: "from-emerald-500/10" },
  orange: { chip: "bg-orange-500/10 text-orange-600 dark:text-orange-400 ring-orange-500/20", bar: "bg-orange-500", hover: "hover:border-orange-500/30", glow: "from-orange-500/10" },
};

/** Counts up from 0 to `target` once; skipped for reduced-motion users. */
function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (typeof target !== "number" || !Number.isFinite(target)) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    const tick = (now) => {
      const t = reduce ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return typeof target === "number" ? value : target;
}

export default function StatCard({ label, value, detail, progress, icon: Icon, href, accent = "indigo" }) {
  const theme = ACCENTS[accent] || ACCENTS.indigo;
  const shown = useCountUp(value);

  const content = (
    <>
      {/* soft corner glow that brightens on hover */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-bl ${theme.glow} to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
      />

      <div className="relative flex items-start justify-between gap-2">
        {Icon && (
          <span
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${theme.chip} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        )}
        {href && (
          <ArrowUpRight
            className="h-4 w-4 text-muted-foreground/40 transition-all duration-300 group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="relative mt-3">
        <span className="block text-2xl sm:text-3xl font-semibold text-foreground tabular-nums leading-none">
          {shown ?? "—"}
        </span>
        <span className="block text-xs font-medium text-muted-foreground mt-1.5">{label}</span>
      </div>

      {progress ? (
        <div className="relative mt-3" title={progress.label}>
          <div
            className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={progress.value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={progress.label}
          >
            <div
              className={`h-full rounded-full ${theme.bar} transition-[width] duration-700 ease-out`}
              style={{ width: `${progress.value}%` }}
            />
          </div>
          {detail && <span className="block text-[11px] text-muted-foreground mt-1.5 leading-snug">{detail}</span>}
        </div>
      ) : (
        detail && <span className="relative block text-[11px] text-muted-foreground mt-3 leading-snug">{detail}</span>
      )}
    </>
  );

  const className = `group relative block min-w-0 overflow-hidden bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs transition-all duration-300 ${theme.hover}`;

  if (!href) return <div className={className}>{content}</div>;

  return (
    <Link
      href={href}
      aria-label={`${label}: ${value ?? "unavailable"}. Open ${label}`}
      className={`${className} hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:translate-y-0`}
    >
      {content}
    </Link>
  );
}
