"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useCertificates } from "@/hooks/useCertificates";
import { useEvents } from "@/hooks/useEvents";
import { CertificateTable } from "./CertificateTable";
import { CertificateTabs } from "./CertificateTabs";
import { CertificateFormModal } from "./CertificateFormModel";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CertificatesSkeleton from "./CertificatesSkeleton";
import { toast } from "sonner";

export function CertificatesPageContent() {
  const { data: certData, isLoading: certLoading, isError: certError } = useCertificates();
  const { data: eventsData, isLoading: eventsLoading } = useEvents();

  const liveCertificates = certData?.data || [];
  const eventsList = eventsData?.data || [];

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

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleRowsPerPageChange = (amount) => {
    setRowsPerPage(amount);
    setCurrentPage(1);
  };

  const handleDeleteCertificate = () => {
    // Preserves current behavior while leaving deletion to future mutation work.
    toast.promise(new Promise((resolve) => setTimeout(resolve, 800)), {
      loading: "Deleting certificate...",
      success: "Certificate deleted successfully.",
      error: "Failed to delete certificate.",
    });
  };

  const handleEditCertificateTrigger = (cert) => {
    setFormMode({ isOpen: true, editData: cert });
  };

  const handleDuplicateCertificateTrigger = (cert) => {
    setFormMode({
      isOpen: true,
      editData: {
        event: cert.event,
        fullName: `${cert.fullName} (Copy)`,
        isProjectComplete: cert.isProjectComplete,
      },
    });
  };

  const handleFormSubmitSuccess = (formData) => {
    const isEdit = formMode.editData != null;
    const savePromise = new Promise((resolve) => setTimeout(resolve, 800));
    return toast.promise(savePromise, {
      loading: isEdit ? "Updating certificate..." : "Issuing certificate...",
      success: () => {
        setFormMode({ isOpen: false, editData: null });
        return isEdit ? "Certificate updated successfully." : "Certificate issued successfully.";
      },
      error: "Failed to save certificate.",
    });
  };

  const processedCertificates = useMemo(() => {
    let dataset = [...liveCertificates];

    if (activeTab === "complete") {
      dataset = dataset.filter((c) => c.isProjectComplete);
    } else if (activeTab === "incomplete") {
      dataset = dataset.filter((c) => !c.isProjectComplete);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      dataset = dataset.filter((c) => {
        const eventTitle = eventsList.find((e) => String(e.id) === String(c.event))?.title || "";
        return c.fullName?.toLowerCase().includes(query) || eventTitle.toLowerCase().includes(query);
      });
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

        if (sortField === "event") {
          const titleA = eventsList.find((e) => String(e.id) === String(valA))?.title || "";
          const titleB = eventsList.find((e) => String(e.id) === String(valB))?.title || "";
          return sortOrder === "asc" ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
        }

        valA = valA?.toString().toLowerCase() || "";
        valB = valB?.toString().toLowerCase() || "";
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return dataset;
  }, [liveCertificates, activeTab, searchQuery, sortField, sortOrder, eventsList]);

  const totalRows = processedCertificates.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);
  const paginatedCertificates = useMemo(() => {
    const startOffset = (currentPage - 1) * rowsPerPage;
    return processedCertificates.slice(startOffset, startOffset + rowsPerPage);
  }, [processedCertificates, currentPage, rowsPerPage]);

  if (certLoading || eventsLoading) return <CertificatesSkeleton />;
  if (certError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load certificates. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">Certificates</h1>
          <p className="text-sm text-muted-foreground font-normal">Issue and manage participant certificates across events.</p>
        </div>
        <div className="shrink-0">
          <Button
            size="sm"
            onClick={() => setFormMode({ isOpen: true, editData: null })}
            className="bg-[#0b2574] text-white hover:bg-[#0b2574]/90 gap-1.5 text-xs font-medium h-9 px-4 shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Issue Certificate
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <CertificateTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setCurrentPage(1);
          }}
          searchQuery={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden">
        <CertificateTable
          certificates={paginatedCertificates}
          eventsList={eventsList}
          onEditCertificate={handleEditCertificateTrigger}
          onDuplicateCertificate={handleDuplicateCertificateTrigger}
          onDeleteCertificate={handleDeleteCertificate}
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

      <CertificateFormModal
        isOpen={formMode.isOpen}
        initialData={formMode.editData}
        eventsList={eventsList}
        onSubmitSuccess={handleFormSubmitSuccess}
        onCancel={() => setFormMode({ isOpen: false, editData: null })}
      />
    </div>
  );
}
