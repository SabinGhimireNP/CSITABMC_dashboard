"use client";

import React, { useState } from "react";
import { MoreHorizontal, Users, Calendar, Copy, Pencil, Trash2, Eye } from "lucide-react";
import { createPortal } from "react-dom";

export function TenureCard({ tenure, memberCount, onOpen, onDuplicate, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [buttonRef, setButtonRef] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    if (menuOpen) { setMenuOpen(false); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.right + window.scrollX - 128,
    });
    setMenuOpen(true);
  };

  // Close menu on outside click
  React.useEffect(() => {
    if (!menuOpen) return;
    function handleClose() { setMenuOpen(false); }
    document.addEventListener("mousedown", handleClose);
    document.addEventListener("scroll", handleClose, true);
    return () => {
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("scroll", handleClose, true);
    };
  }, [menuOpen]);

  const DropdownMenu = () =>
    createPortal(
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ position: "absolute", top: menuPosition.top, left: menuPosition.left }}
        className="w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-99999 animate-in fade-in slide-in-from-top-1 duration-100"
      >
        <button type="button"
          onClick={() => { setMenuOpen(false); if (onOpen) onOpen(tenure); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-slate-400" /> Open
        </button>
        <button type="button"
          onClick={() => { setMenuOpen(false); if (onDuplicate) onDuplicate(tenure); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Copy className="h-3.5 w-3.5 text-slate-400" /> Duplicate
        </button>
        <button type="button"
          onClick={() => { setMenuOpen(false); if (onEdit) onEdit(tenure); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 border-t border-slate-100/80 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-400" /> Edit
        </button>
        <button type="button"
          onClick={() => { setMenuOpen(false); if (onDelete) onDelete(tenure); }}
          className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors flex items-center gap-2 border-t border-slate-100/80 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5 text-rose-400" /> Delete
        </button>
      </div>,
      document.body
    );

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 hover:border-indigo-200/60 group">
      <div className="p-5 flex flex-col gap-3">
        {/* Header: Name + Menu */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
              {tenure.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>
                {formatDate(tenure.startDate)} — {formatDate(tenure.endDate)}
              </span>
            </div>
          </div>
          <button
            ref={(el) => setButtonRef(el)}
            type="button"
            onClick={handleMenuToggle}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <MoreHorizontal className="h-4 w-4 stroke-[2.3]" />
          </button>
        </div>

        {/* Member Count Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100/80">
          <Users className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-700">{memberCount}</span>
          <span className="text-slate-400">member{memberCount !== 1 ? "s" : ""}</span>
        </div>

        {/* Open Button */}
        <button
          type="button"
          onClick={() => onOpen && onOpen(tenure)}
          className="w-full h-9 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-100/60"
        >
          <Eye className="h-3.5 w-3.5" />
          View Members
        </button>
      </div>

      {menuOpen && <DropdownMenu />}
    </div>
  );
}