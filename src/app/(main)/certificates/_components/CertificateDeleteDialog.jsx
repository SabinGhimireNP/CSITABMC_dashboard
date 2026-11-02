import React from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

/** Confirmation prompt shown before deleting a certificate. */
export function CertificateDeleteDialog({ cert, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      open={Boolean(cert)}
      title="Delete certificate?"
      message={
        <>
          Are you sure you want to delete the certificate for{" "}
          <span className="font-semibold text-slate-800">&quot;{cert?.fullName}&quot;</span>? This cannot be undone.
        </>
      }
      confirmLabel="Confirm Delete"
      onClose={onClose}
      onConfirm={onConfirm}
      zIndexClass="z-50"
    />
  );
}
