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
          ? "pt-8 sm:pt-10 border-t border-slate-200/70 first:border-0 first:pt-0"
          : ""
      } ${className}`}
    >
      {(title || description || action) && (
        <div className="mb-6 sm:mb-7 flex items-start justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  {title}
                </h3>
                {badge && (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                    {badge}
                  </span>
                )}
              </div>
            )}
            {description && (
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
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
