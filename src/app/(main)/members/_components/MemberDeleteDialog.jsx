import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Loader2 } from "lucide-react";

/**
 * MemberDeleteDialog renders a confirmation portal dialog before permanently deleting a member.
 */
export function MemberDeleteDialog({
  member,
  isDeleting,
  onClose,
  onConfirm,
}) {
  if (!member || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
      <div
        onClick={() => !isDeleting && onClose()}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      />
      <div className="relative bg-white w-full max-w-sm rounded-2xl border border-slate-100 shadow-xl p-5 z-10 animate-in zoom-in-95 duration-200 text-xs">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 text-rose-600">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900">Delete Member</h3>
            <p className="text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800">{member.name}</span>?
              This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="h-8 px-3 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="h-8 px-3 text-xs font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
