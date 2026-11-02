import React from "react";
import { ConfirmDialog, DeleteConfirmDialog } from "@/components/common/ConfirmDialog";

/**
 * Generic confirmation dialog used for deleting and unpublishing blog articles.
 * Thin wrapper over the shared ConfirmDialog (kept for existing call sites).
 */
export function BlogConfirmDialog(props) {
  return <ConfirmDialog {...props} />;
}

export function BlogDeleteDialog({ blog, onClose, onConfirm }) {
  return (
    <DeleteConfirmDialog
      item={blog}
      name={blog?.title}
      title="Delete blog article?"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
