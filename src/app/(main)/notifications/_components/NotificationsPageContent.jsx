"use client";

import React, { useState, useCallback, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, RefreshCw, CheckCheck, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useNotifications,
  useSentNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/useNotifications";
import { usePermission } from "@/hooks/usePermission";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { NotificationTable } from "./NotificationTable";
import { NotificationTabs } from "./NotificationTabs";
import { NotificationDetailModal } from "./NotificationDetailModal";
import { ComposeNotificationModal } from "./ComposeNotificationModal";
import NotificationsSkeleton from "./NotificationsSkeleton";
import { AccessDenied } from "@/components/common/AccessDenied";

export function NotificationsPageContent() {
  const { can } = usePermission();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const canView = can("notifications.view");
  const canSend = can("notifications.send");

  const activeView = searchParams.get("view") === "sent" ? "sent" : "inbox";
  const activeTab = searchParams.get("source_module") || "all";
  const readFilter = searchParams.get("is_read") || "all";
  const searchQuery = searchParams.get("search") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const rowsPerPageParam = searchParams.get("page_size") || "10";
  const rowsPerPage = [10, 25, 50, 100].includes(parseInt(rowsPerPageParam, 10))
    ? parseInt(rowsPerPageParam, 10)
    : 10;

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const { data: unreadCount = 0 } = useUnreadNotificationCount({
    enabled: canView,
  });

  // Inbox Query (when activeView === 'inbox')
  const {
    data: inboxData,
    isLoading: inboxLoading,
    isError: inboxError,
    refetch: refetchInbox,
    isFetching: inboxFetching,
  } = useNotifications({
    search: searchQuery,
    sourceModule: activeTab === "all" ? "" : activeTab,
    isRead: readFilter === "all" ? "" : readFilter,
    page: currentPage,
    pageSize: rowsPerPage,
  });

  // Sent Query (when activeView === 'sent')
  const {
    data: sentData,
    isLoading: sentLoading,
    isError: sentError,
    refetch: refetchSent,
    isFetching: sentFetching,
  } = useSentNotifications({
    search: searchQuery,
    page: currentPage,
    pageSize: rowsPerPage,
  });

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const isSent = activeView === "sent";
  const activeData = isSent ? sentData : inboxData;
  const isLoading = isSent ? sentLoading : inboxLoading;
  const isFetching = isSent ? sentFetching : inboxFetching;
  const isError = isSent ? sentError : inboxError;

  const notifications = activeData?.data || [];
  const totalRows = activeData?.count || 0;
  const totalPages = activeData?.totalPages || 1;

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
    delay: 350,
    onSearch: (val) => updateQuery({ search: val.trim(), page: 1 }),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleViewChange = (view) => {
    updateQuery({ view: view === "sent" ? "sent" : "", page: 1 });
  };

  const handleReadFilterChange = (filter) => {
    updateQuery({ is_read: filter === "all" ? "" : filter, page: 1 });
  };

  const handleSourceModuleChange = (mod) => {
    updateQuery({ source_module: mod === "all" ? "" : mod, page: 1 });
  };

  const handleToggleRead = async (item) => {
    try {
      await markReadMutation.mutateAsync({
        id: item.id,
        isRead: !item.isRead,
      });
      toast.success(item.isRead ? "Marked as unread" : "Marked as read");
      if (selectedNotification && selectedNotification.id === item.id) {
        setSelectedNotification((prev) => ({ ...prev, isRead: !item.isRead }));
      }
    } catch {
      toast.error("Failed to update notification read status.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllReadMutation.mutateAsync();
      toast.success(res?.message || "All notifications marked as read.");
    } catch {
      toast.error("Failed to mark all notifications as read.");
    }
  };

  const handleRefresh = () => {
    if (isSent) refetchSent();
    else refetchInbox();
  };

  if (!canView) {
    return (
      <AccessDenied message="You do not have permission to view or manage notifications." />
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-primary" />
            <span>Notification Center</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Role-based in-app notifications and administrative broadcasts for Superadmin, Admin, and CMS Users.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isSent && unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
              className="text-xs h-9 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 mr-1.5 text-primary" />
              Mark all as read
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="text-xs h-9 w-9 p-0 cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>

          {canSend && (
            <Button
              onClick={() => setIsComposeOpen(true)}
              className="text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Send Notification
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Search Filters */}
      <NotificationTabs
        activeView={activeView}
        onViewChange={handleViewChange}
        readFilter={readFilter}
        onReadFilterChange={handleReadFilterChange}
        sourceModule={activeTab}
        onSourceModuleChange={handleSourceModuleChange}
        searchQuery={localSearch}
        onSearchChange={handleSearchChange}
        unreadCount={unreadCount}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <NotificationsSkeleton />
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 text-center">
          <p className="text-sm font-medium text-destructive">
            Failed to load notifications. Please check your connection and try again.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-3 text-xs"
          >
            Retry
          </Button>
        </div>
      ) : (
        <NotificationTable
          notifications={notifications}
          onViewDetails={(item) => setSelectedNotification(item)}
          onToggleRead={!isSent ? handleToggleRead : null}
          isSentView={isSent}
          currentPage={currentPage}
          totalPages={totalPages}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          onPageChange={(p) => updateQuery({ page: p })}
          onRowsPerPageChange={(sz) => updateQuery({ page_size: sz, page: 1 })}
        />
      )}

      {/* Modals */}
      <NotificationDetailModal
        isOpen={Boolean(selectedNotification)}
        notification={selectedNotification}
        onToggleRead={!isSent ? handleToggleRead : null}
        onClose={() => setSelectedNotification(null)}
        isSentView={isSent}
      />

      <ComposeNotificationModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
}
