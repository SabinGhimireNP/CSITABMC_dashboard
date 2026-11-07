"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

/** Confirmation prompt shown before removing a tenure (mounted only while open). */
export function TenureDeleteDialog({ tenure, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      open
      title="Remove tenure?"
      message={
        <>
          Are you sure you want to remove{" "}
          <span className="font-semibold text-slate-800">{`"${tenure?.name}"`}</span>? All members in this tenure
          will also be deleted. This action cannot be undone.
        </>
      }
      confirmLabel={
        isDeleting ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting
          </span>
        ) : (
          "Delete Tenure"
        )
      }
      isLoading={isDeleting}
      onClose={() => !isDeleting && onClose()}
      onConfirm={handleConfirm}
      zIndexClass="z-50"
    />
  );
}
