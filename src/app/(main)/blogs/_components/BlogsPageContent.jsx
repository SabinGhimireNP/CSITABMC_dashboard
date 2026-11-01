"use client";

import React, { useState, useCallback, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlogs, useDeleteBlog } from "@/hooks/useBlogs";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useAuthStore } from "@/lib/store/authStore";
import { isAdminRole } from "@/lib/roles";
import { parseServerError } from "@/lib/errorUtils";
import { BlogTable } from "./BlogTable";
import { BlogTabs } from "./BlogTabs";
import { BlogFormModal } from "./BlogFormModal";
import BlogsSkeleton from "./BlogsSkeleton";

const VALID_TABS = ["all", "published", "draft"];
const DEFAULT_PAGE_SIZE = 10;

export function BlogsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { user } = useAuthStore();
  const canDelete = isAdminRole(user);

  const activeTab = VALID_TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "all";
  const searchQuery = searchParams.get("search") || "";
  const orderingQuery = searchParams.get("ordering") || "";
  const currentPage = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const pageSizeParam = parseInt(searchParams.get("page_size") || "", 10);
  const rowsPerPage = [5, 10, 25].includes(pageSizeParam) ? pageSizeParam : DEFAULT_PAGE_SIZE;

  // `null` = closed, `{ id: null }` = create, `{ id }` = edit
  const [formTarget, setFormTarget] = useState(null);
  const deleteBlogMutation = useDeleteBlog();

  const {
    data: blogsData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useBlogs({
    search: searchQuery,
    status: activeTab === "all" ? "" : activeTab,
    ordering: orderingQuery,
    page: currentPage,
    pageSize: rowsPerPage,
  });

  const blogs = blogsData?.data || [];
  const totalRows = blogsData?.count || 0;
  const totalPages = blogsData?.totalPages || 1;

  // ── URL query params helpers ────────────────────────────────────────────
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

  const { value: localSearch, handleSearchChange } = useDebouncedSearch({
    initialValue: searchQuery,
    delay: 400,
    onSearch: (value) => updateQuery({ search: value.trim(), page: "" }),
  });

  const handleTabChange = (tab) => updateQuery({ tab: tab === "all" ? "" : tab, page: "" });
  const handlePageChange = (pageNumber) => updateQuery({ page: pageNumber === 1 ? "" : pageNumber });
  const handleRowsPerPageChange = (amount) =>
    updateQuery({ page: "", page_size: amount === DEFAULT_PAGE_SIZE ? "" : amount });

  // ── Server-side sorting: field → -field → default ───────────────────────
  const sortField = orderingQuery ? orderingQuery.replace("-", "") : null;
  const sortOrder = orderingQuery ? (orderingQuery.startsWith("-") ? "desc" : "asc") : "none";

  const handleSortChange = (field) => {
    let nextOrdering = field;
    if (orderingQuery === field) nextOrdering = `-${field}`;
    else if (orderingQuery === `-${field}`) nextOrdering = "";
    updateQuery({ ordering: nextOrdering, page: "" });
  };

  const handleDeleteBlog = (blog) => {
    toast.promise(deleteBlogMutation.mutateAsync(blog.id), {
      id: "delete-blog",
      loading: "Deleting article",
      success: () => {
        // Step back a page when the last row on a later page was removed.
        if (blogs.length === 1 && currentPage > 1) {
          updateQuery({ page: currentPage - 1 === 1 ? "" : currentPage - 1 });
        }
        return `"${blog.title}" deleted.`;
      },
      error: (err) => parseServerError(err, "Failed to delete blog article."),
    });
  };

  if (isLoading) return <BlogsSkeleton />;

  return (
    <div className="w-full mx-auto px-1 sm:px-6 lg:px-5 py-4 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">Blogs</h1>
          <p className="text-sm text-muted-foreground font-normal">
            Write articles, manage media, review search snippets, and control publication.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            size="sm"
            onClick={() => setFormTarget({ id: null })}
            className="bg-[#0b2574] text-white hover:bg-[#0b2574]/90 gap-1.5 text-xs font-medium h-9 px-4 shadow-sm w-full sm:w-auto cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            New Article
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <BlogTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          searchQuery={localSearch}
          onSearchChange={handleSearchChange}
        />
      </div>

      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-sm overflow-hidden relative">
        {(isPending || isFetching) && (
          <div className="progress-bar-track">
            <div className="progress-bar-indicator" />
          </div>
        )}

        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 bg-white text-center">
            <p className="text-sm text-rose-500 font-medium">Failed to load blog articles.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="h-9 px-4 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              Try again
            </button>
          </div>
        ) : (
          <BlogTable
            blogs={blogs}
            canDelete={canDelete}
            onEditBlog={(blog) => setFormTarget({ id: blog.id })}
            onDeleteBlog={handleDeleteBlog}
            sortField={sortField}
            sortOrder={sortOrder}
            onHeaderClick={handleSortChange}
            currentPage={currentPage}
            totalPages={Math.max(totalPages, 1)}
            totalRows={totalRows}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        )}
      </div>

      <BlogFormModal
        isOpen={Boolean(formTarget)}
        blogId={formTarget?.id || null}
        onClose={() => setFormTarget(null)}
        onSaved={(saved, wasCreate) => {
          if (wasCreate) updateQuery({ page: "" });
        }}
      />
    </div>
  );
}
