"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { MemberTable } from "../_components/MemberTable";
import { MemberTabs } from "../_components/MemberTabs";
import { MemberFormModal } from "../_components/MemberForm";
import { Tenure } from "@/api/Member";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";

function generateMemberId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uid = "";
  for (let i = 0; i < 4; i++) uid += chars.charAt(Math.floor(Math.random() * chars.length));
  return `MEM-${uid}`;
}

export default function TenureMembersPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const [liveTenures, setLiveTenures] = useState([]);
  const [liveMembers, setLiveMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("none");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [memberFormMode, setMemberFormMode] = useState({ isOpen: false, editData: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Tenure();
        if (response && response.data) {
          const tenures = response.data;
          setLiveTenures(tenures);
          // Extract all members from all tenures into a flat array, adding tenureId
          const allMembers = tenures.flatMap((tenure) =>
            (tenure.Members || []).map((member) => ({
              ...member,
              tenureId: tenure.id,
            }))
          );
          setLiveMembers(allMembers);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedTenure = liveTenures.find((t) => String(t.id) === slug);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

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
            ? { ...item, ...formData, image: formData.image instanceof File ? URL.createObjectURL(formData.image) : item.image }
            : item
        )
      );
    } else {
      const nextId = liveMembers.length > 0 ? Math.max(...liveMembers.map((m) => Number(m.id) || 0)) + 1 : 1;
      const newMember = {
        id: nextId, memberId: generateMemberId(), ...formData,
        tenureId: selectedTenure?.id,
        image: formData.image instanceof File ? URL.createObjectURL(formData.image) : null,
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
        (m) => m.fullName?.toLowerCase().includes(q) || m.post?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.memberId?.toLowerCase().includes(q) || (m.tags || []).some((t) => t.toLowerCase().includes(q))
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

  if (isLoading) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/members")}
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