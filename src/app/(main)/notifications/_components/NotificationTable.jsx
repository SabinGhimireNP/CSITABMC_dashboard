"use client";

import React from "react";
import { Eye, RefreshCw } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import {
  getNotificationProfile,
  getDeliveryStatusBadge,
} from "../_lib/profileUtils";

export function NotificationTable({
  notifications = [],
  onViewDetails,
  onRetry,
  retryingId = null,
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) {
  const { can } = usePermission();
  const canRetry = can("notifications.retry");

  return (
    <div className="w-full flex flex-col">
      {/* Mobile: record cards */}
      <ResponsiveRecordList
        className="md:hidden"
        items={notifications}
        getKey={(n) => n.id}
        emptyText="No notification records discovered."
        renderCard={(item) => {
          const profile = getNotificationProfile(item.sourceModule);
          const ProfileIcon = profile.icon;

          return (
            <div className={`p-4 space-y-3 border-l-4 ${profile.accentBorder}`}>
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                    profile.type === "announcement"
                      ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/50"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/50"
                  }`}
                >
                  {profile.label}
                </span>
                {getDeliveryStatusBadge(item.status)}
              </div>

              <div>
                <h4 className="font-semibold text-sm text-foreground break-words">
                  {item.title || item.sourceTitle}
                </h4>
                {item.body && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {item.body}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>
                  Accepted:{" "}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {item.acceptedCount}
                  </strong>{" "}
                  / {item.totalDevices}
                </span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(item)}
                  className="text-xs h-7 px-2.5 cursor-pointer"
                >
                  <Eye className="w-3 h-3 mr-1" /> Details
                </Button>
                {canRetry && item.failedCount > 0 && (
                  <Button
                    size="sm"
                    onClick={() => onRetry(item.id)}
                    disabled={retryingId === item.id}
                    className="text-xs h-7 px-2.5 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                  >
                    <RefreshCw
                      className={`w-3 h-3 mr-1 ${
                        retryingId === item.id ? "animate-spin" : ""
                      }`}
                    />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          );
        }}
      />

      {/* md+: Full CMS Table */}
      <div className="hidden md:block w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[750px] table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-xs select-none">
              <th className="py-3 px-4 w-[16%]">Type</th>
              <th className="py-3 px-4 w-[38%]">Notification Content</th>
              <th className="py-3 px-4 w-[14%]">Delivery Status</th>
              <th className="py-3 px-4 w-[16%]">Accepted / Targeted</th>
              <th className="py-3 px-4 w-[16%]">Sent Date</th>
              <th className="py-3 px-4 text-right pr-6 w-[10%] sticky right-0 bg-muted/95 border-b border-border">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground text-xs">
            {notifications.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground font-medium bg-card"
                >
                  No matching notification records discovered.
                </td>
              </tr>
            ) : (
              notifications.map((item) => {
                const profile = getNotificationProfile(item.sourceModule);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/40 transition-colors group h-14 bg-card"
                  >
                    {/* Type / Profile */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                          profile.type === "announcement"
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/50"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/50"
                        }`}
                      >
                        {profile.label}
                      </span>
                    </td>

                    {/* Content */}
                    <td className="py-2.5 px-4 truncate">
                      <div
                        className="font-semibold text-foreground truncate group-hover:text-primary transition-colors"
                        title={item.title}
                      >
                        {item.title}
                      </div>
                      <div
                        className="text-[11px] text-muted-foreground truncate mt-0.5"
                        title={item.body}
                      >
                        {item.body}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {getDeliveryStatusBadge(item.status)}
                    </td>

                    {/* Delivery Rate */}
                    <td className="py-2.5 px-4 whitespace-nowrap font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {item.acceptedCount}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-muted-foreground">
                          {item.totalDevices} devices
                        </span>
                      </div>
                      {item.failedCount > 0 && (
                        <div className="text-[10px] text-rose-500 font-semibold mt-0.5">
                          {item.failedCount} failed
                          {item.retryCount > 0 && ` (${item.retryCount} retries)`}
                        </div>
                      )}
                    </td>

                    {/* Sent Date */}
                    <td className="py-2.5 px-4 whitespace-nowrap text-muted-foreground tabular-nums">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right pr-6 sticky right-0 bg-card group-hover:bg-muted/40 transition-colors whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewDetails(item)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {canRetry && item.failedCount > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRetry(item.id)}
                            disabled={retryingId === item.id}
                            className="h-7 w-7 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
                            title="Retry failed recipients"
                          >
                            <RefreshCw
                              className={`w-3.5 h-3.5 ${
                                retryingId === item.id ? "animate-spin" : ""
                              }`}
                            />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Embedded Pagination */}
      <div className="border-t border-border bg-muted/20">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          isEmbedded={true}
        />
      </div>
    </div>
  );
}
