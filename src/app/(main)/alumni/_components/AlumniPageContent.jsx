"use client";

import React, { useState, useCallback, useTransition, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAlumni, useCreateAlumni, useUpdateAlumni, useDeleteAlumni } from "@/hooks/useAlumni";
import { AlumniTable } from "./AlumniTable";
import { AlumniTabs } from "./AlumniTabs";
import { AlumniFormModal } from "./AlumniForm";
import { AlumniPageHeader } from "./AlumniPageHeader";
import AlumniSkeleton from "./AlumniSkeleton";

const VALID_TABS = ["all", "active", "draft"];

export function AlumniPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const activeTab = VALID_TABS.includes(searchParams.get("tab"))
    ? searchParams.get("tab")
    : "all";
  const searchQuery = searchParams.get("search") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const rowsPerPageParam = searchParams.get("page_size") || "5";
  const rowsPerPage = [5, 10, 25].includes(parseInt(rowsPerPageParam, 10))
    ? parseInt(rowsPerPageParam, 10)
    : 5;

  const { data: alumniData, isLoading: alumniLoading, isError: alumniError } = useAlumni();
  const createAlumniMutation = useCreateAlumni();
  const updateAlumniMutation = useUpdateAlumni();
  const deleteAlumniMutation = useDeleteAlumni();

  const liveAlumni = useMemo(() => alumniData?.data ?? [], [alumniData]);
  const [alumniFormMode, setAlumniFormMode] = useState({ isOpen: false, editData: null });

  // ── URL query params helpers ────────────────────────────────────────────
  const updateQuery = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router, pathname]
  );

  // ── Search debounce ─────────────────────────────────────────────────────
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const handleSearchChange = (value) => {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateQuery({ search: value.trim(), page: 1 });
    }, 400);
  };

  // ── Tab / pagination / page-size handlers ───────────────────────────────
  const handleTabChange = (tab) => {
    updateQuery({ tab: tab === "all" ? "" : tab, page: 1 });
  };

  const handlePageChange = (pageNumber) => {
    updateQuery({ page: pageNumber === 1 ? "" : pageNumber });
  };

  const handleRowsPerPageChange = (amount) => {
    updateQuery({ page: 1, page_size: amount === 5 ? "" : amount });
  };

  // ── Sort handlers (client-side, default id-based) ──────────────────────
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSortChange = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortOrder("none");
      setSortField(null);
    }
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
      return updateAlumniMutation.mutateAsync(
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
      return createAlumniMutation.mutateAsync(payload, {
        onSuccess: () => {
          toast.success("Alumni added successfully.");
          setAlumniFormMode({ isOpen: false, editData: null });
          updateQuery({ page: 1 });
        },
        onError: () => {
          toast.error("Failed to add alumni. Please try again.");
        },
      });
    }
  };

  // ── Client-side filtering (backend doesn't support it for alumni) ──────
  const filteredAlumni = useMemo(() => {
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
          String(m.memberId || "").toLowerCase().includes(q)
      );
    }

    if (sortField && sortOrder !== "none") {
      dataset.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === "id") {
          const numA = Number(valA) || 0;
          const numB = Number(valB) || 0;
          return sortOrder === "asc" ? numA - numB : numB - numA;
        }

        valA = valA?.toString().toLowerCase() || "";
        valB = valB?.toString().toLowerCase() || "";
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return dataset;
  }, [liveAlumni, activeTab, searchQuery, sortField, sortOrder]);

  const totalRows = filteredAlumni.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const paginatedAlumni = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAlumni.slice(start, start + rowsPerPage);
  }, [filteredAlumni, currentPage, rowsPerPage]);

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
          onTabChange={handleTabChange}
          searchQuery={localSearch}
          onSearchChange={handleSearchChange}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Indeterminate progress bar shown while filters/pagination update */}
        {isPending && (
          <div className="progress-bar-track">
            <div className="progress-bar-indicator" />
          </div>
        )}
        <AlumniTable
          alumni={paginatedAlumni}
          onEditAlumni={handleEditAlumniTrigger}
          onDeleteAlumni={handleDeleteAlumni}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={Math.max(totalPages, 1)}
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