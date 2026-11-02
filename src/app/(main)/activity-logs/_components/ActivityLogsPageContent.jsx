"use client";

import React, { useState, useDeferredValue, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  Activity,
  LogIn,
  Edit3,
  Layers,
  Search,
  Filter,
  Calendar,
  Eye,
  RefreshCw,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Info,
} from "lucide-react";
import { useActivityLogs, useActivityLogSummary, useActivityLogDetail } from "@/hooks/useActivityLogs";
import { ActivityLogDetailModal, formatNepalTime } from "./ActivityLogDetailModal";
import { ResourceNotFoundDialog } from "@/components/common/ResourceNotFoundDialog";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";

const MODULE_OPTIONS = [
  { value: "", label: "All Sections" },
  { value: "auth", label: "Login & Auth" },
  { value: "users", label: "Users" },
  { value: "events", label: "Events" },
  { value: "notices", label: "Notices" },
  { value: "blogs", label: "Blogs" },
  { value: "tenure", label: "Tenure & Members" },
  { value: "certificates", label: "Certificates" },
  { value: "papers", label: "Past Papers" },
];

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Edit / Update" },
  { value: "delete", label: "Delete" },
  { value: "publish", label: "Publish" },
  { value: "unpublish", label: "Unpublish" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "password_change", label: "Password Change" },
  { value: "password_reset", label: "Password Reset" },
];

function getActionBadge(action) {
  switch (action) {
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
    case "logout":
      return "bg-muted text-muted-foreground border-border";
    case "password_change":
    case "password_reset":
      return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function ActivityLogsPageContent({ initialModalMode = null }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Activity Logs
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track user actions and system changes. Times shown in Nepal Time.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-foreground bg-card border border-border rounded-lg hover:bg-muted/50 cursor-pointer shadow-2xs disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-primary" : "text-muted-foreground"}`} />
          Refresh
        </button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Activities */}
        <div className="bg-card p-3 sm:p-5 rounded-2xl border border-border shadow-2xs flex items-center justify-between gap-2 min-w-0">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Total Activities</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
              {isSummaryLoading ? "—" : summary?.total_activities ?? 0}
            </p>
          </div>
          <div className="hidden sm:block p-3 shrink-0 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        {/* Logins This Week */}
        <div className="bg-card p-3 sm:p-5 rounded-2xl border border-border shadow-2xs flex items-center justify-between gap-2 min-w-0">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Logins This Week</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
              {isSummaryLoading ? "—" : summary?.logins_this_week ?? 0}
            </p>
          </div>
          <div className="hidden sm:block p-3 shrink-0 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-600 dark:text-sky-400">
            <LogIn className="h-5 w-5" />
          </div>
        </div>

        {/* Changes Today */}
        <div className="bg-card p-3 sm:p-5 rounded-2xl border border-border shadow-2xs flex items-center justify-between gap-2 min-w-0">
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
        <div className="bg-card p-3 sm:p-5 rounded-2xl border border-border shadow-2xs flex items-center justify-between gap-2 min-w-0">
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
      <div className="bg-card p-4 rounded-2xl border border-border shadow-2xs space-y-3">
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
              placeholder="Search by user, item, or details…"
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
              <button
                onClick={handleResetFilters}
                className="h-9 px-3 text-xs font-semibold text-destructive hover:text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg flex items-center gap-1.5 cursor-pointer w-full justify-center transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-border text-xs text-muted-foreground">
          <span className="font-semibold text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Date:
          </span>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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
      <div className="bg-card rounded-2xl border border-border shadow-2xs overflow-hidden">
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
              renderTitle={(log) => log.target_repr || `${log.action} · ${log.module}`}
              renderSubtitle={(log) => formatNepalTime(log.timestamp)}
              renderBadge={(log) => (
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getActionBadge(log.action)}`}>
                    {log.action}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground capitalize">
                    {log.module}
                  </span>
                </span>
              )}
              fields={[
                {
                  label: "User",
                  render: (log) => (
                    <span className="break-all text-foreground">
                      {log.user_email_snapshot || "System"}
                      <span className="block text-[10px] text-primary">{log.user_role_snapshot || "system"}</span>
                    </span>
                  ),
                },
                { label: "IP Address", render: (log) => <span className="font-mono text-[11px] text-muted-foreground">{log.ip_address || "—"}</span> },
              ]}
              renderActions={(log) => (
                <button
                  type="button"
                  onClick={() => router.push(`/activity-logs/${log.id}`)}
                  className="inline-flex items-center gap-1 h-8 px-2.5 text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg cursor-pointer transition-colors"
                >
                  <Eye className="h-3 w-3" /> View
                </button>
              )}
            />
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Details</th>
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
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-foreground">
                        {formatNepalTime(log.timestamp)}
                      </span>
                    </td>

                    {/* User */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground break-all max-w-56" title={log.user_email_snapshot}>
                          {log.user_email_snapshot || "System"}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                            {log.user_role_snapshot || "system"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    {/* Module */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground capitalize">
                        {log.module}
                      </span>
                    </td>

                    {/* Target / Description */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-start gap-1.5 min-w-0">
                        <span className="font-semibold text-foreground line-clamp-2 break-words" title={log.target_repr}>
                          {log.target_repr || "—"}
                        </span>
                        {log.target_id && (
                          <span className="shrink-0 px-1 py-0.2 rounded text-[10px] bg-muted text-muted-foreground font-mono">
                            #{log.target_id}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Client IP */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                      {log.ip_address || "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/activity-logs/${log.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-primary hover:text-primary/90 bg-primary/10 hover:bg-primary/20 rounded-lg cursor-pointer transition-colors"
                      >
                        <Eye className="h-3 w-3" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border gap-3 text-xs text-muted-foreground">
            <div>
              Showing <span className="font-semibold text-foreground">{logs.length}</span> of{" "}
              <span className="font-semibold text-foreground">{totalCount}</span> logs
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-border rounded-lg hover:bg-muted/50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 font-semibold text-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-border rounded-lg hover:bg-muted/50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
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
