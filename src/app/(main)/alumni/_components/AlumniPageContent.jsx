"use client";

import React, { useState, useCallback, useTransition, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useAlumni, useAlumniDetail, useCreateAlumni, useUpdateAlumni, useDeleteAlumni } from "@/hooks/useAlumni";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { AlumniTable } from "./AlumniTable";
import { AlumniTabs } from "./AlumniTabs";
import { AlumniFormModal } from "./AlumniForm";
import { AlumniPageHeader } from "./AlumniPageHeader";
import { ResourceNotFoundDialog } from "@/components/common/ResourceNotFoundDialog";
import AlumniSkeleton from "./AlumniSkeleton";
import { parseServerError } from "@/lib/errorUtils";

const VALID_TABS = ["all", "active", "draft"];

export function AlumniPageContent({ initialModalMode = null }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const editId = initialModalMode?.action === "edit" ? initialModalMode.id : null;
  const {
    data: routeEditAlumni,
    isLoading: routeEditLoading,
    isError: routeEditError,
  } = useAlumniDetail(editId);

  const [alumniFormMode, setAlumniFormMode] = useState(() => ({
    isOpen: initialModalMode?.action === "create",
    editData: null,
  }));

  useEffect(() => {
    if (initialModalMode?.action === "create") {
      // Route modal state is synchronized from navigation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAlumniFormMode({ isOpen: true, editData: null });
    } else if (initialModalMode?.action === "edit") {
      if (routeEditAlumni) {
        // Route data is external state that must populate the edit modal.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAlumniFormMode({ isOpen: true, editData: routeEditAlumni });
      }
    } else if (!initialModalMode) {
      setAlumniFormMode({ isOpen: false, editData: null });
    }
  }, [initialModalMode, routeEditAlumni]);

  const handleCloseModal = useCallback(() => {
    setAlumniFormMode({ isOpen: false, editData: null });
    if (initialModalMode) {
      router.push("/alumni");
    }
  }, [initialModalMode, router]);

  const activeTab = VALID_TABS.includes(searchParams.get("tab"))
    ? searchParams.get("tab")
    : "all";
  const searchQuery = searchParams.get("search") || "";
  const idQuery = searchParams.get("id") || "";
  const orderingQuery = searchParams.get("ordering") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const rowsPerPageParam = searchParams.get("page_size") || "10";
  const rowsPerPage = [10, 25, 50, 100].includes(parseInt(rowsPerPageParam, 10))
    ? parseInt(rowsPerPageParam, 10)
    : 10;

  const {
    data: alumniData,
    isLoading: alumniLoading,
    isError: alumniError,
    isFetching,
  } = useAlumni();

  const createAlumniMutation = useCreateAlumni();
  const updateAlumniMutation = useUpdateAlumni();
  const deleteAlumniMutation = useDeleteAlumni();

  // Frontend-side pagination: search, tab filter, sort and slicing over the full list.
  const processedAlumni = useMemo(() => {
    let dataset = alumniData?.data ?? [];
    if (activeTab !== "all") {
      dataset = dataset.filter((a) => a.status === activeTab);
    }
    if (idQuery) {
      dataset = dataset.filter((a) => String(a.id) === idQuery);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      dataset = dataset.filter((a) =>
        [a.fullName, a.email, a.memberId, a.graduationYear].some((v) =>
          String(v ?? "").toLowerCase().includes(q)
        )
      );
    }
    const field = orderingQuery.replace("-", "");
    if (field) {
      const dir = orderingQuery.startsWith("-") ? -1 : 1;
      dataset = [...dataset].sort((a, b) => {
        const valA = a[field] ?? "";
        const valB = b[field] ?? "";
        if (typeof valA === "number" && typeof valB === "number") return (valA - valB) * dir;
        return String(valA).localeCompare(String(valB), undefined, { numeric: true }) * dir;
      });
    }
    return dataset;
  }, [alumniData, activeTab, idQuery, searchQuery, orderingQuery]);

  const totalRows = processedAlumni.length;
  const totalPages = Math.max(Math.ceil(totalRows / rowsPerPage), 1);
  // Clamp to the last page when filters or deletes shrink the list.
  const effectivePage = Math.min(currentPage, totalPages);
  const liveAlumni = useMemo(
    () => processedAlumni.slice((effectivePage - 1) * rowsPerPage, effectivePage * rowsPerPage),
    [processedAlumni, effectivePage, rowsPerPage]
  );

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
  const { value: localSearch, handleSearchChange } = useDebouncedSearch({
    initialValue: searchQuery,
    delay: 400,
    onSearch: (value) => updateQuery({ search: value.trim(), page: 1 }),
  });

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

  // ── Sorting (applied locally) ────────────────────────────────────────────
  const sortField = orderingQuery ? orderingQuery.replace("-", "") : null;
  const sortOrder = orderingQuery ? (orderingQuery.startsWith("-") ? "desc" : "asc") : "none";

  const handleSortChange = (field) => {
    let nextOrdering = field;
    if (orderingQuery === field) {
      nextOrdering = `-${field}`;
    } else if (orderingQuery === `-${field}`) {
      nextOrdering = "";
    }
    updateQuery({ ordering: nextOrdering, page: 1 });
  };

  const handleDeleteAlumni = (id) => {
    toast.promise(deleteAlumniMutation.mutateAsync(id), {
      id: "delete-alumni",
      loading: "Deleting alumni",
      success: "Alumni deleted successfully.",
      error: (err) => parseServerError(err, "Failed to delete alumni. Please try again."),
    });
  };

  const handleEditAlumniTrigger = (alumni) => {
    router.push(`/alumni/${alumni.id}/edit`);
  };

  const handleAlumniFormSubmitSuccess = (formData) => {
    const payload = {
      member_id: formData.memberId,
      graduation_year: formData.graduationYear,
      bio: formData.bio || "",
    };
    if (Array.isArray(formData.tenureIds) && formData.tenureIds.length > 0) {
      payload.tenure_ids = formData.tenureIds;
    }

    const isEdit = alumniFormMode.editData && alumniFormMode.editData.id;
    const mutationPromise = isEdit
      ? updateAlumniMutation.mutateAsync({ id: alumniFormMode.editData.id, payload })
      : createAlumniMutation.mutateAsync(payload);

    toast.promise(mutationPromise, {
      id: "alumni-mutation",
      loading: isEdit ? "Updating alumni" : "Adding alumni",
      success: () => {
        handleCloseModal();
        if (!isEdit) updateQuery({ page: 1 });
        return isEdit ? "Alumni updated successfully." : "Alumni added successfully.";
      },
      error: (err) => {
        console.error("Alumni mutation error:", err?.response?.data || err);
        return parseServerError(err, "Failed to save alumni. Please try again.");
      }
    });
    
    return mutationPromise;
  };

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
      <AlumniPageHeader onAddAlumni={() => router.push("/alumni/new")} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <AlumniTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchQuery={localSearch}
          onSearchChange={handleSearchChange}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 dark:border-border shadow-sm overflow-hidden relative">
        {/* Indeterminate progress bar shown while filters/pagination update */}
        {(isPending || isFetching) && (
          <div className="progress-bar-track">
            <div className="progress-bar-indicator" />
          </div>
        )}
        <AlumniTable
          alumni={liveAlumni}
          onEditAlumni={handleEditAlumniTrigger}
          onDeleteAlumni={handleDeleteAlumni}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          currentPage={effectivePage}
          onPageChange={handlePageChange}
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
        onCancel={handleCloseModal}
      />

      <ResourceNotFoundDialog
        isOpen={Boolean(editId && routeEditError)}
        resourceName="Alumni"
        returnPath="/alumni"
        onClose={() => router.push("/alumni")}
      />
    </div>
  );
}