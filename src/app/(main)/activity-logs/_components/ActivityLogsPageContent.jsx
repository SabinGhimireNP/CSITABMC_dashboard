"use client";

import React, { useState, useDeferredValue, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  Activity,
  Search,
  Filter,
  Calendar,
  Eye,
  RefreshCw,
  Loader2,
  X,
  Edit3,
  Layers,
} from "lucide-react";
import { useActivityLogs, useActivityLogSummary, useActivityLogDetail } from "@/hooks/useActivityLogs";
import { ActivityLogDetailModal, formatNepalTime, formatSysId } from "./ActivityLogDetailModal";
import { ResourceNotFoundDialog } from "@/components/common/ResourceNotFoundDialog";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import ActivityLogsSkeleton from "./ActivityLogsSkeleton";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/common/pagination";

const MODULE_OPTIONS = [
  { value: "", label: "All Sections" },
  { value: "auth", label: "Login & Auth" },
  { value: "accounts", label: "Accounts" },
  { value: "users", label: "Users" },
  { value: "events", label: "Events" },
  { value: "notices", label: "Notices" },
  { value: "blogs", label: "Blogs" },
  { value: "tenure", label: "Tenure & Members" },
  { value: "certificates", label: "Certificates" },
  { value: "papers", label: "Past Papers" },
  { value: "media", label: "Media" },
];

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Edit / Update" },
  { value: "delete", label: "Delete" },
  { value: "publish", label: "Publish" },
  { value: "unpublish", label: "Unpublish" },
  { value: "login", label: "Login" },
  { value: "failed_login", label: "Failed Login" },
  { value: "logout", label: "Logout" },
  { value: "password_change", label: "Password Change" },
  { value: "password_reset", label: "Password Reset" },
];

function cleanUsername(val) {
  if (!val) return "";
  return String(val).replace(/^@+/, "").trim();
}

