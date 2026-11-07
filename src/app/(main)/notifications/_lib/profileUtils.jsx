import React from "react";
import {
  Bell,
  Megaphone,
  Mail,
  FileText,
  Users,
  Award,
  CheckCircle2,
  CircleDot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Visual Profiles for in-app Notifications based on sourceModule:
 */
export function getNotificationProfile(sourceModule) {
  const norm = sourceModule?.toLowerCase() || "direct";

  switch (norm) {
    case "announcement":
      return {
        type: "announcement",
        label: "Announcement",
        icon: Megaphone,
        badgeClasses:
          "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/80",
        iconContainerClasses:
          "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60",
        accentBorder: "border-l-purple-500",
      };
    case "notice":
      return {
        type: "notice",
        label: "Notice",
        icon: FileText,
        badgeClasses:
          "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/80",
        iconContainerClasses:
          "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60",
        accentBorder: "border-l-amber-500",
      };
    case "member":
      return {
        type: "member",
        label: "Member",
        icon: Users,
        badgeClasses:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80",
        iconContainerClasses:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60",
        accentBorder: "border-l-emerald-500",
      };
    case "certificate":
      return {
        type: "certificate",
        label: "Certificate",
        icon: Award,
        badgeClasses:
          "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/80",
        iconContainerClasses:
          "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60",
        accentBorder: "border-l-sky-500",
      };
    case "direct":
      return {
        type: "direct",
        label: "Direct",
        icon: Mail,
        badgeClasses:
          "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/80",
        iconContainerClasses:
          "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60",
        accentBorder: "border-l-blue-500",
      };
    default:
      return {
        type: "system",
        label: "System",
        icon: Bell,
        badgeClasses:
          "bg-secondary text-secondary-foreground border-border",
        iconContainerClasses:
          "bg-muted text-muted-foreground border border-border",
        accentBorder: "border-l-slate-400 dark:border-l-slate-600",
      };
  }
}

/**
 * Read/Unread status badge helper:
 */
export function getReadStatusBadge(isRead) {
  if (isRead) {
    return (
      <Badge
        variant="outline"
        className="text-[11px] font-semibold bg-slate-50 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300 border-slate-200 dark:border-slate-800"
      >
        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
        Read
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="text-[11px] font-semibold bg-primary/10 text-primary border-primary/20"
    >
      <CircleDot className="w-3.5 h-3.5 mr-1 text-primary animate-pulse" />
      Unread
    </Badge>
  );
}
