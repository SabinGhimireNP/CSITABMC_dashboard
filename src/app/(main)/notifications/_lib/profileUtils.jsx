import React from "react";
import {
  Bell,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Visual Profiles for Notifications:
 * 1. System Notification: Neutral slate/gray profile with Bell icon (automated notice publishing)
 * 2. Announcement: Purple/violet profile with Megaphone icon (manual broadcasts)
 */
export function getNotificationProfile(sourceModule) {
  const isAnnouncement = sourceModule?.toLowerCase() === "announcement";

  if (isAnnouncement) {
    return {
      type: "announcement",
      label: "Announcement",
      icon: Megaphone,
      badgeClasses:
        "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/80",
      iconContainerClasses:
        "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60",
      accentBorder: "border-l-purple-500",
      description: "Manually broadcast announcement",
    };
  }

  return {
    type: "system",
    label: "System",
    icon: Bell,
    badgeClasses:
      "bg-secondary text-secondary-foreground border-border",
    iconContainerClasses:
      "bg-muted text-muted-foreground border border-border",
    accentBorder: "border-l-slate-400 dark:border-l-slate-600",
    description: "Automated notice publication notification",
  };
}

/**
 * Delivery status badge helper:
 * Kept completely independent from the notification type profile.
 */
export function getDeliveryStatusBadge(status) {
  const norm = status?.toLowerCase() || "pending";

  switch (norm) {
    case "sent":
    case "completed":
      return (
        <Badge variant="outline" className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Sent
        </Badge>
      );
    case "partially_sent":
    case "partially_failed":
      return (
        <Badge variant="outline" className="text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/80">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          Partially Sent
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800/80">
          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          Failed
        </Badge>
      );
    case "in_progress":
      return (
        <Badge variant="outline" className="text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800/80">
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin" />
          Sending
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[11px] font-semibold bg-secondary text-secondary-foreground border-border">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          Pending
        </Badge>
      );
  }
}
