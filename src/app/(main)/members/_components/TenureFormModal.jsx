"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { tenureFormSchema } from "@/lib/Schema/memberSchema";

export function TenureFormModal({ isOpen, initialData = null, onSubmitSuccess, onCancel }) {
  const [formData, setFormData] = useState({ name: "", startDate: "", endDate: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || "",
        startDate: initialData?.startDate || "",
        endDate: initialData?.endDate || "",
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const result = tenureFormSchema.safeParse(formData);
    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (!formattedErrors[fieldName]) {
          formattedErrors[fieldName] = issue.message;
        }
      });
      setErrors(formattedErrors);
      setSubmitting(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (onSubmitSuccess) onSubmitSuccess(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase = "w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all text-xs bg-white";
  const inputNormal = `${inputBase} border-slate-200 focus:ring-indigo-500`;
  const inputError = `${inputBase} border-rose-400 focus:ring-rose-500`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div onClick={onCancel} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" />

      <div className="relative bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 z-10 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="font-semibold text-lg text-[#0b2574]">
            {initialData ? "Edit Tenure" : "Create Tenure"}
          </div>
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tenure Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Tenure Name *</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., 2025-2026"
              className={errors.name ? inputError : inputNormal}
            />
            {errors.name && <p className="text-rose-500 text-[11px] font-medium">{errors.name}</p>}
          </div>

          {/* Start Date + End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Start Date *</label>
              <input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? inputError : inputNormal}
              />
              {errors.startDate && <p className="text-rose-500 text-[11px] font-medium">{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">End Date *</label>
              <input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                className={errors.endDate ? inputError : inputNormal}
              />
              {errors.endDate && <p className="text-rose-500 text-[11px] font-medium">{errors.endDate}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100/80">
            <button type="button" disabled={submitting} onClick={onCancel}
              className="h-9 px-4 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="h-9 px-4 text-xs font-semibold bg-[#0b2574] hover:bg-[#0b2574]/90 text-white rounded-lg cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</> : (initialData ? "Update Tenure" : "Create Tenure")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}