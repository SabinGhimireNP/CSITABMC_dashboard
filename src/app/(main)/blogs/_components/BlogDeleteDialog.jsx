import React from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Generic confirmation dialog used for deleting and unpublishing blog articles.
 */
export function BlogConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "danger",
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-rose-600 hover:bg-rose-700"
      : "bg-[#0b2574] hover:bg-[#0b2574]/90";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-60 animate-in fade-in duration-150">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="blog-confirm-title"
        className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-xl p-5 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-3.5">
          <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 flex-1 pr-6">
            <h3 id="blog-confirm-title" className="text-sm font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 border-t border-slate-100/80 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="h-8.5 px-4 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-8.5 px-4 text-xs font-semibold text-white rounded-lg transition-all cursor-pointer shadow-2xs ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BlogDeleteDialog({ blog, onClose, onConfirm }) {
  return (
    <BlogConfirmDialog
      open={Boolean(blog)}
      title="Delete blog article?"
      message={
        <>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">&quot;{blog?.title}&quot;</span>? This operation
          cannot be undone.
        </>
      }
      confirmLabel="Confirm Delete"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
