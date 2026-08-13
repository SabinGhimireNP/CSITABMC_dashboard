"use client";

export function TenureDeleteDialog({ tenure, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-xl p-5 animate-in zoom-in-95 duration-150 relative"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex gap-3.5">
          <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.134-.833-2.904 0L4.152 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Remove tenure?</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Are you sure you want to remove <span className="font-semibold text-slate-800">{`"${tenure?.name}"`}</span>?
              All members in this tenure will also be deleted. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 border-t border-slate-100/80 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-8 px-4 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all cursor-pointer shadow-sm"
          >
            Delete Tenure
          </button>
        </div>
      </div>
    </div>
  );
}
