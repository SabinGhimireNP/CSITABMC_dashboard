"use strict";

import React from "react";
import DashboardHeader from "./_components/DashboardHeader";
import DashboardStats from "./_components/DashboardStats";
import RecentActivity from "./_components/RecentActivity";

export default function DashboardPage() {
  return (
    <main className="min-h-screen w-full bg-slate-50/40 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Optimized Layout Structural Wrapper */}
      <div className=" mx-auto p-4 sm:p-6 lg:p-8 space-y-8 md:space-y-10">
        
        {/* Header Block Section */}
        <DashboardHeader />
        
        {/* Core Statistical Grid Layout */}
        <DashboardStats />
        
        {/* Chronological Activities / Logs Area Layout */}
        <RecentActivity />
        
      </div>
    </main>
  );
}