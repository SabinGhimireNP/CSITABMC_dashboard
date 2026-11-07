import {
  Activity,
  Award,
  CalendarDays,
  FileText,
  GraduationCap,
  Layers,
  Megaphone,
  PenSquare,
  UserCheck,
  Users,
} from "lucide-react";

/**
 * Single source of truth for the dashboard overview.
 *
 * Visibility is driven only by RBAC (`permission`, checked with `usePermission().can`)
 * and by whether the backend returned the module (the API omits modules the user
 * cannot view). No per-role layouts exist anywhere else.
 *
 * Each entry:
 *  - stat(stats)  -> { label, value, detail, progress? }  headline card (omit `stat` to keep a
 *                     module out of the stats grid but still list its recent records)
 *  - accent         -> colour key for the stat card (see StatCard ACCENTS)
 *  - row(record)  -> { key, title, meta[], badge?, thumbnail? }  recent-record row
 *  - action       -> quick action (create route, gated by `action.permission`)
 */

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(value, withTime = false) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return (withTime ? dateTimeFmt : dateFmt).format(d);
}

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const ratio = (part, total, label) =>
  total > 0 ? { value: Math.round((part / total) * 100), label: `${Math.round((part / total) * 100)}% ${label}` } : null;
const joinParts = (...parts) => parts.filter(Boolean).join(" · ");

const STATUS_BADGES = {
  published: { label: "Published", tone: "positive" },
  draft: { label: "Draft", tone: "muted" },
  completed: { label: "Completed", tone: "neutral" },
};
const statusBadge = (status) => STATUS_BADGES[status] || (status ? { label: status, tone: "muted" } : null);

