"use client";

import React, { useState, useCallback, useTransition, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useNotices, useNoticeDetail, useCreateNotice, useUpdateNotice, useDeleteNotice } from "@/hooks/useNotices";
import { NoticeTable } from "./noticeTable";
import { NoticeTabs } from "./noticeTabs";
import { NoticeFormModal } from "./noticeForm";
import { ResourceNotFoundDialog } from "@/components/common/ResourceNotFoundDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import NoticesSkeleton from "./NoticesSkeleton";
import { parseServerError } from "@/lib/errorUtils";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

const VALID_TABS = ["all", "published", "draft"];

import { usePermission } from "@/hooks/usePermission";

export function NoticesPageContent({ initialModalMode = null }) {
  const { can } = usePermission();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const editId = initialModalMode?.action === "edit" ? initialModalMode.id : null;
  const {
    data: routeEditNotice,
    isLoading: routeEditLoading,
    isError: routeEditError,
  } = useNoticeDetail(editId);

  const [formMode, setFormMode] = useState(() => ({
    isOpen: initialModalMode?.action === "create",
    editData: null,
  }));

  useEffect(() => {
    if (initialModalMode?.action === "create") {
      setFormMode({ isOpen: true, editData: null });
    } else if (initialModalMode?.action === "edit") {
      if (routeEditNotice) {
        setFormMode({ isOpen: true, editData: routeEditNotice });
      }
    } else if (!initialModalMode) {
      setFormMode({ isOpen: false, editData: null });
    }
  }, [initialModalMode, routeEditNotice]);

  const handleCloseModal = useCallback(() => {
    setFormMode({ isOpen: false, editData: null });
    if (initialModalMode) {
      router.push("/notices");
    }
  }, [initialModalMode, router]);

  const activeTab = VALID_TABS.includes(searchParams.get("tab"))
    ? searchParams.get("tab")
    : "all";
  const searchQuery = searchParams.get("search") || "";
  const orderingQuery = searchParams.get("ordering") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const rowsPerPageParam = searchParams.get("page_size") || "5";
  const rowsPerPage = [5, 10, 25].includes(parseInt(rowsPerPageParam, 10))
    ? parseInt(rowsPerPageParam, 10)
    : 5;

  const createNoticeMutation = useCreateNotice();
  const updateNoticeMutation = useUpdateNotice();
  const deleteNoticeMutation = useDeleteNotice();

  const {
    data: noticesData,
    isLoading: noticesLoading,
    isError: noticesError,
    isFetching,
  } = useNotices({
    search: searchQuery,
    status: activeTab === "all" ? "" : activeTab,
    ordering: orderingQuery,
    page: currentPage,
    pageSize: rowsPerPage,
  });

  const notices = noticesData?.data || [];
  const totalRows = noticesData?.count || 0;
  const totalPages = noticesData?.totalPages || 1;

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

  // ── Server-side Sorting Query Handler ────────────────────────────────────
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

  const handleDeleteNotice = (slug) => {
    toast.promise(deleteNoticeMutation.mutateAsync(slug), {
      id: "delete-notice",
      loading: "Deleting notice",
      success: () => {
        // Step back a page when the last row on a later page was removed.
        if (notices.length === 1 && currentPage > 1) {
          updateQuery({ page: currentPage - 1 === 1 ? "" : currentPage - 1 });
        }
        return "Notice deleted successfully.";
      },
      error: (err) => parseServerError(err, "Failed to delete notice."),
    });
  };

  const handleEditNoticeTrigger = (notice) => {
    router.push(`/notices/${notice.slug || notice.id}/edit`);
  };

  const handleDuplicateNoticeTrigger = (notice) => {
    setFormMode({
      isOpen: true,
      editData: {
        title: `${notice.title} (Copy)`,
        category: notice.category,
        description: notice.description,
        image: "",
      },
    });
  };

  const handleFormSubmitSuccess = (formData) => {
    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("category", formData.category);
    payload.append("status", formData.status);
    payload.append("description", formData.description);
    if (formData.image) payload.append("image", formData.image);

    const isEdit = formMode.editData && formMode.editData.slug;
    const mutationPromise = isEdit
      ? updateNoticeMutation.mutateAsync({ slug: formMode.editData.slug, formData: payload })
      : createNoticeMutation.mutateAsync(payload);

    toast.promise(mutationPromise, {
      id: "notice-mutation",
      loading: isEdit ? "Updating notice" : "Adding notice",
      success: () => {
        handleCloseModal();
        if (!isEdit) updateQuery({ page: 1 });
        return isEdit ? "Notice updated successfully." : "Notice created successfully.";
      },
      error: (err) => {
        console.error("Notice mutation error:", err?.response?.data || err);
        return parseServerError(err, "Failed to save notice.");
      }
    });
    
    return mutationPromise;
  };

  if (noticesLoading) return <NoticesSkeleton />;
  if (noticesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load notices. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary break-words">Notices</h1>
          <p className="text-sm text-muted-foreground font-normal">Manage, coordinate, and review your platform notice outputs.</p>
        </div>
        {can("notices.create") && (
          <div className="shrink-0">
            <Button
              size="sm"
              onClick={() => router.push("/notices/new")}
              className="bg-[#0b2574] text-white hover:bg-[#0b2574]/90 gap-1.5 text-xs font-medium h-9 px-4 shadow-sm w-full sm:w-auto cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              Publish Notice
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <NoticeTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchQuery={localSearch}
          onSearchChange={handleSearchChange}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden relative">
        {/* Indeterminate progress bar shown while filters/pagination fetch */}
        {(isPending || isFetching) && (
          <div className="progress-bar-track">
            <div className="progress-bar-indicator" />
          </div>
        )}
        <NoticeTable
          notices={notices}
          onEditNotice={handleEditNoticeTrigger}
          onDuplicateNotice={handleDuplicateNoticeTrigger}
          onDeleteNotice={handleDeleteNotice}
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

      <NoticeFormModal
        isOpen={formMode.isOpen}
        initialData={formMode.editData}
        onSubmitSuccess={handleFormSubmitSuccess}
        onCancel={handleCloseModal}
      />

      <ResourceNotFoundDialog
        isOpen={Boolean(editId && routeEditError)}
        resourceName="Notice"
        returnPath="/notices"
        onClose={() => router.push("/notices")}
      />
    </div>
  );
}