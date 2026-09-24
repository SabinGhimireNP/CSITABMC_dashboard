"use client";

import React, { useState, useMemo } from "react";
import {
  useTenures,
  useCreateTenure,
  useUpdateTenure,
  useDeleteTenure,
  useDuplicateTenure,
  useCreateMember,
  useUpdateMember,
  useCreateMembership,
  useUpdateMembership,
  useDeleteMembership,
} from "@/hooks/useMembers";
import { MemberTable } from "./MemberTable";
import { MemberTabs } from "./MemberTabs";
import { MemberFormModal } from "./MemberForm";
import { TenureListView } from "./TenureListView";
import { TenureFormModal } from "./TenureFormModal";
import { MembersPageHeader } from "./MembersPageHeader";
import { TenureDeleteDialog } from "./TenureDeleteDialog";
import MembersSkeleton from "./MembersSkeleton";
import { toast } from "sonner"; // Assuming sonner is used for toasts, standard in modern dashboards. Or just fallback to console.
import { parseServerError } from "@/lib/errorUtils";

const getPostOrder = (post) => {
  const lowerPost = post?.toLowerCase() || "";
  if (lowerPost.includes("president") && !lowerPost.includes("vice")) return 1;
  if (lowerPost.includes("vice president")) return 2;
  if (lowerPost.includes("secretary") && !lowerPost.includes("joint")) return 3;
  if (lowerPost.includes("joint secretary")) return 4;
  if (lowerPost.includes("treasurer")) return 5;
  return 99;
};

