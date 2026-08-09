"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAlumni } from "@/hooks/useAlumni";
import { AlumniTable } from "./_components/AlumniTable";
import { AlumniTabs } from "./_components/AlumniTabs";
import { AlumniFormModal } from "./_components/AlumniForm";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import AlumniSkeleton from "./_components/AlumniSkeleton";

function generateAlumniId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uid = "";
  for (let i = 0; i < 4; i++) uid += chars.charAt(Math.floor(Math.random() * chars.length));
  return `ALM-${uid}`;
}

export default function AlumniPage() {
  const { data: alumniData, isLoading: alumniLoading, isError: alumniError } = useAlumni();

  // --- Data state ---
  const [liveAlumni, setLiveAlumni] = useState([]);

  // --- Modal state ---
  const [alumniFormMode, setAlumniFormMode] = useState({ isOpen: false, editData: null });

  // --- View state (filtering, pagination, sort) ---
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("none");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync react-query data to local state for CRUD
  useEffect(() => {
    if (alumniData?.data) {
      setLiveAlumni(alumniData.data);
    }
  }, [alumniData]);

  // ────────────────────────────
  //  ALUMNI HANDLERS
  // ────────────────────────────

  const handleSortChange = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else {
      if (sortOrder === "none") setSortOrder("asc");
      else if (sortOrder === "asc") setSortOrder("desc");
      else { setSortOrder("none"); setSortField(null); }
    }
    setCurrentPage(1);
  };

  const handleDeleteAlumni = (id) => {
    setLiveAlumni((prev) => prev.filter((a) => a.id !== id));
  };

  const handleEditAlumniTrigger = (alumni) => {
    setAlumniFormMode({ isOpen: true, editData: alumni });
  };

  const handleAlumniFormSubmitSuccess = (formData) => {
    if (alumniFormMode.editData && alumniFormMode.editData.id) {
      setLiveAlumni((prev) =>
        prev.map((item) =>
          item.id === alumniFormMode.editData.id
            ? {
                ...item,
                ...formData,
                image:
                  formData.image instanceof File
                    ? URL.createObjectURL(formData.image)
                    : item.image,
              }
            : item
        )
      );
    } else {
      const nextId =
        liveAlumni.length > 0
          ? Math.max(...liveAlumni.map((m) => Number(m.id) || 0)) + 1
          : 1;
      const newAlumni = {
        id: nextId,
        memberId: generateAlumniId(),
        ...formData,
        image:
          formData.image instanceof File
            ? URL.createObjectURL(formData.image)
            : alumniFormMode.editData?.image || null,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setLiveAlumni((prev) => [newAlumni, ...prev]);
      setCurrentPage(1);
    }
    setAlumniFormMode({ isOpen: false, editData: null });
  };

  // ────────────────────────────
  //  ALUMNI FILTERING
  // ────────────────────────────

  const processedAlumni = useMemo(() => {
    let dataset = [...liveAlumni];

    if (activeTab === "active") {
      dataset = dataset.filter((m) => m.status?.toLowerCase() === "active");
    } else if (activeTab === "draft") {
      dataset = dataset.filter((m) => m.status?.toLowerCase() === "draft");
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      dataset = dataset.filter(
        (m) =>
          m.fullName?.toLowerCase().includes(q) ||
          m.post?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.memberId?.toLowerCase().includes(q) ||
          (m.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortField && sortOrder !== "none") {
      dataset.sort((a, b) => {
        let valA = a[sortField]?.toString().toLowerCase() || "";
        let valB = b[sortField]?.toString().toLowerCase() || "";
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return dataset;
  }, [liveAlumni, activeTab, searchQuery, sortField, sortOrder]);

  const totalRows = processedAlumni.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

  const paginatedAlumni = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedAlumni.slice(start, start + rowsPerPage);
  }, [processedAlumni, currentPage, rowsPerPage]);

  if (alumniLoading) {
    return <AlumniSkeleton />;
  }

  if (alumniError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load alumni. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">Alumni</h1>
          <p className="text-sm text-muted-foreground font-normal">
            Manage alumni members, roles, and profile information.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            size="sm"
            onClick={() => setAlumniFormMode({ isOpen: true, editData: null })}
            className="bg-[#0b2574] text-white hover:bg-[#0b2574]/90 gap-1.5 text-xs font-medium h-9 px-4 shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Add Alumni
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <AlumniTabs
          activeTab={activeTab}
          onTabChange={(tab) => { setActiveTab(tab); setCurrentPage(1); }}
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden">
        <AlumniTable
          alumni={paginatedAlumni}
          onEditAlumni={handleEditAlumniTrigger}
          onDeleteAlumni={handleDeleteAlumni}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(v) => { setRowsPerPage(v); setCurrentPage(1); }}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          totalRows={totalRows}
          sortField={sortField}
          sortOrder={sortOrder}
          onHeaderClick={handleSortChange}
        />
      </div>

      <AlumniFormModal
        isOpen={alumniFormMode.isOpen}
        initialData={alumniFormMode.editData}
        onSubmitSuccess={handleAlumniFormSubmitSuccess}
        onCancel={() => setAlumniFormMode({ isOpen: false, editData: null })}
      />
    </div>
  );
}