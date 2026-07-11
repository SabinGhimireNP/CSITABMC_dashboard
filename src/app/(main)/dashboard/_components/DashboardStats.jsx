"use strict";

import React from "react";
import { FileText, CalendarDays, Users, Award } from "lucide-react";
import StatCard from "./StatCard";
import { 
  getPublishedNotices, 
  getOpenEvents, 
  getTotalMentorsCount, 
  getCompletedCertificates 
} from "@/api/dashboard";

export default function DashboardStats() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
      <StatCard 
        title="Published Notices" 
        value={getPublishedNotices().length} 
        icon={FileText} 
        statusText="Active global items" 
      />
      <StatCard 
        title="Open Events" 
        value={getOpenEvents().length} 
        icon={CalendarDays} 
        statusText="Live registration hooks" 
      />
      <StatCard 
        title="Total Mentors" 
        value={getTotalMentorsCount()} 
        icon={Users} 
        statusText="Verified active profiles" 
      />
      <StatCard 
        title="Certificates Issued" 
        value={getCompletedCertificates().length} 
        icon={Award} 
        statusText="Passed criteria metrics" 
      />
    </section>
  );
}