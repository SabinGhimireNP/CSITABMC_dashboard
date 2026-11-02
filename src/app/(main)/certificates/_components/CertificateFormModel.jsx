"use client";

import React, { useState, useEffect } from "react";
import { certificateSchema } from "@/lib/Schema/certificateSchema";
import { Loader2, X } from "lucide-react";
import { MODAL_OVERLAY_CLASS, modalPanelClass } from "@/components/common/ModalShell";

export function CertificateFormModal(props) {
  if (!props.isOpen) return null;
  const key = props.initialData?.id || "new-certificate";
  return <CertificateFormModalContent key={key} {...props} />;
}

function CertificateFormModalContent({
  initialData = null,
  isOpen,
  eventsList = [],
  onSubmitSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState(() => ({
    event: initialData?.event ?? "",
    fullName: initialData?.fullName || "",
    isProjectComplete: initialData?.isProjectComplete ?? false,
  }));

  const [errors, setErrors] = useState({});
  const [submitType, setSubmitType] = useState(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitType("save");
    setErrors({});

    // Coerce event id to number before validating
    const dataToValidate = {
      ...formData,
      event: formData.event !== "" ? Number(formData.event) : "",
    };

    const result = certificateSchema.safeParse(dataToValidate);

    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        const pathKey = issue.path[0];
        if (!formattedErrors[pathKey]) formattedErrors[pathKey] = issue.message;
      });
      setErrors(formattedErrors);
      setSubmitType(null);
      return;
    }

    try {
      if (onSubmitSuccess) await onSubmitSuccess(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitType(null);
    }
  };

  return (
    <div className={MODAL_OVERLAY_CLASS}>
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      />

      <div className={modalPanelClass("max-w-lg")}>
        {/* Header */}
        <div className="p-4 border-b border-border/80 dark:border-white/10 flex items-center justify-between bg-muted/40 dark:bg-[#16181e]">
          <div className="font-semibold text-lg text-foreground">
            {initialData ? "Edit Certificate" : "Issue Certificate"}
          </div>
          <button type="button" onClick={onCancel}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto min-h-0 space-y-5 flex-1 w-full text-foreground">
          {/* Full Name */}
          <div className="space-y-1.5 w-full">
            <label className="font-semibold text-foreground text-xs">Full Name *</label>
            <input
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="e.g., Sujata Gurung"
              className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all bg-background text-foreground text-xs ${
                errors.fullName ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
              }`}
            />
            {errors.fullName && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.fullName}</p>}
          </div>

          {/* Event dropdown */}
          <div className="space-y-1.5 w-full">
            <label className="font-semibold text-foreground text-xs">Event *</label>
            <select
              name="event"
              value={formData.event}
              onChange={handleInputChange}
              className={`w-full h-9 px-2.5 border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                errors.event ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
              }`}
            >
              <option value="">Select an event</option>
              {eventsList.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            {errors.event && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.event}</p>}
          </div>

          {/* Project Complete toggle */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/80 dark:border-white/10 bg-muted/20 w-full">
            <input
              id="isProjectComplete"
              name="isProjectComplete"
              type="checkbox"
              checked={formData.isProjectComplete}
              onChange={handleInputChange}
              className="h-4 w-4 mt-0.5 rounded border-input text-primary focus:ring-primary cursor-pointer shrink-0"
            />
            <div>
              <label htmlFor="isProjectComplete" className="font-semibold text-foreground cursor-pointer select-none">
                Project is complete
              </label>
              <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                Check this if the participant has fully submitted and completed their project for this event.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted/40 dark:bg-[#16181e] w-full shrink-0">
          <button
            type="button"
            disabled={submitType !== null}
            onClick={onCancel}
            className="h-9 w-full sm:w-auto px-4 order-2 sm:order-1 text-xs font-semibold border border-border/80 dark:border-white/12 text-foreground bg-card dark:bg-[#1f232b] rounded-lg hover:bg-muted/50 dark:hover:bg-white/10 cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitType !== null}
            onClick={handleSubmit}
            className="h-9 w-full sm:w-auto px-4 order-1 sm:order-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
          >
            {submitType === "save" ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {initialData ? "Updating" : "Adding"}</>
            ) : (
              initialData ? "Save Changes" : "Issue Certificate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}