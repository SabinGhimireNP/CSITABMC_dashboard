import React from "react";
import { DeleteConfirmDialog } from "@/components/common/ConfirmDialog";

/**
 * NoticeDeleteDialog renders a confirmation modal when deleting a platform notice.
 */
export function NoticeDeleteDialog({ notice, onClose, onConfirm }) {
  return (
    <DeleteConfirmDialog
      item={notice}
      name={notice?.title}
      title="Delete platform notice?"
      onClose={onClose}
      onConfirm={onConfirm}
      zIndexClass="z-50"
    />
  );
}
