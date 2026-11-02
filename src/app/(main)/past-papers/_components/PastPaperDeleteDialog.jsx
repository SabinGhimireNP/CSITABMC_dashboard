import React from "react";
import { Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

/** Confirmation prompt shown before deleting a past paper. */
export function PastPaperDeleteDialog({ paper, isDeleting, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      open={Boolean(paper)}
      title="Delete past paper?"
      message={
        <>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">
            &quot;{paper?.subject_name} ({paper?.exam_year})&quot;
          </span>
          ? This cannot be undone.
        </>
      }
      confirmLabel={
        isDeleting ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting
          </span>
        ) : (
          "Confirm Delete"
        )
      }
      isLoading={isDeleting}
      onClose={() => !isDeleting && onClose()}
      onConfirm={onConfirm}
      zIndexClass="z-50"
    />
  );
}
