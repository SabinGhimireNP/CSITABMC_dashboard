"use client";

import React, { useState, useCallback, useTransition, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from "@/hooks/useEvents";
import { useMentors } from "@/hooks/useMentors";
import { EventTable } from "./EventTable";
import { EventTabs } from "./EventTabs";
import { EventFormModal } from "./EventForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import EventsSkeleton from "./EventsSkeleton";
import { parseServerError } from "@/lib/errorUtils";

const VALID_TABS = ["all", "published", "draft"];

const mapCategoryToBackend = (cat) => {
  if (!cat) return "other";
  const lower = cat.toLowerCase().trim();
  const VALID_BACKEND_CATEGORIES = [
    "workshop", "seminar", "conference", "webinar",
    "hackathon", "bootcamp", "talk", "mocktest", "other"
  ];
  if (VALID_BACKEND_CATEGORIES.includes(lower)) return lower;
  return "other";
};

const mapTagToBackend = (tagsInput) => {
  const VALID_TAGS = ["web", "beginner", "intermediate", "frontend", "backend"];
  let candidate = "";
  if (Array.isArray(tagsInput) && tagsInput.length > 0) {
    candidate = tagsInput[0].toLowerCase().trim();
  } else if (typeof tagsInput === "string" && tagsInput) {
    candidate = tagsInput.split(",")[0].toLowerCase().trim();
  }
  if (VALID_TAGS.includes(candidate)) return candidate;
  return "web";
};

export function EventsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const activeTab = VALID_TABS.includes(searchParams.get("tab"))
    ? searchParams.get("tab")
    : "all";
  const searchQuery = searchParams.get("search") || "";
  const orderingQuery = searchParams.get("ordering") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const rowsPerPageParam = searchParams.get("page_size") || "5";
  const rowsPerPage = [5, 10, 25].includes(parseInt(rowsPerPageParam, 10))
    ? parseInt(rowsPerPageParam, 10)
    : 5;

  const [formMode, setFormMode] = useState({ isOpen: false, editData: null });

  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const {
    data: eventsData,
    isLoading: eventsLoading,
    isError: eventsError,
    isFetching,
  } = useEvents({
    search: searchQuery,
    status: activeTab === "all" ? "" : activeTab,
    ordering: orderingQuery,
    page: currentPage,
    pageSize: rowsPerPage,
  });

  const { data: mentorsData, isLoading: mentorsLoading } = useMentors({ pageSize: 100 });

  const eventsList = eventsData?.data || [];
  const totalRows = eventsData?.count || 0;
  const totalPages = eventsData?.totalPages || 1;
  const mentorsList = mentorsData?.data || [];

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
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchChange = (value) => {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateQuery({ search: value.trim(), page: 1 });
    }, 400);
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

  // --- Handlers ---
  const handleTabChange = (tab) => {
    updateQuery({ tab: tab === "all" ? "" : tab, page: 1 });
  };

  const handlePageChange = (pageNumber) => {
    updateQuery({ page: pageNumber === 1 ? "" : pageNumber });
  };

  const handleRowsPerPageChange = (amount) => {
    updateQuery({ page: 1, page_size: amount === 5 ? "" : amount });
  };

  const handleDeleteEvent = async (id) => {
    const event = eventsList.find((e) => e.id === id);
    if (!event || !event.slug) return;

    await toast.promise(deleteEventMutation.mutateAsync(event.slug), {
      id: "delete-event",
      loading: "Deleting event...",
      success: "Event deleted successfully.",
      error: (err) => parseServerError(err, "Failed to delete event."),
    });
  };

  const handleEditEventTrigger = (event) => {
    setFormMode({ isOpen: true, editData: event });
  };

  const handleDuplicateEventTrigger = (event) => {
    setFormMode({
      isOpen: true,
      editData: {
        title: `${event.title} (Copy)`,
        registrationOpen: event.registrationOpen,
        startDate: event.startDate,
        endDate: event.endDate,
        startTime: event.startTime,
        endTime: event.endTime,
        organizer: event.organizer,
        availableSeats: event.availableSeats,
        registrationFormUrl: event.registrationFormUrl,
        registrationFeeBMC: event.registrationFeeBMC,
        registrationFee: event.registrationFee,
        location: event.location,
        category: event.category,
        tags: event.tags,
        image: undefined,
        description: event.description,
        mentors: event.mentors,
      },
    });
  };

  const handleFormSubmitSuccess = (formData) => {
    const payload = new FormData();
    payload.append("title", formData.title || "");
    payload.append("description", formData.description || "");
    payload.append("organiser", formData.organizer || "");
    payload.append("location", formData.location || "");
    payload.append("available_seats", String(Number(formData.availableSeats) || 0));
    payload.append("registration_fee_bmc", String(Number(formData.registrationFeeBMC) || 0));
    payload.append("registration_fee_non_bmc", String(Number(formData.registrationFee) || 0));
    if (formData.registrationFormUrl) {
      payload.append("registration_link", formData.registrationFormUrl);
    }
    payload.append("category", mapCategoryToBackend(formData.category));
    payload.append("tags", mapTagToBackend(formData.tags));
    payload.append("status", (formData.status || "published").toLowerCase());

    // Date Combinations
    const startTimeStr = formData.startTime || "00:00";
    const endTimeStr = formData.endTime || "23:59";

    if (formData.startDate) {
      const dateISO = `${formData.startDate}T${startTimeStr}:00Z`;
      payload.append("date", dateISO);
      payload.append("start_time", dateISO);
    }

    if (formData.endDate) {
      const endDateISO = `${formData.endDate}T${endTimeStr}:00Z`;
      payload.append("end_time", endDateISO);
    }

    // M2M Mentors mapping
    if (Array.isArray(formData.mentors) && formData.mentors.length > 0) {
      formData.mentors.forEach((mId) => {
        if (mId !== null && mId !== undefined && mId !== "") {
          payload.append("mentors", mId);
        }
      });
    }

    // Image Upload
    if (formData.image instanceof File) {
      payload.append("image", formData.image);
    }

    const isEdit = formMode.editData && formMode.editData.slug;
    const mutationPromise = isEdit
      ? updateEventMutation.mutateAsync({ slug: formMode.editData.slug, formData: payload })
      : createEventMutation.mutateAsync(payload);

    toast.promise(mutationPromise, {
      id: "event-mutation",
      loading: isEdit ? "Updating event..." : "Creating event...",
      success: () => {
        setFormMode({ isOpen: false, editData: null });
        if (!isEdit) updateQuery({ page: 1 });
        return isEdit ? "Event updated successfully." : "Event created successfully.";
      },
      error: (err) => {
        console.error("Event mutation error:", err?.response?.data || err);
        return parseServerError(err, "Failed to save event. Please check required fields.");
      },
    });
    
    return mutationPromise;
  };

  if (eventsLoading || mentorsLoading) return <EventsSkeleton />;
  if (eventsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load events. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">Events</h1>
          <p className="text-sm text-muted-foreground font-normal">Manage, schedule, and review your platform events.</p>
        </div>
        <div className="shrink-0">
          <Button
            size="sm"
            onClick={() => setFormMode({ isOpen: true, editData: null })}
            className="bg-[#0b2574] text-white hover:bg-[#0b2574]/90 gap-1.5 text-xs font-medium h-9 px-4 shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <EventTabs
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
        <EventTable
          events={eventsList}
          onEditEvent={handleEditEventTrigger}
          onDuplicateEvent={handleDuplicateEventTrigger}
          onDeleteEvent={handleDeleteEvent}
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

      <EventFormModal
        isOpen={formMode.isOpen}
        initialData={formMode.editData}
        mentorsList={mentorsList}
        onSubmitSuccess={handleFormSubmitSuccess}
        onCancel={() => setFormMode({ isOpen: false, editData: null })}
      />
    </div>
  );
}
