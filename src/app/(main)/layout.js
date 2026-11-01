"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/common/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SideBar } from "@/components/common/SideBar";
import { AuthGuard } from "@/components/common/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Inner layout — rendered only when AuthGuard confirms authentication.
 * AuthGuard owns the single background token-refresh schedule.
 */
function DashboardShell({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* 1. Left Sidebar */}
        <SideBar />

        {/* 2. Right Side Workspace Container */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Top Header */}
          <Header />

          {/* Main Scrollable Content Dashboard Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function MainLayout({ children }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