function getActionBadgeStyle(action) {
  switch (action?.toLowerCase()) {
    case "create":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "update":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "delete":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
    case "publish":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "unpublish":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    case "login":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20";
    case "failed_login":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
    case "logout":
      return "bg-muted text-muted-foreground border-border";
    case "password_change":
    case "password_reset":
      return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function getRoleBadgeStyle(role) {
  switch (role?.toLowerCase()) {
    case "superadmin":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "admin":
      return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
    case "cms_user":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function ActivityLogsPageContent({ initialModalMode = null }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);

  const editId = initialModalMode?.id || null;
  const {
    data: routeEditLog,
    isLoading: routeEditLoading,
    isError: routeEditError,
  } = useActivityLogDetail(editId);

  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    if (routeEditLog) {
      // Route data is external state that must populate the edit modal.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedLog(routeEditLog);
    } else if (!initialModalMode) {
      setSelectedLog(null);
    }
  }, [routeEditLog, initialModalMode]);

  const handleCloseModal = useCallback(() => {
    setSelectedLog(null);
    if (initialModalMode) {
      router.push("/activity-logs");
    }
  }, [initialModalMode, router]);

  // Queries
  const { data: summary, isLoading: isSummaryLoading } = useActivityLogSummary();
  const {
    data: logsData,
    isLoading: isLogsLoading,
    isFetching,
    refetch,
  } = useActivityLogs({
    page,
    pageSize,
    module: moduleFilter,
    action: actionFilter,
    startDate,
    endDate,
    search: deferredSearch,
  });

  const logs = logsData?.results || [];
  const totalCount = logsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const handleResetFilters = () => {
    setModuleFilter("");
    setActionFilter("");
    setStartDate("");
    setEndDate("");
    setSearchInput("");
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    moduleFilter || actionFilter || startDate || endDate || searchInput
  );

  if (isLogsLoading && isSummaryLoading) {
    return <ActivityLogsSkeleton />;
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary break-words">
            Activity Logs
          </h1>
          <p className="text-sm text-muted-foreground font-normal">
            Track user actions and system changes. Times shown in Nepal Time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 gap-1.5 shadow-2xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Activities */}
        <div className="bg-card p-3 sm:p-5 rounded-xl border border-slate-200/90 dark:border-border shadow-2xs flex items-center justify-between gap-2 min-w-0">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Total Activities</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
              {isSummaryLoading ? "—" : summary?.total_logs ?? 0}
            </p>
          </div>
          <div className="hidden sm:block p-3 shrink-0 bg-primary/10 rounded-xl border border-primary/20 text-primary">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        {/* Logins This Week */}
        <div className="bg-card p-3 sm:p-5 rounded-xl border border-slate-200/90 dark:border-border shadow-2xs flex items-center justify-between gap-2 min-w-0">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Logins This Week</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
              {isSummaryLoading ? "—" : summary?.logins_this_week ?? 0}
            </p>
          </div>
          <div className="hidden sm:block p-3 shrink-0 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-600 dark:text-sky-400">
            <History className="h-5 w-5" />
          </div>
        </div>

        {/* Changes Today */}
        <div className="bg-card p-3 sm:p-5 rounded-xl border border-slate-200/90 dark:border-border shadow-2xs flex items-center justify-between gap-2 min-w-0">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Changes Today</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
              {isSummaryLoading ? "—" : summary?.mutations_today ?? 0}
            </p>
          </div>
          <div className="hidden sm:block p-3 shrink-0 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Edit3 className="h-5 w-5" />
          </div>
        </div>

        {/* Most Active Section */}
        <div className="bg-card p-3 sm:p-5 rounded-xl border border-slate-200/90 dark:border-border shadow-2xs flex items-center justify-between gap-2 min-w-0">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Most Active Section</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground capitalize truncate">
              {isSummaryLoading ? "—" : summary?.most_active_module ?? "None"}
            </p>
          </div>
          <div className="hidden sm:block p-3 shrink-0 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Layers className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card p-4 rounded-xl border border-slate-200/90 dark:border-border shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, username, email, or details…"
              className="w-full h-9 pl-9 pr-8 text-xs bg-background border border-input text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 px-3 text-xs bg-background border border-input text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {MODULE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 px-3 text-xs bg-background border border-input text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <div className="flex items-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetFilters}
                className="w-full justify-center shadow-2xs"
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" /> Reset
              </Button>
            </div>
          )}
        </div>

        {/* Date Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1.5 shrink-0">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Date Range:
          </span>
          <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <input
              type="date"
              aria-label="Start date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="h-9 min-w-0 flex-1 sm:flex-none px-2.5 text-xs bg-background border border-input text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              aria-label="End date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="h-9 min-w-0 flex-1 sm:flex-none px-2.5 text-xs bg-background border border-input text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="w-full bg-card rounded-sm border border-slate-200/90 dark:border-border shadow-sm overflow-hidden relative">
        {/* Mobile: record cards */}
        <div className="md:hidden">
          {isLogsLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              Loading activity logs…
            </div>
          ) : (
            <ResponsiveRecordList
              items={logs}
              getKey={(log) => log.id}
              emptyText="No activities match your filters."
              renderTitle={(log) => log.description || `${log.action} · ${log.module}`}
              renderSubtitle={(log) => formatNepalTime(log.timestamp)}
              renderBadge={(log) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getActionBadgeStyle(log.action)}`}>
                  {log.action}
                </span>
              )}
              fields={[
                {
                  label: "ID",
                  render: (log) => (
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {log.actor_sys_id || log.actor_sys_id_snapshot || "—"}
                    </span>
                  ),
                },
                {
                  label: "Actor",
                  render: (log) => {
                    const name = log.actor_name || log.actor_name_snapshot || (log.user_email_snapshot ? "Name unavailable" : "System");
                    const username = cleanUsername(log.actor_username || log.actor_username_snapshot);
                    return (
                      <div className="flex flex-col text-foreground">
                        <span className="font-semibold text-xs">{name}</span>
                        {username && <span className="text-[10px] text-muted-foreground">{username}</span>}
                      </div>
                    );
                  },
                },
                {
                  label: "Role",
                  render: (log) => {
                    const role = log.actor_role_label || log.role_label || log.actor_role || log.user_role_snapshot || "System";
                    return (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle(log.actor_role || log.user_role_snapshot)}`}>
                        {role}
                      </span>
                    );
                  },
                },
                {
                  label: "Env",
                  render: (log) => (
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {log.ip_address || "—"}
                      {log.browser_name ? ` (${log.browser_name} · ${log.os_name || log.device_type})` : ""}
                    </span>
                  ),
                },
              ]}
              renderActions={(log) => (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/activity-logs/${log.id}`)}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Eye className="h-3 w-3" /> View
                </Button>
              )}
            />
          )}
        </div>

        {/* Desktop Table: Order: id, Actor, Role, Action, env then date and time then detials. */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4 w-[11%]">id</th>
                <th className="py-3 px-4 w-[22%]">Actor</th>
                <th className="py-3 px-4 w-[14%]">Role</th>
                <th className="py-3 px-4 w-[14%]">Action</th>
                <th className="py-3 px-4 w-[16%]">env</th>
                <th className="py-3 px-4 w-[15%]">date and time</th>
                <th className="py-3 px-4 w-[8%] text-right">details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {isLogsLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Loading activity logs…
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
                    <p className="font-semibold text-foreground">No activity logs found</p>
                    <p className="text-[11px] mt-0.5">No activities match your filters.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const actorSysId = log.actor_sys_id || log.actor_sys_id_snapshot || (log.actor_id_snapshot ? `SYS-${log.actor_id_snapshot}` : "—");
                  const actorName = log.actor_name || log.actor_name_snapshot || (log.user_email_snapshot ? "Name unavailable" : "System");
                  const rawUsername = log.actor_username || log.actor_username_snapshot || "";
                  const displayUsername = cleanUsername(rawUsername);
                  const actorRole = log.actor_role_label || log.role_label || log.actor_role || log.user_role_snapshot || "System";

                  return (
                    <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                      {/* 1. id */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {actorSysId}
                        </span>
                      </td>

                      {/* 2. Actor */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col min-w-0 max-w-[240px]">
                          <span className="font-semibold text-foreground text-xs truncate" title={actorName}>
                            {actorName}
                          </span>
                          {displayUsername && (
                            <span className="text-[11px] text-muted-foreground truncate" title={displayUsername}>
                              {displayUsername}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Role */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle(log.actor_role || log.user_role_snapshot)}`}>
                          {actorRole}
                        </span>
                      </td>

                      {/* 4. Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getActionBadgeStyle(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* 5. env */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-foreground font-medium">
                            {log.ip_address || "—"}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={log.browser_name ? `${log.browser_name} · ${log.os_name || log.device_type}` : ""}>
                            {log.browser_name ? `${log.browser_name} · ${log.os_name || log.device_type}` : "—"}
                          </span>
                        </div>
                      </td>

                      {/* 6. date and time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-foreground text-[11px]">
                          {formatNepalTime(log.timestamp)}
                        </span>
                      </td>

                      {/* 7. details */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/activity-logs/${log.id}`)}
                          className="text-primary hover:text-primary hover:bg-primary/10 h-7 px-2.5 text-xs font-semibold"
                        >
                          <Eye className="h-3 w-3" /> View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalCount > 0 && (
          <div className="border-t border-border bg-muted/20">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalRows={totalCount}
              rowsPerPage={pageSize}
              onPageChange={setPage}
              onRowsPerPageChange={(newSize) => { setPageSize(newSize); setPage(1); }}
              isEmbedded={true}
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ActivityLogDetailModal
        log={selectedLog}
        isOpen={Boolean(selectedLog)}
        onClose={handleCloseModal}
      />

      <ResourceNotFoundDialog
        isOpen={Boolean(editId && routeEditError)}
        resourceName="Activity Log"
        returnPath="/activity-logs"
        onClose={() => router.push("/activity-logs")}
      />
    </div>
  );
}
