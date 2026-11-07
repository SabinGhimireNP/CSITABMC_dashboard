import React from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

/** Confirmation prompt shown before deleting an event. */
export function EventDeleteDialog({ event, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      open={Boolean(event)}
      title="Delete event?"
      message={
        <>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">&quot;{event?.title}&quot;</span>? This will also affect
          mentors and certificates linked to this event. This operation cannot be undone.
        </>
      }
      confirmLabel="Confirm Delete"
      onClose={onClose}
      onConfirm={onConfirm}
      zIndexClass="z-50"
    />
  );
}
