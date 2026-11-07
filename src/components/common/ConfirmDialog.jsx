"use client";

import React, { useEffect, useId } from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Shared confirmation dialog (delete / unpublish / discard ...).
 * Replaces the per-module copies so every confirm prompt behaves the same on
 * small screens: long quoted titles wrap, actions stack on narrow widths, and
 * Escape / the close button dismiss it.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onClose,
  onConfirm,
  isLoading = false,
  zIndexClass = "z-60",
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const confirmClass =
    tone === "danger" ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-primary hover:bg-primary/90 text-primary-foreground";

  return (
    <div
      className={`fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 ${zIndexClass} animate-in fade-in duration-150`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-card dark:bg-[#1a1d24] text-foreground rounded-xl border border-border/80 dark:border-white/12 w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto shadow-2xl p-5 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-3.5">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border ${
              tone === "danger"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                : "bg-primary/10 text-primary border-primary/20"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0 pr-6">
            <h3 id={titleId} className="text-sm font-bold text-foreground tracking-tight break-words">
              {title}
            </h3>
            <div className="text-xs text-muted-foreground leading-relaxed font-normal break-words">{message}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2.5 mt-6 border-t border-border pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 text-xs font-semibold border border-input text-foreground bg-card rounded-lg hover:bg-muted transition-all cursor-pointer shadow-2xs disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-9 px-4 text-xs font-semibold text-white rounded-lg transition-all cursor-pointer shadow-2xs disabled:opacity-60 ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Convenience wrapper for the common "Delete <name>?" prompt. */
export function DeleteConfirmDialog({ item, name, title, confirmLabel = "Confirm Delete", onClose, onConfirm, ...rest }) {
  return (
    <ConfirmDialog
      open={Boolean(item)}
      title={title}
      message={
        <>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">&quot;{name}&quot;</span>? This operation cannot be undone.
        </>
      }
      confirmLabel={confirmLabel}
      onClose={onClose}
      onConfirm={onConfirm}
      {...rest}
    />
  );
}

export default ConfirmDialog;
