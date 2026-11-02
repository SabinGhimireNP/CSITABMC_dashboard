"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/authStore";
import { getUserRole } from "@/lib/roles";

export function AccessDenied({ message, requiredRole }) {
  const user = useAuthStore((state) => state.user);
  const currentRole = getUserRole(user) || "Unknown";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Access Denied
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        {message || "You do not have the necessary permissions to view or manage this section."}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Your active role:</span>
        <Badge variant="outline" className="capitalize font-medium">
          {currentRole}
        </Badge>
        {requiredRole && (
          <>
            <span className="text-xs text-muted-foreground">Required:</span>
            <Badge variant="secondary" className="capitalize font-medium">
              {requiredRole}
            </Badge>
          </>
        )}
      </div>

      <div className="mt-6">
        <Button asChild variant="default" className="gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
