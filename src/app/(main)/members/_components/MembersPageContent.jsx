"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTenures } from "@/hooks/useMembers";
import { MemberTable } from "./MemberTable";
import { MemberTabs } from "./MemberTabs";
import { MemberFormModal } from "./MemberForm";
import { TenureListView } from "./TenureListView";
import { TenureFormModal } from "./TenureFormModal";
import { MembersPageHeader } from "./MembersPageHeader";
import { TenureDeleteDialog } from "./TenureDeleteDialog";
import MembersSkeleton from "./MembersSkeleton";

function generateMemberId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uid = "";
  for (let i = 0; i < 4; i++) uid += chars.charAt(Math.floor(Math.random() * chars.length));
  return `MEM-${uid}`;
}

export function MembersPageContent() {
  const { data: tenuresData, isLoading: tenuresLoading, isError: tenuresError } = useTenures();

  const [currentView, setCurrentView] = useState("tenures");
  const [selectedTenure, setSelectedTenure] = useState(null);
  const [liveTenures, setLiveTenures] = useState([]);
  const [liveMembers, setLiveMembers] = useState([]);
  const [tenureFormMode, setTenureFormMode] = useState({ isOpen: false, editData: null });
  const [memberFormMode, setMemberFormMode] = useState({ isOpen: false, editData: null });
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("none");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [tenureToDelete, setTenureToDelete] = useState(null);

  useEffect(() => {
    if (tenuresData?.data) {
      const tenures = tenuresData.data;
      setLiveTenures(tenures);
      const allMembers = tenures.flatMap((tenure) =>
        (tenure.Members || []).map((member) => ({
          ...member,
          tenureId: tenure.id,
        }))
      );
      setLiveMembers(allMembers);
    }
  }, [tenuresData]);

  const handleCreateTenure = () => setTenureFormMode({ isOpen: true, editData: null });
  const handleEditTenure = (tenure) => setTenureFormMode({ isOpen: true, editData: tenure });

  const handleTenureFormSubmit = (formData) => {
    if (tenureFormMode.editData) {
      setLiveTenures((prev) =>
        prev.map((t) =>
          t.id === tenureFormMode.editData.id
            ? { ...t, ...formData }
            : t
        )
      );
    } else {
      const nextId = liveTenures.length > 0 ? Math.max(...liveTenures.map((t) => t.id)) + 1 : 1;
      const newTenure = { id: nextId, ...formData, Members: [] };
      setLiveTenures((prev) => [...prev, newTenure]);
    }
    setTenureFormMode({ isOpen: false, editData: null });
  };

  const handleDeleteTenureConfirm = () => {
    if (!tenureToDelete) return;
    setLiveTenures((prev) => prev.filter((t) => t.id !== tenureToDelete.id));
    setLiveMembers((prev) => prev.filter((m) => m.tenureId !== tenureToDelete.id));
    setTenureToDelete(null);
  };

  const handleDuplicateTenure = (sourceTenure) => {
    const nextTenureId = liveTenures.length > 0 ? Math.max(...liveTenures.map((t) => t.id)) + 1 : 1;
    const sourceYearStart = new Date(sourceTenure.startDate).getFullYear();
    const newTenure = {
      id: nextTenureId,
      name: `${sourceYearStart + 1}-${sourceYearStart + 2}`,
      startDate: `${sourceYearStart + 1}-01-01`,
      endDate: `${sourceYearStart + 1}-12-31`,
    };

    const sourceMembers = liveMembers.filter((m) => m.tenureId === sourceTenure.id);
    const maxMemberId = liveMembers.length > 0 ? Math.max(...liveMembers.map((m) => m.id)) : 0;
    const clonedMembers = sourceMembers.map((m, index) => ({
      ...m,
      id: maxMemberId + index + 1,
      tenureId: nextTenureId,
      memberId: generateMemberId(),
      createdAt: new Date().toISOString().split("T")[0],
    }));

    setLiveTenures((prev) => [...prev, newTenure]);
    setLiveMembers((prev) => [...prev, ...clonedMembers]);
    setSelectedTenure(newTenure);
    setCurrentView("members");
    setCurrentPage(1);
  };

  const handleOpenTenure = (tenure) => {
    setSelectedTenure(tenure);
    setCurrentView("members");
    setCurrentPage(1);
  };

  const handleBackToTenures = () => {
    setCurrentView("tenures");
    setSelectedTenure(null);
  };

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

  const handleDeleteMember = (id) => {
    setLiveMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleEditMemberTrigger = (member) => {
    setMemberFormMode({ isOpen: true, editData: member });
  };

  const handleMemberFormSubmitSuccess = (formData) => {
    if (memberFormMode.editData && memberFormMode.editData.id) {
      setLiveMembers((prev) =>
        prev.map((item) =>
          item.id === memberFormMode.editData.id
            ? {
                ...item,
                ...formData,
                image:
                  formData.image instanceof File
                    ? URL.createObjectURL(formData.image)
                    : item.image,
              }
            : item
        )
      );
    } else {
      const nextId =
        liveMembers.length > 0
          ? Math.max(...liveMembers.map((m) => Number(m.id) || 0)) + 1
          : 1;
      const newMember = {
        id: nextId,
        memberId: generateMemberId(),
        ...formData,
        image:
          formData.image instanceof File
            ? URL.createObjectURL(formData.image)
            : memberFormMode.editData?.image || null,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setLiveMembers((prev) => [newMember, ...prev]);
      setCurrentPage(1);
    }
    setMemberFormMode({ isOpen: false, editData: null });
  };

  const processedMembers = useMemo(() => {
    let dataset = [...liveMembers];

    if (selectedTenure) {
      dataset = dataset.filter((m) => m.tenureId === selectedTenure.id);
    }

    if (activeTab === "active") {
      dataset = dataset.filter((m) => m.status?.toLowerCase() === "active");
    } else if (activeTab === "draft") {
      dataset = dataset.filter((m) => m.status?.toLowerCase() === "draft");
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      dataset = dataset.filter(
        (m) =>
          m.fullName?.toLowerCase().includes(q) ||
          m.post?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.memberId?.toLowerCase().includes(q) ||
          (m.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortField && sortOrder !== "none") {
      dataset.sort((a, b) => {
        let valA = a[sortField]?.toString().toLowerCase() || "";
        let valB = b[sortField]?.toString().toLowerCase() || "";
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return dataset;
  }, [liveMembers, selectedTenure, activeTab, searchQuery, sortField, sortOrder]);

  const totalRows = processedMembers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedMembers.slice(start, start + rowsPerPage);
  }, [processedMembers, currentPage, rowsPerPage]);

  if (tenuresLoading) return <MembersSkeleton />;
  if (tenuresError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load members. Please try again later.</p>
      </div>
    );
  }

  if (currentView === "tenures") {
    return (
      <>
        <TenureListView
          tenures={liveTenures}
          members={liveMembers}
          onOpen={handleOpenTenure}
          onDuplicate={handleDuplicateTenure}
          onEdit={handleEditTenure}
          onDelete={(tenure) => setTenureToDelete(tenure)}
          onCreate={handleCreateTenure}
        />

        <TenureFormModal
          isOpen={tenureFormMode.isOpen}
          initialData={tenureFormMode.editData}
          onSubmitSuccess={handleTenureFormSubmit}
          onCancel={() => setTenureFormMode({ isOpen: false, editData: null })}
        />

        {tenureToDelete && (
          <TenureDeleteDialog
            tenure={tenureToDelete}
            onClose={() => setTenureToDelete(null)}
            onConfirm={handleDeleteTenureConfirm}
          />
        )}
      </>
    );
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <MembersPageHeader
        title={selectedTenure?.name || "Members"}
        subtitle="Manage club members, roles, and profile information."
        selectedTenure={selectedTenure}
        onBack={handleBackToTenures}
        onAddMember={() => setMemberFormMode({ isOpen: true, editData: null })}
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
          onDeleteMember={handleDeleteMember}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(v) => {
            setRowsPerPage(v);
            setCurrentPage(1);
          }}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
          totalRows={totalRows}
          sortField={sortField}
          sortOrder={sortOrder}
          onHeaderClick={handleSortChange}
        />
      </div>

      <MemberFormModal
        isOpen={memberFormMode.isOpen}
        initialData={memberFormMode.editData}
        tenureId={selectedTenure?.id}
        onSubmitSuccess={handleMemberFormSubmitSuccess}
        onCancel={() => setMemberFormMode({ isOpen: false, editData: null })}
      />
    </div>
  );
}
