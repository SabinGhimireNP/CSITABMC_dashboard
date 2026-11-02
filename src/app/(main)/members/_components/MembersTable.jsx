"use client";

import React, { useState } from "react";
import { ArrowUpDown, Pencil, Trash2, User } from "lucide-react";
import { FaFacebook, FaLinkedin, FaGithub } from "react-icons/fa";
import { Pagination } from "@/components/common/pagination";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import { MemberDeleteDialog } from "./MemberDeleteDialog";
import { usePermission } from "@/hooks/usePermission";

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
      status === "draft"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
    }`}
  >
    {status === "draft" ? "Draft" : "Published"}
  </span>
);

const MemberAvatar = ({ member }) => (
  <div className="h-8 w-8 rounded-full bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
    {member.image ? (
      <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
    ) : (
      <User className="h-4 w-4 text-muted-foreground" />
    )}
  </div>
);

const SOCIALS = [
  { key: "facebook", icon: FaFacebook, label: "Facebook", hover: "hover:text-blue-500", get: (m) => m.fb_link || m.facebookLink },
  { key: "linkedin", icon: FaLinkedin, label: "LinkedIn", hover: "hover:text-blue-600", get: (m) => m.linkedin_link || m.linkedinLink },
  { key: "github", icon: FaGithub, label: "GitHub", hover: "hover:text-foreground", get: (m) => m.github_link || m.githubLink },
];

const SocialLinks = ({ member }) => {
  const links = SOCIALS.filter((s) => s.get(member));
  if (links.length === 0) return <span className="text-muted-foreground text-[11px]">—</span>;
  return (
    <div className="flex items-center gap-3">
      {links.map(({ key, icon: Icon, label, hover, get }) => (
        <a
          key={key}
          href={get(member)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} Profile`}
          title={label}
          className={`text-muted-foreground ${hover} transition-colors p-0.5`}
        >
          <Icon className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
  );
};

export function MembersTable({
  members = [],
  onDeleteMember,
  onEditMember,
  sortField,
  sortOrder,
  onHeaderClick,
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) {
  const { can } = usePermission();
  const canEdit = can("tenure.edit");
  const canDelete = can("tenure.member_delete");
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
    if (sortOrder === "asc") return <span className="text-primary font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-primary font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
  };

  const handleConfirmDelete = async () => {
    if (memberToDelete) {
      setIsDeleting(true);
      try {
        await onDeleteMember(memberToDelete.slug || memberToDelete.id);
        setMemberToDelete(null);
      } catch (err) {
        console.error("Failed to delete member:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const renderActions = (member) => (
    <RowActionsMenu
      label={`Actions for ${member.name}`}
      items={[
        { label: "Edit", icon: Pencil, hidden: !canEdit, onClick: () => onEditMember(member) },
        { label: "Delete", icon: Trash2, destructive: true, hidden: !canDelete, onClick: () => setMemberToDelete(member) },
      ]}
    />
  );

  return (
    <>
      <div className="w-full bg-card rounded-sm border border-border shadow-2xs overflow-hidden">
        {/* Mobile: record cards */}
        <ResponsiveRecordList
          className="md:hidden"
          items={members}
          getKey={(m) => m.id || m.slug}
          emptyText="No members found."
          renderLeading={(m) => <MemberAvatar member={m} />}
          renderTitle={(m) => m.name}
          renderSubtitle={(m) => [m.id != null ? `#${m.id}` : null, m.slug ? `@${m.slug}` : null].filter(Boolean).join(" · ")}
          renderBadge={(m) => <StatusBadge status={m.status} />}
          fields={[
            { label: "Email", render: (m) => <span className="font-mono text-[11px] break-all">{m.email || "—"}</span> },
            { label: "Social Links", render: (m) => <SocialLinks member={m} /> },
          ]}
          renderActions={renderActions}
        />

        {/* md+: full table */}
        <div className="hidden md:block overflow-x-auto select-none">
          <table className="w-full min-w-180 text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold tracking-tight">
                <th
                  onClick={() => onHeaderClick && onHeaderClick("id")}
                  className="py-3 px-4 w-20 font-semibold text-foreground/80 cursor-pointer hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1.5">ID {renderSortIndicator("id")}</div>
                </th>
                <th
                  onClick={() => onHeaderClick && onHeaderClick("name")}
                  className="py-3 px-4 font-semibold text-foreground/80 cursor-pointer hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">Member Name {renderSortIndicator("name")}</div>
                </th>
                <th
                  onClick={() => onHeaderClick && onHeaderClick("email")}
                  className="py-3 px-4 font-semibold text-foreground/80 cursor-pointer hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">Email {renderSortIndicator("email")}</div>
                </th>
                <th className="py-3 px-4 font-semibold text-foreground/80 w-24 text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-foreground/80">Social Links</th>
                <th className="py-3 px-4 text-center font-semibold text-foreground/80 w-16 sticky right-0 bg-muted/95 border-b border-border">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                    No members found.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id || member.slug} className="hover:bg-muted/40 transition-colors group">
                    <td className="py-3 px-4 text-center text-muted-foreground font-mono text-[11px] font-medium">{member.id ?? "—"}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <MemberAvatar member={member} />
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors block truncate max-w-56" title={member.name}>
                            {member.name}
                          </span>
                          {member.slug && <p className="text-[10px] text-muted-foreground font-mono truncate max-w-56">@{member.slug}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-foreground/80 break-all">{member.email || "—"}</td>
                    <td className="py-3 px-4 text-center"><StatusBadge status={member.status} /></td>
                    <td className="py-3 px-4"><SocialLinks member={member} /></td>
                    <td className="py-3 px-4 text-center sticky right-0 bg-card group-hover:bg-muted/40 transition-colors">{renderActions(member)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalRows > 0 && (
          <div className="border-t border-border px-4 py-3 bg-muted/20">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRows={totalRows}
              rowsPerPage={rowsPerPage}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          </div>
        )}
      </div>

      <MemberDeleteDialog
        member={memberToDelete}
        isDeleting={isDeleting}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
