"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/authStore";
import { getUserRole } from "@/lib/roles";

export function AccessDenied({ message, requiredRole }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const currentRole = getUserRole(user) || "Unknown";

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 w-full min-h-[70vh]">
      <div className="w-full max-w-xl mx-auto text-center">
        {/* Main Card */}
        <div className="rounded-2xl border border-border/60 bg-card/60 dark:bg-card/40 backdrop-blur-md p-8 sm:p-10 shadow-lg shadow-black/5 dark:shadow-none space-y-6">
          {/* Top Indicator */}
          <div className="flex flex-col items-center gap-3">
            <div className="size-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shadow-xs">
              <ShieldAlert className="size-7 stroke-[1.75]" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-xs font-semibold tracking-wider uppercase text-destructive">
              <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
              Restricted Access
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Access Denied
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              {message || "You do not have the necessary permissions to view or manage this section."}
            </p>
          </div>

          {/* Role Status Details */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-muted/30 text-xs">
              <span className="text-muted-foreground">Your Role:</span>
              <Badge variant="outline" className="capitalize font-medium text-[11px] h-5 px-1.5">
                {currentRole}
              </Badge>
            </div>
            {requiredRole && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-muted/30 text-xs">
                <span className="text-muted-foreground">Required Role:</span>
                <Badge variant="secondary" className="capitalize font-medium text-[11px] h-5 px-1.5">
                  {requiredRole}
                </Badge>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              onClick={handleGoBack}
              className="w-full sm:w-auto rounded-xl px-5 gap-2 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              Go Back
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-xl px-5 gap-2 shadow-xs"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" />
                Return to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
