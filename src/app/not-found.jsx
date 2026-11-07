"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutDashboard, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 h-16">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="size-9 rounded-xl overflow-hidden border border-border shadow-2xs bg-card p-0.5 group-hover:border-primary/50 transition-colors">
              <Image
                src="/logo.jpg"
                alt="CSITABMC"
                width={36}
                height={36}
                className="size-full rounded-lg object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                CSIT Association of BMC
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                Management Portal
              </span>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl mx-auto text-center">
          {/* Main Card */}
          <div className="rounded-2xl border border-border/60 bg-card/60 dark:bg-card/40 backdrop-blur-md p-8 sm:p-10 shadow-lg shadow-black/5 dark:shadow-none space-y-6">
            {/* Top Indicator */}
            <div className="flex flex-col items-center gap-3">
              <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                <Compass className="size-7 stroke-[1.75]" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
                Error 404
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Route Not Found
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                The requested URL doesn&apos;t exist, has been relocated, or you may have followed an outdated link.
              </p>
            </div>

            {/* Primary / Secondary Actions */}
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
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/30 py-4 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} CSIT Association of BMC. All rights reserved.
      </footer>
    </div>
  );
}
