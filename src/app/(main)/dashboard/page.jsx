"use strict";

export const dynamic = "force-dynamic";

import React from "react";
import DashboardHeader from "./_components/DashboardHeader";
import DashboardStats from "./_components/DashboardStats";
import RecentActivity from "./_components/RecentActivity";
import {
  getDashboardStats,
  getRecentNotices,
  getRecentEvents,
  getRecentCertificates,
} from "@/api/dashboard";

export default async function DashboardPage() {
  const [stats, notices, events, certificates] = await Promise.all([
    getDashboardStats(),
    getRecentNotices(),
    getRecentEvents(),
    getRecentCertificates(),
  ]);

  return (
    <main className="min-h-screen w-full bg-slate-50/40 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Optimized Layout Structural Wrapper */}
      <div className="mx-auto p-4 sm:p-6 lg:p-8 space-y-8 md:space-y-10">
        
        {/* Header Block Section */}
        <DashboardHeader />
        
        {/* Core Statistical Grid Layout */}
        <DashboardStats stats={stats} />
        
        {/* Chronological Activities / Logs Area Layout */}
        <RecentActivity
          notices={notices}
          events={events}
          certificates={certificates}
        />
        
      </div>
    </main>
  );
}