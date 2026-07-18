"use client";

import React from "react";
import DashboardHeader from "./_components/DashboardHeader";
import DashboardStats from "./_components/DashboardStats";
import RecentActivity from "./_components/RecentActivity";
import {
  useDashboardStats,
  useRecentNotices,
  useRecentEvents,
  useRecentCertificates,
} from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: notices, isLoading: noticesLoading } = useRecentNotices();
  const { data: events, isLoading: eventsLoading } = useRecentEvents();
  const { data: certificates, isLoading: certsLoading } = useRecentCertificates();

  const isLoading = statsLoading || noticesLoading || eventsLoading || certsLoading;

  return (
    <main className="min-h-screen w-full bg-slate-50/40 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      <div className="mx-auto p-4 sm:p-6 lg:p-8 space-y-8 md:space-y-10">
        
        <DashboardHeader />
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <DashboardStats stats={stats} />
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <RecentActivity
            notices={notices || []}
            events={events || []}
            certificates={certificates || []}
          />
        )}
        
      </div>
    </main>
  );
}