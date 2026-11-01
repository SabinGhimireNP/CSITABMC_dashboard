import React from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * CertificateDeleteDialog renders a confirmation modal when deleting a certificate.
 */
export function CertificateDeleteDialog({ cert, onClose, onConfirm }) {
  if (!cert) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-xl p-5 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex gap-3.5">
          <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Delete certificate?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Are you sure you want to delete the certificate for{" "}
              <span className="font-semibold text-slate-800">
                &quot;{cert.fullName}&quot;
              </span>
              ? This cannot be undone.
            </p>
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
            className="h-8.5 px-4 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all cursor-pointer shadow-2xs"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
