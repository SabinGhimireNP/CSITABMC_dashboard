"use client";

import React, { useState, useMemo } from "react";
import { Admins as initialAdmins } from "@/api/Admin";
import { AdminTable } from "./_components/AdminTable";
import { AdminTabs } from "./_components/AdminTabs";
import { AdminFormModal } from "./_components/AdminFormModal";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminAccessPage() {
  const [liveAdmins, setLiveAdmins] = useState(initialAdmins);

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

  const handleDeleteAdmin = (id) => {
    setLiveAdmins((prev) => prev.filter((a) => a.id !== id));
  };

  const handleEditAdminTrigger = (admin) => {
    setFormMode({ isOpen: true, editData: admin });
  };

  const handleFormSubmitSuccess = (formData) => {
    if (formMode.editData && formMode.editData.id) {
      // EDIT: update existing, preserve password if blank submitted
      setLiveAdmins((prev) =>
        prev.map((item) =>
          item.id === formMode.editData.id
            ? {
                ...item,
                fullName: formData.fullName,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                // Only overwrite password if a new one was provided
                ...(formData.password ? { password: formData.password } : {}),
              }
            : item
        )
      );
    } else {
      // CREATE: insert new admin at top
      const nextId = liveAdmins.length > 0
        ? Math.max(...liveAdmins.map((a) => Number(a.id) || 0)) + 1
        : 1;
      const freshAdmin = {
        id: nextId,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        status: formData.status,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setLiveAdmins((prev) => [freshAdmin, ...prev]);
      setCurrentPage(1);
    }
    setFormMode({ isOpen: false, editData: null });
  };

  const processedAdmins = useMemo(() => {
    let dataset = [...liveAdmins];

    if (activeTab === "active") {
      dataset = dataset.filter((a) => a.status === "active");
    } else if (activeTab === "inactive") {
      dataset = dataset.filter((a) => a.status === "inactive");
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      dataset = dataset.filter(
        (a) =>
          a.fullName?.toLowerCase().includes(query) ||
          a.email?.toLowerCase().includes(query) ||
          a.role?.toLowerCase().includes(query)
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

        if (sortField === "createdAt") {
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
  }, [liveAdmins, activeTab, searchQuery, sortField, sortOrder]);

  const totalRows = processedAdmins.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

  const paginatedAdmins = useMemo(() => {
    const startOffset = (currentPage - 1) * rowsPerPage;
    return processedAdmins.slice(startOffset, startOffset + rowsPerPage);
  }, [processedAdmins, currentPage, rowsPerPage]);

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">Admin Access</h1>
          <p className="text-sm text-muted-foreground font-normal">Manage sub-admins and their platform access roles.</p>
        </div>
        <div className="shrink-0">
          <Button
            size="sm"
            onClick={() => setFormMode({ isOpen: true, editData: null })}
            className="bg-[#0b2574] text-white hover:bg-[#0b2574]/90 gap-1.5 text-xs font-medium h-9 px-4 shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Add Sub-Admin
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <AdminTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden">
        <AdminTable
          admins={paginatedAdmins}
          onEditAdmin={handleEditAdminTrigger}
          onDeleteAdmin={handleDeleteAdmin}
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

      <AdminFormModal
        isOpen={formMode.isOpen}
        initialData={formMode.editData}
        onSubmitSuccess={handleFormSubmitSuccess}
        onCancel={() => setFormMode({ isOpen: false, editData: null })}
      />

    </div>
  );
}