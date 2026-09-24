"use client";

import React, { useState, useCallback, useTransition, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { 
  useCertificates,
  useCreateCertificate,
  useUpdateCertificate,
  useDeleteCertificate 
} from "@/hooks/useCertificates";
import { useEvents } from "@/hooks/useEvents";
import { CertificateTable } from "./CertificateTable";
import { CertificateTabs } from "./CertificateTabs";
import { CertificateFormModal } from "./CertificateFormModel";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import CertificatesSkeleton from "./CertificatesSkeleton";
import { toast } from "sonner";
import { parseServerError } from "@/lib/errorUtils";

const VALID_TABS = ["all", "complete", "incomplete"];

export function CertificatesPageContent() {
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

  const createCertificateMutation = useCreateCertificate();
  const updateCertificateMutation = useUpdateCertificate();
  const deleteCertificateMutation = useDeleteCertificate();

  const { data: eventsData, isLoading: eventsLoading } = useEvents({ pageSize: 100 });
  const eventsList = eventsData?.data || [];

  const {
    data: certData,
    isLoading: certLoading,
    isError: certError,
    isFetching,
  } = useCertificates({
    search: searchQuery,
    ordering: orderingQuery,
    page: currentPage,
    pageSize: rowsPerPage,
  });

  // Client-side filter for "complete/incomplete" since it's not a real backend field right now
  const liveCertificates = certData?.data || [];
  let processedCertificates = liveCertificates;
  if (activeTab === "complete") {
    processedCertificates = processedCertificates.filter((c) => c.isProjectComplete);
  } else if (activeTab === "incomplete") {
    processedCertificates = processedCertificates.filter((c) => !c.isProjectComplete);
  }

  const totalRows = certData?.count || 0;
  const totalPages = certData?.totalPages || 1;

  // ── URL query helpers ────────────────────────────────────────────────────
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

  // ── Debounced search ─────────────────────────────────────────────────────
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (value) => {
    setLocalSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateQuery({ search: value, page: "" });
    }, 350);
  };

  // ── Sort (header click → ordering query param) ────────────────────────
  const handleSortChange = (field) => {
    const currentOrdering = orderingQuery;
    let newOrdering = "";
    if (currentOrdering === field) {
      newOrdering = `-${field}`;
    } else if (currentOrdering === `-${field}`) {
      newOrdering = "";
    } else {
      newOrdering = field;
    }
    updateQuery({ ordering: newOrdering, page: "" });
  };

  const handleDeleteCertificate = (id) => {
    toast.promise(deleteCertificateMutation.mutateAsync(id), {
      id: "delete-certificate",
      loading: "Deleting certificate",
      success: "Certificate deleted successfully.",
      error: (err) => parseServerError(err, "Failed to delete certificate."),
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
    const payload = {
      full_name: formData.fullName,
      event: formData.event,
    };

    const isEdit = formMode.editData && formMode.editData.id;
    const mutationPromise = isEdit
      ? updateCertificateMutation.mutateAsync({ id: formMode.editData.id, data: payload })
      : createCertificateMutation.mutateAsync(payload);

    toast.promise(mutationPromise, {
      id: "certificate-mutation",
      loading: isEdit ? "Updating certificate" : "Adding certificate",
      success: () => {
        setFormMode({ isOpen: false, editData: null });
        return isEdit ? "Certificate updated successfully." : "Certificate added successfully.";
      },
      error: (err) => {
        console.error("Certificate mutation error:", err?.response?.data || err);
        return parseServerError(err, "Failed to save certificate.");
      },
    });
    
    return mutationPromise;
  };

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
          onTabChange={(tab) => updateQuery({ tab: tab === "all" ? "" : tab, page: "" })}
          searchQuery={localSearch}
          onSearchChange={handleSearchChange}
          isFetching={isFetching && !certLoading}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden">
        <CertificateTable
          certificates={processedCertificates}
          eventsList={eventsList}
          onEditCertificate={handleEditCertificateTrigger}
          onDuplicateCertificate={handleDuplicateCertificateTrigger}
          onDeleteCertificate={handleDeleteCertificate}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(n) => updateQuery({ page_size: n, page: "" })}
          currentPage={currentPage}
          onPageChange={(p) => updateQuery({ page: p })}
          totalPages={totalPages}
          totalRows={totalRows}
          sortField={orderingQuery.replace(/^-/, "")}
          sortOrder={orderingQuery ? (orderingQuery.startsWith("-") ? "desc" : "asc") : "none"}
          onHeaderClick={handleSortChange}
          isFetching={isFetching && !certLoading}
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
