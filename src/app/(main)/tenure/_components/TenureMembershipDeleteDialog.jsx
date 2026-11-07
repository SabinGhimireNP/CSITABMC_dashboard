import React from "react";
import { Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

/** Confirmation prompt shown before removing a member from a tenure. */
export function TenureMembershipDeleteDialog({ member, isDeleting, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      open={Boolean(member)}
      title="Remove from tenure?"
      message={
        <>
          Are you sure you want to remove{" "}
          <span className="font-semibold text-slate-800">&quot;{member?.fullName}&quot;</span> from this tenure?
          Their master member profile will not be deleted.
        </>
      }
      confirmLabel={
        isDeleting ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Removing
          </span>
        ) : (
          "Confirm Remove"
        )
      }
      isLoading={isDeleting}
      onClose={() => !isDeleting && onClose()}
      onConfirm={onConfirm}
      zIndexClass="z-50"
    />
  );
}
