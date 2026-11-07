"use client";

import React from "react";
import { Eye, Check, CheckCheck, Users } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import { Button } from "@/components/ui/button";
import {
  getNotificationProfile,
  getReadStatusBadge,
} from "../_lib/profileUtils";

export function NotificationTable({
  notifications = [],
  onViewDetails,
  onToggleRead,
  isSentView = false,
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) {
  return (
    <div className="w-full flex flex-col">
      {/* Mobile: responsive record cards */}
      <ResponsiveRecordList
        className="md:hidden"
        items={notifications}
        getKey={(n) => n.id}
        emptyText={isSentView ? "No sent notifications found." : "No received notifications found."}
        renderCard={(item) => {
          const profile = getNotificationProfile(item.sourceModule);
          const formattedDate = item.sentAt || item.createdAt
            ? new Date(item.sentAt || item.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <div className={`p-4 space-y-3 border-l-4 ${profile.accentBorder}`}>
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${profile.badgeClasses}`}
                >
                  {profile.label}
                </span>

                {!isSentView ? (
                  getReadStatusBadge(item.isRead)
                ) : (
                  <span className="text-[11px] font-medium text-muted-foreground inline-flex items-center gap-1">
                    <Users className="w-3 h-3" /> {item.recipientCount} recipient(s)
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-sm text-foreground break-words">
                  {item.title}
                </h4>
                {item.message && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {item.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                <span>
                  {!isSentView ? (
                    <>From: <strong className="font-medium text-foreground">{item.sender ? item.sender.name : "System"}</strong></>
                  ) : (
                    <>Sent by you</>
                  )}
                </span>
                <span>{formattedDate}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                {!isSentView && onToggleRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleRead(item)}
                    className="text-xs h-7 px-2 cursor-pointer"
                  >
                    {item.isRead ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-muted-foreground" /> Unread
                      </>
                    ) : (
                      <>
                        <CheckCheck className="w-3 h-3 mr-1 text-primary" /> Mark read
                      </>
                    )}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(item)}
                  className="text-xs h-7 px-2.5 cursor-pointer"
                >
                  <Eye className="w-3 h-3 mr-1" /> Details
                </Button>
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
              <th className="py-3 px-4 w-[14%]">Type</th>
              <th className="py-3 px-4 w-[38%]">Notification Content</th>
              <th className="py-3 px-4 w-[14%]">{!isSentView ? "Status" : "Recipients"}</th>
              <th className="py-3 px-4 w-[18%]">{!isSentView ? "Sender" : "Date"}</th>
              <th className="py-3 px-4 text-right pr-6 w-[16%] sticky right-0 bg-muted/95 border-b border-border">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground text-xs">
            {notifications.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-muted-foreground font-medium bg-card"
                >
                  {isSentView ? "No sent notifications found." : "No notifications in your inbox."}
                </td>
              </tr>
            ) : (
              notifications.map((item) => {
                const profile = getNotificationProfile(item.sourceModule);
                const formattedDate = item.sentAt || item.createdAt
                  ? new Date(item.sentAt || item.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-muted/40 transition-colors group h-14 bg-card ${
                      !isSentView && !item.isRead ? "bg-primary/[0.02]" : ""
                    }`}
                  >
                    {/* Type */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${profile.badgeClasses}`}
                      >
                        {profile.label}
                      </span>
                    </td>

                    {/* Content */}
                    <td className="py-2.5 px-4 truncate">
                      <div className="flex items-center gap-2">
                        {!isSentView && !item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0 ring-2 ring-primary/20" />
                        )}
                        <div
                          className={`truncate group-hover:text-primary transition-colors ${
                            !isSentView && !item.isRead ? "font-bold text-foreground" : "font-medium text-foreground"
                          }`}
                          title={item.title}
                        >
                          {item.title}
                        </div>
                      </div>
                      <div
                        className="text-[11px] text-muted-foreground truncate mt-0.5 pl-4"
                        title={item.message}
                      >
                        {item.message}
                      </div>
                    </td>

                    {/* Status or Recipient Count */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {!isSentView ? (
                        getReadStatusBadge(item.isRead)
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>{item.recipientCount} user(s)</span>
                        </span>
                      )}
                    </td>

                    {/* Sender or Date */}
                    <td className="py-2.5 px-4 whitespace-nowrap text-muted-foreground">
                      {!isSentView ? (
                        <div>
                          <p className="font-medium text-foreground text-xs">
                            {item.sender ? item.sender.name : "System"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{formattedDate}</p>
                        </div>
                      ) : (
                        <span className="text-xs">{formattedDate}</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right pr-6 whitespace-nowrap sticky right-0 bg-card group-hover:bg-muted/40 transition-colors">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isSentView && onToggleRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleRead(item)}
                            title={item.isRead ? "Mark as unread" : "Mark as read"}
                            className="text-xs h-7 px-2 cursor-pointer"
                          >
                            {item.isRead ? (
                              <Check className="w-3.5 h-3.5 text-muted-foreground" />
                            ) : (
                              <CheckCheck className="w-3.5 h-3.5 text-primary" />
                            )}
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(item)}
                          className="text-xs h-7 px-2.5 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 mr-1" /> View
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </div>
  );
}
