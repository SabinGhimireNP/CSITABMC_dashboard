"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useAlumni, useCreateAlumni, useUpdateAlumni, useDeleteAlumni } from "@/hooks/useAlumni";
import { AlumniTable } from "./AlumniTable";
import { AlumniTabs } from "./AlumniTabs";
import { AlumniFormModal } from "./AlumniForm";
import { AlumniPageHeader } from "./AlumniPageHeader";
import AlumniSkeleton from "./AlumniSkeleton";

export function AlumniPageContent() {
  const { data: alumniData, isLoading: alumniLoading, isError: alumniError } = useAlumni();
  const createAlumniMutation = useCreateAlumni();
  const updateAlumniMutation = useUpdateAlumni();
  const deleteAlumniMutation = useDeleteAlumni();

  const liveAlumni = useMemo(() => alumniData?.data ?? [], [alumniData]);
  const [alumniFormMode, setAlumniFormMode] = useState({ isOpen: false, editData: null });
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("none");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSortChange = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else if (sortOrder === "none") {
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortOrder("none");
      setSortField(null);
    }
    setCurrentPage(1);
  };

  const handleDeleteAlumni = (id) => {
    deleteAlumniMutation.mutate(id, {
      onSuccess: () => toast.success("Alumni deleted successfully."),
      onError: () => toast.error("Failed to delete alumni. Please try again."),
    });
  };

  const handleEditAlumniTrigger = (alumni) => {
    setAlumniFormMode({ isOpen: true, editData: alumni });
  };

  const handleAlumniFormSubmitSuccess = (formData) => {
    const payload = {
      member_id: formData.memberId,
      tenure_ids: formData.tenureIds || [],
      graduation_year: formData.graduationYear,
      bio: formData.bio || "",
    };

    if (alumniFormMode.editData && alumniFormMode.editData.id) {
      updateAlumniMutation.mutate(
        { id: alumniFormMode.editData.id, payload },
        {
          onSuccess: () => {
            toast.success("Alumni updated successfully.");
            setAlumniFormMode({ isOpen: false, editData: null });
          },
          onError: () => {
            toast.error("Failed to update alumni. Please try again.");
          },
        }
      );
    } else {
      createAlumniMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Alumni added successfully.");
          setAlumniFormMode({ isOpen: false, editData: null });
          setCurrentPage(1);
        },
        onError: () => {
          toast.error("Failed to add alumni. Please try again.");
        },
      });
    }
  };

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
          m.email?.toLowerCase().includes(q) ||
          m.memberId?.toLowerCase().includes(q) ||
          (m.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortField && sortOrder !== "none") {
      dataset.sort((a, b) => {
        const valA = a[sortField]?.toString().toLowerCase() || "";
        const valB = b[sortField]?.toString().toLowerCase() || "";
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return dataset;
  }, [liveAlumni, activeTab, searchQuery, sortField, sortOrder]);

  const totalRows = processedAlumni.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);
  const paginatedAlumni = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedAlumni.slice(start, start + rowsPerPage);
  }, [processedAlumni, currentPage, rowsPerPage]);

  if (alumniLoading) return <AlumniSkeleton />;
  if (alumniError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load alumni. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <AlumniPageHeader onAddAlumni={() => setAlumniFormMode({ isOpen: true, editData: null })} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <AlumniTabs
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
        <AlumniTable
          alumni={paginatedAlumni}
          onEditAlumni={handleEditAlumniTrigger}
          onDeleteAlumni={handleDeleteAlumni}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(v) => {
            setRowsPerPage(v);
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

      <AlumniFormModal
        key={alumniFormMode.isOpen ? `alumni-form-${alumniFormMode.editData?.id ?? "new"}` : "alumni-form-closed"}
        isOpen={alumniFormMode.isOpen}
        initialData={alumniFormMode.editData}
        onSubmitSuccess={handleAlumniFormSubmitSuccess}
        onCancel={() => setAlumniFormMode({ isOpen: false, editData: null })}
      />
    </div>
  );
}
