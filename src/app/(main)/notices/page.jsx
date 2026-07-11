"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Notices } from "@/api/Notice";
import { NoticeTable } from "./_components/noticeTable";
import { NoticeTabs } from "./_components/noticeTabs";
import { NoticeFormModal } from "./_components/noticeForm"; 
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function NoticeHistoryPage() {
  const [liveNotices, setLiveNotices] = useState([]);
  
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [sortField, setSortField] = useState(null); 
  const [sortOrder, setSortOrder] = useState("none"); 
  
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Tracks form view state and active dataset node for modifications
  const [formMode, setFormMode] = useState({ isOpen: false, editData: null });

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await Notices();
        if (response && response.data) {
          setLiveNotices(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchNotices();
  }, []);

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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRowsPerPageChange = (amount) => {
    setRowsPerPage(amount);
    setCurrentPage(1); 
  };

  const handleDeleteNotice = (id) => {
    setLiveNotices(prev => prev.filter(n => n.id !== id));
  };

  // Triggers the form panel pre-populated with selected notice data
  const handleEditNoticeTrigger = (notice) => {
    setFormMode({ isOpen: true, editData: notice });
  };

  // Triggers the form pre-populated with duplicated content fields, treating it as a fresh record creation
  const handleDuplicateNoticeTrigger = (notice) => {
    setFormMode({
      isOpen: true,
      editData: {
        title: `${notice.title} (Copy)`,
        category: notice.category,
        description: notice.description,
        image: ""
      }
    });
  };

  // Handles both Create and Edit form success submissions
  const handleFormSubmitSuccess = (formData) => {
    if (formMode.editData && formMode.editData.id) {
      // EDIT MODE: Update existing notice mapping properties
      setLiveNotices((prev) =>
        prev.map((item) =>
          item.id === formMode.editData.id
            ? {
                ...item,
                title: formData.title,
                category: formData.category,
                status: formData.status,
                description: formData.description,
                image: formData.image instanceof File 
                  ? URL.createObjectURL(formData.image) 
                  : item.image
              }
            : item
        )
      );
    } else {
      // CREATE MODE / DUPLICATE SAVING: Insert a completely new record at the top of the array
      const nextId = liveNotices.length > 0 ? Math.max(...liveNotices.map((n) => Number(n.id) || 0)) + 1 : 1;
      const freshNotice = {
        id: nextId,
        title: formData.title,
        category: formData.category,
        createdAt: new Date().toISOString().split("T")[0],
        status: formData.status,
        description: formData.description,
        image: formData.image instanceof File 
          ? URL.createObjectURL(formData.image) 
          : (formMode.editData?.image || null) // Persists duplicated image links if applicable
      };
      setLiveNotices((prev) => [freshNotice, ...prev]);
      setCurrentPage(1); 
    }

    setFormMode({ isOpen: false, editData: null });
  };

  const processedNotices = useMemo(() => {
    let dataset = [...liveNotices];

    if (activeTab === "published") {
      dataset = dataset.filter(n => n.status?.toLowerCase() === "published" || n.status?.toLowerCase() === "active");
    } else if (activeTab === "draft") {
      dataset = dataset.filter(n => n.status?.toLowerCase() === "draft");
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
  
  const paginatedNotices = useMemo(() => {
    const startOffset = (currentPage - 1) * rowsPerPage;
    return processedNotices.slice(startOffset, startOffset + rowsPerPage);
  }, [processedNotices, currentPage, rowsPerPage]);


  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      
      {/* Notice Heading and Top Action Header Row */}
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

      {/* Filter Segment & Search parameters remain visible on page block background */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
         <NoticeTabs activeTab={activeTab} onTabChange={setActiveTab} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
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

      {/* RENDER THE CENTERING MODAL COMPONENT WINDOW DIALOG LAYER */}
      <NoticeFormModal 
        isOpen={formMode.isOpen}
        initialData={formMode.editData}
        onSubmitSuccess={handleFormSubmitSuccess}
        onCancel={() => setFormMode({ isOpen: false, editData: null })}
      />

    </div>
  );
}