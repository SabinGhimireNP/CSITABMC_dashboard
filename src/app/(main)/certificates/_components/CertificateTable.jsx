"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Copy,
} from "lucide-react";
import { Pagination } from "@/components/common/pagination";

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
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [certToDelete, setCertToDelete] = useState(null);
  const buttonRefs = useRef({});

  useEffect(() => {
    if (!activeMenuId) return;
    function handleClose() {
      setActiveMenuId(null);
    }
    document.addEventListener("mousedown", handleClose);
    document.addEventListener("scroll", handleClose, true);
    return () => {
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("scroll", handleClose, true);
    };
  }, [activeMenuId]);

  const handleMenuToggle = useCallback(
    (e, certId) => {
      e.stopPropagation();
      if (activeMenuId === certId) {
        setActiveMenuId(null);
        return;
      }
      const btn = buttonRefs.current[certId];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.right + window.scrollX - 128,
        });
      }
      setActiveMenuId(certId);
    },
    [activeMenuId],
  );

  const handleConfirmDelete = () => {
    if (certToDelete) {
      onDeleteCertificate(certToDelete.id);
      setCertToDelete(null);
    }
  };

  const getEventTitle = (eventId) =>
    eventsList.find((e) => String(e.id) === String(eventId))?.title || "—";

  const SortIndicator = ({ field }) => {
    if (sortField !== field)
      return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    if (sortOrder === "asc")
      return (
        <span className="text-indigo-600 font-bold text-[11px]">&uarr;</span>
      );
    if (sortOrder === "desc")
      return (
        <span className="text-indigo-600 font-bold text-[11px]">&darr;</span>
      );
    return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
  };

  const DropdownMenu = ({ cert }) =>
    createPortal(
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: menuPosition.top,
          left: menuPosition.left,
        }}
        className="w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-9999 animate-in fade-in slide-in-from-top-1 duration-100"
      >
        <button
          type="button"
          onClick={() => {
            if (onEditCertificate) onEditCertificate(cert);
            setActiveMenuId(null);
          }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-400" /> Edit
        </button>
        <button
          type="button"
          onClick={() => {
            if (onDuplicateCertificate) onDuplicateCertificate(cert);
            setActiveMenuId(null);
          }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 border-t border-slate-100/60 cursor-pointer"
        >
          <Copy className="h-3.5 w-3.5 text-slate-400" /> Duplicate
        </button>
        <button
          type="button"
          onClick={() => {
            setCertToDelete(cert);
            setActiveMenuId(null);
          }}
          className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors flex items-center gap-2 border-t border-slate-100/80 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5 text-rose-400" /> Delete
        </button>
      </div>,
      document.body,
    );

  return (
    <div className="w-full flex flex-col">
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-150 table-fixed">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-semibold text-xs select-none">
              <th
                onClick={() => onHeaderClick("id")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[50%]"
              >
                <div className="flex items-center gap-1.5">
                  ID <SortIndicator field="id" />
                </div>
              </th>
              <th
                onClick={() => onHeaderClick("fullName")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[25%]"
              >
                <div className="flex items-center gap-1.5">
                  Full Name <SortIndicator field="fullName" />
                </div>
              </th>
              <th
                onClick={() => onHeaderClick("event")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[40%]"
              >
                <div className="flex items-center gap-1.5">
                  Event <SortIndicator field="event" />
                </div>
              </th>
              <th className="py-3 px-4 w-[15%]">Project Status</th>
              <th
                onClick={() => onHeaderClick("createdAt")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[14%]"
              >
                <div className="flex items-center gap-1.5">
                  Created At <SortIndicator field="createdAt" />
                </div>
              </th>
              <th className="py-3 px-4 text-right pr-6 w-[8%]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {certificates.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-slate-400 font-medium bg-white"
                >
                  No matching certificates found.
                </td>
              </tr>
            ) : (
              certificates.map((cert) => (
                <tr
                  key={cert.id}
                  className="hover:bg-slate-50/40 transition-colors group h-14 bg-white"
                >
                  <td className="py-2 px-4 font-semibold text-slate-900 tabular-nums truncate">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{cert.id}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(cert.id)}
                        className="shrink-0 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Copy ID"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </td>

                  <td className="py-2 px-4 max-w-xs truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {cert.fullName}
                      </span>
                    </div>
                  </td>

                  <td className="py-2 px-4 text-slate-500 font-normal truncate">
                    {getEventTitle(cert.event)}
                  </td>

                  <td className="py-2 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        cert.isProjectComplete
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                          : "bg-amber-50 text-amber-700 border-amber-200/60"
                      }`}
                    >
                      {cert.isProjectComplete ? "COMPLETE" : "INCOMPLETE"}
                    </span>
                  </td>

                  <td className="py-2 px-4 font-normal text-slate-500 tabular-nums truncate">
                    {cert.createdAt || "—"}
                  </td>

                  <td className="py-2 px-4 text-right pr-6">
                    <button
                      ref={(el) => (buttonRefs.current[cert.id] = el)}
                      type="button"
                      onClick={(e) => handleMenuToggle(e, cert.id)}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        activeMenuId === cert.id
                          ? "bg-slate-100 text-slate-800"
                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <MoreHorizontal className="h-4 w-4 stroke-[2.3]" />
                    </button>
                    {activeMenuId === cert.id && <DropdownMenu cert={cert} />}
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

      {certToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div
            className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-xl p-5 animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setCertToDelete(null)}
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
                  Delete certificate?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Are you sure you want to delete the certificate for{" "}
                  <span className="font-semibold text-slate-800">
                    "{certToDelete.fullName}"
                  </span>
                  ? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 mt-6 border-t border-slate-100/80 pt-3">
              <button
                type="button"
                onClick={() => setCertToDelete(null)}
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
