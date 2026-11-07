"use client";

import React, { useState, useMemo, useCallback, useTransition, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { useMembers, useMembersList, useMemberDetail, useDeleteMember } from "@/hooks/useMembers";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { MembersTabs } from "./MembersTabs";
import { MembersTable } from "./MembersTable";
import { MemberFormModal } from "./MemberFormModal";
import { ResourceNotFoundDialog } from "@/components/common/ResourceNotFoundDialog";
import { MembersSkeleton } from "./MembersSkeleton";
import { parseServerError } from "@/lib/errorUtils";
import { usePermission } from "@/hooks/usePermission";
import { Button } from "@/components/ui/button";

const VALID_TABS = ["all", "published", "draft"];

export function MembersPageContent({ initialModalMode = null }) {
  const { can } = usePermission();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const statusParam = searchParams.get("status") || searchParams.get("tab") || "all";
  const activeTab = VALID_TABS.includes(statusParam) ? statusParam : "all";
  const searchQuery = searchParams.get("search") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const rowsPerPageParam = searchParams.get("page_size") || "10";
  const rowsPerPage = [10, 25, 50, 100].includes(parseInt(rowsPerPageParam, 10))
    ? parseInt(rowsPerPageParam, 10)
    : 10;

  const editId = initialModalMode?.action === "edit" ? initialModalMode.id : null;
  const {
    data: routeEditMember,
    isLoading: routeEditLoading,
    isError: routeEditError,
  } = useMemberDetail(editId);

  const [formMode, setFormMode] = useState(() => ({
    isOpen: initialModalMode?.action === "create",
    editData: null,
  }));

  useEffect(() => {
    if (initialModalMode?.action === "create") {
      // Route modal state is synchronized from navigation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormMode({ isOpen: true, editData: null });
    } else if (initialModalMode?.action === "edit") {
      if (routeEditMember) {
        // Route data is external state that must populate the edit modal.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormMode({ isOpen: true, editData: routeEditMember });
      }
    } else if (!initialModalMode) {
      setFormMode({ isOpen: false, editData: null });
    }
  }, [initialModalMode, routeEditMember]);

  const handleCloseModal = useCallback(() => {
    setFormMode({ isOpen: false, editData: null });
    if (initialModalMode) {
      router.push("/members");
    }
  }, [initialModalMode, router]);
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const orderingParam = sortField && sortOrder !== "none"
    ? (sortOrder === "desc" ? `-${sortField}` : sortField)
    : "";

  const {
    data: membersData,
    isLoading,
    isFetching,
    isError,
  } = useMembers({
    search: searchQuery,
    status: activeTab === "all" ? "" : activeTab,
    ordering: orderingParam,
    page: currentPage,
    pageSize: rowsPerPage,
  });

  // Flat list for global tab counts
  const { data: allMembers = [] } = useMembersList();
  const deleteMemberMutation = useDeleteMember();

  // URL query synchronizer
  const updateQuery = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, router, pathname]
  );

  const handleTabChange = (tabId) => {
    updateQuery({ status: tabId === "all" ? "" : tabId, page: 1 });
  };

  // Search Debounce
  const { value: localSearch, handleSearchChange } = useDebouncedSearch({
    initialValue: searchQuery,
    delay: 300,
    onSearch: (val) => updateQuery({ search: val, page: 1 }),
  });

  const handlePageChange = (newPage) => {
    updateQuery({ page: newPage });
  };

  const handleRowsPerPageChange = (newSize) => {
    updateQuery({ page_size: newSize, page: 1 });
  };

  const handleSortChange = (field) => {
    let nextField = sortField;
    let nextOrder = sortOrder;

    if (sortField !== field) {
      nextField = field;
      nextOrder = "asc";
    } else if (sortOrder === "none") {
      nextOrder = "asc";
    } else if (sortOrder === "asc") {
      nextOrder = "desc";
    } else {
      nextOrder = "none";
      nextField = null;
    }

    setSortField(nextField);
    setSortOrder(nextOrder);
    updateQuery({ page: 1 });
  };

  const handleDeleteMember = async (slug) => {
    try {
      await deleteMemberMutation.mutateAsync(slug);
      toast.success("Member deleted successfully.");
      // Step back a page when the last row on a later page was removed.
      if ((membersData?.data || []).length === 1 && currentPage > 1) {
        updateQuery({ page: currentPage - 1 === 1 ? "" : currentPage - 1 });
      }
    } catch (err) {
      toast.error(parseServerError(err) || "Failed to delete member.");
    }
  };

  const tabCounts = useMemo(() => {
    const list = Array.isArray(allMembers) ? allMembers : [];
    return {
      all: list.length,
      published: list.filter((m) => m.status !== "draft").length,
      draft: list.filter((m) => m.status === "draft").length,
    };
  }, [allMembers]);

  const members = membersData?.data || [];
  const totalRows = membersData?.count || 0;
  const totalPages = membersData?.totalPages || 1;

  if (isLoading) {
    return <MembersSkeleton />;
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary break-words">
            Team Members
          </h1>
          <p className="text-sm text-muted-foreground font-normal">
            Manage organization members, profile details, and external links.
          </p>
        </div>
        {can("tenure.create") && (
          <div className="shrink-0">
            <Button
              size="sm"
              onClick={() => router.push("/members/new")}
              className="gap-1.5 shadow-2xs w-full sm:w-auto cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              Add Member
            </Button>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="border-b border-border pb-4">
        <MembersTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchQuery={localSearch}
          onSearchChange={handleSearchChange}
          tabCounts={tabCounts}
        />
      </div>

      {/* Members Table */}
      <div className="relative">
        {isFetching && !isLoading && (
          <div className="progress-bar-track" aria-label="Refreshing members">
            <div className="progress-bar-indicator" />
          </div>
        )}
        <MembersTable
          members={members}
          onEditMember={(member) => router.push(`/members/${member.slug || member.id}/edit`)}
          onDeleteMember={handleDeleteMember}
          sortField={sortField}
          sortOrder={sortOrder}
          onHeaderClick={handleSortChange}
          currentPage={currentPage}
          totalPages={totalPages}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>

      {/* Member Form Modal */}
      <MemberFormModal
        isOpen={formMode.isOpen}
        initialData={formMode.editData}
        onSubmitSuccess={handleCloseModal}
        onCancel={handleCloseModal}
      />

      <ResourceNotFoundDialog
        isOpen={Boolean(editId && routeEditError)}
        resourceName="Member"
        returnPath="/members"
        onClose={() => router.push("/members")}
      />
    </div>
  );
}
