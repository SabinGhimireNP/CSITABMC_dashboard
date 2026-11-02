"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdmins, useAdminDetail, useCreateAdmin, useUpdateAdmin, useDeleteAdmin, useToggleAdminActive } from "@/hooks/useAdmins";
import { AdminTable } from "./AdminTable";
import { AdminTabs } from "./AdminTabs";
import { AdminFormModal } from "./AdminFormModal";
import { AdminsPageHeader } from "./AdminsPageHeader";
import { ResourceNotFoundDialog } from "@/components/common/ResourceNotFoundDialog";
import AdminsSkeleton from "./AdminsSkeleton";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

export function AdminsPageContent({ initialModalMode = null }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("none");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const editId = initialModalMode?.action === "edit" ? initialModalMode.id : null;
  const {
    data: routeEditAdmin,
    isLoading: routeEditLoading,
    isError: routeEditError,
  } = useAdminDetail(editId);

  const [formMode, setFormMode] = useState(() => ({
    isOpen: initialModalMode?.action === "create",
    editData: null,
  }));

  useEffect(() => {
    if (initialModalMode?.action === "create") {
      setFormMode({ isOpen: true, editData: null });
    } else if (initialModalMode?.action === "edit") {
      if (routeEditAdmin) {
        setFormMode({ isOpen: true, editData: routeEditAdmin });
      }
    } else if (!initialModalMode) {
      setFormMode({ isOpen: false, editData: null });
    }
  }, [initialModalMode, routeEditAdmin]);

  const handleCloseModal = useCallback(() => {
    setFormMode({ isOpen: false, editData: null });
    if (initialModalMode) {
      router.push("/admins");
    }
  }, [initialModalMode, router]);

  // One request for the full list; paging, search and sorting never refetch.
  const { data: queryData, isLoading, isError, error } = useAdmins();

  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin();
  const deleteMutation = useDeleteAdmin();
  const toggleActiveMutation = useToggleAdminActive();

  const handleToggleActive = (admin) => {
    const nextStatus = !admin.is_active;
    toast.promise(
      toggleActiveMutation.mutateAsync({ id: admin.id, is_active: nextStatus }),
      {
        loading: nextStatus ? "Activating account..." : "Deactivating account...",
        success: nextStatus ? "Account activated." : "Account deactivated.",
        error: (err) => err?.response?.data?.detail || "Failed to update account status.",
      }
    );
  };

  const liveAdmins = useMemo(() => queryData?.data || [], [queryData]);

  const handleSortChange = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else if (sortOrder === "none") {
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortOrder("none");
      setSortField(null);
    }
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleRowsPerPageChange = (amount) => {
    setRowsPerPage(amount);
    setCurrentPage(1);
  };

  const handleDeleteAdmin = (id) => {
    toast.promise(deleteMutation.mutateAsync(id), {
      id: "delete-admin",
      loading: "Revoking admin access",
      success: "Admin access revoked successfully.",
      error: "Failed to revoke admin access.",
    });
  };

  const handleEditAdminTrigger = (admin) => {
    router.push(`/admins/${admin.id}/edit`);
  };

  const handleFormSubmitSuccess = (formData) => {
    const isEdit = Boolean(formMode.editData && (formMode.editData.id != null || formMode.editData.email));
    const targetId = formMode.editData?.id;

    if (isEdit && targetId) {
      return toast.promise(updateMutation.mutateAsync({ id: targetId, formData }), {
        id: "admin-mutation",
        loading: "Updating admin access",
        success: () => {
          handleCloseModal();
          return "Admin access updated successfully.";
        },
        error: "Failed to update admin access.",
      });
    } else {
      return toast.promise(createMutation.mutateAsync(formData), {
        id: "admin-mutation",
        loading: "Adding admin access",
        success: () => {
          handleCloseModal();
          setCurrentPage(1);
          return "Admin access added successfully.";
        },
        error: "Failed to add admin access.",
      });
    }
  };

  const processedAdmins = useMemo(() => {
    let dataset = [...liveAdmins];

    // Tab filtering by role
    if (activeTab !== "all") {
      dataset = dataset.filter((a) => a.role === activeTab);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      dataset = dataset.filter((a) =>
        [a.username, a.email, a.role].some((v) => v?.toLowerCase().includes(query))
      );
    }

    if (sortField && sortOrder !== "none") {
      dataset.sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === "id") {
          const numA = parseInt(valA?.toString().replace(/\D/g, "")) || 0;
          const numB = parseInt(valB?.toString().replace(/\D/g, "")) || 0;
          return sortOrder === "asc" ? numA - numB : numB - numA;
        }

        if (sortField === "date_joined") {
          const timeA = valA ? new Date(valA).getTime() : 0;
          const timeB = valB ? new Date(valB).getTime() : 0;
          if (!isNaN(timeA) && !isNaN(timeB)) {
            return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
          }
        }

        valA = valA?.toString().toLowerCase() || "";
        valB = valB?.toString().toLowerCase() || "";
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return dataset;
  }, [liveAdmins, activeTab, searchQuery, sortField, sortOrder]);

  const totalRows = processedAdmins.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

  // Clamp to the last page when filters or deletes shrink the list.
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedAdmins = useMemo(() => {
    const startOffset = (effectivePage - 1) * rowsPerPage;
    return processedAdmins.slice(startOffset, startOffset + rowsPerPage);
  }, [processedAdmins, effectivePage, rowsPerPage]);

  if (isLoading) return <AdminsSkeleton />;

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <AdminsPageHeader onAddAdmin={() => router.push("/admins/new")} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <AdminTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
          searchQuery={searchQuery}
          onSearchChange={(query) => {
            setSearchQuery(query);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
            </div>
            <p className="text-sm font-medium text-rose-600">
              {error?.response?.status === 403
                ? "You do not have permission to manage admin access."
                : "Failed to load admin users."}
            </p>
          </div>
        ) : (
          <AdminTable
            admins={paginatedAdmins}
            onEditAdmin={handleEditAdminTrigger}
            onDeleteAdmin={handleDeleteAdmin}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            currentPage={effectivePage}
            onPageChange={handlePageChange}
            totalPages={totalPages}
            totalRows={totalRows}
            sortField={sortField}
            sortOrder={sortOrder}
            onHeaderClick={handleSortChange}
            isDeleting={deleteMutation.isPending}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>

      <AdminFormModal
        isOpen={formMode.isOpen}
        initialData={formMode.editData}
        onSubmitSuccess={handleFormSubmitSuccess}
        onCancel={handleCloseModal}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <ResourceNotFoundDialog
        isOpen={Boolean(editId && routeEditError)}
        resourceName="Admin"
        returnPath="/admins"
        onClose={() => router.push("/admins")}
      />
    </div>
  );
}
