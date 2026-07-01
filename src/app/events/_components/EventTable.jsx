"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowUpDown, ImageIcon, MoreHorizontal, Pencil, Trash2, AlertTriangle, X, Copy } from "lucide-react";
import { Pagination } from "@/components/common/pagination";

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
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [eventToDelete, setEventToDelete] = useState(null);
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

  const handleMenuToggle = useCallback((e, eventId) => {
    e.stopPropagation();
    if (activeMenuId === eventId) { setActiveMenuId(null); return; }
    const btn = buttonRefs.current[eventId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 128,
      });
    }
    setActiveMenuId(eventId);
  }, [activeMenuId]);

  const getRegistrationStyle = (isOpen) =>
    isOpen
      ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
      : "bg-rose-50 text-rose-600 border-rose-200/60";

  const SortIndicator = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    if (sortOrder === "asc") return <span className="text-indigo-600 font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-indigo-600 font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) { onDeleteEvent(eventToDelete.id); setEventToDelete(null); }
  };

  const formatDateRange = (start, end) => {
    if (!start) return "—";
    if (!end || end === start) return start;
    return `${start} → ${end}`;
  };

  const DropdownMenu = ({ event }) =>
    createPortal(
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ position: "absolute", top: menuPosition.top, left: menuPosition.left }}
        className="w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-9999 animate-in fade-in slide-in-from-top-1 duration-100"
      >
        <button type="button"
          onClick={() => { if (onEditEvent) onEditEvent(event); setActiveMenuId(null); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-400" /> Edit
        </button>
        <button type="button"
          onClick={() => { if (onDuplicateEvent) onDuplicateEvent(event); setActiveMenuId(null); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 border-t border-slate-100/60 cursor-pointer"
        >
          <Copy className="h-3.5 w-3.5 text-slate-400" /> Duplicate
        </button>
        <button type="button"
          onClick={() => { setEventToDelete(event); setActiveMenuId(null); }}
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
        <table className="w-full text-left border-collapse min-w-225 table-fixed">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-semibold text-xs select-none">
              <th onClick={() => onHeaderClick("id")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[8%]">
                <div className="flex items-center gap-1.5">ID <SortIndicator field="id" /></div>
              </th>
              <th className="py-3 px-4 w-[8%]">Image</th>
              <th onClick={() => onHeaderClick("title")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[24%]">
                <div className="flex items-center gap-1.5">Title <SortIndicator field="title" /></div>
              </th>
              <th onClick={() => onHeaderClick("category")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[12%]">
                <div className="flex items-center gap-1.5">Category <SortIndicator field="category" /></div>
              </th>
              <th onClick={() => onHeaderClick("startDate")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[16%]">
                <div className="flex items-center gap-1.5">Dates <SortIndicator field="startDate" /></div>
              </th>
              <th onClick={() => onHeaderClick("status")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[12%]">
                <div className="flex items-center gap-1.5">Status <SortIndicator field="status" /></div>
              </th>
              <th className="py-3 px-4 text-right pr-6 w-[8%]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {events.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium bg-white">
                  No matching events discovered.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50/40 transition-colors group h-14 bg-white">
                  <td className="py-2 px-4 font-semibold text-slate-900 tabular-nums truncate">{event.id}</td>

                  <td className="py-2 px-4">
                    {event.image ? (
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                        <img src={event.image} alt="" className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; }} />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200/60 text-slate-400 shrink-0">
                        <ImageIcon className="h-4 w-4 opacity-70" />
                      </div>
                    )}
                  </td>

                  <td className="py-2 px-4 max-w-xs truncate">
                    <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block truncate">
                      {event.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal truncate block">{event.organizer}</span>
                  </td>

                  <td className="py-2 px-4 font-medium text-slate-600 truncate">{event.category}</td>

                  <td className="py-2 px-4 font-normal text-slate-500 tabular-nums truncate">
                    {formatDateRange(event.startDate, event.endDate)}
                  </td>

                  <td className="py-2 px-4 truncate">
                    <div className="flex items-center justify-start gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${event.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-amber-50 text-amber-700 border-amber-200/60"}`}>
                        {event.status || "—"}
                      </span>
                      {onUpdateEventStatus && (
                        event.status === "published" ? (
                          <button onClick={(e) => { e.stopPropagation(); onUpdateEventStatus(event.id, "draft"); }} className="text-[11px] text-slate-500 hover:text-rose-600">Save as Draft</button>
                        ) : (
                          <button onClick={(e) => { e.stopPropagation(); onUpdateEventStatus(event.id, "published"); }} className="text-[11px] text-slate-500 hover:text-emerald-700">Publish</button>
                        )
                      )}
                    </div>
                  </td>

                  <td className="py-2 px-4 text-right pr-6">
                    <button
                      ref={(el) => (buttonRefs.current[event.id] = el)}
                      type="button"
                      onClick={(e) => handleMenuToggle(e, event.id)}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        activeMenuId === event.id
                          ? "bg-slate-100 text-slate-800"
                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <MoreHorizontal className="h-4 w-4 stroke-[2.3]" />
                    </button>

                    {activeMenuId === event.id && <DropdownMenu event={event} />}
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

      {eventToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div
            className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-xl p-5 animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setEventToDelete(null)}
              className="absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex gap-3.5">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Delete event?</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-800">"{eventToDelete.title}"</span>? This will also affect mentors and certificates linked to this event. This operation cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 border-t border-slate-100/80 pt-3">
              <button type="button" onClick={() => setEventToDelete(null)}
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