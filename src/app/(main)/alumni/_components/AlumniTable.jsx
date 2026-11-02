"use client";

import React, { useState } from "react";
import { ArrowUpDown, Pencil, Trash2, User } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "active": return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "draft":  return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    default:       return "bg-muted text-muted-foreground border-border";
  }
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(status)}`}>
    {(status || "ACTIVE").toUpperCase()}
  </span>
);

const AlumniPhoto = ({ alumni }) =>
  alumni.image ? (
    <div className="w-9 h-9 rounded-full overflow-hidden border border-border bg-muted/40 shrink-0">
      <img src={alumni.image} alt="" className="w-full h-full object-cover"
        onError={(e) => { e.target.style.display = "none"; }} />
    </div>
  ) : (
    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 text-primary">
      <User className="h-4 w-4" />
    </div>
  );

export function AlumniTable({
  alumni = [],
  onDeleteAlumni,
  onEditAlumni,
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
  const [alumniToDelete, setAlumniToDelete] = useState(null);

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
    if (sortOrder === "asc")  return <span className="text-primary font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-primary font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
  };

  const handleConfirmDelete = () => {
    if (alumniToDelete) { onDeleteAlumni(alumniToDelete.id); setAlumniToDelete(null); }
  };

  const renderActions = (a) => (
    <RowActionsMenu
      label={`Actions for ${a.fullName}`}
      items={[
        { label: "Edit", icon: Pencil, onClick: () => onEditAlumni?.(a) },
        { label: "Delete", icon: Trash2, destructive: true, onClick: () => setAlumniToDelete(a) },
      ]}
    />
  );

  return (
    <div className="w-full flex flex-col">
      {/* Mobile: record cards */}
      <ResponsiveRecordList
        className="md:hidden"
        items={alumni}
        getKey={(a) => a.id}
        emptyText="No alumni found. Add one to get started."
        renderLeading={(a) => <AlumniPhoto alumni={a} />}
        renderTitle={(a) => a.fullName}
        renderSubtitle={(a) => <span className="break-all">{a.email}</span>}
        renderBadge={(a) => <StatusBadge status={a.status} />}
        fields={[
          { label: "Alumni ID", render: (a) => a.memberId },
          { label: "Graduation Year", render: (a) => a.graduationYear || "—" },
        ]}
        renderActions={renderActions}
      />

      {/* md+: full table */}
      <div className="hidden md:block w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-200 table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-xs select-none">
              <th onClick={() => onHeaderClick("memberId")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[12%]">
                <div className="flex items-center gap-1.5">Alumni ID {renderSortIndicator("memberId")}</div>
              </th>
              <th className="py-3 px-4 w-[8%]">Photo</th>
              <th onClick={() => onHeaderClick("fullName")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[22%]">
                <div className="flex items-center gap-1.5">Full Name {renderSortIndicator("fullName")}</div>
              </th>
              <th onClick={() => onHeaderClick("graduationYear")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[15%]">
                <div className="flex items-center gap-1.5">Graduation Year {renderSortIndicator("graduationYear")}</div>
              </th>
              <th onClick={() => onHeaderClick("email")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[20%]">
                <div className="flex items-center gap-1.5">Email {renderSortIndicator("email")}</div>
              </th>
              <th className="py-3 px-4 w-[10%]">Status</th>
              <th className="py-3 px-4 text-right pr-6 w-[10%] sticky right-0 bg-muted/95 border-b border-border">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-foreground text-xs">
            {alumni.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground font-medium bg-card">
                  No alumni found. Add one to get started.
                </td>
              </tr>
            ) : (
              alumni.map((a) => (
                <tr key={a.id} className="hover:bg-muted/40 transition-colors group h-14 bg-card">
                  <td className="py-2 px-4 font-semibold text-foreground tabular-nums truncate text-[10px]">{a.memberId}</td>
                  <td className="py-2 px-4"><AlumniPhoto alumni={a} /></td>
                  <td className="py-2 px-4 max-w-xs truncate">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors block truncate" title={a.fullName}>
                      {a.fullName}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate block">{a.email}</span>
                  </td>
                  <td className="py-2 px-4 font-medium text-foreground/80 truncate">{a.graduationYear || "—"}</td>
                  <td className="py-2 px-4 font-normal text-muted-foreground truncate" title={a.email}>{a.email}</td>
                  <td className="py-2 px-4 whitespace-nowrap"><StatusBadge status={a.status} /></td>
                  <td className="py-2 px-4 text-right pr-6 sticky right-0 bg-card group-hover:bg-muted/40 transition-colors">{renderActions(a)}</td>
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

      <ConfirmDialog
        open={Boolean(alumniToDelete)}
        title="Remove alumni?"
        message={
          <>
            Are you sure you want to remove{" "}
            <span className="font-semibold text-foreground">&quot;{alumniToDelete?.fullName}&quot;</span>? This action cannot be undone.
          </>
        }
        confirmLabel="Confirm Remove"
        onClose={() => setAlumniToDelete(null)}
        onConfirm={handleConfirmDelete}
        zIndexClass="z-50"
      />
    </div>
  );
}
