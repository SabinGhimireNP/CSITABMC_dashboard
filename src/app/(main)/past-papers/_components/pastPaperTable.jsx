"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpDown, ExternalLink, Eye, MoreHorizontal,
  Pencil, Trash2, AlertTriangle, X, FileText, Loader2
} from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { SEMESTER_LABELS } from "@/lib/Schema/pastPaperSchema";

function getDriveEmbedUrl(driveLink) {
  const match = driveLink?.match(/\/file\/d\/([^/]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  return null;
}

function getSemesterLabel(num) {
  return SEMESTER_LABELS.find((s) => s.number === num)?.label || `Semester ${num}`;
}

export function PastPaperTable({
  papers = [],
  onDeletePaper,
  onEditPaper,
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
  const [paperToDelete, setPaperToDelete] = useState(null);
  const [previewPaper, setPreviewPaper] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
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

  // Lock scroll when preview is open
  useEffect(() => {
    if (previewPaper) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [previewPaper]);

  const handleMenuToggle = useCallback((e, paperId) => {
    e.stopPropagation();
    if (activeMenuId === paperId) { setActiveMenuId(null); return; }
    const btn = buttonRefs.current[paperId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 128,
      });
    }
    setActiveMenuId(paperId);
  }, [activeMenuId]);

  const handleConfirmDelete = () => {
    if (paperToDelete) { onDeletePaper(paperToDelete.id); setPaperToDelete(null); }
  };

  const handlePreview = (paper) => {
    setPreviewPaper(paper);
    setPreviewLoading(true);
  };

  const SortIndicator = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    if (sortOrder === "asc") return <span className="text-indigo-600 font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-indigo-600 font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
  };

  const DropdownMenu = ({ paper }) =>
    createPortal(
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ position: "absolute", top: menuPosition.top, left: menuPosition.left }}
        className="w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-9999 animate-in fade-in slide-in-from-top-1 duration-100"
      >
        <button type="button"
          onClick={() => { handlePreview(paper); setActiveMenuId(null); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-slate-400" /> Preview
        </button>
        <button type="button"
          onClick={() => { if (onEditPaper) onEditPaper(paper); setActiveMenuId(null); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 border-t border-slate-100/60 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-400" /> Edit
        </button>
        <button type="button"
          onClick={() => { window.open(paper.drive_link, "_blank"); setActiveMenuId(null); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 border-t border-slate-100/60 cursor-pointer"
        >
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" /> Open
        </button>
        <button type="button"
          onClick={() => { setPaperToDelete(paper); setActiveMenuId(null); }}
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
              {/* MODIFIED: Changed field header to S.N. and restricted column layout size */}
              <th className="py-3 px-4 w-[8%]">
                <div className="flex items-center gap-1.5">S.N.</div>
              </th>
              <th onClick={() => onHeaderClick("subject_name")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[32%]">
                <div className="flex items-center gap-1.5">Subject <SortIndicator field="subject_name" /></div>
              </th>
              <th onClick={() => onHeaderClick("semester")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[18%]">
                <div className="flex items-center gap-1.5">Semester <SortIndicator field="semester" /></div>
              </th>
              <th onClick={() => onHeaderClick("exam_year")} className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors w-[12%]">
                <div className="flex items-center gap-1.5">Year <SortIndicator field="exam_year" /></div>
              </th>
              <th className="py-3 px-4 w-[12%]">Type</th>
              <th className="py-3 px-4 text-right pr-6 w-[8%]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {papers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-medium bg-white">
                  No papers found for this semester.
                </td>
              </tr>
            ) : (
              papers.map((paper, index) => {
                {/* CALCULATED: Determines sequential number based on current pagination offsets */}
                const serialNumber = (currentPage - 1) * rowsPerPage + index + 1;

                return (
                  <tr
                   key={`${paper.id}-${index}`}
                    className="hover:bg-slate-50/40 transition-colors group h-14 bg-white cursor-pointer"
                    onClick={() => handlePreview(paper)}
                  >
                    {/* MODIFIED: Replaced Code output cell with Serial Number calculation */}
                    <td className="py-2 px-4 font-mono font-medium text-slate-400 tabular-nums">
                      {serialNumber}
                    </td>

                    <td className="py-2 px-4 max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                          <FileText className="h-3.5 w-3.5 text-rose-500" />
                        </div>
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {paper.subject_name}
                        </span>
                      </div>
                    </td>

                    <td className="py-2 px-4 text-slate-500 font-normal truncate">
                      {getSemesterLabel(paper.semester)}
                    </td>

                    <td className="py-2 px-4 font-semibold text-slate-700 tabular-nums">{paper.exam_year}</td>

                    <td className="py-2 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        paper.model_set
                          ? "bg-violet-50 text-violet-700 border-violet-200/60"
                          : "bg-sky-50 text-sky-700 border-sky-200/60"
                      }`}>
                        {paper.model_set ? "MODEL SET" : "BOARD EXAM"}
                      </span>
                    </td>

                    <td className="py-2 px-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      <button
                        ref={(el) => (buttonRefs.current[paper.id] = el)}
                        type="button"
                        onClick={(e) => handleMenuToggle(e, paper.id)}
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                          activeMenuId === paper.id
                            ? "bg-slate-100 text-slate-800"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <MoreHorizontal className="h-4 w-4 stroke-[2.3]" />
                      </button>
                      {activeMenuId === paper.id && <DropdownMenu paper={paper} />}
                    </td>
                  </tr>
                );
              })
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
  
        {/* PDF Preview Modal */}
        {previewPaper && (() => {
          const embedUrl = getDriveEmbedUrl(previewPaper.drive_link);
          return createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div onClick={() => setPreviewPaper(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <div className="relative bg-white w-full max-w-4xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col z-10 animate-in scale-in-95 duration-200" style={{ height: "88vh" }}>
                {/* Header */}
                <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{previewPaper.subject_name}</p>
                      <p className="text-[11px] text-slate-400 font-normal">
                        {previewPaper.subject_code} · {getSemesterLabel(previewPaper.semester)} · {previewPaper.exam_year} · {previewPaper.model_set ? "Model Set" : "Board Exam"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={previewPaper.drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 px-3 text-xs font-semibold border border-slate-200 text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Open in Drive
                    </a>
                    <button
                      type="button"
                      onClick={() => setPreviewPaper(null)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      <X className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
  
                {/* Embed */}
                <div className="relative flex-1 bg-slate-100">
                  {previewLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                        <p className="text-xs text-slate-400 font-medium">Loading preview...</p>
                      </div>
                    </div>
                  )}
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full border-0"
                      allow="autoplay"
                      onLoad={() => setPreviewLoading(false)}
                      title={previewPaper.subject_name}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <FileText className="h-10 w-10 text-slate-300" />
                      <p className="text-sm text-slate-500 font-medium">This link can't be embedded.</p>
                      <a
                        href={previewPaper.drive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 px-4 text-xs font-semibold bg-[#0b2574] text-white rounded-lg hover:bg-[#0b2574]/90 flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open in Google Drive
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          );
        })()}
  
        {/* Delete Confirmation */}
        {paperToDelete && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div
              className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-xl p-5 animate-in zoom-in-95 duration-150 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" onClick={() => setPaperToDelete(null)}
                className="absolute right-4 top-4 p-1 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex gap-3.5">
                <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Delete past paper?</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-slate-800">"{paperToDelete.subject_name} ({paperToDelete.exam_year})"</span>? This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 mt-6 border-t border-slate-100/80 pt-3">
                <button type="button" onClick={() => setPaperToDelete(null)}
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