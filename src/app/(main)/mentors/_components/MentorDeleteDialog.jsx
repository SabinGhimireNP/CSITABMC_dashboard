import React from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

/** Confirmation prompt shown before deleting a mentor. */
export function MentorDeleteDialog({ mentor, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      open={Boolean(mentor)}
      title="Delete mentor?"
      message={
        <>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">&quot;{mentor?.fullName}&quot;</span>? This cannot be undone.
        </>
      }
      confirmLabel="Confirm Delete"
      onClose={onClose}
      onConfirm={onConfirm}
      zIndexClass="z-50"
    />
  );
}
