"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowUpDown, FileText, MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { NoticeDeleteDialog } from "./NoticeDeleteDialog";

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
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const buttonRefs = useRef({});

  // Close on outside click or any scroll
  useEffect(() => {
    if (!activeMenuId) return;
    function handleClose() { setActiveMenuId(null); }
    document.addEventListener("mousedown", handleClose);
    document.addEventListener("scroll", handleClose, true);
    return () => {
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("scroll", handleClose, true);
    };
  }, [activeMenuId]);

  const handleMenuToggle = useCallback((e, noticeId) => {
    e.stopPropagation();
    if (activeMenuId === noticeId) { setActiveMenuId(null); return; }
    const btn = buttonRefs.current[noticeId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 128, // 128 = w-32
      });
    }
    setActiveMenuId(noticeId);
  }, [activeMenuId]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "draft":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    if (sortOrder === "asc")  return <span className="text-indigo-600 font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-indigo-600 font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
  };

  const handleConfirmDelete = () => {
    if (noticeToDelete) { onDeleteNotice(noticeToDelete.slug); setNoticeToDelete(null); }
  };

  // Portal dropdown — escapes overflow:hidden on the table wrapper
  const renderDropdownMenu = (notice) =>
    createPortal(
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ position: "absolute", top: menuPosition.top, left: menuPosition.left }}
        className="w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-9999 animate-in fade-in slide-in-from-top-1 duration-100"
      >
        <button type="button"
          onClick={() => { if (onEditNotice) onEditNotice(notice); setActiveMenuId(null); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-400" /> Edit
        </button>
        <button type="button"
          onClick={() => { if (onDuplicateNotice) onDuplicateNotice(notice); setActiveMenuId(null); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 border-t border-slate-100/60 cursor-pointer"
        >
          <Copy className="h-3.5 w-3.5 text-slate-400" /> Duplicate
        </button>
        <button type="button"
          onClick={() => { setNoticeToDelete(notice); setActiveMenuId(null); }}
          className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors flex items-center gap-2 border-t border-slate-100/80 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5 text-rose-400" /> Delete
        </button>
      </div>,
      document.body
    );

  return (
    <div className="w-full flex flex-col">
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-200 table-fixed">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-semibold text-xs select-none">
              <th onClick={() => onHeaderClick("id")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[10%]">
                <div className="flex items-center gap-1.5">ID {renderSortIndicator("id")}</div>
              </th>
              <th className="py-3 px-4 w-[10%]">Image</th>
              <th onClick={() => onHeaderClick("title")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[40%]">
                <div className="flex items-center gap-1.5">Title {renderSortIndicator("title")}</div>
              </th>
              <th onClick={() => onHeaderClick("category")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[15%]">
                <div className="flex items-center gap-1.5">Category {renderSortIndicator("category")}</div>
              </th>
              <th onClick={() => onHeaderClick("createdAt")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[13%]">
                <div className="flex items-center gap-1.5">Date Created {renderSortIndicator("createdAt")}</div>
              </th>
              <th className="py-3 px-4 w-[12%]">Status</th>
              <th className="py-3 px-4 text-right pr-6 w-[10%]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {notices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium bg-white">
                  No matching notices discovered.
                </td>
              </tr>
            ) : (
              notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-slate-50/40 transition-colors group h-14 bg-white">
                  <td className="py-2 px-4 font-semibold text-slate-900 tabular-nums truncate">
                    {notice.id}
                  </td>

                  <td className="py-2 px-4">
                    {notice.image ? (
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                        <img src={notice.image} alt="" className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200/60 text-slate-400 shrink-0">
                        <FileText className="h-4 w-4 opacity-70" />
                      </div>
                    )}
                  </td>

                  <td className="py-2 px-4 max-w-xs truncate">
                    <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block truncate">
                      {notice.title}
                    </span>
                    {notice.slug && (
                      <span className="text-[10px] text-slate-400 font-normal truncate block" title={notice.slug}>
                        /{notice.slug}
                      </span>
                    )}
                  </td>

                  <td className="py-2 px-4 font-medium text-slate-600 truncate">{notice.category}</td>

                  <td className="py-2 px-4 font-normal text-slate-500 tabular-nums truncate">{notice.createdAt}</td>

                  <td className="py-2 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(notice.status)}`}>
                      {(notice.status || "DRAFT").toUpperCase()}
                    </span>
                  </td>

                  <td className="py-2 px-4 text-right pr-6">
                    <button
                      ref={(el) => (buttonRefs.current[notice.id] = el)}
                      type="button"
                      onClick={(e) => handleMenuToggle(e, notice.id)}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        activeMenuId === notice.id
                          ? "bg-slate-100 text-slate-800"
                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <MoreHorizontal className="h-4 w-4 stroke-[2.3]" />
                    </button>

                    {activeMenuId === notice.id && renderDropdownMenu(notice)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200/80 bg-slate-50/30">
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