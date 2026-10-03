"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Upload } from "lucide-react";
import { tenureFormSchema } from "@/lib/Schema/memberSchema";

export function TenureFormModal({ isOpen, initialData = null, onSubmitSuccess, onCancel }) {
  const [formData, setFormData] = useState({ name: "", startDate: "", endDate: "", signature: undefined });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [fileMeta, setFileMeta] = useState({ preview: null, name: "" });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || "",
        startDate: initialData?.startDate || "",
        endDate: initialData?.endDate || "",
        signature: initialData?.signature || undefined,
      });
      setFileMeta({
        preview: initialData?.signature || null,
        name: initialData?.signature ? "Signature Image" : "",
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, signature: "File size exceeds 5MB limit." }));
      return;
    }

    setFormData((prev) => ({ ...prev, signature: file }));
    setFileMeta({ preview: URL.createObjectURL(file), name: file.name });
    if (errors.signature) setErrors((prev) => ({ ...prev, signature: undefined }));
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, signature: null })); // Send null to indicate removal
    setFileMeta({ preview: null, name: "" });
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
      if (onSubmitSuccess) await onSubmitSuccess(result.data);
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

          {/* Signature Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">President Signature</label>
              <span className="text-[10px] text-slate-400 font-medium">Optional · JPG, PNG, WEBP · Max 5MB</span>
            </div>

            <input
              type="file"
              id="signature-upload"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />

            {fileMeta.preview ? (
              /* Preview state — signature on a "paper-like" background */
              <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden group">
                {/* Lined paper feel for signature context */}
                <div className="absolute inset-x-0 bottom-8 h-px bg-slate-200/70" />
                <div className="py-5 px-6 flex items-end justify-center min-h-[88px]">
                  <img
                    src={fileMeta.preview}
                    alt="Signature preview"
                    className="max-h-14 max-w-full object-contain select-none"
                    style={{ filter: "contrast(1.1)" }}
                  />
                </div>
                {/* File name strip */}
                <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/60">
                  <span className="text-[10px] text-slate-500 truncate max-w-[calc(100%-2rem)]">
                    {fileMeta.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <label
                      htmlFor="signature-upload"
                      className="text-[10px] text-indigo-600 font-semibold hover:text-indigo-800 cursor-pointer transition-colors"
                    >
                      Replace
                    </label>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-[10px] text-rose-500 font-semibold hover:text-rose-700 cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty state — clean drag-to-upload zone */
              <label
                htmlFor="signature-upload"
                className={`flex flex-col items-center justify-center gap-2.5 w-full min-h-[88px] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50/30 group ${
                  errors.signature
                    ? "border-rose-300 bg-rose-50/30"
                    : "border-slate-200 bg-slate-50/40"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  errors.signature ? "bg-rose-100" : "bg-slate-100 group-hover:bg-indigo-100"
                }`}>
                  <Upload className={`h-3.5 w-3.5 transition-colors ${
                    errors.signature ? "text-rose-500" : "text-slate-400 group-hover:text-indigo-600"
                  }`} />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-semibold transition-colors ${
                    errors.signature ? "text-rose-600" : "text-slate-600 group-hover:text-indigo-700"
                  }`}>
                    Click to upload signature
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Transparent PNG recommended for best results
                  </p>
                </div>
              </label>
            )}

            {errors.signature && (
              <p className="text-rose-500 text-[11px] font-medium flex items-center gap-1">
                {errors.signature}
              </p>
            )}
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
              {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {initialData ? "Updating" : "Adding"}</> : (initialData ? "Update Tenure" : "Create Tenure")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}