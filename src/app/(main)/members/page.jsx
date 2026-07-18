"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTenures } from "@/hooks/useMembers";
import { MemberTable } from "./_components/MemberTable";
import { MemberTabs } from "./_components/MemberTabs";
import { MemberFormModal } from "./_components/MemberForm";
import { TenureListView } from "./_components/TenureListView";
import { TenureFormModal } from "./_components/TenureFormModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";
import MembersSkeleton from "./_components/MembersSkeleton";

function generateMemberId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uid = "";
  for (let i = 0; i < 4; i++) uid += chars.charAt(Math.floor(Math.random() * chars.length));
  return `MEM-${uid}`;
}

export default function MembersPage() {
  const { data: tenuresData, isLoading: tenuresLoading, isError: tenuresError } = useTenures();

  // --- View state ---
  const [currentView, setCurrentView] = useState("tenures"); // "tenures" | "members"
  const [selectedTenure, setSelectedTenure] = useState(null);

  // --- Data state ---
  const [liveTenures, setLiveTenures] = useState([]);
  const [liveMembers, setLiveMembers] = useState([]);

  // --- Modal state ---
  const [tenureFormMode, setTenureFormMode] = useState({ isOpen: false, editData: null });
  const [memberFormMode, setMemberFormMode] = useState({ isOpen: false, editData: null });

  // --- Member view state (filtering, pagination, sort) ---
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("none");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Delete confirmation ---
  const [tenureToDelete, setTenureToDelete] = useState(null);

  // Sync react-query data to local state for CRUD
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

  // ────────────────────────────
  //  TENURE HANDLERS
  // ────────────────────────────

  const handleCreateTenure = () => {
    setTenureFormMode({ isOpen: true, editData: null });
  };

  const handleEditTenure = (tenure) => {
    setTenureFormMode({ isOpen: true, editData: tenure });
  };

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
    const nextTenureId =
      liveTenures.length > 0 ? Math.max(...liveTenures.map((t) => t.id)) + 1 : 1;
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

  // ────────────────────────────
  //  MEMBER HANDLERS
  // ────────────────────────────

  const handleSortChange = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else {
      if (sortOrder === "none") setSortOrder("asc");
      else if (sortOrder === "asc") setSortOrder("desc");
      else { setSortOrder("none"); setSortField(null); }
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

  // ────────────────────────────
  //  MEMBER FILTERING
  // ────────────────────────────

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

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedMembers.slice(start, start + rowsPerPage);
  }, [processedMembers, currentPage, rowsPerPage]);

  if (tenuresLoading) {
    return <MembersSkeleton />;
  }

  if (tenuresError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load members. Please try again later.</p>
      </div>
    );
  }

  // ────────────────────────────
  //  RENDER: Tenures View
  // ────────────────────────────

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
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div
              className="bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-xl p-5 animate-in zoom-in-95 duration-150 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-3.5">
                <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.134-.833-2.904 0L4.152 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Remove tenure?</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    Are you sure you want to remove{" "}
                    <span className="font-semibold text-slate-800">{`"${tenureToDelete.name}"`}</span>?
                    All members in this tenure will also be deleted. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 mt-6 border-t border-slate-100/80 pt-3">
                <button type="button" onClick={() => setTenureToDelete(null)}
                  className="h-8 px-4 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                >
                  Cancel
                </button>
                <button type="button" onClick={handleDeleteTenureConfirm}
                  className="h-8 px-4 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all cursor-pointer shadow-sm"
                >
                  Delete Tenure
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ────────────────────────────
  //  RENDER: Members View
  // ────────────────────────────

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToTenures}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-primary">
                {selectedTenure?.name || "Members"}
              </h1>
              <p className="text-sm text-muted-foreground font-normal flex items-center gap-2">
                <span>Manage club members, roles, and profile information.</span>
                {selectedTenure && (
                  <span className="text-[11px] text-slate-400">
                    ({formatDate(selectedTenure.startDate)} — {formatDate(selectedTenure.endDate)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <Button
            size="sm"
            onClick={() => setMemberFormMode({ isOpen: true, editData: null })}
            className="bg-[#0b2574] text-white hover:bg-[#0b2574]/90 gap-1.5 text-xs font-medium h-9 px-4 shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <MemberTabs
          activeTab={activeTab}
          onTabChange={(tab) => { setActiveTab(tab); setCurrentPage(1); }}
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden">
        <MemberTable
          members={paginatedMembers}
          onEditMember={handleEditMemberTrigger}
          onDeleteMember={handleDeleteMember}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(v) => { setRowsPerPage(v); setCurrentPage(1); }}
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