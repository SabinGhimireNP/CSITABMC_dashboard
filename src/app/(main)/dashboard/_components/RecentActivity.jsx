"use strict";

import React from "react";
import { FileText, CalendarDays, Award, AlertCircle } from "lucide-react";
import RecentCard from "./RecentCard";
import RecentItem from "./RecentItem";
import EmptyState from "./EmptyState";

export default function RecentActivity({ notices = [], events = [], certificates = [] }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start w-full">
      <RecentCard title="Notices Content" icon={FileText} viewAllHref="/dashboard/notices">
        {notices.length === 0 ? <EmptyState icon={AlertCircle} description="Collection empty." /> : 
          notices.map((n) => <RecentItem key={n.id} title={n.title} subtitle={n.category} badgeText={n.status} />)}
      </RecentCard>

      <RecentCard title="Events Content" icon={CalendarDays} viewAllHref="/dashboard/events">
        {events.length === 0 ? <EmptyState icon={AlertCircle} description="Collection empty." /> : 
          events.map((e) => <RecentItem key={e.id} title={e.title} subtitle={e.location} badgeText={e.registrationOpen ? "Open" : "Closed"} />)}
      </RecentCard>

      <RecentCard title="Certificates Content" icon={Award} viewAllHref="/dashboard/certificates">
        {certificates.length === 0 ? <EmptyState icon={AlertCircle} description="Collection empty." /> : 
          certificates.map((c) => <RecentItem key={c.id} title={c.fullName} subtitle={c.createdAt} badgeText={c.isProjectComplete} />)}
      </RecentCard>
    </section>
  );
}