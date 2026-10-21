"use client";

import React, { useState, useMemo, useCallback, useTransition, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { useMembersList, useDeleteMember } from "@/hooks/useMembers";
import { MembersTabs } from "./MembersTabs";
import { MembersTable } from "./MembersTable";
import { MemberFormModal } from "./MemberFormModal";
import { MembersSkeleton } from "./MembersSkeleton";
import { parseServerError } from "@/lib/errorUtils";

export function MembersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const activeTab = searchParams.get("status") || "all";
  const searchQuery = searchParams.get("search") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const rowsPerPageParam = searchParams.get("page_size") || "10";
  const rowsPerPage = [5, 10, 25].includes(parseInt(rowsPerPageParam, 10))
    ? parseInt(rowsPerPageParam, 10)
    : 10;

  const [formMode, setFormMode] = useState({ isOpen: false, editData: null });
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const { data: members = [], isLoading, isError } = useMembersList();
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
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  const debounceRef = useRef(null);

  if (prevSearchQuery !== searchQuery) {
    setPrevSearchQuery(searchQuery);
    setLocalSearch(searchQuery);
  }

  const handleSearchChange = (val) => {
    setLocalSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateQuery({ search: val, page: 1 });
    }, 300);
  };

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
    } catch (err) {
      toast.error(parseServerError(err) || "Failed to delete member.");
    }
  };

  const tabCounts = useMemo(() => {
    const list = Array.isArray(members) ? members : [];
    return {
      all: list.length,
      published: list.filter((m) => m.status !== "draft").length,
      draft: list.filter((m) => m.status === "draft").length,
    };
  }, [members]);

  const filteredMembers = useMemo(() => {
    let result = Array.isArray(members) ? [...members] : [];

    // Filter by tab status
    if (activeTab === "published") {
      result = result.filter((m) => m.status !== "draft");
    } else if (activeTab === "draft") {
      result = result.filter((m) => m.status === "draft");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.slug?.toLowerCase().includes(q)
      );
    }

    if (sortField && sortOrder !== "none") {
      result.sort((a, b) => {
        if (sortField === "id") {
          const numA = Number(a.id);
          const numB = Number(b.id);
          if (!isNaN(numA) && !isNaN(numB)) {
            return sortOrder === "asc" ? numA - numB : numB - numA;
          }
        }
        const valA = (a[sortField] || "").toString().toLowerCase();
        const valB = (b[sortField] || "").toString().toLowerCase();
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    return result;
  }, [members, activeTab, searchQuery, sortField, sortOrder]);

  const totalRows = filteredMembers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredMembers.slice(start, start + rowsPerPage);
  }, [filteredMembers, currentPage, rowsPerPage]);

  if (isLoading) {
    return <MembersSkeleton />;
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0b2574]">
            Team Members
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage organization members, profile details, and external links.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormMode({ isOpen: true, editData: null })}
          className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-[#0b2574] hover:bg-[#0b2574]/90 text-white font-semibold text-xs shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="border-b border-slate-100 pb-4">
        <MembersTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchQuery={localSearch}
          onSearchChange={handleSearchChange}
          tabCounts={tabCounts}
        />
      </div>

      {/* Members Table */}
      <MembersTable
        members={paginatedMembers}
        onEditMember={(member) => setFormMode({ isOpen: true, editData: member })}
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

      {/* Member Form Modal */}
      <MemberFormModal
        isOpen={formMode.isOpen}
        initialData={formMode.editData}
        onSubmitSuccess={() => setFormMode({ isOpen: false, editData: null })}
        onCancel={() => setFormMode({ isOpen: false, editData: null })}
      />
    </div>
  );
}
