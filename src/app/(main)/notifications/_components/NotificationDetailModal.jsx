"use client";

import React from "react";
import {
  Bell,
  RefreshCw,
  Clock,
  Smartphone,
  Layers,
  AlertTriangle,
  Info,
} from "lucide-react";
import { ModalShell } from "@/components/common/ModalShell";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import {
  getNotificationProfile,
  getDeliveryStatusBadge,
} from "../_lib/profileUtils";

export function NotificationDetailModal({
  isOpen,
  notification,
  isRetrying = false,
  onRetry,
  onClose,
}) {
  const { can } = usePermission();
  const canRetry = can("notifications.retry");

  if (!isOpen || !notification) return null;

  const profile = getNotificationProfile(notification.sourceModule);
  const ProfileIcon = profile.icon;
  const hasFailedRecipients = (notification.failedCount || 0) > 0;
  const attempts = notification.attempts || [];

  return (
    <ModalShell
      title={`Notification #${notification.id}`}
      subtitle={`${profile.label} • ${notification.sourceTitle || notification.sourceId || "Direct"}`}
      icon={ProfileIcon}
      onClose={onClose}
      closeDisabled={isRetrying}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-[11px] text-muted-foreground">
            {notification.retryCount > 0 && (
              <span>Retried {notification.retryCount} time(s)</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isRetrying}
              className="text-xs cursor-pointer"
            >
              Close
            </Button>
            {hasFailedRecipients && canRetry && (
              <Button
                type="button"
                onClick={() => onRetry(notification.id)}
                disabled={isRetrying}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Retrying Failed Devices...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Retry {notification.failedCount} Failed Recipient{notification.failedCount > 1 ? "s" : ""}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Top Profile & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-muted/40 border border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wider uppercase ${profile.badgeClasses}`}
              >
                <ProfileIcon className="w-3.5 h-3.5" />
                {profile.label}
              </span>
              {getDeliveryStatusBadge(notification.status)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {profile.description}
            </p>
          </div>

          <div className="flex items-center gap-5 sm:gap-7">
            <div className="text-center">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Targeted
              </span>
              <p className="text-sm font-bold text-foreground">
                {notification.totalDevices ?? 0}
              </p>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider">
                Accepted
              </span>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {notification.acceptedCount ?? 0}
              </p>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium uppercase tracking-wider">
                Failed
              </span>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {notification.failedCount ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Content Snapshot */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-primary" />
            Notification Payload Snapshot
          </h4>
          <div className="p-4 rounded-xl border border-border bg-card text-card-foreground space-y-2.5 shadow-xs">
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Title
              </span>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {notification.title}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Message Body
              </span>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap mt-0.5 leading-relaxed">
                {notification.body}
              </p>
            </div>
            {notification.sourceTitle && (
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Source Content
                </span>
                <p className="text-xs text-foreground mt-0.5">
                  {notification.sourceTitle}{" "}
                  {notification.sourceId && (
                    <span className="text-muted-foreground font-mono text-[11px]">
                      (ID: {notification.sourceId})
                    </span>
                  )}
                </p>
              </div>
            )}
            {notification.data && Object.keys(notification.data).length > 0 && (
              <div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Navigation Payload
                </span>
                <pre className="text-[11px] font-mono bg-muted/60 p-2.5 rounded-lg border border-border text-foreground overflow-x-auto mt-1">
                  {JSON.stringify(notification.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Error Summary if present */}
        {notification.errorSummary && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <div className="font-semibold flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 shrink-0" /> Error Details
            </div>
            <p className="text-[11px] leading-relaxed">{notification.errorSummary}</p>
          </div>
        )}

        {/* Attempt History */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Delivery Attempt Audit ({attempts.length})
          </h4>

          {attempts.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No delivery attempt records recorded.
            </p>
          ) : (
            <div className="space-y-2">
              {attempts.map((att) => (
                <div
                  key={att.id || att.attemptNumber}
                  className="p-3 rounded-lg border border-border bg-muted/30 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        Attempt #{att.attemptNumber}
                      </span>
                      {getDeliveryStatusBadge(att.status)}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(att.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span>Targeted: {att.targetedCount}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Accepted: {att.acceptedCount}
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 font-medium">
                      Failed: {att.failedCount}
                    </span>
                  </div>

                  {att.errorSummary && (
                    <p className="text-[10px] text-destructive bg-destructive/10 p-2 rounded-md">
                      {att.errorSummary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
