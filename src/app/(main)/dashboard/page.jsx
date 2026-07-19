"use client";

import React from "react";
import DashboardHeader from "./_components/DashboardHeader";
import DashboardStats from "./_components/DashboardStats";
import RecentActivity from "./_components/RecentActivity";
import DashboardSkeleton from "./_components/DashboardSkeleton";
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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="min-h-screen w-full bg-slate-50/40 text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      <div className="mx-auto p-4 sm:p-6 lg:p-8 space-y-8 md:space-y-10">
        
        <DashboardHeader />
        
        <DashboardStats stats={stats} />
        
        <RecentActivity
          notices={notices || []}
          events={events || []}
          certificates={certificates || []}
        />
        
      </div>
    </main>
  );
}