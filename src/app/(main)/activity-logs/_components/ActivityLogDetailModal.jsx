"use client";

import React from "react";
import { User, Globe, Shield, Clock, FileJson } from "lucide-react";
import { ModalShell } from "@/components/common/ModalShell";

export function formatNepalTime(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kathmandu",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function ActivityLogDetailModal({ log, isOpen, onClose }) {
  if (!isOpen || !log) return null;

  return (
    <ModalShell
      title="Activity Details"
      subtitle={`Log #${log.id}`}
      icon={FileJson}
      onClose={onClose}
      closeOnBackdrop
      bodyClassName="p-4 sm:p-6 space-y-5 text-xs"
      footer={
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg text-xs cursor-pointer transition-colors w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      }
    >

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-muted/40 p-4 rounded-xl border border-border">
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Date & Time (Nepal Time)
              </span>
              <p className="font-semibold text-foreground">{formatNepalTime(log.timestamp)}</p>
            </div>

            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> User
              </span>
              <p className="font-semibold text-foreground break-all">{log.user_email_snapshot || "System"}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                  {log.user_role_snapshot || "No role"}
                </span>
                {log.user && <span className="text-[10px] text-muted-foreground">ID: {log.user}</span>}
              </div>
            </div>

            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Section & Action
              </span>
              <p className="font-semibold text-foreground capitalize">
                {log.module} · <span className="text-primary">{log.action}</span>
              </p>
            </div>

            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" /> IP Address
              </span>
              <p className="font-semibold text-foreground font-mono">{log.ip_address || "—"}</p>
            </div>
          </div>

          {/* Target Resource */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-foreground">Item Affected</h4>
            <div className="p-3 bg-card border border-border rounded-xl space-y-1">
              <div className="flex items-start justify-between gap-3 text-muted-foreground">
                <span className="text-muted-foreground shrink-0">Name:</span>
                <span className="font-semibold text-foreground text-right break-words min-w-0">{log.target_repr || "—"}</span>
              </div>
              {log.target_id && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-foreground break-all text-right min-w-0">{log.target_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* User Agent */}
          {log.user_agent && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground">Browser / Device</h4>
              <p className="p-2.5 bg-muted/40 border border-border rounded-xl text-[11px] text-muted-foreground font-mono break-all">
                {log.user_agent}
              </p>
            </div>
          )}

          {/* JSON Details */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-foreground">Additional Details</h4>
            <pre className="p-3.5 bg-slate-900 dark:bg-black/80 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-border">
              {JSON.stringify(log.details || {}, null, 2)}
            </pre>
          </div>
    </ModalShell>
  );
}
