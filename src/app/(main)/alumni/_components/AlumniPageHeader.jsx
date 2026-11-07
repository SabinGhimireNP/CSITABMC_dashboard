"use client";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function AlumniPageHeader({ onAddAlumni }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary break-words">Alumni</h1>
        <p className="text-sm text-muted-foreground font-normal">
          Manage alumni members, roles, and profile information.
        </p>
      </div>
      <div className="shrink-0">
        <Button
          size="sm"
          onClick={onAddAlumni}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs font-semibold h-9 px-4 shadow-2xs w-full sm:w-auto cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Add Alumni
        </Button>
      </div>
    </div>
  );
}
