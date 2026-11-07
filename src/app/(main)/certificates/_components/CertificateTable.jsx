"use client";

import React, { useState } from "react";
import { ArrowUpDown, Pencil, Trash2, Copy } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import { CertificateDeleteDialog } from "./CertificateDeleteDialog";
import { usePermission } from "@/hooks/usePermission";
import { Badge } from "@/components/ui/badge";

const CHECKBOX_CLASS =
  "rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer bg-background";

const ProjectBadge = ({ complete }) => (
  <Badge
    variant="outline"
    className={`text-[10px] font-bold ${
      complete
        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
    }`}
  >
    {complete ? "COMPLETE" : "INCOMPLETE"}
  </Badge>
);

const CopyIdButton = ({ id }) => (
  <button
    type="button"
    onClick={() => navigator.clipboard.writeText(id)}
    className="shrink-0 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
    title="Copy ID"
    aria-label="Copy certificate ID"
  >
    <Copy size={14} />
  </button>
);

export function CertificateTable({
  certificates = [],
  eventsList = [],
  onDeleteCertificate,
  onEditCertificate,
  onDuplicateCertificate,
  sortField,
  sortOrder,
  onHeaderClick,
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  selectedIds = [],
  onSelectionChange,
}) {
  const { can } = usePermission();
  const canEdit = can("certificates.edit");
  const canDelete = can("certificates.delete");
  const canCreate = can("certificates.create");

  const [certToDelete, setCertToDelete] = useState(null);

  const handleConfirmDelete = () => {
    if (certToDelete) {
      onDeleteCertificate(certToDelete.id);
      setCertToDelete(null);
    }
  };

  const getEventTitle = (eventId) =>
    eventsList.find((e) => String(e.id) === String(eventId))?.title || "—";

  const toggleOne = (id, checked) =>
    onSelectionChange(checked ? [...selectedIds, id] : selectedIds.filter((x) => x !== id));

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
    if (sortOrder === "asc") return <span className="text-primary font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-primary font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
  };

  const renderActions = (cert) => (
    <RowActionsMenu
      label={`Actions for certificate of ${cert.fullName}`}
      items={[
        { label: "Edit", icon: Pencil, hidden: !canEdit, onClick: () => onEditCertificate?.(cert) },
        { label: "Duplicate", icon: Copy, hidden: !canCreate, onClick: () => onDuplicateCertificate?.(cert) },
        { label: "Delete", icon: Trash2, destructive: true, hidden: !canDelete, onClick: () => setCertToDelete(cert) },
      ]}
    />
  );

  const allSelected = certificates.length > 0 && selectedIds.length === certificates.length;
  const toggleAll = (checked) => onSelectionChange(checked ? certificates.map((c) => c.id) : []);

  return (
    <div className="w-full flex flex-col">
      {/* Mobile: record cards */}
      <div className="md:hidden">
        {certificates.length > 0 && (
          <label className="flex items-center gap-2 px-4 py-2.5 border-b border-border text-xs font-medium text-muted-foreground bg-muted/40">
            <input type="checkbox" className={CHECKBOX_CLASS} checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} />
            Select all on this page
          </label>
        )}
        <ResponsiveRecordList
          items={certificates}
          getKey={(c) => c.id}
          emptyText="No matching certificates found."
          renderSelect={(c) => (
            <input
              type="checkbox"
              aria-label={`Select certificate of ${c.fullName}`}
              className={CHECKBOX_CLASS}
              checked={selectedIds.includes(c.id)}
              onChange={(e) => toggleOne(c.id, e.target.checked)}
            />
          )}
          renderTitle={(c) => c.fullName}
          renderSubtitle={(c) => (
            <span className="flex items-center gap-1 min-w-0">
              <span className="font-mono break-all">{c.id}</span>
              <CopyIdButton id={c.id} />
            </span>
          )}
          renderBadge={(c) => <ProjectBadge complete={c.isProjectComplete} />}
          fields={[
            { label: "Event", render: (c) => getEventTitle(c.event) },
            { label: "Created At", render: (c) => c.createdAt || "—" },
          ]}
          renderActions={renderActions}
        />
      </div>

      {/* md+: full table */}
      <div className="hidden md:block w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-200 table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-xs select-none">
              <th className="py-3 px-4 w-[5%]">
                <input
                  type="checkbox"
                  aria-label="Select all certificates on this page"
                  className={CHECKBOX_CLASS}
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th onClick={() => onHeaderClick("id")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[25%]">
                <div className="flex items-center gap-1.5">ID {renderSortIndicator("id")}</div>
              </th>
              <th onClick={() => onHeaderClick("fullName")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[18%]">
                <div className="flex items-center gap-1.5">Full Name {renderSortIndicator("fullName")}</div>
              </th>
              <th onClick={() => onHeaderClick("event")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[20%]">
                <div className="flex items-center gap-1.5">Event {renderSortIndicator("event")}</div>
              </th>
              <th className="py-3 px-4 w-[12%]">Project Status</th>
              <th onClick={() => onHeaderClick("createdAt")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[13%]">
                <div className="flex items-center gap-1.5">Created At {renderSortIndicator("createdAt")}</div>
              </th>
              <th className="py-3 px-4 text-right pr-6 w-[7%] sticky right-0 bg-muted/95 border-b border-border">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-foreground text-xs">
            {certificates.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground font-medium bg-card">
                  No matching certificates found.
                </td>
              </tr>
            ) : (
              certificates.map((cert) => {
                const selected = selectedIds.includes(cert.id);
                const rowBg = selected ? "bg-muted/60" : "bg-card";
                return (
                  <tr key={cert.id} className={`hover:bg-muted/40 transition-colors group h-14 ${rowBg}`}>
                    <td className="py-2 px-4">
                      <input
                        type="checkbox"
                        aria-label={`Select certificate of ${cert.fullName}`}
                        className={CHECKBOX_CLASS}
                        checked={selected}
                        onChange={(e) => toggleOne(cert.id, e.target.checked)}
                      />
                    </td>
                    <td className="py-2 px-4 font-semibold text-foreground tabular-nums">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate font-mono text-[11px]" title={cert.id}>{cert.id}</span>
                        <CopyIdButton id={cert.id} />
                      </div>
                    </td>
                    <td className="py-2 px-4 truncate">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate block" title={cert.fullName}>
                        {cert.fullName}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-muted-foreground font-normal truncate" title={getEventTitle(cert.event)}>
                      {getEventTitle(cert.event)}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <ProjectBadge complete={cert.isProjectComplete} />
                    </td>
                    <td className="py-2 px-4 font-normal text-muted-foreground tabular-nums truncate">{cert.createdAt || "—"}</td>
                    <td className={`py-2 px-4 text-right pr-6 sticky right-0 ${rowBg} group-hover:bg-muted/40 transition-colors`}>{renderActions(cert)}</td>
                  </tr>
                );
              })
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

      <CertificateDeleteDialog
        cert={certToDelete}
        onClose={() => setCertToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
