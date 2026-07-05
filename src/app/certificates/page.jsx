"use client";

import React, { useState, useMemo } from "react";
import { Certificates as initialCertificates } from "@/api/Certificates";
import { Events as initialEvents } from "@/api/Events";
import { CertificateTable } from "./_components/CertificateTable";
import { CertificateTabs } from "./_components/CertificateTabs";
import { CertificateFormModal } from "./_components/CertificateFormModel";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function CertificatesPage() {
  const [liveCertificates, setLiveCertificates] = useState(initialCertificates);
  const [eventsList] = useState(initialEvents);

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
      else { setSortOrder("none"); setSortField(null); }
    }
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleRowsPerPageChange = (amount) => {
    setRowsPerPage(amount);
    setCurrentPage(1);
  };

  const handleDeleteCertificate = (id) => {
    setLiveCertificates((prev) => prev.filter((c) => c.id !== id));
  };

  const handleEditCertificateTrigger = (cert) => {
    setFormMode({ isOpen: true, editData: cert });
  };

  const handleDuplicateCertificateTrigger = (cert) => {
    setFormMode({
      isOpen: true,
      editData: {
        // No id — treated as new record
        event: cert.event,
        fullName: `${cert.fullName} (Copy)`,
        isProjectComplete: cert.isProjectComplete,
      },
    });
  };

  const handleFormSubmitSuccess = (formData) => {
    if (formMode.editData && formMode.editData.id) {
      setLiveCertificates((prev) =>
        prev.map((item) =>
          item.id === formMode.editData.id
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      const nextId = liveCertificates.length > 0
        ? Math.max(...liveCertificates.map((c) => Number(c.id) || 0)) + 1
        : 1;
      const freshCert = { id: nextId, ...formData };
      setLiveCertificates((prev) => [freshCert, ...prev]);
      setCurrentPage(1);
    }
    setFormMode({ isOpen: false, editData: null });
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
        return (
          c.fullName?.toLowerCase().includes(query) ||
          eventTitle.toLowerCase().includes(query)
        );
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

        // Sort by resolved event title instead of raw event id
        if (sortField === "event") {
          const titleA = eventsList.find((e) => String(e.id) === String(valA))?.title || "";
          const titleB = eventsList.find((e) => String(e.id) === String(valB))?.title || "";
          return sortOrder === "asc"
            ? titleA.localeCompare(titleB)
            : titleB.localeCompare(titleA);
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

  const paginatedCertificates = useMemo(() => {
    const startOffset = (currentPage - 1) * rowsPerPage;
    return processedCertificates.slice(startOffset, startOffset + rowsPerPage);
  }, [processedCertificates, currentPage, rowsPerPage]);

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
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
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