"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, X } from "lucide-react";
import { alumniFormSchema } from "@/lib/Schema/alumniSchema";
import { useMembersList, useTenures } from "@/hooks/useMembers";
import { MarkdownEditor } from "@/components/common/MarkdownEditor";

const getDefaultFormData = (initialData, tenuresList) => {
  const selectedTenureIds = initialData?.tenureIds?.length
    ? initialData.tenureIds
    : tenuresList.length > 0
      ? [tenuresList[0].id]
      : [];

  return {
    memberId: initialData?.memberId || "",
    tenureIds: selectedTenureIds,
    graduationYear: initialData?.graduationYear || "",
    bio: initialData?.bio || "",
  };
};

export function AlumniFormModal({
  initialData = null,
  isOpen,
  onSubmitSuccess,
  onCancel,
}) {
  const { data: membersList = [], isLoading: membersLoading } = useMembersList();
  const { data: tenuresData } = useTenures();
  const tenuresList = useMemo(() => {
    if (Array.isArray(tenuresData?.data)) return tenuresData.data;
    if (Array.isArray(tenuresData)) return tenuresData;
    return [];
  }, [tenuresData]);

  const [formData, setFormData] = useState(() => getDefaultFormData(initialData, tenuresList));

  const [errors, setErrors] = useState({});
  const [submitType, setSubmitType] = useState(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleTenureChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, tenureIds: value ? [Number(value)] : [] }));
    if (errors.tenureIds) setErrors((prev) => ({ ...prev, tenureIds: undefined }));
  };

  const handleActionClick = async (e) => {
    e.preventDefault();
    setSubmitType("active");
    setErrors({});

    const result = alumniFormSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (!formattedErrors[fieldName]) {
          formattedErrors[fieldName] = issue.message;
        }
      });
      setErrors(formattedErrors);
      setSubmitType(null);
      return;
    }

    try {
      if (onSubmitSuccess) onSubmitSuccess(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitType(null);
    }
  };

  const inputBase = "w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all text-xs bg-white";
  const inputNormal = `${inputBase} border-slate-200 focus:ring-indigo-500`;
  const inputError = `${inputBase} border-rose-400 focus:ring-rose-500`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div onClick={onCancel} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" />

      <div className="relative bg-white w-full max-w-3xl rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 z-10 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="font-semibold text-lg text-[#0b2574]">
            {initialData ? "Edit Alumni" : "Add Alumni"}
          </div>
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Row 1: Member + Tenure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Member *</label>
              <select
                name="memberId"
                value={formData.memberId}
                onChange={handleInputChange}
                disabled={membersLoading}
                className={`${errors.memberId ? inputError : inputNormal} cursor-pointer`}
              >
                <option value="">
                  {membersLoading ? "Loading members..." : "Choose a member"}
                </option>
                {(membersList || []).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              {errors.memberId && <p className="text-rose-500 text-[11px] font-medium">{errors.memberId}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Tenure *</label>
              <select
                name="tenureIds"
                value={formData.tenureIds[0] ?? ""}
                onChange={handleTenureChange}
                disabled={tenuresList.length === 0}
                className={`${errors.tenureIds ? inputError : inputNormal} cursor-pointer`}
              >
                <option value="">
                  {tenuresList.length === 0 ? "No tenures available" : "Choose a tenure"}
                </option>
                {(tenuresList || []).map((tenure) => (
                  <option key={tenure.id} value={tenure.id}>
                    {tenure.name}
                  </option>
                ))}
              </select>
              {errors.tenureIds && <p className="text-rose-500 text-[11px] font-medium">{errors.tenureIds}</p>}
            </div>
          </div>

          {/* Row 2: Graduation Year */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Graduation Year</label>
            <input name="graduationYear" type="number" value={formData.graduationYear} onChange={handleInputChange} placeholder="e.g., 2024" className={inputNormal} />
          </div>

          {/* Row 3: Bio */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Bio</label>
            <MarkdownEditor
              id="alumni-modal-textarea"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              error={errors.bio}
              placeholder="Write alumni bio, achievements, or role description..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/30 shrink-0">
          <button type="button" disabled={submitType !== null} onClick={onCancel} className="h-9 w-full sm:w-auto px-4 order-3 sm:order-1 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm">Cancel</button>
          <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2 flex-col sm:flex-row">
            <button type="button" disabled={submitType !== null || tenuresList.length === 0} onClick={handleActionClick} className="h-9 w-full sm:w-auto px-4 text-xs font-semibold bg-[#0b2574] hover:bg-[#0b2574]/90 text-white rounded-lg cursor-pointer shadow-sm flex items-center justify-center gap-1.5">
              {submitType === "active" ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</> : (initialData ? "Update Alumni" : "Add Alumni")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}