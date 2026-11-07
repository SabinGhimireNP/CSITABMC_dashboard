"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";

export function TenureMembersPageHeader({
  title,
  subtitle,
  selectedTenure,
  onBack,
  onAddMember,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary break-words">{title}</h1>
            <p className="text-sm text-muted-foreground font-normal flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>{subtitle}</span>
              {selectedTenure && (
                <span className="text-[11px] text-slate-400">
                  ({formatDate(selectedTenure.startDate)} — {formatDate(selectedTenure.endDate)})
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <Button
          size="sm"
          onClick={onAddMember}
          className="gap-1.5 shadow-2xs w-full sm:w-auto cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </div>
    </div>
  );
}
