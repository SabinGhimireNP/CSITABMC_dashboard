"use client";

import React from "react";
import { Plus } from "lucide-react";
import { TenureCard } from "./TenureCard";
import { Button } from "@/components/ui/button";

export function TenureListView({ tenures, members, onOpen, onDuplicate, isDuplicating, onEdit, onDelete, onCreate }) {
  const getMemberCount = (tenureId) => {
    return members.filter((m) => m.tenureId === tenureId).length;
  };

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary break-words">Tenures</h1>
          <p className="text-sm text-muted-foreground font-normal">
            Manage academic years/tenures and their members.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            size="sm"
            onClick={onCreate}
            className="gap-1.5 shadow-2xs w-full sm:w-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Tenure
          </Button>
        </div>
      </div>

      {/* Tenure Cards Grid */}
      {tenures.length === 0 ? (
        <div className="w-full bg-card rounded-sm border border-slate-200/90 dark:border-border shadow-sm overflow-hidden py-16 text-center">
          <div className="text-muted-foreground font-medium text-sm">
            No tenures yet. Create one to get started.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tenures.map((tenure) => (
            <TenureCard
              key={tenure.id}
              tenure={tenure}
              memberCount={getMemberCount(tenure.id)}
              onOpen={onOpen}
              onDuplicate={onDuplicate}
              isDuplicating={isDuplicating}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}