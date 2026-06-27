"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowUpDown, FileText, MoreHorizontal, Pencil, Trash2, AlertTriangle, X, Copy } from "lucide-react";
import { Pagination } from "@/components/common/pagination";

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
  // Action Dropdown Menu State Tracker
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  // Dialog Overlay State Tracker (holds notice object when confirming deletion)
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  
  const dropdownRef = useRef(null);

  // Auto-close open dropdown menus on outside viewport clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const SortIndicator = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    if (sortOrder === "asc") return <span className="text-indigo-600 font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-indigo-600 font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
  };

  const handleConfirmDelete = () => {
    if (noticeToDelete) {
      onDeleteNotice(noticeToDelete.id);
      setNoticeToDelete(null);
    }
  };

  return (
    <div className="w-full flex flex-col" ref={dropdownRef}>
      {/* Scrollable table data region */}
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[800px] table-fixed">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-semibold text-xs select-none">
              <th 
                onClick={() => onHeaderClick("id")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[10%]"
              >
                <div className="flex items-center gap-1.5">ID <SortIndicator field="id" /></div>
              </th>
              <th className="py-3 px-4 w-[10%]">Image</th>
              <th 
                onClick={() => onHeaderClick("title")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[40%]"
              >
                <div className="flex items-center gap-1.5">Title <SortIndicator field="title" /></div>
              </th>
              <th 
                onClick={() => onHeaderClick("category")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[15%]"
              >
                <div className="flex items-center gap-1.5">Category <SortIndicator field="category" /></div>
              </th>
              <th 
                onClick={() => onHeaderClick("createdAt")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[13%]"
              >
                <div className="flex items-center gap-1.5">Date Created <SortIndicator field="createdAt" /></div>
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
                  {/* ID */}
                  <td className="py-2 px-4 font-semibold text-slate-900 tabular-nums truncate">
                    {notice.id}
                  </td>
                  
                  {/* Image Container */}
                  <td className="py-2 px-4 vertical-middle">
                    {notice.image ? (
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                        <img 
                          src={notice.image} 
                          alt="" 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200/60 text-slate-400 shrink-0">
                        <FileText className="h-4 w-4 opacity-70" />
                      </div>
                    )}
                  </td>
                  
                  {/* Title */}
                  <td className="py-2 px-4 max-w-xs truncate">
                    <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block truncate">
                      {notice.title}
                    </span>
                  </td>
                  
                  {/* Category */}
                  <td className="py-2 px-4 font-medium text-slate-600 truncate">
                    {notice.category}
                  </td>
                  
                  {/* Date Created */}
                  <td className="py-2 px-4 font-normal text-slate-500 tabular-nums truncate">
                    {notice.createdAt}
                  </td>
                  
                  {/* Status Badge */}
                  <td className="py-2 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(notice.status)}`}>
                      {(notice.status || "DRAFT").toUpperCase()}
                    </span>
                  </td>
                  
                  {/* Action Dropdown Isolation Cell */}
                  <td className="py-2 px-4 text-right pr-6">
                    <div className="relative inline-block text-left">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === notice.id ? null : notice.id);
                        }}
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                          activeMenuId === notice.id 
                            ? "bg-slate-100 text-slate-800" 
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <MoreHorizontal className="h-4 w-4 stroke-[2.3]" />
                      </button>

                      {/* Stabilized Dropdown Overlay Context */}
                      {activeMenuId === notice.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-40 animate-in fade-in slide-in-from-top-1 duration-100 origin-top-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (onEditNotice) onEditNotice(notice);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            Edit
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (onDuplicateNotice) onDuplicateNotice(notice);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 border-t border-slate-100/60 cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                            Duplicate
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNoticeToDelete(notice); 
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 font-medium transition-colors flex items-center gap-2 border-t border-slate-100/80 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Boundary */}
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

      {/* DELETE DIALOG MODAL LAYOUT OVERLAY */}
      {noticeToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-xl p-5 animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setNoticeToDelete(null)}
              className="absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex gap-3.5">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Delete platform notice?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Are you sure you want to delete <span className="font-semibold text-slate-800">"{noticeToDelete.title}"</span>? This operation cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 border-t border-slate-100/80 pt-3">
              <button
                type="button"
                onClick={() => setNoticeToDelete(null)}
                className="h-8.5 px-4 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="h-8.5 px-4 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all cursor-pointer shadow-2xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}