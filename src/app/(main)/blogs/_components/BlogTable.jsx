"use client";

import React, { useState } from "react";
import { ArrowUpDown, Image as ImageIcon, Pencil, Trash2, User } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { RowActionsMenu } from "@/components/common/RowActionsMenu";
import { ResponsiveRecordList } from "@/components/common/ResponsiveRecordList";
import { BlogDeleteDialog } from "./BlogDeleteDialog";
import { formatDate } from "./blogUtils";
import { usePermission } from "@/hooks/usePermission";

const STATUS_STYLES = {
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  draft: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
      STATUS_STYLES[status] || "bg-muted text-muted-foreground border-border"
    }`}
  >
    {(status || "draft").toUpperCase()}
  </span>
);

const BlogThumb = ({ blog }) => (
  <div className="h-10 w-16 rounded-lg overflow-hidden border border-border bg-muted/40 shrink-0 flex items-center justify-center">
    {blog.featuredImageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={blog.featuredImageUrl}
        alt={blog.featuredImageAlt || ""}
        className="w-full h-full object-cover"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    ) : (
      <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
    )}
  </div>
);

export function BlogTable({
  blogs = [],
  canDelete = false,
  onEditBlog,
  onDeleteBlog,
  sortField,
  sortOrder,
  onHeaderClick,
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) {
  const { can } = usePermission();
  const canEdit = can("blogs.edit");
  const [blogToDelete, setBlogToDelete] = useState(null);

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
    if (sortOrder === "asc") return <span className="text-primary font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-primary font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />;
  };

  const sortableHeader = (field, label, className) => (
    <th
      className={`py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors ${className}`}
      aria-sort={sortField === field ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
    >
      <button type="button" onClick={() => onHeaderClick(field)} className="flex items-center gap-1.5 cursor-pointer">
        {label} {renderSortIndicator(field)}
      </button>
    </th>
  );

  const handleConfirmDelete = () => {
    if (blogToDelete) {
      onDeleteBlog(blogToDelete);
      setBlogToDelete(null);
    }
  };

  const renderActions = (blog) => (
    <RowActionsMenu
      label={`Actions for ${blog.title}`}
      items={[
        { label: "Edit", icon: Pencil, hidden: !canEdit, onClick: () => onEditBlog(blog) },
        { label: "Delete", icon: Trash2, destructive: true, hidden: !canDelete, onClick: () => setBlogToDelete(blog) },
      ]}
    />
  );

  return (
    <div className="w-full flex flex-col">
      {/* Mobile: record cards */}
      <ResponsiveRecordList
        className="md:hidden"
        items={blogs}
        getKey={(b) => b.id}
        emptyText="No matching blog articles found."
        renderLeading={(b) => <BlogThumb blog={b} />}
        renderTitle={(b) => (
          <button type="button" onClick={() => onEditBlog(b)} className="text-left break-words cursor-pointer">
            {b.title}
          </button>
        )}
        renderSubtitle={(b) => b.reference}
        renderBadge={(b) => <StatusBadge status={b.status} />}
        fields={[
          { label: "Author", render: (b) => b.author?.name },
          { label: "Created", render: (b) => formatDate(b.createdAt) },
          { label: "Published", render: (b) => (b.publishedAt ? formatDate(b.publishedAt) : null) },
          { label: "Updated", render: (b) => formatDate(b.updatedAt) },
        ]}
        renderActions={renderActions}
      />

      {/* md+: full table */}
      <div className="hidden md:block w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-240 table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold text-xs select-none">
              {sortableHeader("id", "ID", "w-[9%]")}
              {sortableHeader("title", "Article", "w-[29%]")}
              <th className="py-3 px-4 w-[14%]">Author</th>
              <th className="py-3 px-4 w-[10%]">Status</th>
              {sortableHeader("created_at", "Created", "w-[11%]")}
              {sortableHeader("published_at", "Published", "w-[11%]")}
              {sortableHeader("updated_at", "Updated", "w-[10%]")}
              <th className="py-3 px-4 text-right pr-6 w-[6%] sticky right-0 bg-muted/95 border-b border-border">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-foreground text-xs">
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground font-medium bg-card">
                  No matching blog articles found.
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-muted/40 transition-colors group h-16 bg-card">
                  <td className="py-2 px-4 font-semibold text-foreground font-mono tabular-nums truncate">
                    {blog.reference}
                  </td>

                  <td className="py-2 px-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <BlogThumb blog={blog} />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onEditBlog(blog)}
                          className="font-semibold text-foreground group-hover:text-primary transition-colors block truncate max-w-full text-left cursor-pointer"
                          title={blog.title}
                        >
                          {blog.title}
                        </button>
                        <span className="text-[10px] text-muted-foreground font-mono truncate block" title={blog.slug}>
                          /blogs/{blog.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-4">
                    {blog.author ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded-full bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                          {blog.author.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={blog.author.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-medium text-foreground/80 truncate" title={blog.author.name}>
                          {blog.author.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  <td className="py-2 px-4 whitespace-nowrap">
                    <StatusBadge status={blog.status} />
                  </td>

                  <td className="py-2 px-4 text-muted-foreground tabular-nums truncate">{formatDate(blog.createdAt)}</td>
                  <td className="py-2 px-4 text-muted-foreground tabular-nums truncate">{formatDate(blog.publishedAt)}</td>
                  <td className="py-2 px-4 text-muted-foreground tabular-nums truncate">{formatDate(blog.updatedAt)}</td>

                  <td className="py-2 px-4 text-right pr-6 sticky right-0 bg-card group-hover:bg-muted/40 transition-colors">
                    {renderActions(blog)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border bg-muted/20">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRows={totalRows}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          isEmbedded={true}
        />
      </div>

      <BlogDeleteDialog
        blog={blogToDelete}
        onClose={() => setBlogToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
