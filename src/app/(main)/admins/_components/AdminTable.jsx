"use client";

import React, { useState } from "react";
import { ArrowUpDown, Pencil, Trash2, Loader2 } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuthStore } from "@/lib/store/authStore";
import { canDeleteAccount, isSuperadminUser } from "@/lib/roles";
import { toast } from "sonner";

const getRoleStyle = (role) => {
  switch (role) {
    case "superadmin": return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "admin": return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
    case "cms_user": return "bg-muted text-muted-foreground border-border";
    case "operations": return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    case "papers": return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "notice": return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20";
    case "blog": return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const RoleBadge = ({ role, label }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleStyle(role)}`}>
    {label || role || "—"}
  </span>
);

export function AdminTable({
  admins = [],
  onDeleteAdmin,
  onEditAdmin,
  onToggleActive,
  sortField,
  sortOrder,
  onHeaderClick,
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  isDeleting,
}) {
  const { user } = useAuthStore();
  const [adminToDelete, setAdminToDelete] = useState(null);

  const isSelf = (admin) => Boolean(user) && String(admin.id) === String(user.id);

  const handleConfirmDelete = () => {
    if (adminToDelete) {
      if (user && adminToDelete.id?.toString() === user.id?.toString()) {
        toast.warning("You cannot delete your own account.");
        setAdminToDelete(null);
        return;
      }
      onDeleteAdmin(adminToDelete.id);
      setAdminToDelete(null);
    }
  };

  // Account management is Superadmin-only; the backend enforces the same rule.
  const canManageAdmin = () => isSuperadminUser(user);

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
    if (sortOrder === "asc") return <span className="text-primary font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-primary font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
  };

  const renderActions = (admin) =>
    canManageAdmin(admin) ? (
      <RowActionsMenu
        label={`Actions for ${admin.username}`}
        items={[
          { label: "Edit", icon: Pencil, onClick: () => onEditAdmin?.(admin) },
          {
            label: "Delete",
            icon: Trash2,
            destructive: true,
            hidden: !canDeleteAccount(user, admin),
            onClick: () => setAdminToDelete(admin),
          },
        ]}
      />
    ) : (
      <span className="text-muted-foreground font-semibold px-2 text-xs select-none cursor-not-allowed" title="Protected account">—</span>
    );

  const renderStatusToggle = (admin) => {
    const self = isSelf(admin);
    return (
      <button
        type="button"
        disabled={self}
        onClick={() => onToggleActive && onToggleActive(admin)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
          admin.is_active
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
            : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
        } ${self ? "opacity-60 cursor-not-allowed" : ""}`}
        title={self ? "You cannot deactivate your own account" : admin.is_active ? "Click to deactivate" : "Click to activate"}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${admin.is_active ? "bg-emerald-500" : "bg-muted-foreground"}`} />
        {admin.is_active ? "Active" : "Inactive"}
      </button>
    );
  };

  const formatJoined = (admin) => (admin.date_joined ? new Date(admin.date_joined).toLocaleDateString() : "—");
  const keyFor = (admin, index) => admin.id ?? `admin-${index}`;

  return (
    <div className="w-full flex flex-col">
      {/* Mobile: record cards */}
      <ResponsiveRecordList
        className="md:hidden"
        items={admins.map((a, index) => ({ ...a, __index: index }))}
        getKey={(a) => keyFor(a, a.__index)}
        emptyText="No matching admins found."
        renderTitle={(a) => a.username}
        renderSubtitle={(a) => <span className="break-all">{a.email}</span>}
        renderBadge={(a) => <RoleBadge role={a.role} label={a.role_label} />}
        fields={[
          { label: "Status", render: renderStatusToggle },
          { label: "Date Joined", render: formatJoined },
        ]}
        renderActions={renderActions}
      />

      {/* md+: full table */}
      <div className="hidden md:block w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-200 table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-xs select-none">
              <th className="py-3 px-4 w-[6%]">
                <div className="flex items-center gap-1.5">SN</div>
              </th>
              <th onClick={() => onHeaderClick("username")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[20%]">
                <div className="flex items-center gap-1.5">Username {renderSortIndicator("username")}</div>
              </th>
              <th onClick={() => onHeaderClick("email")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[23%]">
                <div className="flex items-center gap-1.5">Email {renderSortIndicator("email")}</div>
              </th>
              <th onClick={() => onHeaderClick("role")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[14%]">
                <div className="flex items-center gap-1.5">Role {renderSortIndicator("role")}</div>
              </th>
              <th className="py-3 px-4 w-[13%]">
                <div className="flex items-center gap-1.5">Status</div>
              </th>
              <th onClick={() => onHeaderClick("date_joined")} className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors w-[14%]">
                <div className="flex items-center gap-1.5">Date Joined {renderSortIndicator("date_joined")}</div>
              </th>
              <th className="py-3 px-4 text-right pr-6 w-[10%] sticky right-0 bg-muted/95 border-b border-border">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-foreground text-xs">
            {admins.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground font-medium bg-card">
                  No matching admins found.
                </td>
              </tr>
            ) : (
              admins.map((admin, index) => (
                <tr key={keyFor(admin, index)} className="hover:bg-muted/40 transition-colors group h-14 bg-card">
                  <td className="py-2 px-4 font-semibold text-foreground tabular-nums truncate text-[10px]">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  <td className="py-2 px-4 max-w-xs truncate">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors block truncate" title={admin.username}>
                      {admin.username}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-muted-foreground font-normal truncate" title={admin.email}>{admin.email}</td>
                  <td className="py-2 px-4 whitespace-nowrap"><RoleBadge role={admin.role} label={admin.role_label} /></td>
                  <td className="py-2 px-4 whitespace-nowrap">{renderStatusToggle(admin)}</td>
                  <td className="py-2 px-4 font-normal text-muted-foreground tabular-nums truncate">{formatJoined(admin)}</td>
                  <td className="py-2 px-4 text-right pr-6 sticky right-0 bg-card group-hover:bg-muted/40 transition-colors">{renderActions(admin)}</td>
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

      <ConfirmDialog
        open={Boolean(adminToDelete)}
        title="Remove admin access?"
        message={
          <>
            Are you sure you want to remove{" "}
            <span className="font-semibold text-foreground">&quot;{adminToDelete?.username}&quot;</span> from the
            platform? This cannot be undone.
          </>
        }
        confirmLabel={
          isDeleting ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...
            </span>
          ) : (
            "Confirm Delete"
          )
        }
        isLoading={isDeleting}
        onClose={() => setAdminToDelete(null)}
        onConfirm={handleConfirmDelete}
        zIndexClass="z-50"
      />
    </div>
  );
}
