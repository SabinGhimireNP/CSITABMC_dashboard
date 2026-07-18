"use client";

import React, { useState, useMemo } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useMentors } from "@/hooks/useMentors";
import { EventTable } from "./_components/EventTable";
import { EventTabs } from "./_components/EventTabs";
import { EventFormModal } from "./_components/EventForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import EventsSkeleton from "./_components/EventsSkeleton";

export default function EventsHistoryPage() {
  const { data: eventsData, isLoading: eventsLoading, isError: eventsError } = useEvents();
  const { data: mentorsData, isLoading: mentorsLoading } = useMentors();

  const liveEvents = eventsData?.data || [];
  const mentorsList = mentorsData?.data || [];

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("none");

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [formMode, setFormMode] = useState({ isOpen: false, editData: null });

  const handleSortChange = (field) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else {
      if (sortOrder === "none") setSortOrder("asc");
      else if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortOrder("none");
        setSortField(null);
      }
    }
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleRowsPerPageChange = (amount) => {
    setRowsPerPage(amount);
    setCurrentPage(1);
  };

  const handleDeleteEvent = (id) => {
    // Optimistic removal — in a real app this would call a mutation
    // For now we keep the local state pattern for CRUD
    // setLiveEvents((prev) => prev.filter((e) => e.id !== id));
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
        image: event.image,
        description: event.description,
        mentors: event.mentors,
      },
    });
  };

  const handleFormSubmitSuccess = (formData) => {
    setFormMode({ isOpen: false, editData: null });
  };

  const processedEvents = useMemo(() => {
    let dataset = [...liveEvents];

    if (activeTab === "open") {
      dataset = dataset.filter((e) => e.registrationOpen);
    } else if (activeTab === "closed") {
      dataset = dataset.filter((e) => !e.registrationOpen);
    }
    if (activeTab === "published") {
      dataset = dataset.filter((e) => e.status === "published");
    } else if (activeTab === "draft") {
      dataset = dataset.filter((e) => e.status === "draft");
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      dataset = dataset.filter(
        (e) =>
          e.title?.toLowerCase().includes(query) ||
          e.category?.toLowerCase().includes(query) ||
          e.organizer?.toLowerCase().includes(query) ||
          e.location?.toLowerCase().includes(query)
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

        if (sortField === "startDate") {
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
  }, [liveEvents, activeTab, searchQuery, sortField, sortOrder]);

  const handleUpdateEventStatus = (id, status) => {
    // In a real app this would call a mutation
  };

  const totalRows = processedEvents.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

  const paginatedEvents = useMemo(() => {
    const startOffset = (currentPage - 1) * rowsPerPage;
    return processedEvents.slice(startOffset, startOffset + rowsPerPage);
  }, [processedEvents, currentPage, rowsPerPage]);

  if (eventsLoading || mentorsLoading) {
    return <EventsSkeleton />;
  }

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
        <EventTabs activeTab={activeTab} onTabChange={setActiveTab} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden">
        <EventTable
          events={paginatedEvents}
          onEditEvent={handleEditEventTrigger}
          onDuplicateEvent={handleDuplicateEventTrigger}
          onDeleteEvent={handleDeleteEvent}
          onUpdateEventStatus={handleUpdateEventStatus}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
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