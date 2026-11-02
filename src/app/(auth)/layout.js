"use client";

import React from "react";
import Link from "next/link";
import { GuestGuard } from "@/components/common/GuestGuard";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function AuthLayout({ children }) {
  return (
    <GuestGuard>
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-8 transition-colors duration-200">
        {/* Top Header / Branding & Theme Toggle */}
        <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
          <Link href="/login" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-border shadow-xs bg-card p-0.5 group-hover:border-primary/50 transition-colors">
              <img
                src="/logo.jpg"
                alt="CSITABMC"
                className="size-full rounded-lg object-cover"
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                CSIT Association of BMC
              </h1>
              <p className="text-[11px] font-medium text-muted-foreground">
                Management Portal
              </p>
            </div>
          </Link>
          <ThemeToggle />
        </header>

        {/* Main Centered Content */}
        <main className="my-auto py-8 w-full flex items-center justify-center">
          {children}
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CSIT Association of BMC. All rights reserved.
        </footer>
      </div>
    </GuestGuard>
  );
}