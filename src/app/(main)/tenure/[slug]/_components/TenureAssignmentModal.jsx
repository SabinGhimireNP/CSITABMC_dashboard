"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { tenureAssignmentSchema } from "@/lib/Schema/memberSchema";
import {
  useMembersList,
  useCreateMembership,
  useUpdateMembership,
} from "@/hooks/useMembers";
import { parseServerError } from "@/lib/errorUtils";
import { MemberSearchCombobox } from "@/components/common/MemberSearchCombobox";
import {
  DesignationSelectPortal,
  EXECUTIVE_POSTS,
  ADVISOR_POSTS,
} from "./DesignationSelectPortal";
import { MODAL_OVERLAY_CLASS, modalPanelClass } from "@/components/common/ModalShell";

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

  // Lock background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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

  const handleSelectMember = (member) => {
    setFormData((prev) => ({ ...prev, memberId: member.id }));
    if (errors.memberId) {
      setErrors((prev) => ({ ...prev, memberId: undefined }));
    }
  };

  const handleDesignationChange = (newDesignation) => {
    setFormData((prev) => ({ ...prev, designation: newDesignation }));
    if (errors.designation) {
      setErrors((prev) => ({ ...prev, designation: undefined }));
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

    const payload = {
      member_id: submitData.memberId,
      tenure: tenure.slug,
      designation: submitData.designation.trim(),
      role_type: submitData.role_type,
      order: Number(submitData.order),
      status: targetStatus,
    };

    try {
      const membershipId = initialData?.membershipId || (initialData?.post ? initialData?.id : null);
      if (membershipId) {
        await updateMembershipMutation.mutateAsync({
          id: membershipId,
          membershipId,
          data: payload,
        });
        toast.success(
          targetStatus === "draft"
            ? "Assignment saved as draft."
            : "Tenure assignment updated successfully."
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
    "w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all text-xs bg-background text-foreground placeholder:text-muted-foreground";
  const inputNormal = `${inputBase} border-input focus:ring-primary`;
  const inputError = `${inputBase} border-destructive focus:ring-destructive`;

  return (
    <div className={MODAL_OVERLAY_CLASS}>
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      />

      <div className={modalPanelClass("max-w-2xl")}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/80 dark:border-white/10 flex items-center justify-between bg-muted/40 dark:bg-[#16181e] shrink-0">
          <div>
            <div className="font-semibold text-lg text-foreground">
              {initialData ? "Edit Tenure Assignment" : "Assign Member to Tenure"}
            </div>
            {tenure?.name && (
              <p className="text-[11px] text-muted-foreground font-medium">
                Academic Tenure: <span className="text-foreground font-semibold">{tenure.name}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
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
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="p-4 sm:p-7 overflow-y-auto min-h-0 space-y-5 flex-1">
            {/* Searchable Member Combobox */}
            <MemberSearchCombobox
              members={members}
              selectedMemberId={formData.memberId}
              onSelectMember={handleSelectMember}
              isLoading={membersLoading}
              error={errors.memberId}
            />

            {/* Role Type & Hierarchy Order Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role Type */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-xs">Role Type *</label>
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
                  <p className="text-destructive text-[11px] font-medium">{errors.role_type}</p>
                )}
              </div>

              {/* Hierarchy Order */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-xs">Hierarchy Order *</label>
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
                  <p className="text-destructive text-[11px] font-medium">{errors.order}</p>
                )}
              </div>
            </div>

            {/* Designation / Post with Floating Portal Dropdown */}
            <DesignationSelectPortal
              value={formData.designation}
              onChange={handleDesignationChange}
              roleType={formData.role_type}
              error={errors.designation}
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted/40 dark:bg-[#16181e] shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancel}
              className="h-9 w-full sm:w-auto px-4 order-2 sm:order-1 text-xs font-semibold border border-border text-foreground bg-card dark:bg-[#1f232b] rounded-lg hover:bg-muted/50 cursor-pointer shadow-2xs transition-all"
            >
              Cancel
            </button>

            <div className="grid grid-cols-2 gap-2.5 w-full order-1 sm:order-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitWithStatus("draft")}
                className="h-9 w-full sm:w-auto px-2 sm:px-4 text-xs font-semibold border border-border text-foreground bg-card dark:bg-[#1f232b] rounded-lg hover:bg-muted/50 cursor-pointer shadow-2xs transition-all text-center flex items-center justify-center"
              >
                Save as Draft
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-9 w-full sm:w-auto px-2 sm:px-5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cursor-pointer shadow-2xs transition-all flex items-center justify-center text-center gap-1.5"
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
