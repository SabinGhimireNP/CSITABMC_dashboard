"use client";

import React, { useState } from "react";
import { ArrowUpDown, Megaphone, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { usePermission } from "@/hooks/usePermission";

const AnnouncementThumb = ({ item }) =>
  item.image ? (
    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
      <img
        src={item.image}
        alt=""
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    </div>
  ) : (
    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40 text-indigo-500 shrink-0">
      <Megaphone className="h-4 w-4" />
    </div>
  );

export function AnnouncementTable({
  announcements = [],
  onDelete,
  onEdit,
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
  const [itemToDelete, setItemToDelete] = useState(null);

  const canEdit = can("announcements.update");
  const canDelete = can("announcements.delete");

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    if (sortOrder === "asc") return <span className="text-indigo-600 font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-indigo-600 font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const renderActions = (item) => (
    <RowActionsMenu
      label={`Actions for ${item.title}`}
      items={[
        { label: "Edit", icon: Pencil, hidden: !canEdit, onClick: () => onEdit?.(item) },
        { label: "Delete", icon: Trash2, destructive: true, hidden: !canDelete, onClick: () => setItemToDelete(item) },
      ]}
    />
  );

  return (
    <div className="w-full flex flex-col">
      {/* Mobile: record cards */}
      <ResponsiveRecordList
        className="md:hidden"
        items={announcements}
        getKey={(a) => a.id}
        renderCard={(item) => (
          <div className="p-3.5 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <AnnouncementThumb item={item} />
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {renderActions(item)}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
              {item.description}
            </p>

            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                Visit Link
              </a>
            )}
          </div>
        )}
      />

      {/* Desktop Table */}
      <div className="hidden md:block w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold select-none">
                <th className="py-3 px-4 w-14">Media</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => onHeaderClick?.("title")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Title</span>
                    {renderSortIndicator("title")}
                  </div>
                </th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 w-32">Link</th>
                <th
                  className="py-3 px-4 w-36 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => onHeaderClick?.("createdAt")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Created Date</span>
                    {renderSortIndicator("createdAt")}
                  </div>
                </th>
                <th className="py-3 px-4 w-14 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No announcements found.
                  </td>
                </tr>
              ) : (
                announcements.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <AnnouncementThumb item={item} />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white max-w-xs">
                      <div className="truncate font-semibold">{item.title}</div>
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="line-clamp-2 text-slate-600 dark:text-slate-400">
                        {item.description}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline max-w-[120px] truncate"
                          title={item.link}
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">Open</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {renderActions(item)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalRows > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRows={totalRows}
              rowsPerPage={rowsPerPage}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title="Delete Announcement"
        description={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
