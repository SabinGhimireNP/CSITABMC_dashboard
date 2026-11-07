"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

/**
 * Confirmation prompt shown before deleting a member. Portalled to <body> so it
 * stacks above the members table and any open modal.
 */
export function MemberDeleteDialog({ member, isDeleting, onClose, onConfirm }) {
  if (!member || typeof document === "undefined") return null;

  return createPortal(
    <ConfirmDialog
      open
      title="Delete Member"
      message={
        <>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800">{member.name}</span>? This action cannot be undone.
        </>
      }
      confirmLabel={
        isDeleting ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting
          </span>
        ) : (
          "Delete"
        )
      }
      isLoading={isDeleting}
      onClose={() => !isDeleting && onClose()}
      onConfirm={onConfirm}
      zIndexClass="z-99999"
    />,
    document.body
  );
}
