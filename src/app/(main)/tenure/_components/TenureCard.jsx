"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Users, Calendar, Copy, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export function TenureCard({ tenure, memberCount, onDuplicate, isDuplicating, onEdit, onDelete }) {
  const router = useRouter();

  const handleOpenTenure = () => {
    router.push(`/tenure/${tenure.id}`);
  };

  return (
    <div className="bg-card text-foreground rounded-xl border border-border shadow-xs hover:shadow-md transition-all duration-200 hover:border-primary/40 group min-w-0">
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        {/* Header: Name + Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-base font-bold text-foreground tracking-tight truncate" title={tenure.name}>
              {tenure.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3 text-muted-foreground/60 shrink-0" />
              <span className="break-words">
                {formatDate(tenure.startDate)} — {formatDate(tenure.endDate)}
              </span>
            </div>
          </div>
          {/* Always visible on touch screens; revealed on hover from md up */}
          <div className="shrink-0 -mr-1.5 -mt-1 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-opacity">
            <RowActionsMenu
              label={`Actions for ${tenure.name}`}
              items={[
                { label: "Open", icon: Eye, onClick: handleOpenTenure },
                {
                  key: "duplicate",
                  label: isDuplicating ? "Duplicating" : "Duplicate",
                  icon: isDuplicating ? Loader2 : Copy,
                  spinning: isDuplicating,
                  disabled: isDuplicating,
                  onClick: () => onDuplicate?.(tenure),
                },
                { label: "Edit", icon: Pencil, onClick: () => onEdit?.(tenure) },
                { label: "Delete", icon: Trash2, destructive: true, onClick: () => onDelete?.(tenure) },
              ]}
            />
          </div>
        </div>

        {/* Member Count Badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-foreground">{memberCount}</span>
          <span className="text-muted-foreground">member{memberCount !== 1 ? "s" : ""}</span>
        </div>

        {/* Open Button */}
        <button
          type="button"
          onClick={handleOpenTenure}
          className="w-full h-9 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-primary/20"
        >
          <Eye className="h-3.5 w-3.5" />
          View Members
        </button>
      </div>
    </div>
  );
}