export function MembersPageContent() {
  const { data: tenuresData, isLoading: tenuresLoading, isError: tenuresError } = useTenures();

  const createTenureMutation = useCreateTenure();
  const updateTenureMutation = useUpdateTenure();
  const deleteTenureMutation = useDeleteTenure();
  const duplicateTenureMutation = useDuplicateTenure();

  const createMemberMutation = useCreateMember();
  const updateMemberMutation = useUpdateMember();
  const createMembershipMutation = useCreateMembership();
  const updateMembershipMutation = useUpdateMembership();
  const deleteMembershipMutation = useDeleteMembership();

  const [currentView, setCurrentView] = useState("tenures");
  const [selectedTenure, setSelectedTenure] = useState(null);
  
  const [tenureFormMode, setTenureFormMode] = useState({ isOpen: false, editData: null });
  const [memberFormMode, setMemberFormMode] = useState({ isOpen: false, editData: null });
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("none");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [tenureToDelete, setTenureToDelete] = useState(null);

  const liveTenures = tenuresData?.data || [];
  const liveMembers = useMemo(() => {
    return liveTenures.flatMap((tenure) =>
      (tenure.Members || []).map((member) => ({
        ...member,
        tenureId: tenure.id,
        tenureSlug: tenure.slug,
      }))
    );
  }, [liveTenures]);

  const handleCreateTenure = () => setTenureFormMode({ isOpen: true, editData: null });
  const handleEditTenure = (tenure) => setTenureFormMode({ isOpen: true, editData: tenure });

  const handleTenureFormSubmit = async (formData) => {
    const isEdit = !!tenureFormMode.editData;
    const mutationPromise = isEdit
      ? updateTenureMutation.mutateAsync({
          slug: tenureFormMode.editData.slug,
          data: {
            name: formData.name,
            start_date: formData.startDate,
            end_date: formData.endDate,
          }
        })
      : createTenureMutation.mutateAsync({
          name: formData.name,
          start_date: formData.startDate,
          end_date: formData.endDate,
        });

    toast.promise(mutationPromise, {
      id: "tenure-mutation",
      loading: isEdit ? "Updating tenure" : "Adding tenure",
      success: () => {
        setTenureFormMode({ isOpen: false, editData: null });
        return isEdit ? "Tenure updated successfully." : "Tenure created successfully.";
      },
      error: (err) => {
        console.error("Failed to save tenure", err?.response?.data || err);
        return parseServerError(err, "Failed to save tenure.");
      }
    });
    
    return mutationPromise;
  };

  const handleDeleteTenureConfirm = async () => {
    if (!tenureToDelete) return;
    return toast.promise(deleteTenureMutation.mutateAsync(tenureToDelete.slug), {
      id: "delete-tenure",
      loading: "Deleting tenure",
      success: () => {
        setTenureToDelete(null);
        return "Tenure deleted successfully.";
      },
      error: (err) => {
        console.error("Failed to delete tenure", err?.response?.data || err);
        return parseServerError(err, "Failed to delete tenure.");
      }
    });
  };

  const handleDuplicateTenure = async (sourceTenure) => {
    const sourceYearStart = new Date(sourceTenure.startDate).getFullYear();
    const newName = `${sourceYearStart + 1}-${sourceYearStart + 2}`;

    const duplicatePromise = async () => {
      const newTenure = await createTenureMutation.mutateAsync({
        name: newName,
        start_date: `${sourceYearStart + 1}-01-01`,
        end_date: `${sourceYearStart + 1}-12-31`,
      });

      if (newTenure.slug) {
        await duplicateTenureMutation.mutateAsync({
          targetSlug: newTenure.slug,
          sourceSlug: sourceTenure.slug,
        });
      }
    };

    const p = duplicatePromise();
    toast.promise(p, {
      id: "duplicate-tenure",
      loading: "Duplicating tenure",
      success: "Tenure duplicated successfully.",
      error: (err) => {
        console.error("Failed to duplicate tenure", err?.response?.data || err);
        return parseServerError(err, "Failed to duplicate tenure.");
      }
    });
    
    return p;
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

  const handleDeleteMember = async (id) => {
    // Find the membershipId corresponding to this member's ID in the current view
    const member = liveMembers.find(m => m.id === id && m.tenureId === selectedTenure?.id);
    if (member && member.membershipId) {
      return toast.promise(deleteMembershipMutation.mutateAsync(member.membershipId), {
        id: "delete-member",
        loading: "Removing member",
        success: "Member removed successfully.",
        error: (err) => {
          console.error("Failed to delete membership", err?.response?.data || err);
          return parseServerError(err, "Failed to remove member.");
        }
      });
    } else if (member && member.slug) {
      console.warn("No membership ID found, trying to delete member directly? Typically we just delete membership.");
    }
  };

  const handleEditMemberTrigger = (member) => {
    setMemberFormMode({ isOpen: true, editData: member });
  };

  const handleMemberFormSubmitSuccess = async (formData) => {
    const memberPayload = new FormData();
    memberPayload.append("name", formData.fullName);
    memberPayload.append("email", formData.email);
    if (formData.facebookLink) memberPayload.append("fb_link", formData.facebookLink);
    if (formData.linkedinLink) memberPayload.append("linkedin_link", formData.linkedinLink);
    if (formData.githubLink) memberPayload.append("github_link", formData.githubLink);
    if (formData.image instanceof File) {
      memberPayload.append("image", formData.image);
    }

    const isEdit = memberFormMode.editData && memberFormMode.editData.slug;

    const savePromise = async () => {
      let memberResponse;
      if (isEdit) {
        // Update existing member
        memberResponse = await updateMemberMutation.mutateAsync({
          slug: memberFormMode.editData.slug,
          formData: memberPayload,
        });

        // Update membership if designation/post changed
        if (memberFormMode.editData.membershipId) {
          await updateMembershipMutation.mutateAsync({
            id: memberFormMode.editData.membershipId,
            data: {
              member_id: memberFormMode.editData.memberId || memberResponse?.id || memberFormMode.editData.id,
              tenure: selectedTenure?.slug || memberFormMode.editData.tenureSlug,
              designation: formData.post,
              order: getPostOrder(formData.post),
              role_type: "EXECUTIVE",
            }
          });
        }
      } else {
        // Create new member
        memberResponse = await createMemberMutation.mutateAsync(memberPayload);

        // Create new membership
        await createMembershipMutation.mutateAsync({
          member_id: memberResponse.id,
          tenure: selectedTenure?.slug,
          designation: formData.post,
          order: getPostOrder(formData.post),
          role_type: "EXECUTIVE",
        });
      }
    };

    const p = savePromise();
    toast.promise(p, {
      id: "member-mutation",
      loading: isEdit ? "Updating member" : "Adding member",
      success: () => {
        setMemberFormMode({ isOpen: false, editData: null });
        return isEdit ? "Member updated successfully." : "Member added successfully.";
      },
      error: (err) => {
        console.error("Failed to save member", err?.response?.data || err);
        return parseServerError(err, "Failed to save member.");
      }
    });
    
    return p;
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

  React.useEffect(() => {
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
