"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function NoticePagination({
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  isEmbedded = false
}) {
  // Generates smart visible numbers on desktop viewports
  const getPageRange = () => {
    const range = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  };

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-700 p-4 ${
      isEmbedded 
        ? "bg-transparent border-0" 
        : "bg-card border border-border/80 rounded-xl shadow-2xs mt-2"
    }`}>
      
      {/* Container 1: Stats & Rows per page config */}
      <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto border-b border-slate-100 pb-3 md:pb-0 md:border-0">
        <div className="font-semibold text-slate-800 tabular-nums">
          Total: <span className="text-slate-500 font-normal">{totalRows} entries</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Show:</span>
          <select 
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs hover:bg-slate-50"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>
      </div>

      {/* Container 2: Navigation controllers */}
      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
        
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="h-9 md:h-8 px-3 md:px-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer shadow-2xs text-xs font-semibold"
        >
          <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
          <span className="md:hidden">Prev</span>
        </button>
        
        {/* Center Indicators - Dynamic desktop view vs mobile view */}
        <div className="flex items-center">
          {/* Mobile Display Indicator (Shows up on smaller views only) */}
          <div className="md:hidden text-slate-600 font-semibold text-xs bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 tabular-nums">
            Page {currentPage} of {totalPages}
          </div>

          {/* Desktop Full Pagination Track (Hidden on mobile viewports) */}
          <div className="hidden md:flex items-center gap-1.5">
            {getPageRange().map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`ellipsis-${index}`} className="h-8 w-8 flex items-center justify-center text-slate-400 select-none font-normal">
                    ...
                  </span>
                );
              }

              const isCurrent = page === currentPage;
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => onPageChange(page)}
                  className={`h-8 w-8 text-xs font-bold rounded-lg transition-all border flex items-center justify-center cursor-pointer ${
                    isCurrent 
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-2xs" 
                      : "border-slate-200/70 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="h-9 md:h-8 px-3 md:px-2 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer shadow-2xs text-xs font-semibold"
        >
          <span className="md:hidden">Next</span>
          <ChevronRight className="h-4 w-4 stroke-[2.5]" />
        </button>

      </div>
    </div>
  );
}