"use client";

import React from "react";
import { ModalShell } from "@/components/common/ModalShell";
import { Button } from "@/components/ui/button";
import {
  getNotificationProfile,
  getReadStatusBadge,
} from "../_lib/profileUtils";
import { Clock, User, Check, CheckCheck } from "lucide-react";

export function NotificationDetailModal({
  isOpen,
  notification,
  onToggleRead,
  onClose,
  isSentView = false,
}) {
  if (!isOpen || !notification) return null;

  const profile = getNotificationProfile(notification.sourceModule);
  const ProfileIcon = profile.icon;

  const formattedDate = notification.sentAt || notification.createdAt
    ? new Date(notification.sentAt || notification.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <ModalShell
      title={notification.title}
      subtitle={`${profile.label} • ${formattedDate}`}
      icon={ProfileIcon}
      onClose={onClose}
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {!isSentView && onToggleRead && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onToggleRead(notification)}
                className="text-xs cursor-pointer"
              >
                {notification.isRead ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                    Mark as unread
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 mr-1 text-primary" />
                    Mark as read
                  </>
                )}
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-muted/40 border border-border">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${profile.badgeClasses}`}
            >
              <ProfileIcon className="w-3.5 h-3.5" />
              {profile.label}
            </span>

            {!isSentView && getReadStatusBadge(notification.isRead)}

            {isSentView && (
              <span className="text-xs font-medium text-muted-foreground">
                Sent to {notification.recipientCount || 0} user(s)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Sender Info (for received notifications) */}
        {!isSentView && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-card">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">
                {notification.sender ? notification.sender.name : "System Notification"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {notification.sender
                  ? `${notification.sender.role_label || notification.sender.role} • ${notification.sender.email}`
                  : "Automated administrative dispatch"}
              </p>
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Message
          </h4>
          <div className="p-4 rounded-xl border border-border bg-card text-foreground text-xs whitespace-pre-wrap leading-relaxed">
            {notification.message}
          </div>
        </div>

        {/* Recipients list (for sent notifications) */}
        {isSentView && notification.recipients && notification.recipients.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recipients ({notification.recipients.length})
            </h4>
            <div className="max-h-36 overflow-y-auto divide-y divide-border/60 rounded-xl border border-border bg-card scrollbar-thin">
              {notification.recipients.map((r) => (
                <div key={r.id} className="p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-foreground">
                      {r.recipient ? r.recipient.name : "User"}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-1.5">
                      (@{r.recipient?.username})
                    </span>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    r.isRead ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-muted text-muted-foreground"
                  }`}>
                    {r.isRead ? "Read" : "Unread"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
