"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Search, Check, ChevronDown, User } from "lucide-react";
import { toast } from "sonner";
import { tenureAssignmentSchema } from "@/lib/Schema/memberSchema";
import {
  useMembersList,
  useCreateMembership,
  useUpdateMembership,
} from "@/hooks/useMembers";
import { parseServerError } from "@/lib/errorUtils";

const EXECUTIVE_POSTS = [
  "President",
  "Vice President",
  "Secretary",
  "Joint Secretary",
  "Treasurer",
  "Executive Member",
];

const ADVISOR_POSTS = [
  "Advisor",
  "Senior Advisor",
  "Technical Advisor",
  "Faculty Advisor",
];

function TenureAssignmentModalContent({
  initialData = null,
  tenure,
  onSubmitSuccess,
  onCancel,
}) {
  const { data: members = [], isLoading: membersLoading } = useMembersList();
  const createMembershipMutation = useCreateMembership();
  const updateMembershipMutation = useUpdateMembership();

  const isSubmitting =
    createMembershipMutation.isPending || updateMembershipMutation.isPending;

  const [formData, setFormData] = useState({
    memberId: initialData?.memberId || initialData?.id || "",
    role_type: initialData?.roleType || initialData?.role_type || "EXECUTIVE",
    designation: initialData?.post || initialData?.designation || "",
    order: initialData?.order ?? 99,
    status: initialData?.status || "published",
  });

  const [errors, setErrors] = useState({});
  const [memberSearch, setMemberSearch] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const comboboxRef = useRef(null);

  const [designationOpen, setDesignationOpen] = useState(false);
  const designationRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });

  const updateDropdownPosition = useCallback(() => {
    if (!designationRef.current) return;
    const rect = designationRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = 220;
    const openUpward = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

    setDropdownPosition({
      top: openUpward ? rect.top - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openUpward,
    });
  }, []);

  const openDesignationDropdown = useCallback(() => {
    updateDropdownPosition();
    setDesignationOpen(true);
  }, [updateDropdownPosition]);

  // Lock background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Update dropdown position on resize or scroll
  useEffect(() => {
    if (!designationOpen) return;
    updateDropdownPosition();

    function handleScrollOrResize() {
      updateDropdownPosition();
    }

    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [designationOpen, updateDropdownPosition]);

  // Close combobox & designation dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target)) {
        setComboboxOpen(false);
      }
      if (
        designationRef.current &&
        !designationRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setDesignationOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setComboboxOpen(false);
        setDesignationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectedMember = useMemo(() => {
    if (!formData.memberId) return null;
    return members.find((m) => String(m.id) === String(formData.memberId));
  }, [members, formData.memberId]);

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.slug?.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRoleTypeChange = (e) => {
    const newRole = e.target.value;
    setFormData((prev) => {
      const wasExecutive = prev.role_type === "EXECUTIVE";
      const isOtherPreset = wasExecutive
        ? EXECUTIVE_POSTS.includes(prev.designation)
        : ADVISOR_POSTS.includes(prev.designation);

      const defaultForNew = newRole === "EXECUTIVE" ? "Executive Member" : "Advisor";

      return {
        ...prev,
        role_type: newRole,
        designation: isOtherPreset ? defaultForNew : prev.designation,
      };
    });
    if (errors.role_type) {
      setErrors((prev) => ({ ...prev, role_type: undefined }));
    }
  };

  const currentPostSuggestions = useMemo(() => {
    return formData.role_type === "ADVISOR" ? ADVISOR_POSTS : EXECUTIVE_POSTS;
  }, [formData.role_type]);

  const handleSelectMember = (member) => {
    setFormData((prev) => ({ ...prev, memberId: member.id }));
    setComboboxOpen(false);
    if (errors.memberId) {
      setErrors((prev) => ({ ...prev, memberId: undefined }));
    }
  };

  const handleSubmitWithStatus = async (targetStatus) => {
    setErrors({});

    const submitData = {
      ...formData,
      status: targetStatus,
    };

    const result = tenureAssignmentSchema.safeParse(submitData);
    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (!formattedErrors[fieldName]) {
          formattedErrors[fieldName] = issue.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    if (!tenure?.slug) {
      toast.error("Tenure context is missing.");
      return;
    }

    const payload = {
      member_id: Number(submitData.memberId),
      tenure: tenure.slug,
      role_type: submitData.role_type,
      designation: submitData.designation.trim(),
      order: Number(submitData.order) || 99,
      status: targetStatus,
    };

    try {
      const isEdit = !!(initialData?.membershipId || initialData?.id);
      const membershipPk = initialData?.membershipId || initialData?.id;

      if (isEdit && membershipPk) {
        await updateMembershipMutation.mutateAsync({
          id: membershipPk,
          data: payload,
        });
        toast.success(
          targetStatus === "draft"
            ? "Assignment saved as draft."
            : "Assignment updated successfully."
        );
      } else {
        await createMembershipMutation.mutateAsync(payload);
        toast.success(
          targetStatus === "draft"
            ? "Assignment saved as draft."
            : "Member assigned to tenure successfully."
        );
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      const errorMsg = parseServerError(err);
      toast.error(errorMsg || "Failed to assign member to tenure.");
    }
  };

  const inputBase =
    "w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all text-xs bg-white";
  const inputNormal = `${inputBase} border-slate-200 focus:ring-indigo-500`;
  const inputError = `${inputBase} border-rose-400 focus:ring-rose-500`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      />

      <div className="relative bg-white w-full max-w-2xl rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 z-10 text-xs">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <div className="font-semibold text-lg text-[#0b2574]">
              {initialData ? "Edit Tenure Assignment" : "Assign Member to Tenure"}
            </div>
            {tenure?.name && (
              <p className="text-[11px] text-slate-500 font-medium">
                Academic Tenure: <span className="text-slate-800 font-semibold">{tenure.name}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitWithStatus(formData.status || "published");
          }}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-6 sm:p-7 overflow-y-auto space-y-5 flex-1">
            {/* Searchable Member Combobox */}
            <div className="space-y-1.5" ref={comboboxRef}>
              <label className="font-semibold text-slate-700">Select Member *</label>

              {/* Combobox Trigger */}
              <div
                onClick={() => setComboboxOpen((prev) => !prev)}
                className={`w-full min-h-[42px] px-3 py-1.5 border rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all bg-white ${
                  errors.memberId
                    ? "border-rose-400 ring-1 ring-rose-500"
                    : comboboxOpen
                      ? "border-indigo-500 ring-1 ring-indigo-500"
                      : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {selectedMember ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {selectedMember.image ? (
                        <img
                          src={selectedMember.image}
                          alt={selectedMember.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate text-xs">
                        {selectedMember.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate font-mono">
                        {selectedMember.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">
                    {membersLoading ? "Loading members..." : "Choose an existing master member..."}
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    comboboxOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Dropdown Popover */}
              {comboboxOpen && (
                <div className="absolute left-6 right-6 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100 max-h-60 flex flex-col">
                  {/* Search bar inside combobox */}
                  <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        placeholder="Search member by name, email, slug..."
                        className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Member List */}
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                    {filteredMembers.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        No members matching &quot;{memberSearch}&quot;.
                      </div>
                    ) : (
                      filteredMembers.map((member) => {
                        const isSelected = String(member.id) === String(formData.memberId);
                        return (
                          <div
                            key={member.id}
                            onClick={() => handleSelectMember(member)}
                            className={`p-2.5 flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-indigo-50/60 text-indigo-900"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {member.image ? (
                                  <img
                                    src={member.image}
                                    alt={member.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <User className="h-3.5 w-3.5 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-xs truncate">{member.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono truncate">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-indigo-600 shrink-0" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {errors.memberId && (
                <p className="text-rose-500 text-[11px] font-medium">{errors.memberId}</p>
              )}
            </div>

            {/* Role Type & Hierarchy Order Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role Type */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Role Type *</label>
                <select
                  name="role_type"
                  value={formData.role_type}
                  onChange={handleRoleTypeChange}
                  className={`${errors.role_type ? inputError : inputNormal} cursor-pointer`}
                >
                  <option value="EXECUTIVE">Executive Board</option>
                  <option value="ADVISOR">Advisor</option>
                </select>
                {errors.role_type && (
                  <p className="text-rose-500 text-[11px] font-medium">{errors.role_type}</p>
                )}
              </div>

              {/* Hierarchy Order */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Hierarchy Order *</label>
                <input
                  name="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="e.g., 1, 2, 3..."
                  className={errors.order ? inputError : inputNormal}
                />
                {errors.order && (
                  <p className="text-rose-500 text-[11px] font-medium">{errors.order}</p>
                )}
              </div>
            </div>

            {/* Designation / Post with Custom Dropdown Trigger */}
            <div className="space-y-1.5" ref={designationRef}>
              <label className="font-semibold text-slate-700">Designation / Post *</label>
              <div className="relative">
                <input
                  name="designation"
                  type="text"
                  autoComplete="off"
                  value={formData.designation}
                  onFocus={openDesignationDropdown}
                  onClick={openDesignationDropdown}
                  onChange={(e) => {
                    handleInputChange(e);
                    openDesignationDropdown();
                  }}
                  placeholder={
                    formData.role_type === "ADVISOR"
                      ? "e.g., Senior Advisor, Technical Advisor"
                      : "e.g., President, Vice President, Secretary"
                  }
                  className={`${errors.designation ? inputError : inputNormal} pr-9`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    if (designationOpen) {
                      setDesignationOpen(false);
                    } else {
                      openDesignationDropdown();
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label="Toggle suggestions"
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      designationOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <p className="text-[10px] text-slate-400">
                Choose a suggested title from the dropdown or type a custom designation.
              </p>
              {errors.designation && (
                <p className="text-rose-500 text-[11px] font-medium">{errors.designation}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/40 shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancel}
              className="h-9 w-full sm:w-auto px-4 order-2 sm:order-1 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm transition-all"
            >
              Cancel
            </button>

            <div className="grid grid-cols-2 gap-2.5 w-full order-1 sm:order-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitWithStatus("draft")}
                className="h-9 w-full sm:w-auto px-2 sm:px-4 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm transition-all text-center flex items-center justify-center"
              >
                Save as Draft
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-9 w-full sm:w-auto px-2 sm:px-5 text-xs font-semibold bg-[#0b2574] hover:bg-[#0b2574]/90 text-white rounded-lg cursor-pointer shadow-sm transition-all flex items-center justify-center text-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    <span>{initialData ? "Updating..." : "Assigning..."}</span>
                  </>
                ) : initialData ? (
                  initialData.status === "draft" ? "Publish Assignment" : "Update Assignment"
                ) : (
                  "Assign Member"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Floating Custom Designation Dropdown Portal rendered outside modal scroll container */}
      {designationOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: dropdownPosition.openUpward ? undefined : dropdownPosition.top,
              bottom: dropdownPosition.openUpward
                ? window.innerHeight - dropdownPosition.top
                : undefined,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
            className="bg-white border border-slate-200 rounded-xl shadow-2xl z-[99999] overflow-hidden py-1 max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-100 text-xs"
          >
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100">
              Suggested {formData.role_type === "ADVISOR" ? "Advisor" : "Executive"} Posts
            </div>
            {currentPostSuggestions.map((post) => {
              const isSelected = formData.designation === post;
              return (
                <div
                  key={post}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, designation: post }));
                    setDesignationOpen(false);
                    if (errors.designation) {
                      setErrors((prev) => ({ ...prev, designation: undefined }));
                    }
                  }}
                  className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? "bg-indigo-50/80 text-indigo-900 font-medium"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>{post}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}

export function TenureAssignmentModal(props) {
  if (!props.isOpen) return null;
  const key = props.initialData
    ? `${props.initialData.membershipId || props.initialData.id || "edit"}`
    : "new-assignment";
  return <TenureAssignmentModalContent key={key} {...props} />;
}