export const OVERVIEW_MODULES = [
  {
    key: "tenures",
    permission: "tenure.view",
    label: "Tenures",
    recentLabel: "Recent Tenures",
    icon: Layers,
    href: "/tenure",
    emptyText: "No tenures created yet.",
    action: { label: "Add Tenure", href: "/tenure/new", permission: "tenure.create" },
    row: (t) => ({
      key: t.id,
      title: t.name,
      meta: [
        t.start_date && t.end_date ? `${formatDate(t.start_date)} – ${formatDate(t.end_date)}` : null,
        plural(t.member_count, "member"),
      ],
      badge: t.is_active ? { label: "Active", tone: "positive" } : null,
    }),
  },
  {
    key: "members",
    accent: "indigo",
    permission: "tenure.view",
    label: "Team Members",
    recentLabel: "Recent Members",
    icon: Users,
    href: "/members",
    emptyText: "No team members added yet.",
    action: { label: "Add Member", href: "/members/new", permission: "tenure.create" },
    stat: (s) => ({
      label: "Team Members",
      value: s.total,
      detail: joinParts(`${s.published} published`, s.drafts ? `${s.drafts} draft` : null),
      progress: ratio(s.published, s.total, "published"),
    }),
    row: (m) => ({
      key: m.id,
      title: m.name,
      meta: [`#${m.id}`, joinParts(m.designation, m.tenure_name) || "No tenure assigned"],
      badge: statusBadge(m.status),
    }),
  },
  {
    key: "alumni",
    accent: "violet",
    permission: "tenure.view",
    label: "Alumni",
    recentLabel: "Recent Alumni",
    icon: GraduationCap,
    href: "/alumni",
    emptyText: "No alumni records yet.",
    action: { label: "Add Alumni", href: "/alumni/new", permission: "tenure.create" },
    stat: (s) => ({ label: "Alumni", value: s.total, detail: null }),
    row: (a) => ({
      key: a.id,
      title: a.name || "Unnamed member",
      meta: [a.graduation_year ? `Class of ${a.graduation_year}` : "Graduation year not set", formatDate(a.created_at)],
    }),
  },
  {
    key: "events",
    accent: "sky",
    permission: "events.view",
    label: "Events",
    recentLabel: "Recent Events",
    icon: CalendarDays,
    href: "/events",
    emptyText: "No events created yet.",
    action: { label: "Create Event", href: "/events/new", permission: "events.create" },
    stat: (s) => ({
      label: "Events",
      value: s.total,
      detail: joinParts(`${s.upcoming} upcoming`, s.drafts ? `${s.drafts} draft` : null),
      progress: ratio(s.published + s.completed, s.total, "published or completed"),
    }),
    row: (e) => ({
      key: e.id,
      title: e.title,
      meta: [formatDate(e.date) || "Date not set", e.mentor_count ? plural(e.mentor_count, "mentor") : "No mentors"],
      badge: statusBadge(e.status),
    }),
  },
  {
    key: "mentors",
    accent: "teal",
    permission: "events.view",
    label: "Mentors",
    recentLabel: "Recent Mentors",
    icon: UserCheck,
    href: "/mentors",
    emptyText: "No mentors added yet.",
    action: { label: "Add Mentor", href: "/mentors/new", permission: "events.create" },
    stat: (s) => ({
      label: "Mentors",
      value: s.total,
      detail: `${s.assigned} assigned to events`,
      progress: ratio(s.assigned, s.total, "assigned"),
    }),
    row: (m) => ({
      key: m.id,
      title: m.name,
      meta: [m.expertise, m.event_count ? plural(m.event_count, "event") : "Not assigned"],
    }),
  },
  {
    key: "certificates",
    accent: "amber",
    permission: "certificates.view",
    label: "Certificates",
    recentLabel: "Recent Certificates",
    icon: Award,
    href: "/certificates",
    emptyText: "No certificates issued yet.",
    action: { label: "Issue Certificate", href: "/certificates/new", permission: "certificates.create" },
    stat: (s) => ({
      label: "Certificates Issued",
      value: s.total,
      detail: `${s.completed} with completed projects`,
      progress: ratio(s.completed, s.total, "projects completed"),
    }),
    row: (c) => ({
      key: c.id,
      title: c.full_name,
      meta: [c.event_title || "No event", formatDate(c.issued_at)],
      badge: c.is_project_completed
        ? { label: "Completed", tone: "positive" }
        : { label: "Pending", tone: "muted" },
    }),
  },
  {
    key: "papers",
    accent: "rose",
    permission: "papers.view",
    label: "Past Papers",
    recentLabel: "Recent Past Papers",
    icon: FileText,
    href: "/past-papers",
    emptyText: "No past papers uploaded yet.",
    action: { label: "Add Past Paper", href: "/past-papers/new", permission: "papers.create" },
    stat: (s) => ({
      label: "Past Papers",
      value: s.total,
      detail: joinParts(`${s.current_course} current`, s.old_course ? `${s.old_course} old course` : null),
      progress: ratio(s.current_course, s.total, "current course"),
    }),
    row: (p) => ({
      key: p.id,
      title: p.subject || p.subject_code || "Untitled paper",
      meta: [p.semester ? `Semester ${p.semester}` : null, p.exam_year],
      badge: p.is_old_course ? { label: "Old course", tone: "muted" } : null,
    }),
  },
  {
    key: "blogs",
    accent: "emerald",
    permission: "blogs.view",
    label: "Blogs",
    recentLabel: "Recent Blogs",
    icon: PenSquare,
    href: "/blogs",
    emptyText: "No articles written yet.",
    action: { label: "Write Blog", href: "/blogs/new", permission: "blogs.create" },
    stat: (s) => ({
      label: "Blogs",
      value: s.total,
      detail: joinParts(`${s.published} published`, s.drafts ? `${s.drafts} draft` : null),
      progress: ratio(s.published, s.total, "published"),
    }),
    row: (b) => ({
      key: b.id,
      title: b.title,
      meta: [b.author_name, formatDate(b.status === "published" ? b.published_at || b.created_at : b.created_at)],
      badge: statusBadge(b.status),
      thumbnail: b.featured_image_url || "",
    }),
  },
  {
    key: "notices",
    accent: "orange",
    permission: "notices.view",
    label: "Notices",
    recentLabel: "Recent Notices",
    icon: Megaphone,
    href: "/notices",
    emptyText: "No notices posted yet.",
    action: { label: "Publish Notice", href: "/notices/new", permission: "notices.create" },
    stat: (s) => ({
      label: "Notices",
      value: s.total,
      detail: joinParts(`${s.published} published`, s.drafts ? `${s.drafts} draft` : null),
      progress: ratio(s.published, s.total, "published"),
    }),
    row: (n) => ({
      key: n.id,
      title: n.title,
      meta: [n.category ? n.category.charAt(0).toUpperCase() + n.category.slice(1) : null, formatDate(n.created_at)],
      badge: statusBadge(n.status),
    }),
  },
  {
    key: "activity_logs",
    permission: "activity_logs.view",
    label: "Activity",
    recentLabel: "Recent Activity",
    icon: Activity,
    href: "/activity-logs",
    emptyText: "No activity recorded yet.",
    action: null,
    row: (l) => ({
      key: l.id,
      title: l.target_repr || `${l.action} · ${l.module}`,
      meta: [l.user_email, joinParts(l.action, l.module), formatDate(l.timestamp, true)],
    }),
  },
];
