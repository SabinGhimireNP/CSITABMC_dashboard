"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, X, User } from "lucide-react";
import { alumniFormSchema } from "@/lib/Schema/alumniSchema";
import { useMembersList } from "@/hooks/useMembers";

function AlumniFormModalContent({
  initialData = null,
  onSubmitSuccess,
  onCancel,
}) {
  const { data: membersList = [], isLoading: membersLoading } = useMembersList();

  const [formData, setFormData] = useState({
    memberId: initialData?.memberId || initialData?.member?.id || "",
    graduationYear: initialData?.graduationYear || "",
  });

  const [errors, setErrors] = useState({});
  const [submitType, setSubmitType] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const selectedMember = useMemo(() => {
    if (!formData.memberId) return null;
    return (membersList || []).find((m) => String(m.id) === String(formData.memberId));
  }, [membersList, formData.memberId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleActionClick = async (e) => {
    e.preventDefault();
    if (submitType !== null) return;

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
      if (onSubmitSuccess) {
        await onSubmitSuccess({
          memberId: result.data.memberId,
          graduationYear: result.data.graduationYear,
        });
      }
    } catch (err) {
      console.error("Failed to save alumni:", err);
    } finally {
      setSubmitType(null);
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
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="font-semibold text-lg text-[#0b2574]">
            {initialData ? "Edit Alumni Profile" : "Add Alumni Profile"}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Row 1: Member + Graduation Year */}
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
                  {membersLoading ? "Loading members..." : "Choose an existing member"}
                </option>
                {(membersList || []).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
              {errors.memberId && (
                <p className="text-rose-500 text-[11px] font-medium">{errors.memberId}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Graduation Year</label>
              <input
                name="graduationYear"
                type="number"
                value={formData.graduationYear}
                onChange={handleInputChange}
                placeholder="e.g., 2024"
                className={inputNormal}
              />
            </div>
          </div>

          {/* Member Profile Preview Card */}
          {selectedMember && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {selectedMember.image ? (
                    <img
                      src={selectedMember.image}
                      alt={selectedMember.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 text-xs truncate">
                      {selectedMember.name}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: #{selectedMember.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    {selectedMember.email}
                  </p>
                </div>
              </div>

              {selectedMember.description ? (
                <div className="text-[11px] text-slate-600 bg-white border border-slate-100 rounded-lg p-2.5 leading-relaxed line-clamp-3">
                  <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wider mb-0.5">
                    Master Member Profile Description
                  </span>
                  {selectedMember.description}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">
                  No profile description recorded on master member record.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/30 shrink-0">
          <button
            type="button"
            disabled={submitType !== null}
            onClick={onCancel}
            className="h-9 w-full sm:w-auto px-4 order-3 sm:order-1 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2 flex-col sm:flex-row">
            <button
              type="button"
              disabled={submitType !== null}
              onClick={handleActionClick}
              className="h-9 w-full sm:w-auto px-4 text-xs font-semibold bg-[#0b2574] hover:bg-[#0b2574]/90 text-white rounded-lg cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              {submitType === "active" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                </>
              ) : initialData ? (
                "Update Alumni"
              ) : (
                "Add Alumni"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlumniFormModal(props) {
  if (!props.isOpen) return null;
  const key = props.initialData?.id ? String(props.initialData.id) : "new-alumni";
  return <AlumniFormModalContent key={key} {...props} />;
}