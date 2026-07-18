"use client";

import React, { useState, useMemo } from "react";
import { usePastPapers } from "@/hooks/usePastPapers";
import { PastPaperTable } from "./_components/pastPaperTable";
import { PastPaperTabs } from "./_components/pastPaperTabs";
import { PastPaperFormModal } from "./_components/pastPaperFormModel";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import PastPapersSkeleton from "./_components/PastPapersSkeleton";

export default function PastPapersPage() {
  const { data: papersData, isLoading: papersLoading, isError: papersError } = usePastPapers();

  const livePapers = papersData?.data || [];
  const [activeTab, setActiveTab] = useState("all"); // "all" | "board" | "model"
  const [searchQuery, setSearchQuery] = useState("");

  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("none");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [formMode, setFormMode] = useState({ isOpen: false, editData: null });

  const handleSortChange = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else {
      if (sortOrder === "none") setSortOrder("asc");
      else if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortOrder("none");
        setSortField(null);
      }
    }
    setCurrentPage(1);
  };

  const handleDeletePaper = (id) => {
    // In a real app this would call a mutation
  };

  const handleEditPaperTrigger = (paper) => {
    setFormMode({ isOpen: true, editData: paper });
  };

  const handleFormSubmitSuccess = (formData) => {
    setFormMode({ isOpen: false, editData: null });
  };

  const activeFilterLabel =
    activeTab === "all"
      ? "All Papers"
      : activeTab === "board"
        ? "Board Exams Only"
        : "Model Sets Only";

  const processedPapers = useMemo(() => {
    let dataset = [...livePapers];

    if (activeTab !== "all") {
      dataset = dataset.filter((p) =>
        activeTab === "model" ? p.model_set === true : p.model_set === false,
      );
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      dataset = dataset.filter(
        (p) =>
          p.subject_name?.toLowerCase().includes(query) ||
          p.subject_code?.toLowerCase().includes(query) ||
          String(p.exam_year).includes(query),
      );
    }

    if (sortField && sortOrder !== "none") {
      dataset.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === "semester" || sortField === "exam_year") {
          return sortOrder === "asc"
            ? Number(valA) - Number(valB)
            : Number(valB) - Number(valA);
        }

        valA = valA?.toString().toLowerCase() || "";
        valB = valB?.toString().toLowerCase() || "";
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    return dataset;
  }, [livePapers, activeTab, searchQuery, sortField, sortOrder]);

  const totalRows = processedPapers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

  const paginatedPapers = useMemo(() => {
    const startOffset = (currentPage - 1) * rowsPerPage;
    return processedPapers.slice(startOffset, startOffset + rowsPerPage);
  }, [processedPapers, currentPage, rowsPerPage]);

  if (papersLoading) {
    return <PastPapersSkeleton />;
  }

  if (papersError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load past papers. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">
            Past Papers
          </h1>
          <p className="text-sm text-muted-foreground font-normal">
            Manage, coordinate, and review academic past papers and official
            model questions.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            size="sm"
            onClick={() => setFormMode({ isOpen: true, editData: null })}
            className="bg-[#0b2574] text-white hover:bg-[#0b2574]/90 gap-1.5 text-xs font-medium h-9 px-4 shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Add Paper
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <PastPaperTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden">
        <PastPaperTable
          papers={paginatedPapers}
          onEditPaper={handleEditPaperTrigger}
          onDeletePaper={handleDeletePaper}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(n) => {
            setRowsPerPage(n);
            setCurrentPage(1);
          }}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          totalRows={totalRows}
          sortField={sortField}
          sortOrder={sortOrder}
          onHeaderClick={handleSortChange}
        />
      </div>

      <PastPaperFormModal
        isOpen={formMode.isOpen}
        initialData={formMode.editData}
        onSubmitSuccess={handleFormSubmitSuccess}
        onCancel={() => setFormMode({ isOpen: false, editData: null })}
      />
    </div>
  );
}