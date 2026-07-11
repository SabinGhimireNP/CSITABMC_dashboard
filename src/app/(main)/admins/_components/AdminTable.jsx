"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, AlertTriangle, X } from "lucide-react";
import { Pagination } from "@/components/common/pagination";

export function AdminTable({
  admins = [],
  onDeleteAdmin,
  onEditAdmin,
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
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [adminToDelete, setAdminToDelete] = useState(null);
  const buttonRefs = useRef({});

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

  const handleMenuToggle = useCallback((e, adminId) => {
    e.stopPropagation();
    if (activeMenuId === adminId) { setActiveMenuId(null); return; }
    const btn = buttonRefs.current[adminId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 128,
      });
    }
    setActiveMenuId(adminId);
  }, [activeMenuId]);

  const handleConfirmDelete = () => {
    if (adminToDelete) { onDeleteAdmin(adminToDelete.id); setAdminToDelete(null); }
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case "Super Admin":
        return "bg-violet-50 text-violet-700 border-violet-200/60";
      case "Admin":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getStatusStyle = (status) =>
    status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
      : "bg-slate-100 text-slate-500 border-slate-200";

  const SortIndicator = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    if (sortOrder === "asc") return <span className="text-indigo-600 font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-indigo-600 font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
  };

  const DropdownMenu = ({ admin }) =>
    createPortal(
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ position: "absolute", top: menuPosition.top, left: menuPosition.left }}
        className="w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-9999 animate-in fade-in slide-in-from-top-1 duration-100"
      >
        <button type="button"
          onClick={() => { if (onEditAdmin) onEditAdmin(admin); setActiveMenuId(null); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-400" /> Edit
        </button>
        <button type="button"
          onClick={() => { setAdminToDelete(admin); setActiveMenuId(null); }}
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
              <th onClick={() => onHeaderClick("id")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[8%]">
                <div className="flex items-center gap-1.5">ID <SortIndicator field="id" /></div>
              </th>
              <th onClick={() => onHeaderClick("fullName")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[22%]">
                <div className="flex items-center gap-1.5">Full Name <SortIndicator field="fullName" /></div>
              </th>
              <th onClick={() => onHeaderClick("email")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[25%]">
                <div className="flex items-center gap-1.5">Email <SortIndicator field="email" /></div>
              </th>
              <th onClick={() => onHeaderClick("role")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[14%]">
                <div className="flex items-center gap-1.5">Role <SortIndicator field="role" /></div>
              </th>
              <th onClick={() => onHeaderClick("status")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[12%]">
                <div className="flex items-center gap-1.5">Status <SortIndicator field="status" /></div>
              </th>
              <th onClick={() => onHeaderClick("createdAt")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[13%]">
                <div className="flex items-center gap-1.5">Created At <SortIndicator field="createdAt" /></div>
              </th>
              <th className="py-3 px-4 text-right pr-6 w-[6%]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {admins.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium bg-white">
                  No matching admins found.
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50/40 transition-colors group h-14 bg-white">
                  <td className="py-2 px-4 font-semibold text-slate-900 tabular-nums truncate">{admin.id}</td>

                  <td className="py-2 px-4 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {admin.fullName}
                      </span>
                    </div>
                  </td>

                  <td className="py-2 px-4 text-slate-500 font-normal truncate">{admin.email}</td>

                  <td className="py-2 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleStyle(admin.role)}`}>
                      {admin.role}
                    </span>
                  </td>

                  <td className="py-2 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(admin.status)}`}>
                      {(admin.status || "active").toUpperCase()}
                    </span>
                  </td>

                  <td className="py-2 px-4 font-normal text-slate-500 tabular-nums truncate">{admin.createdAt || "—"}</td>

                  <td className="py-2 px-4 text-right pr-6">
                    <button
                      ref={(el) => (buttonRefs.current[admin.id] = el)}
                      type="button"
                      onClick={(e) => handleMenuToggle(e, admin.id)}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        activeMenuId === admin.id
                          ? "bg-slate-100 text-slate-800"
                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <MoreHorizontal className="h-4 w-4 stroke-[2.3]" />
                    </button>
                    {activeMenuId === admin.id && <DropdownMenu admin={admin} />}
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

      {adminToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div
            className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-xl p-5 animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setAdminToDelete(null)}
              className="absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex gap-3.5">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Remove admin access?</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-slate-800">"{adminToDelete.fullName}"</span> from the platform? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 mt-6 border-t border-slate-100/80 pt-3">
              <button type="button" onClick={() => setAdminToDelete(null)}
                className="h-8.5 px-4 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button type="button" onClick={handleConfirmDelete}
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