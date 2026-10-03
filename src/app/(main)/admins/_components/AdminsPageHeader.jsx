"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function AdminsPageHeader({ onAddAdmin }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-primary">Admin Access</h1>
        <p className="text-sm text-muted-foreground font-normal">Manage sub-admins and their platform access roles.</p>
      </div>
      <div className="shrink-0">
        <Button
          size="sm"
          onClick={onAddAdmin}
          className="bg-[#0b2574] text-white hover:bg-[#0b2574]/90 gap-1.5 text-xs font-medium h-9 px-4 shadow-sm w-full sm:w-auto cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Add Admin
        </Button>
      </div>
    </div>
  );
}
