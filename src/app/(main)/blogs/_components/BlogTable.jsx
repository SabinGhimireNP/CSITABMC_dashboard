"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowUpDown, Image as ImageIcon, MoreHorizontal, Pencil, Trash2, User } from "lucide-react";
import { Pagination } from "@/components/common/pagination";
import { BlogDeleteDialog } from "./BlogDeleteDialog";
import { formatDate } from "./blogUtils";

const STATUS_STYLES = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  draft: "bg-amber-50 text-amber-700 border-amber-200/60",
};

const MENU_WIDTH = 128; // w-32

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
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [blogToDelete, setBlogToDelete] = useState(null);
  const buttonRefs = useRef({});

  // Close on outside click/tap, Escape, or any scroll
  useEffect(() => {
    if (!activeMenuId) return;
    function handleClose() { setActiveMenuId(null); }
    function handleKeyDown(e) { if (e.key === "Escape") setActiveMenuId(null); }
    document.addEventListener("mousedown", handleClose);
    document.addEventListener("touchstart", handleClose);
    document.addEventListener("scroll", handleClose, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("touchstart", handleClose);
      document.removeEventListener("scroll", handleClose, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMenuId]);

  const handleMenuToggle = useCallback((e, blogId) => {
    e.stopPropagation();
    if (activeMenuId === blogId) { setActiveMenuId(null); return; }
    const btn = buttonRefs.current[blogId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      // Right-align with the trigger, but keep the menu inside the viewport on small screens
      const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: left + window.scrollX,
      });
    }
    setActiveMenuId(blogId);
  }, [activeMenuId]);

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    if (sortOrder === "asc") return <span className="text-indigo-600 font-bold text-[11px]">&uarr;</span>;
    if (sortOrder === "desc") return <span className="text-indigo-600 font-bold text-[11px]">&darr;</span>;
    return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
  };

  const sortableHeader = (field, label, className) => (
    <th
      className={`py-3 px-4 cursor-pointer hover:bg-slate-100/50 transition-colors ${className}`}
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

  // Portal dropdown — escapes overflow:hidden on the table wrapper
  const renderDropdownMenu = (blog) =>
    createPortal(
      <div
        role="menu"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{ position: "absolute", top: menuPosition.top, left: menuPosition.left }}
        className="w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-9999 animate-in fade-in slide-in-from-top-1 duration-100"
      >
        <button type="button" role="menuitem"
          onClick={() => { onEditBlog(blog); setActiveMenuId(null); }}
          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-400" /> Edit
        </button>
        {canDelete && (
          <button type="button" role="menuitem"
            onClick={() => { setBlogToDelete(blog); setActiveMenuId(null); }}
            className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors flex items-center gap-2 border-t border-slate-100/80 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-400" /> Delete
          </button>
        )}
      </div>,
      document.body
    );

  return (
    <div className="w-full flex flex-col">
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-275 table-fixed">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-semibold text-xs select-none">
              {sortableHeader("id", "ID", "w-[9%]")}
              {sortableHeader("title", "Article", "w-[29%]")}
              <th className="py-3 px-4 w-[14%]">Author</th>
              <th className="py-3 px-4 w-[10%]">Status</th>
              {sortableHeader("created_at", "Created", "w-[11%]")}
              {sortableHeader("published_at", "Published", "w-[11%]")}
              {sortableHeader("updated_at", "Updated", "w-[10%]")}
              <th className="py-3 px-4 text-right pr-6 w-[6%]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {blogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-medium bg-white">
                  No matching blog articles found.
                </td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-slate-50/40 transition-colors group h-16 bg-white">
                  <td className="py-2 px-4 font-semibold text-slate-900 font-mono tabular-nums truncate">
                    {blog.reference}
                  </td>

                  <td className="py-2 px-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center">
                        {blog.featuredImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={blog.featuredImageUrl}
                            alt={blog.featuredImageAlt || ""}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onEditBlog(blog)}
                          className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block truncate max-w-full text-left cursor-pointer"
                          title={blog.title}
                        >
                          {blog.title}
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono truncate block" title={blog.slug}>
                          /blogs/{blog.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-4">
                    {blog.author ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {blog.author.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={blog.author.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-3 w-3 text-slate-400" />
                          )}
                        </div>
                        <span className="font-medium text-slate-700 truncate" title={blog.author.name}>
                          {blog.author.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-2 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        STATUS_STYLES[blog.status] || "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {(blog.status || "draft").toUpperCase()}
                    </span>
                  </td>

                  <td className="py-2 px-4 text-slate-500 tabular-nums truncate">{formatDate(blog.createdAt)}</td>
                  <td className="py-2 px-4 text-slate-500 tabular-nums truncate">{formatDate(blog.publishedAt)}</td>
                  <td className="py-2 px-4 text-slate-500 tabular-nums truncate">{formatDate(blog.updatedAt)}</td>

                  <td className="py-2 px-4 text-right pr-6">
                    <button
                      ref={(el) => (buttonRefs.current[blog.id] = el)}
                      type="button"
                      aria-label={`Actions for ${blog.title}`}
                      aria-haspopup="menu"
                      aria-expanded={activeMenuId === blog.id}
                      onClick={(e) => handleMenuToggle(e, blog.id)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        activeMenuId === blog.id
                          ? "bg-slate-100 text-slate-800"
                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <MoreHorizontal className="h-4 w-4 stroke-[2.3]" />
                    </button>

                    {activeMenuId === blog.id && renderDropdownMenu(blog)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200/80 bg-slate-50/30">
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
