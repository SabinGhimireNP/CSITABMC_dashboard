"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutDashboard, FileQuestion } from "lucide-react";
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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-8 transition-colors duration-200">
      {/* Top Header / Branding & Theme Toggle */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/dashboard" className="flex items-center gap-3 group">
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

      {/* Main 404 Hero Card */}
      <main className="max-w-md mx-auto w-full my-auto py-12 px-2 text-center">
        <div className="relative rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-xl text-card-foreground">
          {/* Subtle decorative glow */}
          <div
            className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Icon Badge */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="h-20 w-20 rounded-2xl bg-muted/60 border border-border flex items-center justify-center shadow-inner">
              <FileQuestion className="h-10 w-10 text-primary" strokeWidth={1.75} />
            </div>
          </div>

          {/* 404 Tag */}
          <div className="inline-flex items-center px-3 py-1 mb-3 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
            Error 404
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-3">
            Page Not Found
          </h2>

          <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
            The page you are looking for doesn’t exist or has been moved to another location.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleGoBack}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-sm font-medium shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium shadow-sm transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} CSIT Association of BMC. All rights reserved.
      </footer>
    </div>
  );
}
