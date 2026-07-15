"use strict";

import React from "react";
import { FileText, CalendarDays, Users, Award } from "lucide-react";
import StatCard from "./StatCard";

export default function DashboardStats({ stats }) {
  const {
    publishedNoticesCount = 0,
    openEventsCount = 0,
    totalMentorsCount = 0,
    certificatesIssuedCount = 0,
  } = stats || {};

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
      <StatCard 
        title="Published Notices" 
        value={publishedNoticesCount} 
        icon={FileText} 
        statusText="Active global items" 
      />
      <StatCard 
        title="Open Events" 
        value={openEventsCount} 
        icon={CalendarDays} 
        statusText="Live registration hooks" 
      />
      <StatCard 
        title="Total Mentors" 
        value={totalMentorsCount} 
        icon={Users} 
        statusText="Verified active profiles" 
      />
      <StatCard 
        title="Certificates Issued" 
        value={certificatesIssuedCount} 
        icon={Award} 
        statusText="Passed criteria metrics" 
      />
    </section>
  );
}