"use client";

import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useNotices, useCreateNotice, useUpdateNotice } from "@/hooks/useNotices";
import { NoticeTable } from "./noticeTable";
import { NoticeTabs } from "./noticeTabs";
import { NoticeFormModal } from "./noticeForm";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import NoticesSkeleton from "./NoticesSkeleton";

export function NoticesPageContent() {
  const { data: noticesData, isLoading: noticesLoading, isError: noticesError } = useNotices();
  const createNoticeMutation = useCreateNotice();
  const updateNoticeMutation = useUpdateNotice();
  const liveNotices = noticesData?.data || [];

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

  const handleDeleteNotice = () => {
    // Preserves current behavior while leaving deletion to future mutation work.
  };

  const handleEditNoticeTrigger = (notice) => {
    setFormMode({ isOpen: true, editData: notice });
  };

  const handleDuplicateNoticeTrigger = (notice) => {
    setFormMode({
      isOpen: true,
      editData: {
        title: `${notice.title} (Copy)`,
        category: notice.category,
        description: notice.description,
        image: "",
      },
    });
  };

  const handleFormSubmitSuccess = (formData) => {
    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("category", formData.category);
    payload.append("status", formData.status);
    payload.append("description", formData.description);
    if (formData.image) payload.append("image", formData.image);

    if (formMode.editData && formMode.editData.slug) {
      return updateNoticeMutation.mutateAsync(
        { slug: formMode.editData.slug, formData: payload },
        {
          onSuccess: () => {
            toast.success("Notice updated successfully.");
            setFormMode({ isOpen: false, editData: null });
          },
          onError: () => {
            toast.error("Failed to update notice. Please try again.");
          },
        }
      );
    } else {
      return createNoticeMutation.mutateAsync(payload, {
        onSuccess: () => {
          toast.success("Notice created successfully.");
          setFormMode({ isOpen: false, editData: null });
          setCurrentPage(1);
        },
        onError: () => {
          toast.error("Failed to create notice. Please try again.");
        },
      });
    }
  };

  const processedNotices = useMemo(() => {
    let dataset = [...liveNotices];

    if (activeTab === "published") {
      dataset = dataset.filter((n) => n.status?.toLowerCase() === "published" || n.status?.toLowerCase() === "active");
    } else if (activeTab === "draft") {
      dataset = dataset.filter((n) => n.status?.toLowerCase() === "draft");
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      dataset = dataset.filter(
        (n) =>
          n.title?.toLowerCase().includes(query) ||
          n.category?.toLowerCase().includes(query) ||
          n.createdAt?.toLowerCase().includes(query)
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
  }, [liveNotices, activeTab, searchQuery, sortField, sortOrder]);

  const totalRows = processedNotices.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);
  const paginatedNotices = useMemo(() => {
    const startOffset = (currentPage - 1) * rowsPerPage;
    return processedNotices.slice(startOffset, startOffset + rowsPerPage);
  }, [processedNotices, currentPage, rowsPerPage]);

  if (noticesLoading) return <NoticesSkeleton />;
  if (noticesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load notices. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">Notices</h1>
          <p className="text-sm text-muted-foreground font-normal">Manage, coordinate, and review your platform notice outputs.</p>
        </div>
        <div className="shrink-0">
          <Button
            size="sm"
            onClick={() => setFormMode({ isOpen: true, editData: null })}
            className="bg-[#0b2574] text-white hover:bg-[#0b2574]/90 gap-1.5 text-xs font-medium h-9 px-4 shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Publish Notice
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <NoticeTabs
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
        <NoticeTable
          notices={paginatedNotices}
          onEditNotice={handleEditNoticeTrigger}
          onDuplicateNotice={handleDuplicateNoticeTrigger}
          onDeleteNotice={handleDeleteNotice}
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

      <NoticeFormModal
        isOpen={formMode.isOpen}
        initialData={formMode.editData}
        onSubmitSuccess={handleFormSubmitSuccess}
        onCancel={() => setFormMode({ isOpen: false, editData: null })}
      />
    </div>
  );
}
