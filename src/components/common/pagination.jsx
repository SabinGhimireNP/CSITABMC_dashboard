"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalRows = 0,
  rowsPerPage = 10,
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
    <div className={`flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-foreground p-4 ${
      isEmbedded 
        ? "bg-transparent border-0" 
        : "bg-card border border-border/80 rounded-xl shadow-2xs mt-2"
    }`}>
      
      {/* Container 1: Stats & Rows per page config */}
      <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto border-b border-border pb-3 md:pb-0 md:border-0">
        <div className="font-semibold text-foreground tabular-nums">
          Total: <span className="text-muted-foreground font-normal">{totalRows} entries</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Show:</span>
          <select 
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="bg-card border border-input text-foreground text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs hover:bg-muted"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Container 2: Navigation controllers */}
      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
        
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="h-9 md:h-8 px-3 md:px-2 border border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer shadow-2xs text-xs font-semibold"
        >
          <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
          <span className="md:hidden">Prev</span>
        </button>
        
        {/* Center Indicators - Dynamic desktop view vs mobile view */}
        <div className="flex items-center">
          {/* Mobile Display Indicator (Shows up on smaller views only) */}
          <div className="md:hidden text-foreground font-semibold text-xs bg-muted/50 border border-border rounded-lg px-3 py-1.5 tabular-nums">
            Page {currentPage} of {totalPages}
          </div>

          {/* Desktop Full Pagination Track (Hidden on mobile viewports) */}
          <div className="hidden md:flex items-center gap-1.5">
            {getPageRange().map((page, index) => {
              if (page === "...") {
                return (
                  <span key={`ellipsis-${index}`} className="h-8 w-8 flex items-center justify-center text-muted-foreground select-none font-normal">
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
                      ? "bg-primary/10 border-primary/20 text-primary shadow-2xs" 
                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
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
          className="h-9 md:h-8 px-3 md:px-2 border border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer shadow-2xs text-xs font-semibold"
        >
          <span className="md:hidden">Next</span>
          <ChevronRight className="h-4 w-4 stroke-[2.5]" />
        </button>

      </div>
    </div>
  );
}