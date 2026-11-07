"use client";

import React, { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Megaphone,
  PlusCircle,
  Search,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "@/hooks/useAnnouncements";
import { AnnouncementTable } from "./AnnouncementTable";
import { AnnouncementModal } from "./AnnouncementModal";
import AnnouncementsSkeleton from "./AnnouncementsSkeleton";
import { parseServerError } from "@/lib/errorUtils";

export function AnnouncementsPageContent() {
  const { can } = usePermission();
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchQuery = searchParams.get("search") || "";
  const orderingQuery = searchParams.get("ordering") || "-created_at";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const rowsPerPageParam = searchParams.get("page_size") || "10";
  const rowsPerPage = [10, 25, 50, 100].includes(parseInt(rowsPerPageParam, 10))
    ? parseInt(rowsPerPageParam, 10)
    : 10;

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [modalState, setModalState] = useState({ isOpen: false, item: null });

  const {
    data: announcementsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAnnouncements({
    search: searchQuery,
    ordering: orderingQuery,
    page: currentPage,
    pageSize: rowsPerPage,
  });

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const announcements = announcementsData?.data || [];
  const totalRows = announcementsData?.count || 0;
  const totalPages = announcementsData?.totalPages || 1;

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
      router.push(`/announcements?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQuery({ search: searchInput.trim(), page: 1 });
  };

  const handleSort = (field) => {
    let newOrdering = field;
    if (orderingQuery === field) {
      newOrdering = `-${field}`;
    } else if (orderingQuery === `-${field}`) {
      newOrdering = "";
    }
    updateQuery({ ordering: newOrdering, page: 1 });
  };

  const getSortDetails = () => {
    if (!orderingQuery) return { field: null, order: null };
    if (orderingQuery.startsWith("-")) {
      return { field: orderingQuery.substring(1), order: "desc" };
    }
    return { field: orderingQuery, order: "asc" };
  };

  const { field: sortField, order: sortOrder } = getSortDetails();

  const handleModalSubmit = async (formData) => {
    if (modalState.item?.id) {
      // Update
      updateMutation.mutate(
        { id: modalState.item.id, formData },
        {
          onSuccess: () => {
            toast.success("Announcement updated successfully.");
            setModalState({ isOpen: false, item: null });
          },
          onError: (err) => {
            toast.error(parseServerError(err, "Failed to update announcement."));
          },
        }
      );
    } else {
      // Create
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success(
            "Announcement created and push notification broadcast scheduled!"
          );
          setModalState({ isOpen: false, item: null });
        },
        onError: (err) => {
          toast.error(parseServerError(err, "Failed to create announcement."));
        },
      });
    }
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Announcement deleted successfully.");
      },
      onError: (err) => {
        toast.error(parseServerError(err, "Failed to delete announcement."));
      },
    });
  };

  if (isLoading) {
    return <AnnouncementsSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-6 max-w-xl mx-auto my-12 text-center bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 rounded-2xl shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Failed to load announcements
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          {parseServerError(error, "An error occurred while fetching announcements.")}
        </p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Announcements
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage mobile announcements and trigger push notification broadcasts.
              </p>
            </div>
          </div>
        </div>

        {can("announcements.create") && (
          <Button
            size="sm"
            onClick={() => setModalState({ isOpen: true, item: null })}
            className="gap-1.5 shadow-2xs text-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            New Announcement
          </Button>
        )}
      </div>

      {/* Toolbar / Search */}
      <div className="flex items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </form>

        {isFetching && !isLoading && (
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
            Updating...
          </span>
        )}
      </div>

      {/* Table */}
      <AnnouncementTable
        announcements={announcements}
        onDelete={handleDelete}
        onEdit={(item) => setModalState({ isOpen: true, item })}
        sortField={sortField}
        sortOrder={sortOrder}
        onHeaderClick={handleSort}
        currentPage={currentPage}
        totalPages={totalPages}
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
        onPageChange={(page) => updateQuery({ page })}
        onRowsPerPageChange={(pageSize) => updateQuery({ page_size: pageSize, page: 1 })}
      />

      {/* Create / Edit Modal */}
      <AnnouncementModal
        isOpen={modalState.isOpen}
        initialData={modalState.item}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleModalSubmit}
        onClose={() => setModalState({ isOpen: false, item: null })}
      />
    </div>
  );
}
