"use client";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function AlumniPageHeader({ onAddAlumni }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-primary">Alumni</h1>
        <p className="text-sm text-muted-foreground font-normal">
          Manage alumni members, roles, and profile information.
        </p>
      </div>
      <div className="shrink-0">
        <Button
          size="sm"
          onClick={onAddAlumni}
          className="bg-[#0b2574] text-white hover:bg-[#0b2574]/90 gap-1.5 text-xs font-medium h-9 px-4 shadow-sm w-full sm:w-auto cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Add Alumni
        </Button>
      </div>
    </div>
  );
}
