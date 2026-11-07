"use client";

import React, { useState } from "react";
import { ArrowUpDown, ImageIcon, Pencil, Trash2, Copy } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import { EventDeleteDialog } from "./EventDeleteDialog";
import { usePermission } from "@/hooks/usePermission";
import { Badge } from "@/components/ui/badge";

export function EventTable({
  events = [],
  onDeleteEvent,
  onEditEvent,
  onDuplicateEvent,
  onUpdateEventStatus,
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
  const { can } = usePermission();
  const [eventToDelete, setEventToDelete] = useState(null);
  const canEdit = can("events.edit");
  const canCreate = can("events.create");
  const canDelete = can("events.delete");

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
    if (sortOrder === "asc") return <span className="text-primary font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-primary font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) { onDeleteEvent(eventToDelete.id); setEventToDelete(null); }
  };

  const formatDateRange = (start, end) => {
    if (!start) return "—";
    if (!end || end === start) return start;
    return `${start} → ${end}`;
  };

  const renderActions = (event) => (
    <RowActionsMenu
      label={`Actions for ${event.title}`}
      items={[
        { label: "Edit", icon: Pencil, hidden: !canEdit, onClick: () => onEditEvent?.(event) },
        { label: "Duplicate", icon: Copy, hidden: !canCreate, onClick: () => onDuplicateEvent?.(event) },
        { label: "Delete", icon: Trash2, destructive: true, hidden: !canDelete, onClick: () => setEventToDelete(event) },
      ]}
    />
  );

  const statusBadge = (status) => (
    <Badge
      variant="outline"
      className={`text-[10px] font-bold ${
        status === "published"
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
      }`}
    >
      {(status && status.toUpperCase()) || "—"}
    </Badge>
  );

  const thumb = (event) =>
    event.image ? (
      <div className="w-9 h-9 rounded-lg overflow-hidden border border-border bg-muted/40 shrink-0">
        <img src={event.image} alt="" className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = "none"; }} />
      </div>
    ) : (
      <div className="w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center border border-border text-muted-foreground shrink-0">
        <ImageIcon className="h-4 w-4 opacity-70" />
      </div>
    );

  return (
    <div className="w-full flex flex-col">
      {/* Mobile: record cards */}
      <ResponsiveRecordList
        className="md:hidden"
        items={events}
        getKey={(e) => e.id}
        emptyText="No matching events discovered."
        renderLeading={thumb}
        renderTitle={(e) => e.title}
        renderSubtitle={(e) => [`#${e.id}`, e.organizer, e.tenureName].filter(Boolean).join(" · ")}
        renderBadge={(e) => statusBadge(e.status)}
        fields={[
          { label: "Dates", render: (e) => formatDateRange(e.startDate, e.endDate) },
          { label: "Category", render: (e) => e.category },
          {
            label: "Mentors",
            render: (e) =>
              e.mentor_assignments?.length
                ? e.mentor_assignments.map((m) => `${m.mentor_name} (${m.role_label})`).join(", ")
                : "Unassigned",
          },
        ]}
        renderActions={renderActions}
      />

      {/* md+: full table */}
      <div className="hidden md:block w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-240 table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-xs select-none">
              <th onClick={() => onHeaderClick("id")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[6%]">
                <div className="flex items-center gap-1.5">ID {renderSortIndicator("id")}</div>
              </th>
              <th className="py-3 px-4 w-[6%]">Image</th>
              <th onClick={() => onHeaderClick("title")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[22%]">
                <div className="flex items-center gap-1.5">Title {renderSortIndicator("title")}</div>
              </th>
              <th className="py-3 px-4 w-[16%]">Mentors</th>
              <th onClick={() => onHeaderClick("category")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[12%]">
                <div className="flex items-center gap-1.5">Category {renderSortIndicator("category")}</div>
              </th>
              <th onClick={() => onHeaderClick("startDate")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[16%]">
                <div className="flex items-center gap-1.5">Dates {renderSortIndicator("startDate")}</div>
              </th>
              <th onClick={() => onHeaderClick("status")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[12%]">
                <div className="flex items-center gap-1.5">Status {renderSortIndicator("status")}</div>
              </th>
              <th className="py-3 px-4 text-right pr-6 w-[10%] sticky right-0 bg-muted/95 border-b border-border">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-foreground text-xs">
            {events.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground font-medium bg-card">
                  No matching events discovered.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-muted/40 transition-colors group h-14 bg-card">
                  <td className="py-2 px-4 font-semibold text-foreground tabular-nums truncate">{event.id}</td>

                  <td className="py-2 px-4">{thumb(event)}</td>

                  <td className="py-2 px-4 max-w-xs truncate">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
                      {event.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal truncate block">
                      {event.organizer}{event.tenureName ? ` · ${event.tenureName}` : ""}
                    </span>
                  </td>

                  <td className="py-2 px-4">
                    {event.mentor_assignments?.length > 0 ? (
                      <div className="flex items-center gap-2 max-w-[210px]">
                        <div className="flex -space-x-1.5 shrink-0">
                          {event.mentor_assignments.slice(0, 2).map((a, idx) => (
                            <div
                              key={idx}
                              className="relative inline-flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-card bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-[10px] shadow-xs uppercase overflow-hidden"
                              title={`${a.mentor_name} (${a.role_label})`}
                            >
                              {a.mentor_photo ? (
                                <img
                                  src={a.mentor_photo}
                                  alt={a.mentor_name}
                                  className="size-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                a.mentor_name ? a.mentor_name.charAt(0) : "M"
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-semibold text-foreground text-xs truncate block"
                              title={event.mentor_assignments.map((m) => `${m.mentor_name} (${m.role_label})`).join(", ")}
                            >
                              {event.mentor_assignments[0].mentor_name}
                            </span>
                            {event.mentor_assignments.length > 1 && (
                              <span
                                className="shrink-0 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border"
                                title={event.mentor_assignments.slice(1).map((m) => `${m.mentor_name} (${m.role_label})`).join(", ")}
                              >
                                +{event.mentor_assignments.length - 1}
                              </span>
                            )}
                          </div>
                          <span className="inline-block text-[10px] font-medium text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded mt-0.5 truncate max-w-full">
                            {event.mentor_assignments[0].role_label}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                        Unassigned
                      </span>
                    )}
                  </td>

                  <td className="py-2 px-4 font-medium text-foreground/80 truncate">{event.category}</td>

                  <td className="py-2 px-4 font-normal text-muted-foreground tabular-nums truncate">
                    {formatDateRange(event.startDate, event.endDate)}
                  </td>

                  <td className="py-2 px-4 truncate">{statusBadge(event.status)}</td>

                  <td className="py-2 px-4 text-right pr-6 sticky right-0 bg-card group-hover:bg-muted/40 transition-colors">
                    {renderActions(event)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border bg-muted/20">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          isEmbedded={true}
        />
      </div>

      <EventDeleteDialog
        event={eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}