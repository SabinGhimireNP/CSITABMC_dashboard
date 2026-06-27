"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Download } from "lucide-react";

export function MemberToolbar({ searchQuery, onSearchChange, filteredData }) {
  const handleDownloadCSV = () => {
    if (!filteredData || filteredData.length === 0) return;

    const headers = ["Member ID", "Full Name", "Post", "Email", "Tags", "Status"];
    const rows = filteredData.map((m) => [
      `"${m.memberId || ""}"`,
      `"${(m.fullName || "").replace(/"/g, '""')}"`,
      `"${m.post || ""}"`,
      `"${m.email || ""}"`,
      `"${(m.tags || []).join(", ")}"`,
      `"${m.status || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `members_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, post, or email..."
          className="pl-9 h-9 border-border bg-transparent placeholder:text-muted-foreground/50 text-sm focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownloadCSV}
          className="h-9 text-xs gap-1.5 text-muted-foreground font-medium hover:text-foreground cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          Download CSV
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-xs gap-1.5 text-muted-foreground font-medium cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
        </Button>
      </div>
    </div>
  );
}