"use client";

import React from "react";

const BADGE_TONES = {
  positive: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  neutral: "bg-primary/10 text-primary border-primary/20",
  muted: "bg-muted text-muted-foreground border-border",
};

export default function RecentItem({ title, meta = [], badge, thumbnail }) {
  const metaText = meta.filter((part) => part !== null && part !== undefined && part !== "").join(" · ");

  return (
    <li className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-md min-w-0 transition-colors hover:bg-muted/60">
      {thumbnail !== undefined &&
        (thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            className="h-9 w-14 shrink-0 rounded object-cover border border-border bg-muted"
          />
        ) : (
          <div className="h-9 w-14 shrink-0 rounded border border-border bg-muted" aria-hidden="true" />
        ))}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate" title={title}>
          {title}
        </p>
        {metaText && <p className="text-xs text-muted-foreground truncate mt-0.5">{metaText}</p>}
      </div>
      {badge && (
        <span
          className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded border ${BADGE_TONES[badge.tone] || BADGE_TONES.muted}`}
        >
          {badge.label}
        </span>
      )}
    </li>
  );
}
