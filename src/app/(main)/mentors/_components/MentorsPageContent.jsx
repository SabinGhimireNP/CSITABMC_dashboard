"use client";

import React, { useState, useCallback, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useMentors, useCreateMentor, useUpdateMentor, useDeleteMentor } from "@/hooks/useMentors";
import { MentorTable } from "./MentorsTable";
import { MentorTabs } from "./MentorTabs";
import { MentorFormModal } from "./MentorForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import MentorsSkeleton from "./MentorsSkeleton";
import { parseServerError } from "@/lib/errorUtils";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

const VALID_TABS = ["all", "published", "draft"];

export function MentorsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const activeTab = VALID_TABS.includes(searchParams.get("tab"))
    ? searchParams.get("tab")
    : "all";
  const searchQuery = searchParams.get("search") || "";
  const idQuery = searchParams.get("id") || "";
  const orderingQuery = searchParams.get("ordering") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const rowsPerPageParam = searchParams.get("page_size") || "5";
  const rowsPerPage = [5, 10, 25].includes(parseInt(rowsPerPageParam, 10))
    ? parseInt(rowsPerPageParam, 10)
    : 5;

  const [formMode, setFormMode] = useState({ isOpen: false, editData: null });

  const createMentorMutation = useCreateMentor();
  const updateMentorMutation = useUpdateMentor();
  const deleteMentorMutation = useDeleteMentor();

  const {
    data: mentorsData,
    isLoading: mentorsLoading,
    isError: mentorsError,
    isFetching,
  } = useMentors({
    search: searchQuery,
    status: activeTab === "all" ? "" : activeTab,
    id: idQuery,
    ordering: orderingQuery,
    page: currentPage,
    pageSize: rowsPerPage,
  });

  const mentorsList = mentorsData?.data || [];
  const totalRows = mentorsData?.count || 0;
  const totalPages = mentorsData?.totalPages || 1;

  // --- URL Query Params Helpers ---
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

  // --- Search Debounce ---
  const { value: localSearch, handleSearchChange } = useDebouncedSearch({
    initialValue: searchQuery,
    delay: 400,
    onSearch: (value) => updateQuery({ search: value.trim(), page: 1 }),
  });

  // --- Tab / pagination / page-size handlers ---
  const handleTabChange = (tab) => {
    updateQuery({ tab: tab === "all" ? "" : tab, page: 1 });
  };

  const handlePageChange = (pageNumber) => {
    updateQuery({ page: pageNumber === 1 ? "" : pageNumber });
  };

  const handleRowsPerPageChange = (amount) => {
    updateQuery({ page: 1, page_size: amount === 5 ? "" : amount });
  };

  // --- Server-side Sorting Query Handler ---
  const sortField = orderingQuery ? orderingQuery.replace("-", "") : null;
  const sortOrder = orderingQuery ? (orderingQuery.startsWith("-") ? "desc" : "asc") : "none";

  const handleSortChange = (field) => {
    let nextOrdering = field;
    if (orderingQuery === field) {
      nextOrdering = `-${field}`;
    } else if (orderingQuery === `-${field}`) {
      nextOrdering = "";
    }
    updateQuery({ ordering: nextOrdering, page: 1 });
  };

  const handleDeleteMentor = async (id) => {
    const mentor = mentorsList.find((m) => m.id === id);
    if (!mentor) return;

    await toast.promise(deleteMentorMutation.mutateAsync(mentor.id), {
      id: "delete-mentor",
      loading: "Deleting mentor...",
      success: () => {
        // Step back a page when the last row on a later page was removed.
        if (mentorsList.length === 1 && currentPage > 1) {
          updateQuery({ page: currentPage - 1 === 1 ? "" : currentPage - 1 });
        }
        return "Mentor deleted successfully.";
      },
      error: (err) => parseServerError(err, "Failed to delete mentor."),
    });
  };

  const handleEditMentorTrigger = (mentor) => {
    setFormMode({ isOpen: true, editData: mentor });
  };

  const handleDuplicateMentorTrigger = (mentor) => {
    setFormMode({
      isOpen: true,
      editData: {
        fullName: `${mentor.fullName} (Copy)`,
        socialLink: mentor.socialLink,
        image: undefined,
        role: mentor.role,
        status: mentor.status,
      },
    });
  };

  const handleFormSubmitSuccess = (formData) => {
    const payload = new FormData();
    payload.append("name", formData.fullName);
    payload.append("expertise", formData.role);
    payload.append("linkedin_profile", formData.socialLink);

    if (formData.image instanceof File) {
      payload.append("photo", formData.image);
    }

    // Saving a mentor never touches event assignments; those are edited from the Event form.
    const isEdit = Boolean(formMode.editData?.id);
    const mutationPromise = isEdit
      ? updateMentorMutation.mutateAsync({ id: formMode.editData.id, formData: payload })
      : createMentorMutation.mutateAsync(payload);

    toast.promise(mutationPromise, {
      id: "mentor-mutation",
      loading: isEdit ? "Updating mentor..." : "Adding mentor...",
      success: () => {
        setFormMode({ isOpen: false, editData: null });
        if (!isEdit) updateQuery({ page: 1 });
        return isEdit ? "Mentor updated successfully." : "Mentor added successfully.";
      },
      error: (err) => {
        console.error("Mentor mutation error:", err?.response?.data || err);
        return parseServerError(err, "Failed to save mentor. Please check required fields.");
      },
    });
    
    return mutationPromise;
  };

  if (mentorsLoading) return <MentorsSkeleton />;
  if (mentorsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load mentors. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">Mentors</h1>
          <p className="text-sm text-muted-foreground font-normal">Manage mentors and their linked events.</p>
        </div>
        <div className="shrink-0">
          <Button
            size="sm"
            onClick={() => setFormMode({ isOpen: true, editData: null })}
            className="bg-[#0b2574] text-white hover:bg-[#0b2574]/90 gap-1.5 text-xs font-medium h-9 px-4 shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Add Mentor
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <MentorTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchQuery={localSearch}
          onSearchChange={handleSearchChange}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden relative">
        {/* Indeterminate progress bar shown while filters/pagination fetch */}
        {(isPending || isFetching) && (
          <div className="progress-bar-track">
            <div className="progress-bar-indicator" />
          </div>
        )}
        <MentorTable
          mentors={mentorsList}
          onEditMentor={handleEditMentorTrigger}
          onDuplicateMentor={handleDuplicateMentorTrigger}
          onDeleteMentor={handleDeleteMentor}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={Math.max(totalPages, 1)}
          totalRows={totalRows}
          sortField={sortField}
          sortOrder={sortOrder}
          onHeaderClick={handleSortChange}
        />
      </div>

      <MentorFormModal
        isOpen={formMode.isOpen}
        initialData={formMode.editData}
        onSubmitSuccess={handleFormSubmitSuccess}
        onCancel={() => setFormMode({ isOpen: false, editData: null })}
      />
    </div>
  );
}
