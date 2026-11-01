"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  User,
  ExternalLink,
} from "lucide-react";
import { FaFacebook, FaLinkedin, FaGithub } from "react-icons/fa";
import { Pagination } from "@/components/common/pagination";
import { MemberDeleteDialog } from "./MemberDeleteDialog";

export function MembersTable({
  members = [],
  onDeleteMember,
  onEditMember,
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
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const buttonRefs = useRef({});

  // Close dropdown on outside click or scroll
  useEffect(() => {
    if (!activeMenuId) return;
    function handleClose() {
      setActiveMenuId(null);
    }
    document.addEventListener("mousedown", handleClose);
    document.addEventListener("scroll", handleClose, true);
    return () => {
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("scroll", handleClose, true);
    };
  }, [activeMenuId]);

  const handleMenuToggle = useCallback((e, memberId) => {
    e.stopPropagation();
    if (activeMenuId === memberId) {
      setActiveMenuId(null);
      return;
    }
    const btn = buttonRefs.current[memberId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 128, // 128 = w-32
      });
    }
    setActiveMenuId(memberId);
  }, [activeMenuId]);

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    }
    if (sortOrder === "asc") {
      return <span className="text-indigo-600 font-bold text-[11px]">&uarr;</span>;
    }
    if (sortOrder === "desc") {
      return <span className="text-indigo-600 font-bold text-[11px]">&darr;</span>;
    }
    return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
  };

  const handleConfirmDelete = async () => {
    if (memberToDelete) {
      setIsDeleting(true);
      try {
        await onDeleteMember(memberToDelete.slug || memberToDelete.id);
        setMemberToDelete(null);
      } catch (err) {
        console.error("Failed to delete member:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const renderDropdownMenu = (member) => {
    if (typeof document === "undefined") return null;
    return createPortal(
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ position: "absolute", top: menuPosition.top, left: menuPosition.left }}
        className="w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-99999 animate-in fade-in slide-in-from-top-1 duration-100"
      >
        <button
          type="button"
          onClick={() => {
            setActiveMenuId(null);
            onEditMember(member);
          }}
          className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-500" />
          Edit
        </button>
        <div className="h-px bg-slate-100 my-1" />
        <button
          type="button"
          onClick={() => {
            setActiveMenuId(null);
            setMemberToDelete(member);
          }}
          className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
          Delete
        </button>
      </div>,
      document.body
    );
  };


  return (
    <>
      <div className="w-full bg-card rounded-sm border border-slate-200/90 shadow-2xs overflow-hidden select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50 text-slate-500 font-semibold tracking-tight">
                <th
                  onClick={() => onHeaderClick && onHeaderClick("id")}
                  className="py-3 px-4 w-20 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    ID
                    {renderSortIndicator("id")}
                  </div>
                </th>
                <th
                  onClick={() => onHeaderClick && onHeaderClick("name")}
                  className="py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Member Name
                    {renderSortIndicator("name")}
                  </div>
                </th>
                <th
                  onClick={() => onHeaderClick && onHeaderClick("email")}
                  className="py-3 px-4 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Email
                    {renderSortIndicator("email")}
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-slate-700 w-24 text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-slate-700">Social Links</th>
                <th className="py-3 px-4 text-center font-semibold text-slate-700 w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <User className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    No members found.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  return (
                    <tr
                      key={member.id || member.slug}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px] font-medium">
                        {member.id ?? "—"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {member.name}
                            </span>
                            {member.slug && (
                              <p className="text-[10px] text-slate-400 font-mono">@{member.slug}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {member.email || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            member.status === "draft"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {member.status === "draft" ? "Draft" : "Published"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {member.fb_link || member.facebookLink ? (
                            <a
                              href={member.fb_link || member.facebookLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Facebook Profile"
                              title="Facebook"
                              className="text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <FaFacebook className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                          {member.linkedin_link || member.linkedinLink ? (
                            <a
                              href={member.linkedin_link || member.linkedinLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="LinkedIn Profile"
                              title="LinkedIn"
                              className="text-slate-400 hover:text-blue-700 transition-colors"
                            >
                              <FaLinkedin className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                          {member.github_link || member.githubLink ? (
                            <a
                              href={member.github_link || member.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="GitHub Profile"
                              title="GitHub"
                              className="text-slate-400 hover:text-slate-900 transition-colors"
                            >
                              <FaGithub className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                          {!member.fb_link &&
                            !member.facebookLink &&
                            !member.linkedin_link &&
                            !member.linkedinLink &&
                            !member.github_link &&
                            !member.githubLink && (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          ref={(el) => {
                            buttonRefs.current[member.id] = el;
                          }}
                          onClick={(e) => handleMenuToggle(e, member.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {activeMenuId === member.id && renderDropdownMenu(member)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalRows > 0 && (
          <div className="border-t border-slate-200/80 px-4 py-3 bg-slate-50/30">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRows={totalRows}
              rowsPerPage={rowsPerPage}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          </div>
        )}
      </div>

      <MemberDeleteDialog
        member={memberToDelete}
        isDeleting={isDeleting}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
