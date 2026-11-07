"use client";

import React, { useState, useCallback, useTransition, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  usePastPapers,
  usePastPaperDetail,
  useCreatePastPaper,
  useUpdatePastPaper,
  useDeletePastPaper,
} from "@/hooks/usePastPapers";
import { PastPaperTable } from "./pastPaperTable";
import { PastPaperTabs } from "./pastPaperTabs";
import { PastPaperFormModal } from "./pastPaperFormModel";
import { ResourceNotFoundDialog } from "@/components/common/ResourceNotFoundDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import PastPapersSkeleton from "./PastPapersSkeleton";
import { toast } from "sonner";
import { parseServerError } from "@/lib/errorUtils";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { usePermission } from "@/hooks/usePermission";

const VALID_TABS = ["all", "board", "model"];

export function PastPapersPageContent({ initialModalMode = null }) {
  const { can } = usePermission();
  const canCreate = can("papers.create");

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const activeTab = VALID_TABS.includes(searchParams.get("tab"))
    ? searchParams.get("tab")
    : "all";
  const searchQuery = searchParams.get("search") || "";
  const orderingQuery = searchParams.get("ordering") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const rowsPerPageParam = searchParams.get("page_size") || "10";
  const rowsPerPage = [10, 25, 50, 100].includes(parseInt(rowsPerPageParam, 10))
    ? parseInt(rowsPerPageParam, 10)
    : 10;

  const editId = initialModalMode?.action === "edit" ? initialModalMode.id : null;
  const {
    data: routeEditPaper,
    isLoading: routeEditLoading,
    isError: routeEditError,
  } = usePastPaperDetail(editId);

  const [formMode, setFormMode] = useState(() => ({
    isOpen: initialModalMode?.action === "create",
    editData: null,
  }));

  useEffect(() => {
    if (initialModalMode?.action === "create") {
      // Route modal state is synchronized from navigation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormMode({ isOpen: true, editData: null });
    } else if (initialModalMode?.action === "edit") {
      if (routeEditPaper) {
        setFormMode({ isOpen: true, editData: routeEditPaper });
      }
    } else if (!initialModalMode) {
      setFormMode({ isOpen: false, editData: null });
    }
  }, [initialModalMode, routeEditPaper]);

  const handleCloseModal = useCallback(() => {
    setFormMode({ isOpen: false, editData: null });
    if (initialModalMode) {
      router.push("/past-papers");
    }
  }, [initialModalMode, router]);

  const createPaperMutation = useCreatePastPaper();
  const updatePaperMutation = useUpdatePastPaper();
  const deletePaperMutation = useDeletePastPaper();

  // Tab maps to backend model_set filter
  const modelSetFilter = activeTab === "model" ? "true" : activeTab === "board" ? "false" : "";

  const {
    data: papersData,
    isLoading: papersLoading,
    isError: papersError,
    isFetching,
  } = usePastPapers({
    search: searchQuery,
    ordering: orderingQuery,
    page: currentPage,
    pageSize: rowsPerPage,
    model_set: modelSetFilter,
  });

  const livePapers = papersData?.data || [];
  const totalRows = papersData?.count || 0;
  const totalPages = papersData?.totalPages || 1;

  // ── URL query helpers ────────────────────────────────────────────────────
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

  // ── Debounced search ─────────────────────────────────────────────────────
  const { value: localSearch, handleSearchChange } = useDebouncedSearch({
    initialValue: searchQuery,
    delay: 350,
    onSearch: (value) => updateQuery({ search: value, page: "" }),
  });

  // ── Sort (header click → ordering query param) ────────────────────────
  const handleSortChange = (field) => {
    const currentOrdering = orderingQuery;
    let newOrdering = "";
    if (currentOrdering === field) {
      newOrdering = `-${field}`;
    } else if (currentOrdering === `-${field}`) {
      newOrdering = "";
    } else {
      newOrdering = field;
    }
    updateQuery({ ordering: newOrdering, page: "" });
  };

  // ── Mutations ─────────────────────────────────────────────────────────
  const handleDeletePaper = (slug) => {
    return toast.promise(deletePaperMutation.mutateAsync(slug), {
      id: "delete-paper",
      loading: "Deleting past paper",
      success: "Past paper deleted successfully.",
      error: (err) => {
        console.error("Failed to delete past paper:", err);
        return parseServerError(err, "Failed to delete past paper.");
      },
    });
  };

  const handleEditPaperTrigger = (paper) => {
    router.push(`/past-papers/${paper.slug || paper.id}/edit`);
  };

  const handleFormSubmitSuccess = (formData) => {
    const isEdit = formMode.editData != null;
    const payload = {
      subject_name: formData.subject_code,
      semester: formData.semester,
      model_set: formData.model_set,
      is_old_course: Boolean(formData.is_old_course),
      exam_year: formData.exam_year,
      drive_link: formData.drive_link,
    };

    const savePromise = isEdit
      ? updatePaperMutation.mutateAsync({ slug: formMode.editData.slug, data: payload })
      : createPaperMutation.mutateAsync(payload);

    toast.promise(savePromise, {
      id: "paper-mutation",
      loading: isEdit ? "Updating past paper" : "Adding past paper",
      success: () => {
        handleCloseModal();
        return isEdit ? "Past paper updated successfully." : "Past paper added successfully.";
      },
      error: (err) => {
        console.error("Failed to save past paper:", err);
        return parseServerError(err, "Failed to save past paper.");
      },
    });

    return savePromise;
  };

  if (papersLoading) return <PastPapersSkeleton />;
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
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary break-words">Past Papers</h1>
          <p className="text-sm text-muted-foreground font-normal">Manage, coordinate, and review academic past papers and official model questions.</p>
        </div>
        {canCreate && (
          <div className="shrink-0">
            <Button
              size="sm"
              onClick={() => router.push("/past-papers/new")}
              className="gap-1.5 shadow-2xs w-full sm:w-auto cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              Add Paper
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <PastPaperTabs
          activeTab={activeTab}
          onTabChange={(tab) => updateQuery({ tab: tab === "all" ? "" : tab, page: "" })}
          searchQuery={localSearch}
          onSearchChange={handleSearchChange}
          isFetching={isFetching && !papersLoading}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 dark:border-border shadow-sm overflow-hidden">
        <PastPaperTable
          papers={livePapers}
          onEditPaper={handleEditPaperTrigger}
          onDeletePaper={handleDeletePaper}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(n) => updateQuery({ page_size: n, page: "" })}
          currentPage={currentPage}
          onPageChange={(p) => updateQuery({ page: p })}
          totalPages={totalPages}
          totalRows={totalRows}
          sortField={orderingQuery.replace(/^-/, "")}
          sortOrder={orderingQuery ? (orderingQuery.startsWith("-") ? "desc" : "asc") : "none"}
          onHeaderClick={handleSortChange}
          isFetching={isFetching && !papersLoading}
        />
      </div>

      <PastPaperFormModal
        isOpen={formMode.isOpen}
        initialData={formMode.editData}
        onSubmitSuccess={handleFormSubmitSuccess}
        onCancel={handleCloseModal}
      />

      <ResourceNotFoundDialog
        isOpen={Boolean(editId && routeEditError)}
        resourceName="Past Paper"
        returnPath="/past-papers"
        onClose={() => router.push("/past-papers")}
      />
    </div>
  );
}
