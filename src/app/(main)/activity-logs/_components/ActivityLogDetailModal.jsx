"use client";

import React, { useState } from "react";
import {
  User,
  Globe,
  Clock,
  FileJson,
  Shield,
  ChevronDown,
  ChevronUp,
  FileDiff,
  CheckCircle2,
} from "lucide-react";
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

export function formatSysId(id) {
  if (id === null || id === undefined || id === "") return "—";
  const str = String(id).trim();
  if (str.startsWith("SYS-")) return str;
  return `SYS-${str}`;
}

function formatDiffValue(val) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

function cleanUserValue(val) {
  if (!val) return "";
  return String(val).replace(/^@+/, "").trim();
}

export function ActivityLogDetailModal({ log, isOpen, onClose }) {
  const [showRawUa, setShowRawUa] = useState(false);

  if (!isOpen || !log) return null;

  const actorSysId = log.actor_sys_id || log.actor_sys_id_snapshot || (log.actor_id_snapshot ? `SYS-${log.actor_id_snapshot}` : "—");
  const actorName = log.actor_name || log.actor_name_snapshot || (log.user_email_snapshot ? "Name unavailable" : "System");
  const rawUsername = log.actor_username || log.actor_username_snapshot || "";
  const cleanUsername = cleanUserValue(rawUsername);
  const actorEmail = log.actor_email || log.user_email_snapshot || "—";
  const actorRoleLabel = log.actor_role_label || log.role_label || log.actor_role || log.user_role_snapshot || "System";

  // Check resource applicability
  const isAuthAction = log.module === "auth" || ["login", "logout", "failed_login", "password_change"].includes(log.action);
  const isResourceApplicable = log.is_resource_applicable ?? !isAuthAction;

  // Changes & Details
  const changes = log.changes && typeof log.changes === "object" ? log.changes : {};
  const changeKeys = Object.keys(changes);
  const hasChanges = changeKeys.length > 0;

  const details = log.details && typeof log.details === "object" ? log.details : {};
  const detailEntries = Object.entries(details).filter(
    ([k]) => !["password", "token", "secret"].some((s) => k.toLowerCase().includes(s))
  );
  const hasDetails = detailEntries.length > 0;

  return (
    <ModalShell
      title="Activity Details"
      subtitle={`Log #${log.id} • ${formatNepalTime(log.timestamp)}`}
      icon={FileJson}
      onClose={onClose}
      closeOnBackdrop
      maxWidth="max-w-2xl"
      bodyClassName="p-4 sm:p-6 space-y-5 text-xs"
      footer={
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg text-xs cursor-pointer transition-colors w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      }
    >
      {/* 1. Account Information */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" /> Account Information
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
            {actorRoleLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium shrink-0">User ID:</span>
            <span className="font-mono font-semibold text-foreground">{actorSysId}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium shrink-0">Name:</span>
            <span className="font-semibold text-foreground truncate">{actorName}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium shrink-0">Username:</span>
            <span className="font-semibold text-foreground truncate">{cleanUsername || "—"}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium shrink-0">Email:</span>
            <span className="font-medium text-foreground truncate">{actorEmail}</span>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <span className="text-muted-foreground font-medium shrink-0">Role:</span>
            <span className="font-semibold text-foreground capitalize">{log.actor_role || log.user_role_snapshot || "System"}</span>
          </div>
        </div>
      </div>

      {/* 2. Activity Information */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" /> Activity Information
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-foreground border border-border uppercase">
            {log.action}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium shrink-0">Action:</span>
            <span className="font-semibold text-foreground capitalize">{log.action}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium shrink-0">Section:</span>
            <span className="font-semibold text-foreground capitalize">{log.module || "General"}</span>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <span className="text-muted-foreground font-medium shrink-0">Date & Time:</span>
            <span className="font-semibold text-foreground">{formatNepalTime(log.timestamp)}</span>
          </div>

          <div className="flex items-start gap-2 sm:col-span-2">
            <span className="text-muted-foreground font-medium shrink-0 mt-0.5">Description:</span>
            <span className="font-medium text-foreground leading-relaxed">{log.description || "No description provided."}</span>
          </div>
        </div>
      </div>

      {/* 3. Affected Resource */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-2.5">
        <div className="border-b border-border/60 pb-2">
          <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-primary" /> Affected Resource
          </h3>
        </div>

        {!isResourceApplicable ? (
          <div className="flex flex-col gap-1 text-xs py-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium shrink-0">Status:</span>
              <span className="font-semibold text-foreground">Not Applicable</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              This action is an authentication or session event and does not target a specific database entity.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium shrink-0">Resource Type:</span>
              <span className="font-semibold text-foreground capitalize">{log.module || "Item"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium shrink-0">Resource ID:</span>
              <span className="font-mono font-semibold text-foreground">{log.target_id ? `#${log.target_id}` : "—"}</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <span className="text-muted-foreground font-medium shrink-0">Resource Name:</span>
              <span className="font-semibold text-foreground break-words">{log.target_repr || "—"}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Request Environment */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-2.5">
        <div className="border-b border-border/60 pb-2">
          <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-primary" /> Request Environment
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium shrink-0">IP Address:</span>
            <span className="font-mono font-semibold text-foreground">{log.ip_address || "—"}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium shrink-0">Browser:</span>
            <span className="font-semibold text-foreground">
              {log.browser_name || "Unknown"}{log.browser_version ? ` v${log.browser_version}` : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium shrink-0">Operating System:</span>
            <span className="font-semibold text-foreground">{log.os_name || "Unknown"}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium shrink-0">Device Type:</span>
            <span className="font-semibold text-foreground">{log.device_type || "Unknown"}</span>
          </div>
        </div>

        {/* Collapsible raw user-agent */}
        {log.user_agent && (
          <div className="pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={() => setShowRawUa(!showRawUa)}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
            >
              {showRawUa ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {showRawUa ? "Hide User-Agent String" : "View Raw User-Agent String"}
            </button>
            {showRawUa && (
              <p className="mt-2 p-2.5 bg-muted/40 border border-border rounded-lg text-[10px] text-muted-foreground font-mono break-all leading-relaxed">
                {log.user_agent}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 5. Changed Data & Additional Details */}
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-2.5">
        <div className="border-b border-border/60 pb-2">
          <h3 className="font-bold text-foreground text-xs flex items-center gap-1.5">
            <FileDiff className="h-4 w-4 text-primary" /> Changed Data & Details
          </h3>
        </div>

        {hasChanges ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-2 px-3">Field</th>
                  <th className="py-2 px-3">Previous Value</th>
                  <th className="py-2 px-3">New Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {changeKeys.map((key) => {
                  const change = changes[key] || {};
                  return (
                    <tr key={key} className="hover:bg-muted/20">
                      <td className="py-2 px-3 font-semibold text-foreground whitespace-nowrap">{key}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-rose-700 dark:text-rose-400">
                        <span className="line-through bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                          {formatDiffValue(change.before)}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                        <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          {formatDiffValue(change.after)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {hasDetails ? (
          <div className="space-y-1.5 pt-1 text-xs">
            <span className="text-[11px] font-medium text-muted-foreground">Metadata:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {detailEntries.map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground capitalize shrink-0">{key.replace(/_/g, " ")}:</span>
                  <span className="font-mono text-foreground font-semibold break-all">{formatDiffValue(val)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {!hasChanges && !hasDetails ? (
          <div className="py-4 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
            <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground/60" />
            <p className="font-semibold text-foreground text-xs">No Additional Details Available</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              No field modifications or additional metadata were recorded for this activity.
            </p>
          </div>
        ) : null}
      </div>
    </ModalShell>
  );
}
