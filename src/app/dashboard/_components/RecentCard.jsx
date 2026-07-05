"use strict";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "./SectionHeader";

export default function RecentCard({ title, icon, viewAllHref, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-2xs flex flex-col justify-between h-full w-full">
      <div>
        <SectionHeader title={title} icon={icon} />
        <div className="space-y-1 mt-2">{children}</div>
      </div>
      <div className="mt-5 pt-3 border-t border-border">
        <Link href={viewAllHref} className="group inline-flex items-center justify-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors w-full sm:w-auto">
          <span>View All Entries</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}