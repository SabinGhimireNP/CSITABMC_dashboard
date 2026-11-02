"use client";

import React, { useState } from "react";
import { ArrowUpDown, FileText, Pencil, Trash2, Copy } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import { NoticeDeleteDialog } from "./NoticeDeleteDialog";
import { usePermission } from "@/hooks/usePermission";

const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "published":
    case "active":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "draft":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(status)}`}>
    {(status || "DRAFT").toUpperCase()}
  </span>
);

const NoticeThumb = ({ notice }) =>
  notice.image ? (
    <div className="w-9 h-9 rounded-lg overflow-hidden border border-border bg-muted/40 shrink-0">
      <img src={notice.image} alt="" className="w-full h-full object-cover"
        onError={(e) => { e.target.style.display = "none"; }} />
    </div>
  ) : (
    <div className="w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center border border-border text-muted-foreground shrink-0">
      <FileText className="h-4 w-4 opacity-70" />
    </div>
  );

export function NoticeTable({
  notices = [],
  onDeleteNotice,
  onEditNotice,
  onDuplicateNotice,
  sortField,
  sortOrder,
  onHeaderClick,
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange
}) {
  const { can } = usePermission();
  const [noticeToDelete, setNoticeToDelete] = useState(null);

  const canEdit = can("notices.edit");
  const canCreate = can("notices.create");
  const canDelete = can("notices.delete");

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
    if (sortOrder === "asc")  return <span className="text-primary font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-primary font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
  };

  const handleConfirmDelete = () => {
    if (noticeToDelete) { onDeleteNotice(noticeToDelete.slug); setNoticeToDelete(null); }
  };

  const renderActions = (notice) => (
    <RowActionsMenu
      label={`Actions for ${notice.title}`}
      items={[
        { label: "Edit", icon: Pencil, hidden: !canEdit, onClick: () => onEditNotice?.(notice) },
        { label: "Duplicate", icon: Copy, hidden: !canCreate, onClick: () => onDuplicateNotice?.(notice) },
        { label: "Delete", icon: Trash2, destructive: true, hidden: !canDelete, onClick: () => setNoticeToDelete(notice) },
      ]}
    />
  );

  return (
    <div className="w-full flex flex-col">
      {/* Mobile: record cards */}
      <ResponsiveRecordList
        className="md:hidden"
        items={notices}
        getKey={(n) => n.id}
        emptyText="No matching notices discovered."
        renderLeading={(n) => <NoticeThumb notice={n} />}
        renderTitle={(n) => n.title}
        renderSubtitle={(n) => `#${n.id}${n.slug ? ` · /${n.slug}` : ""}`}
        renderBadge={(n) => <StatusBadge status={n.status} />}
        fields={[
          { label: "Category", render: (n) => n.category },
          { label: "Date Created", render: (n) => n.createdAt },
        ]}
        renderActions={renderActions}
      />

      {/* md+: full table */}
      <div className="hidden md:block w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-200 table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-xs select-none">
              <th onClick={() => onHeaderClick("id")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[10%]">
                <div className="flex items-center gap-1.5">ID {renderSortIndicator("id")}</div>
              </th>
              <th className="py-3 px-4 w-[10%]">Image</th>
              <th onClick={() => onHeaderClick("title")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[40%]">
                <div className="flex items-center gap-1.5">Title {renderSortIndicator("title")}</div>
              </th>
              <th onClick={() => onHeaderClick("category")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[15%]">
                <div className="flex items-center gap-1.5">Category {renderSortIndicator("category")}</div>
              </th>
              <th onClick={() => onHeaderClick("createdAt")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[13%]">
                <div className="flex items-center gap-1.5">Date Created {renderSortIndicator("createdAt")}</div>
              </th>
              <th className="py-3 px-4 w-[12%]">Status</th>
              <th className="py-3 px-4 text-right pr-6 w-[10%] sticky right-0 bg-muted/95 border-b border-border">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-foreground text-xs">
            {notices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground font-medium bg-card">
                  No matching notices discovered.
                </td>
              </tr>
            ) : (
              notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-muted/40 transition-colors group h-14 bg-card">
                  <td className="py-2 px-4 font-semibold text-foreground tabular-nums truncate">
                    {notice.id}
                  </td>

                  <td className="py-2 px-4">
                    <NoticeThumb notice={notice} />
                  </td>

                  <td className="py-2 px-4 max-w-xs truncate">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors block truncate" title={notice.title}>
                      {notice.title}
                    </span>
                    {notice.slug && (
                      <span className="text-[10px] text-muted-foreground font-normal truncate block" title={notice.slug}>
                        /{notice.slug}
                      </span>
                    )}
                  </td>

                  <td className="py-2 px-4 font-medium text-foreground/80 truncate">{notice.category}</td>

                  <td className="py-2 px-4 font-normal text-muted-foreground tabular-nums truncate">{notice.createdAt}</td>

                  <td className="py-2 px-4 whitespace-nowrap">
                    <StatusBadge status={notice.status} />
                  </td>

                  <td className="py-2 px-4 text-right pr-6 sticky right-0 bg-card group-hover:bg-muted/40 transition-colors">
                    {renderActions(notice)}
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

      <NoticeDeleteDialog
        notice={noticeToDelete}
        onClose={() => setNoticeToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
