"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Mentors } from "@/api/Mentor";
import { Events as fetchEvents } from "@/api/Events";
import { MENTOR_ROLES } from "@/lib/Schema/mentorSchema";
import { MentorTable } from "./_components/MentorsTable";
import { MentorTabs } from "./_components/MentorTabs";
import { MentorFormModal } from "./_components/MentorForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import MentorsSkeleton from "./_components/MentorsSkeleton";

export default function MentorsPage() {
  const [liveMentors, setLiveMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventsList, setEventsList] = useState([]);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("none");

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [formMode, setFormMode] = useState({ isOpen: false, editData: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mentorsRes, eventsRes] = await Promise.all([Mentors(), fetchEvents()]);
        if (mentorsRes?.data) setLiveMentors(mentorsRes.data);
        if (eventsRes?.data) setEventsList(eventsRes.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleRowsPerPageChange = (amount) => {
    setRowsPerPage(amount);
    setCurrentPage(1);
  };

  const handleDeleteMentor = (id) => {
    setLiveMentors((prev) => prev.filter((m) => m.id !== id));
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
        image: mentor.image,
        events: mentor.events,
        role: mentor.role,
      },
    });
  };

  const handleFormSubmitSuccess = (formData) => {
    if (formMode.editData && formMode.editData.id) {
      setLiveMentors((prev) =>
        prev.map((item) =>
          item.id === formMode.editData.id
            ? {
                ...item,
                ...formData,
                image: formData.image instanceof File
                  ? URL.createObjectURL(formData.image)
                  : item.image,
              }
            : item
        )
      );
    } else {
      const nextId = liveMentors.length > 0 ? Math.max(...liveMentors.map((m) => Number(m.id) || 0)) + 1 : 1;
      const freshMentor = {
        id: nextId,
        ...formData,
        image: formData.image instanceof File
          ? URL.createObjectURL(formData.image)
          : (formMode.editData?.image || null),
      };
      setLiveMentors((prev) => [freshMentor, ...prev]);
      setCurrentPage(1);
    }
    setFormMode({ isOpen: false, editData: null });
  };

  const processedMentors = useMemo(() => {
    let dataset = [...liveMentors];

    // Tab filters by status
    if (activeTab !== "all") {
      dataset = dataset.filter((m) => m.status === activeTab);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      dataset = dataset.filter(
        (m) =>
          m.fullName?.toLowerCase().includes(query) ||
          m.role?.toLowerCase().includes(query)
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

        valA = valA?.toString().toLowerCase() || "";
        valB = valB?.toString().toLowerCase() || "";
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return dataset;
  }, [liveMentors, activeTab, searchQuery, sortField, sortOrder]);

  const handleUpdateMentorStatus = (id, status) => {
    setLiveMentors((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const totalRows = processedMentors.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

  const paginatedMentors = useMemo(() => {
    const startOffset = (currentPage - 1) * rowsPerPage;
    return processedMentors.slice(startOffset, startOffset + rowsPerPage);
  }, [processedMentors, currentPage, rowsPerPage]);

  if (isLoading) {
    return <MentorsSkeleton />;
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
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roles={MENTOR_ROLES}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden">
        <MentorTable
          mentors={paginatedMentors}
          eventsList={eventsList}
          onEditMentor={handleEditMentorTrigger}
          onDuplicateMentor={handleDuplicateMentorTrigger}
          onDeleteMentor={handleDeleteMentor}
          onUpdateMentorStatus={handleUpdateMentorStatus}
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

      <MentorFormModal
        isOpen={formMode.isOpen}
        initialData={formMode.editData}
        eventsList={eventsList}
        onSubmitSuccess={handleFormSubmitSuccess}
        onCancel={() => setFormMode({ isOpen: false, editData: null })}
      />

    </div>
  );
}