"use client";

import React, { useState } from "react";
import { ArrowUpDown, Pencil, Trash2, User } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import { TenureMembershipDeleteDialog } from "./TenureMembershipDeleteDialog";
import { Badge } from "@/components/ui/badge";

const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "active": return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "draft":  return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    default:       return "bg-muted text-muted-foreground border-border";
  }
};

const StatusBadge = ({ status }) => (
  <Badge variant="outline" className={`text-[10px] font-bold ${getStatusStyle(status)}`}>
    {(status || "DRAFT").toUpperCase()}
  </Badge>
);

const MemberPhoto = ({ member }) =>
  member.image ? (
    <div className="w-9 h-9 rounded-full overflow-hidden border border-border bg-muted/40 shrink-0">
      <img src={member.image} alt="" className="w-full h-full object-cover"
        onError={(e) => { e.target.style.display = "none"; }} />
    </div>
  ) : (
    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 text-primary">
      <User className="h-4 w-4" />
    </div>
  );

/** Members assigned to the selected tenure. */
export function MemberTable({
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
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
    if (sortOrder === "asc")  return <span className="text-primary font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-primary font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
  };

  const handleConfirmDelete = async () => {
    if (memberToDelete) {
      setIsDeleting(true);
      try {
        await onDeleteMember(memberToDelete.membershipId || memberToDelete.id);
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
      label={`Actions for ${member.fullName}`}
      items={[
        { label: "Edit", icon: Pencil, onClick: () => onEditMember?.(member) },
        { label: "Delete", icon: Trash2, destructive: true, onClick: () => setMemberToDelete(member) },
      ]}
    />
  );

  return (
    <div className="w-full flex flex-col">
      {/* Mobile: record cards */}
      <ResponsiveRecordList
        className="md:hidden"
        items={members}
        getKey={(m) => m.id}
        emptyText="No members found. Add one to get started."
        renderLeading={(m) => <MemberPhoto member={m} />}
        renderTitle={(m) => m.fullName}
        renderSubtitle={(m) => m.post}
        renderBadge={(m) => <StatusBadge status={m.status} />}
        fields={[
          { label: "Member ID", render: (m) => m.memberId },
          { label: "Email", render: (m) => (m.email ? <span className="break-all">{m.email}</span> : null) },
        ]}
        renderActions={renderActions}
      />

      {/* md+: full table */}
      <div className="hidden md:block w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-200 table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-xs select-none">
              <th onClick={() => onHeaderClick("memberId")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[12%]">
                <div className="flex items-center gap-1.5">Member ID {renderSortIndicator("memberId")}</div>
              </th>
              <th className="py-3 px-4 w-[8%]">Photo</th>
              <th onClick={() => onHeaderClick("fullName")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[22%]">
                <div className="flex items-center gap-1.5">Full Name {renderSortIndicator("fullName")}</div>
              </th>
              <th onClick={() => onHeaderClick("post")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[16%]">
                <div className="flex items-center gap-1.5">Post {renderSortIndicator("post")}</div>
              </th>
              <th onClick={() => onHeaderClick("email")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[22%]">
                <div className="flex items-center gap-1.5">Email {renderSortIndicator("email")}</div>
              </th>
              <th className="py-3 px-4 w-[10%]">Status</th>
              <th className="py-3 px-4 text-right pr-6 w-[10%] sticky right-0 bg-muted/95 border-b border-border">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-foreground text-xs">
            {members.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground font-medium bg-card">
                  No members found. Add one to get started.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-muted/40 transition-colors group h-14 bg-card">
                  <td className="py-2 px-4 font-semibold text-foreground tabular-nums truncate text-[10px]">{member.memberId}</td>
                  <td className="py-2 px-4"><MemberPhoto member={member} /></td>
                  <td className="py-2 px-4 max-w-xs truncate">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors block truncate" title={member.fullName}>
                      {member.fullName}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate block">{member.email}</span>
                  </td>
                  <td className="py-2 px-4 font-medium text-foreground/80 truncate" title={member.post}>{member.post}</td>
                  <td className="py-2 px-4 font-normal text-muted-foreground truncate" title={member.email}>{member.email}</td>
                  <td className="py-2 px-4 whitespace-nowrap"><StatusBadge status={member.status} /></td>
                  <td className="py-2 px-4 text-right pr-6 sticky right-0 bg-card group-hover:bg-muted/40 transition-colors">{renderActions(member)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      <TenureMembershipDeleteDialog
        member={memberToDelete}
        isDeleting={isDeleting}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
