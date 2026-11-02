"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpDown, ExternalLink, Eye,
  Pencil, Trash2, X, FileText, Loader2
} from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import { SEMESTER_LABELS } from "@/lib/Schema/pastPaperSchema";
import { PastPaperDeleteDialog } from "./PastPaperDeleteDialog";
import { usePermission } from "@/hooks/usePermission";

function getDriveEmbedUrl(driveLink) {
  const match = driveLink?.match(/\/file\/d\/([^/]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  return null;
}

function getSemesterLabel(num) {
  return SEMESTER_LABELS.find((s) => s.number === num)?.label || `Semester ${num}`;
}

const OldCourseTag = () => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0 select-none">
    Old Course
  </span>
);

const TypeBadge = ({ modelSet }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
    modelSet
      ? "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20"
      : "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20"
  }`}>
    {modelSet ? "MODEL SET" : "BOARD EXAM"}
  </span>
);

const PaperIcon = () => (
  <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
    <FileText className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
  </div>
);

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
  const { can } = usePermission();
  const canEdit = can("papers.edit");
  const canDelete = can("papers.delete");

  const [paperToDelete, setPaperToDelete] = useState(null);
  const [previewPaper, setPreviewPaper] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lock page scroll and allow Escape while the preview is open
  useEffect(() => {
    if (!previewPaper) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setPreviewPaper(null); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", onKey);
    };
  }, [previewPaper]);

  const handleConfirmDelete = async () => {
    if (paperToDelete) {
      setIsDeleting(true);
      try {
        await onDeletePaper(paperToDelete.slug);
        setPaperToDelete(null);
      } catch (err) {
        console.error("Failed to delete paper:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handlePreview = (paper) => {
    setPreviewPaper(paper);
    setPreviewLoading(true);
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
    if (sortOrder === "asc") return <span className="text-primary font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-primary font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
  };

  const renderActions = (paper) => (
    <RowActionsMenu
      label={`Actions for ${paper.subject_name}`}
      items={[
        { label: "Preview", icon: Eye, onClick: () => handlePreview(paper) },
        { label: "Edit", icon: Pencil, hidden: !canEdit, onClick: () => onEditPaper?.(paper) },
        { label: "Open", icon: ExternalLink, onClick: () => window.open(paper.drive_link, "_blank", "noopener,noreferrer") },
        { label: "Delete", icon: Trash2, destructive: true, hidden: !canDelete, onClick: () => setPaperToDelete(paper) },
      ]}
    />
  );

  const serialFor = (index) => (currentPage - 1) * rowsPerPage + index + 1;

  return (
    <div className="w-full flex flex-col">
      {/* Mobile: record cards */}
      <ResponsiveRecordList
        className="md:hidden"
        items={papers.map((p, index) => ({ ...p, __index: index }))}
        getKey={(p) => `${p.id}-${p.__index}`}
        emptyText="No papers found for this semester."
        renderLeading={() => <PaperIcon />}
        renderTitle={(p) => (
          <button type="button" onClick={() => handlePreview(p)} className="text-left break-words cursor-pointer">
            {p.subject_name}
          </button>
        )}
        renderSubtitle={(p) => `#${serialFor(p.__index)}`}
        renderBadge={(p) => (
          <span className="flex flex-wrap items-center gap-1.5">
            <TypeBadge modelSet={p.model_set} />
            {p.is_old_course && <OldCourseTag />}
          </span>
        )}
        fields={[
          { label: "Semester", render: (p) => getSemesterLabel(p.semester) },
          { label: "Year", render: (p) => p.exam_year },
        ]}
        renderActions={renderActions}
      />

      {/* md+: full table */}
      <div className="hidden md:block w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-180 table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-xs select-none">
              <th className="py-3 px-4 w-[8%]">
                <div className="flex items-center gap-1.5">S.N.</div>
              </th>
              <th onClick={() => onHeaderClick("subject_name")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[38%]">
                <div className="flex items-center gap-1.5">Subject {renderSortIndicator("subject_name")}</div>
              </th>
              <th onClick={() => onHeaderClick("semester")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[18%]">
                <div className="flex items-center gap-1.5">Semester {renderSortIndicator("semester")}</div>
              </th>
              <th onClick={() => onHeaderClick("exam_year")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[12%]">
                <div className="flex items-center gap-1.5">Year {renderSortIndicator("exam_year")}</div>
              </th>
              <th className="py-3 px-4 w-[14%]">Type</th>
              <th className="py-3 px-4 text-right pr-6 w-[10%] sticky right-0 bg-muted/95 border-b border-border">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-foreground text-xs">
            {papers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground font-medium bg-card">
                  No papers found for this semester.
                </td>
              </tr>
            ) : (
              papers.map((paper, index) => (
                <tr
                  key={`${paper.id}-${index}`}
                  className="hover:bg-muted/40 transition-colors group h-14 bg-card cursor-pointer"
                  onClick={() => handlePreview(paper)}
                >
                  <td className="py-2 px-4 font-mono font-medium text-muted-foreground tabular-nums">{serialFor(index)}</td>

                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <PaperIcon />
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate" title={paper.subject_name}>
                          {paper.subject_name}
                        </span>
                        {paper.is_old_course && <OldCourseTag />}
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-4 text-muted-foreground font-normal truncate">{getSemesterLabel(paper.semester)}</td>

                  <td className="py-2 px-4 font-semibold text-foreground/80 tabular-nums">{paper.exam_year}</td>

                  <td className="py-2 px-4 whitespace-nowrap"><TypeBadge modelSet={paper.model_set} /></td>

                  <td className="py-2 px-4 text-right pr-6 sticky right-0 bg-card group-hover:bg-muted/40 transition-colors" onClick={(e) => e.stopPropagation()}>
                    {renderActions(paper)}
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

      {/* PDF Preview Modal — full screen on phones, large panel from sm up */}
      {previewPaper && (() => {
        const embedUrl = getDriveEmbedUrl(previewPaper.drive_link);
        return createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 animate-in fade-in duration-200">
            <div onClick={() => setPreviewPaper(null)} className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm" />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Preview of ${previewPaper.subject_name}`}
              className="relative bg-card text-foreground w-full max-w-4xl h-dvh sm:h-[88dvh] rounded-none sm:rounded-2xl border-0 sm:border border-border shadow-2xl overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200"
            >
              {/* Header */}
              <div className="flex items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-border bg-muted/30 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="hidden sm:flex w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{previewPaper.subject_name}</p>
                      {previewPaper.is_old_course && <OldCourseTag />}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-normal break-words">
                      {[previewPaper.subject_code, getSemesterLabel(previewPaper.semester), previewPaper.exam_year, previewPaper.model_set ? "Model Set" : "Board Exam", previewPaper.is_old_course ? "Old Syllabus" : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={previewPaper.drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open in Drive"
                    className="h-9 px-2.5 sm:px-3 text-xs font-semibold border border-input text-foreground bg-card rounded-lg hover:bg-muted transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Open in Drive</span>
                  </a>
                  <button
                    type="button"
                    aria-label="Close preview"
                    onClick={() => setPreviewPaper(null)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Embed */}
              <div className="relative flex-1 min-h-0 bg-muted/30">
                {previewLoading && embedUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      <p className="text-xs text-muted-foreground font-medium">Loading preview</p>
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
                  <div className="flex flex-col items-center justify-center h-full gap-4 px-4 text-center">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-medium">This link can&apos;t be embedded.</p>
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

      <PastPaperDeleteDialog
        paper={paperToDelete}
        isDeleting={isDeleting}
        onClose={() => setPaperToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
