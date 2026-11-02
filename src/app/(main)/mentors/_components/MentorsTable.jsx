"use client";

import React, { useState } from "react";
import { ArrowUpDown, UserCircle, Pencil, Trash2, Copy, ExternalLink } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import { MentorDeleteDialog } from "./MentorDeleteDialog";

// Event-specific roles come from the mentor's assignments, e.g. "Hackathon (Main Mentor)".
const getEventNames = (assignments = []) => {
  if (!assignments.length) return "—";
  return assignments
    .map((a) => `${a.eventTitle}${a.roleLabel ? ` (${a.roleLabel})` : ""}`)
    .join(", ");
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${status === "published" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"}`}>
    {(status && status.toUpperCase()) || "—"}
  </span>
);

const MentorPhoto = ({ mentor }) =>
  mentor.image ? (
    <div className="w-9 h-9 rounded-full overflow-hidden border border-border bg-muted/40 shrink-0">
      <img src={mentor.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
    </div>
  ) : (
    <div className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center border border-border text-muted-foreground shrink-0">
      <UserCircle className="h-5 w-5 opacity-70" />
    </div>
  );

const SocialLink = ({ href }) =>
  href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-primary hover:underline font-medium transition-colors">
      <ExternalLink className="h-3.5 w-3.5" /> Profile
    </a>
  ) : (
    <span className="text-muted-foreground">—</span>
  );

export function MentorTable({
  mentors = [],
  onDeleteMentor,
  onEditMentor,
  onDuplicateMentor,
  sortField,
  sortOrder,
  onHeaderClick,
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) {
  const [mentorToDelete, setMentorToDelete] = useState(null);

  const handleConfirmDelete = () => {
    if (mentorToDelete) { onDeleteMentor(mentorToDelete.id); setMentorToDelete(null); }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
    if (sortOrder === "asc") return <span className="text-primary font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-primary font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
  };

  const renderActions = (mentor) => (
    <RowActionsMenu
      label={`Actions for ${mentor.fullName}`}
      items={[
        { label: "Edit", icon: Pencil, onClick: () => onEditMentor?.(mentor) },
        { label: "Duplicate", icon: Copy, onClick: () => onDuplicateMentor?.(mentor) },
        { label: "Delete", icon: Trash2, destructive: true, onClick: () => setMentorToDelete(mentor) },
      ]}
    />
  );

  return (
    <div className="w-full flex flex-col">
      {/* Mobile: record cards */}
      <ResponsiveRecordList
        className="md:hidden"
        items={mentors}
        getKey={(m) => m.id}
        emptyText="No matching mentors found."
        renderLeading={(m) => <MentorPhoto mentor={m} />}
        renderTitle={(m) => m.fullName}
        renderSubtitle={(m) => `#${m.id}`}
        renderBadge={(m) => <StatusBadge status={m.status} />}
        fields={[
          { label: "Events", render: (m) => getEventNames(m.eventAssignments) },
          { label: "Social", render: (m) => (m.socialLink ? <SocialLink href={m.socialLink} /> : null) },
        ]}
        renderActions={renderActions}
      />

      {/* md+: full table */}
      <div className="hidden md:block w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-200 table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-xs select-none">
              <th onClick={() => onHeaderClick("id")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[8%]">
                <div className="flex items-center gap-1.5">ID {renderSortIndicator("id")}</div>
              </th>
              <th className="py-3 px-4 w-[8%]">Photo</th>
              <th onClick={() => onHeaderClick("fullName")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[20%]">
                <div className="flex items-center gap-1.5">Full Name {renderSortIndicator("fullName")}</div>
              </th>
              <th className="py-3 px-4 w-[30%]">Events</th>
              <th className="py-3 px-4 w-[11%]">Social</th>
              <th onClick={() => onHeaderClick("status")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[12%]">
                <div className="flex items-center gap-1.5">Status {renderSortIndicator("status")}</div>
              </th>
              <th className="py-3 px-4 text-right pr-6 w-[8%] sticky right-0 bg-muted/95 border-b border-border">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-foreground text-xs">
            {mentors.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground font-medium bg-card">
                  No matching mentors found.
                </td>
              </tr>
            ) : (
              mentors.map((mentor) => (
                <tr key={mentor.id} className="hover:bg-muted/40 transition-colors group h-14 bg-card">
                  <td className="py-2 px-4 font-semibold text-foreground tabular-nums truncate">{mentor.id}</td>
                  <td className="py-2 px-4"><MentorPhoto mentor={mentor} /></td>
                  <td className="py-2 px-4 max-w-xs truncate">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors block truncate" title={mentor.fullName}>
                      {mentor.fullName}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-muted-foreground font-normal truncate" title={getEventNames(mentor.eventAssignments)}>
                    {getEventNames(mentor.eventAssignments)}
                  </td>
                  <td className="py-2 px-4"><SocialLink href={mentor.socialLink} /></td>
                  <td className="py-2 px-4 truncate"><StatusBadge status={mentor.status} /></td>
                  <td className="py-2 px-4 text-right pr-6 sticky right-0 bg-card group-hover:bg-muted/40 transition-colors">{renderActions(mentor)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border bg-muted/20">
        <Pagination currentPage={currentPage} totalPages={totalPages} totalRows={totalRows} rowsPerPage={rowsPerPage} onPageChange={onPageChange} onRowsPerPageChange={onRowsPerPageChange} isEmbedded={true} />
      </div>

      <MentorDeleteDialog
        mentor={mentorToDelete}
        onClose={() => setMentorToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
