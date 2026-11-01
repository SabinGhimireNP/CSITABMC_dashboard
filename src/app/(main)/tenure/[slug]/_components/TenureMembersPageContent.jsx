"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTenures, useDeleteMembership } from "@/hooks/useMembers";
import { MemberTable } from "../../_components/MemberTable";
import { MemberTabs } from "../../_components/MemberTabs";
import { TenureAssignmentModal } from "./TenureAssignmentModal";
import { TenureMembersPageHeader } from "./TenureMembersPageHeader";
import { parseServerError } from "@/lib/errorUtils";

export function TenureMembersPageContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const { data: tenuresData, isLoading: tenuresLoading } = useTenures();
  const deleteMembershipMutation = useDeleteMembership();

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("order");
  const [sortOrder, setSortOrder] = useState("asc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [assignmentModalMode, setAssignmentModalMode] = useState({
    isOpen: false,
    editData: null,
  });

  const selectedTenure = useMemo(() => {
    const list = tenuresData?.data || [];
    return list.find(
      (t) => String(t.id) === String(slug) || t.slug === slug
    );
  }, [tenuresData, slug]);

  const rawMembers = useMemo(() => {
    return selectedTenure?.Members || [];
  }, [selectedTenure]);

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

  const handleDeleteMembership = async (membershipId) => {
    try {
      await deleteMembershipMutation.mutateAsync(membershipId);
      toast.success("Member removed from tenure.");
    } catch (err) {
      toast.error(parseServerError(err) || "Failed to remove member from tenure.");
    }
  };

  const handleEditMemberTrigger = (member) => {
    setAssignmentModalMode({ isOpen: true, editData: member });
  };

  const processedMembers = useMemo(() => {
    let dataset = [...rawMembers];

    if (activeTab === "executive") {
      dataset = dataset.filter((m) => m.roleType === "EXECUTIVE");
    } else if (activeTab === "advisor") {
      dataset = dataset.filter((m) => m.roleType === "ADVISOR");
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      dataset = dataset.filter(
        (m) =>
          // memberId is numeric, so compare everything as strings.
          [m.fullName, m.post, m.email, m.memberId].some((v) =>
            String(v ?? "").toLowerCase().includes(q)
          )
      );
    }

    if (sortField && sortOrder !== "none") {
      dataset.sort((a, b) => {
        if (sortField === "order") {
          const numA = Number(a.order) || 99;
          const numB = Number(b.order) || 99;
          return sortOrder === "asc" ? numA - numB : numB - numA;
        }
        const valA = a[sortField]?.toString().toLowerCase() || "";
        const valB = b[sortField]?.toString().toLowerCase() || "";
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return dataset;
  }, [rawMembers, activeTab, searchQuery, sortField, sortOrder]);

  const totalRows = processedMembers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

  // Clamp to the last page when filters or deletes shrink the list.
  const effectivePage = Math.min(currentPage, totalPages);
  const paginatedMembers = useMemo(() => {
    const start = (effectivePage - 1) * rowsPerPage;
    return processedMembers.slice(start, start + rowsPerPage);
  }, [processedMembers, effectivePage, rowsPerPage]);

  if (tenuresLoading) {
    return (
      <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-md bg-slate-200" />
        <div className="h-4 w-72 rounded-md bg-slate-200" />
        <div className="h-96 rounded-sm bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <TenureMembersPageHeader
        title={selectedTenure?.name || "Tenure Members"}
        subtitle="Manage assigned board members, designations, and hierarchy order."
        selectedTenure={selectedTenure}
        onBack={() => router.push("/tenure")}
        onAddMember={() => setAssignmentModalMode({ isOpen: true, editData: null })}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <MemberTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden">
        <MemberTable
          members={paginatedMembers}
          onEditMember={handleEditMemberTrigger}
          onDeleteMember={handleDeleteMembership}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(v) => {
            setRowsPerPage(v);
            setCurrentPage(1);
          }}
          currentPage={effectivePage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          totalRows={totalRows}
          sortField={sortField}
          sortOrder={sortOrder}
          onHeaderClick={handleSortChange}
        />
      </div>

      <TenureAssignmentModal
        isOpen={assignmentModalMode.isOpen}
        initialData={assignmentModalMode.editData}
        tenure={selectedTenure}
        onSubmitSuccess={() => setAssignmentModalMode({ isOpen: false, editData: null })}
        onCancel={() => setAssignmentModalMode({ isOpen: false, editData: null })}
      />
    </div>
  );
}
