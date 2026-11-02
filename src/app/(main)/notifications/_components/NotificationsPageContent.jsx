"use client";

import React, { useState, useCallback, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications, useRetryNotification } from "@/hooks/useNotifications";
import { useCreateAnnouncement } from "@/hooks/useAnnouncements";
import { usePermission } from "@/hooks/usePermission";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { NotificationTable } from "./NotificationTable";
import { NotificationTabs } from "./NotificationTabs";
import { NotificationDetailModal } from "./NotificationDetailModal";
import { AnnouncementModal } from "@/app/(main)/announcements/_components/AnnouncementModal";
import NotificationsSkeleton from "./NotificationsSkeleton";
import { parseServerError } from "@/lib/errorUtils";

const VALID_TABS = ["all", "announcement", "notice"];

export function NotificationsPageContent() {
  const { can } = usePermission();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const canSendAnnouncement =
    can("announcements.create") || can("notifications.send");

  const activeTab = VALID_TABS.includes(searchParams.get("source_module"))
    ? searchParams.get("source_module")
    : "all";
  const searchQuery = searchParams.get("search") || "";
  const statusQuery = searchParams.get("status") || "all";
  const dateQuery = searchParams.get("date") || "";
  const orderingQuery = searchParams.get("ordering") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const rowsPerPageParam = searchParams.get("page_size") || "10";
  const rowsPerPage = [5, 10, 25, 50].includes(parseInt(rowsPerPageParam, 10))
    ? parseInt(rowsPerPageParam, 10)
    : 10;

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isSendAnnouncementOpen, setIsSendAnnouncementOpen] = useState(false);

  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    isError: notificationsError,
    error,
    refetch,
    isFetching,
  } = useNotifications({
    search: searchQuery,
    sourceModule: activeTab === "all" ? "" : activeTab,
    status: statusQuery === "all" ? "" : statusQuery,
    date: dateQuery,
    ordering: orderingQuery,
    page: currentPage,
    pageSize: rowsPerPage,
  });

  const retryMutation = useRetryNotification();
  const createAnnouncementMutation = useCreateAnnouncement();

  const notifications = notificationsData?.data || [];
  const totalRows = notificationsData?.count || 0;
  const totalPages = notificationsData?.totalPages || 1;

  // ── URL query params helper ──────────────────────────────────────────────
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

  // ── Debounced Search ─────────────────────────────────────────────────────
  const { value: localSearch, handleSearchChange } = useDebouncedSearch({
    initialValue: searchQuery,
    delay: 400,
    onSearch: (val) => updateQuery({ search: val.trim(), page: 1 }),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleTabChange = (tab) => {
    updateQuery({ source_module: tab === "all" ? "" : tab, page: 1 });
  };

  const handleStatusChange = (status) => {
    updateQuery({ status: status === "all" ? "" : status, page: 1 });
  };

  const handleDateChange = (date) => {
    updateQuery({ date, page: 1 });
  };

  const handlePageChange = (pageNumber) => {
    updateQuery({ page: pageNumber === 1 ? "" : pageNumber });
  };

  const handleRowsPerPageChange = (amount) => {
    updateQuery({ page: 1, page_size: amount === 10 ? "" : amount });
  };

  const handleRetry = (id) => {
    retryMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Retry attempt initiated for eligible failed recipients.");
        if (selectedNotification?.id === id) {
          setSelectedNotification(null);
        }
      },
      onError: (err) => {
        toast.error(parseServerError(err, "Failed to retry notification dispatch."));
      },
    });
  };

  const handleCreateAnnouncement = (formData) => {
    createAnnouncementMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Announcement broadcasted and push notification sent.");
        setIsSendAnnouncementOpen(false);
        updateQuery({ page: 1 });
        refetch();
      },
      onError: (err) => {
        toast.error(parseServerError(err, "Failed to send announcement."));
      },
    });
  };

  if (notificationsLoading) {
    return <NotificationsSkeleton />;
  }

  if (notificationsError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <p className="text-red-500 text-sm">
          {parseServerError(error, "Failed to load notifications. Please try again later.")}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="text-xs inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      {/* CMS Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary break-words">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground font-normal">
            Manage, broadcast, and review your outgoing push notifications.
          </p>
        </div>
        {canSendAnnouncement && (
          <div className="shrink-0">
            <Button
              size="sm"
              onClick={() => setIsSendAnnouncementOpen(true)}
              className="bg-[#0b2574] text-white hover:bg-[#0b2574]/90 gap-1.5 text-xs font-medium h-9 px-4 shadow-sm w-full sm:w-auto cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              Send Announcement
            </Button>
          </div>
        )}
      </div>

      {/* Tabs and Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <NotificationTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          statusFilter={statusQuery}
          onStatusChange={handleStatusChange}
          dateFilter={dateQuery}
          onDateChange={handleDateChange}
          searchQuery={localSearch}
          onSearchChange={handleSearchChange}
        />
      </div>

      {/* Table Card Container matching CMS Standard */}
      <div className="w-full bg-card rounded-sm border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden relative">
        {/* Indeterminate progress bar shown while filters/pagination fetch */}
        {(isPending || isFetching) && (
          <div className="progress-bar-track">
            <div className="progress-bar-indicator" />
          </div>
        )}

        <NotificationTable
          notifications={notifications}
          onViewDetails={(item) => setSelectedNotification(item)}
          onRetry={handleRetry}
          retryingId={retryMutation.isPending ? retryMutation.variables : null}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={Math.max(totalPages, 1)}
          totalRows={totalRows}
        />
      </div>

      {/* Detail Modal */}
      <NotificationDetailModal
        isOpen={Boolean(selectedNotification)}
        notification={selectedNotification}
        isRetrying={
          retryMutation.isPending &&
          retryMutation.variables === selectedNotification?.id
        }
        onRetry={handleRetry}
        onClose={() => setSelectedNotification(null)}
      />

      {/* Send Announcement Modal */}
      <AnnouncementModal
        isOpen={isSendAnnouncementOpen}
        isSubmitting={createAnnouncementMutation.isPending}
        onSubmit={handleCreateAnnouncement}
        onClose={() => setIsSendAnnouncementOpen(false)}
      />
    </div>
  );
}
