"use client";

import React from "react";

/**
 * FormSection
 * Reusable layout primitive for spacious, executive-grade section organization across dashboard forms.
 * Provides generous vertical spacing, clean dividers, elevated heading typography,
 * and sufficient breathing room before fields without heavy nested cards or visual noise.
 */
export function FormSection({
  title,
  description,
  badge,
  action,
  children,
  className = "",
  contentClassName = "",
  withDivider = true,
}) {
  return (
    <section
      className={`w-full ${
        withDivider
          ? "pt-8 sm:pt-10 border-t border-border/80 dark:border-white/10 first:border-0 first:pt-0"
          : ""
      } ${className}`}
    >
      {(title || description || action) && (
        <div className="mb-6 sm:mb-7 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="space-y-1 min-w-0">
            {title && (
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-semibold text-foreground tracking-tight">
                  {title}
                </h3>
                {badge && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                    {badge}
                  </span>
                )}
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
