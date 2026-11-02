"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Upload } from "lucide-react";
import { tenureFormSchema } from "@/lib/Schema/memberSchema";
import { MODAL_OVERLAY_CLASS, modalPanelClass } from "@/components/common/ModalShell";

function TenureFormModalContent({ initialData, onSubmitSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    signature: initialData?.signature || undefined,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [fileMeta, setFileMeta] = useState({
    preview: initialData?.signature || null,
    name: initialData?.signature ? "Signature Image" : "",
  });

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

  const inputBase = "w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all text-xs bg-background text-foreground placeholder:text-muted-foreground";
  const inputNormal = `${inputBase} border-input focus:ring-primary`;
  const inputError = `${inputBase} border-destructive focus:ring-destructive`;

  return (
    <div className={MODAL_OVERLAY_CLASS}>
      <div onClick={onCancel} className="absolute inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200" />

      <div className={modalPanelClass("max-w-lg")}>
        {/* Header */}
        <div className="p-4 border-b border-border/80 dark:border-white/10 flex items-center justify-between gap-3 bg-muted/40 dark:bg-[#16181e] shrink-0">
          <div className="font-semibold text-lg text-foreground">
            {initialData ? "Edit Tenure" : "Create Tenure"}
          </div>
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer">
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-5 flex-1 min-h-0 overflow-y-auto">
            {/* Tenure Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground text-xs">Tenure Name *</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., 2025-2026"
                className={errors.name ? inputError : inputNormal}
              />
              {errors.name && <p className="text-destructive text-[11px] font-medium">{errors.name}</p>}
            </div>

            {/* Start Date + End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-xs">Start Date *</label>
                <input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? inputError : inputNormal}
                />
                {errors.startDate && <p className="text-destructive text-[11px] font-medium">{errors.startDate}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground text-xs">End Date *</label>
                <input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? inputError : inputNormal}
                />
                {errors.endDate && <p className="text-destructive text-[11px] font-medium">{errors.endDate}</p>}
              </div>
            </div>

            {/* Signature Upload */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                <label className="font-semibold text-foreground text-xs">President Signature</label>
                <span className="text-[10px] text-muted-foreground font-medium">Optional · JPG, PNG, WEBP · Max 5MB</span>
              </div>

              <input
                type="file"
                id="signature-upload"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />

              {fileMeta.preview ? (
                /* Preview state — signature on a card background */
                <div className="relative rounded-xl border border-border bg-card dark:bg-[#1f232b] overflow-hidden group">
                  <div className="absolute inset-x-0 bottom-8 h-px bg-border/70" />
                  <div className="py-5 px-6 flex items-end justify-center min-h-[88px] bg-background/50">
                    <img
                      src={fileMeta.preview}
                      alt="Signature preview"
                      className="max-h-14 max-w-full object-contain select-none"
                      style={{ filter: "contrast(1.1)" }}
                    />
                  </div>
                  {/* File name strip */}
                  <div className="border-t border-border px-4 py-2 flex items-center justify-between bg-muted/40 dark:bg-[#16181e]">
                    <span className="text-[10px] text-muted-foreground truncate max-w-[calc(100%-2rem)]">
                      {fileMeta.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <label
                        htmlFor="signature-upload"
                        className="text-[10px] text-primary font-semibold hover:underline cursor-pointer transition-colors"
                      >
                        Replace
                      </label>
                      <span className="text-muted-foreground">·</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-[10px] text-destructive font-semibold hover:underline cursor-pointer transition-colors"
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
                  className={`flex flex-col items-center justify-center gap-2.5 w-full min-h-[88px] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-primary hover:bg-primary/5 group ${
                    errors.signature
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-muted/20"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    errors.signature ? "bg-destructive/20" : "bg-muted group-hover:bg-primary/20"
                  }`}>
                    <Upload className={`h-3.5 w-3.5 transition-colors ${
                      errors.signature ? "text-destructive" : "text-muted-foreground group-hover:text-primary"
                    }`} />
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-semibold transition-colors ${
                      errors.signature ? "text-destructive" : "text-foreground group-hover:text-primary"
                    }`}>
                      Click to upload signature
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Transparent PNG recommended for best results
                    </p>
                  </div>
                </label>
              )}

              {errors.signature && (
                <p className="text-destructive text-[11px] font-medium flex items-center gap-1">
                  {errors.signature}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 p-4 border-t border-border/80 dark:border-white/10 bg-muted/40 dark:bg-[#16181e] shrink-0">
            <button type="button" disabled={submitting} onClick={onCancel}
              className="h-9 px-4 text-xs font-semibold border border-border text-foreground bg-card dark:bg-[#1f232b] rounded-lg hover:bg-muted/50 transition-all cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="h-9 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
            >
              {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {initialData ? "Updating" : "Adding"}</> : (initialData ? "Update Tenure" : "Create Tenure")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TenureFormModal({ isOpen, initialData = null, onSubmitSuccess, onCancel }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <TenureFormModalContent
      key={initialData?.id ? String(initialData.id) : "new-tenure"}
      initialData={initialData}
      onSubmitSuccess={onSubmitSuccess}
      onCancel={onCancel}
    />
  );
}