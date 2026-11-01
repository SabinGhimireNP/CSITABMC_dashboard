"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowUpDown, UserCircle, MoreHorizontal, Pencil, Trash2, Copy, ExternalLink } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { MentorDeleteDialog } from "./MentorDeleteDialog";

export function MentorTable({
  mentors = [],
  onDeleteMentor,
  onEditMentor,
  onDuplicateMentor,
  onUpdateMentorStatus,
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
  const [mentorToDelete, setMentorToDelete] = useState(null);
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

  const handleMenuToggle = useCallback((e, mentorId) => {
    e.stopPropagation();
    if (activeMenuId === mentorId) { setActiveMenuId(null); return; }
    const btn = buttonRefs.current[mentorId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 128,
      });
    }
    setActiveMenuId(mentorId);
  }, [activeMenuId]);

  const handleConfirmDelete = () => {
    if (mentorToDelete) { onDeleteMentor(mentorToDelete.id); setMentorToDelete(null); }
  };

  // Event-specific roles come from the mentor's assignments, e.g. "Hackathon (Main Mentor)".
  const getEventNames = (assignments = []) => {
    if (!assignments.length) return "—";
    return assignments
      .map((a) => `${a.eventTitle}${a.roleLabel ? ` (${a.roleLabel})` : ""}`)
      .join(", ");
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    if (sortOrder === "asc") return <span className="text-indigo-600 font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-indigo-600 font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
  };

  const renderDropdownMenu = (mentor) =>
    createPortal(
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ position: "absolute", top: menuPosition.top, left: menuPosition.left }}
        className="w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-9999 animate-in fade-in slide-in-from-top-1 duration-100"
      >
        <button type="button"
          onClick={() => { if (onEditMentor) onEditMentor(mentor); setActiveMenuId(null); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-400" /> Edit
        </button>
        <button type="button"
          onClick={() => { if (onDuplicateMentor) onDuplicateMentor(mentor); setActiveMenuId(null); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 border-t border-slate-100/60 cursor-pointer"
        >
          <Copy className="h-3.5 w-3.5 text-slate-400" /> Duplicate
        </button>
        <button type="button"
          onClick={() => { setMentorToDelete(mentor); setActiveMenuId(null); }}
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
                <div className="flex items-center gap-1.5">ID {renderSortIndicator("id")}</div>
              </th>
              <th className="py-3 px-4 w-[8%]">Photo</th>
              <th onClick={() => onHeaderClick("fullName")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[20%]">
                <div className="flex items-center gap-1.5">Full Name {renderSortIndicator("fullName")}</div>
              </th>
              <th className="py-3 px-4 w-[30%]">Events</th>
              <th className="py-3 px-4 w-[11%]">Social</th>
              <th onClick={() => onHeaderClick("status")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[12%]">
                <div className="flex items-center gap-1.5">Status {renderSortIndicator("status")}</div>
              </th>
              <th className="py-3 px-4 text-right pr-6 w-[8%]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {mentors.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium bg-white">
                  No matching mentors found.
                </td>
              </tr>
            ) : (
              mentors.map((mentor) => (
                <tr key={mentor.id} className="hover:bg-slate-50/40 transition-colors group h-14 bg-white">
                  <td className="py-2 px-4 font-semibold text-slate-900 tabular-nums truncate">{mentor.id}</td>

                  <td className="py-2 px-4">
                    {mentor.image ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                        <img src={mentor.image} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200/60 text-slate-400 shrink-0">
                        <UserCircle className="h-5 w-5 opacity-70" />
                      </div>
                    )}
                  </td>

                  <td className="py-2 px-4 max-w-xs truncate">
                    <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block truncate">
                      {mentor.fullName}
                    </span>
                  </td>

                  <td className="py-2 px-4 text-slate-500 font-normal truncate">{getEventNames(mentor.eventAssignments)}</td>

                  <td className="py-2 px-4">
                    {mentor.socialLink ? (
                      <a href={mentor.socialLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" /> Profile
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-2 px-4 truncate">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${mentor.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-amber-50 text-amber-700 border-amber-200/60"}`}>
                      {(mentor.status && mentor.status.toUpperCase()) || "—"}
                    </span>
                  </td>

                  <td className="py-2 px-4 text-right pr-6">
                    <button ref={(el) => (buttonRefs.current[mentor.id] = el)} type="button" onClick={(e) => handleMenuToggle(e, mentor.id)} className={`p-1.5 rounded-md transition-all cursor-pointer ${activeMenuId === mentor.id ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}>
                      <MoreHorizontal className="h-4 w-4 stroke-[2.3]" />
                    </button>
                    {activeMenuId === mentor.id && renderDropdownMenu(mentor)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200/80 bg-slate-50/30">
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
