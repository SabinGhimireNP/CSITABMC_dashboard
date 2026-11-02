"use client";

import React, { useEffect, useId } from "react";
import { X } from "lucide-react";

/**
 * Shared modal layout for every route-based form/detail modal.
 *
 * Responsive contract (single source of truth):
 *  - phones: near full-screen panel (0.5rem gutter), height capped to the
 *    dynamic viewport so browser toolbars never clip the footer
 *  - sm+: centered panel, max 90dvh
 *  - header/footer never scroll; the body scrolls internally (min-h-0)
 *
 * Existing hand-written modals use the exported class helpers directly so their
 * markup (and form logic) stays intact; new modals can use <ModalShell>.
 */
export const MODAL_OVERLAY_CLASS = "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6";

export const MODAL_BACKDROP_CLASS = "absolute inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200";

export function modalPanelClass(maxWidth = "max-w-2xl", extra = "") {
  return [
    "relative bg-card dark:bg-[#1a1d24] text-foreground w-full",
    maxWidth,
    "rounded-xl sm:rounded-2xl border border-border/80 dark:border-white/12 shadow-2xl overflow-hidden flex flex-col",
    "max-h-[calc(100dvh-1rem)] sm:max-h-[90dvh]",
    "animate-in zoom-in-95 duration-200 z-10 text-xs",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Scrollable body; `min-h-0` lets it shrink inside the flex column. */
export const MODAL_BODY_CLASS = "flex-1 min-h-0 overflow-y-auto overflow-x-hidden text-foreground";

export function ModalShell({
  isOpen = true,
  title,
  subtitle,
  icon: Icon,
  headerExtra,
  onClose,
  closeDisabled = false,
  maxWidth = "max-w-2xl",
  maxWidthClass,
  footer,
  children,
  bodyClassName = "p-4 sm:p-6",
  closeOnBackdrop = false,
  lockScroll = true,
}) {
  const titleId = useId();
  const effectiveMaxWidth = maxWidthClass || maxWidth;

  useEffect(() => {
    if (!isOpen || !lockScroll) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous || "unset";
    };
  }, [isOpen, lockScroll]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !closeDisabled) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, closeDisabled]);

  if (!isOpen) return null;

  return (
    <div className={MODAL_OVERLAY_CLASS}>
      <div
        className={MODAL_BACKDROP_CLASS}
        onClick={closeOnBackdrop && !closeDisabled ? onClose : undefined}
        aria-hidden="true"
      />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className={modalPanelClass(effectiveMaxWidth)}>
        <div className="px-4 py-4 sm:px-6 border-b border-border/80 dark:border-white/10 flex items-center justify-between gap-3 bg-muted/40 dark:bg-[#16181e] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary shrink-0">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id={titleId} className="font-semibold text-base sm:text-lg text-foreground break-words">
                  {title}
                </h2>
                {headerExtra}
              </div>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5 break-words">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Close dialog"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/10 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        <div className={`${MODAL_BODY_CLASS} ${bodyClassName}`}>{children}</div>

        {footer && (
          <div className="px-4 py-3 sm:px-6 border-t border-border/80 dark:border-white/10 bg-muted/40 dark:bg-[#16181e] shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
}

export default ModalShell;
