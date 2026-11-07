"use client";

import React from "react";
import { Search, Share2, Image as ImageIcon } from "lucide-react";
import { markdownToPlainText, truncateText } from "./blogUtils";

const SITE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "").host;
  } catch {
    return "";
  }
})();

/** Same derivation as the backend: description = excerpt, else plain text from the article. */
export function deriveSeoDescription(excerpt = "", content = "") {
  const fromExcerpt = excerpt.replace(/\s+/g, " ").trim();
  return truncateText(fromExcerpt || markdownToPlainText(content), 160);
}

/**
 * Read-only preview of the SEO values the backend derives automatically:
 * title → page/OG title, excerpt (or article text) → description, featured image → OG image.
 */
export function SeoPreview({ title = "", slug = "", excerpt = "", content = "", imageUrl = "", imageAlt = "" }) {
  const displayTitle = title.trim() || "Untitled article";
  const displaySlug = slug || "generated-from-title";
  const derived = deriveSeoDescription(excerpt, content);
  const usesFallback = !excerpt.trim() && Boolean(derived);
  const description =
    derived || "Add an excerpt (or start writing the article) to generate the search description.";

  return (
    <div className="rounded-xl border border-slate-200 dark:border-border bg-slate-50/70 dark:bg-card/40 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Search className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Automatic SEO Preview</span>
        </div>
        <span className="text-[10px] text-slate-400">Derived from the fields above · editing aid only</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Search result */}
        <div className="rounded-lg bg-card dark:bg-card p-4 border border-border shadow-2xs space-y-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Search result</p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 min-w-0">
            {SITE_HOST && <span className="font-medium text-slate-700 dark:text-slate-300 shrink-0">{SITE_HOST}</span>}
            {SITE_HOST && <span aria-hidden="true">›</span>}
            <span className="shrink-0">blogs</span>
            <span aria-hidden="true">›</span>
            <span className="truncate font-mono">{displaySlug}</span>
          </div>
          <p className="text-base font-medium text-[#1a0dab] dark:text-[#8ab4f8] truncate">{displayTitle}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>
          {usesFallback && (
            <p className="text-[10px] text-amber-500 dark:text-amber-400 pt-1">
              No excerpt yet: using text from the article. A short excerpt usually reads better.
            </p>
          )}
        </div>

        {/* Social share card */}
        <div className="rounded-lg bg-card border border-border shadow-2xs overflow-hidden min-w-0">
          <div className="aspect-[1.91/1] bg-muted/50 flex items-center justify-center border-b border-border">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={imageAlt || ""} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
                <span className="text-[10px]">No featured image: no share image</span>
              </div>
            )}
          </div>
          <div className="p-3 space-y-0.5">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Share2 className="h-3 w-3" /> Social share (Open Graph)
            </p>
            <p className="text-xs font-semibold text-foreground truncate">{displayTitle}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-2">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
