"use client";

import React, { useState, useEffect } from "react";
import { certificateSchema } from "@/lib/Schema/certificateSchema";
import { Loader2, X } from "lucide-react";

export function CertificateFormModal({
  initialData = null,
  isOpen,
  eventsList = [],
  onSubmitSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    event: "",
    fullName: "",
    isProjectComplete: false,
  });

  const [errors, setErrors] = useState({});
  const [submitType, setSubmitType] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        event: initialData?.event ?? "",
        fullName: initialData?.fullName || "",
        isProjectComplete: initialData?.isProjectComplete ?? false,
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
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (onSubmitSuccess) onSubmitSuccess(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      />

      <div className="relative bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in scale-in-95 duration-200 z-10 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="font-semibold text-lg text-primary">
            {initialData ? "Edit Certificate" : "Issue Certificate"}
          </div>
          <button type="button" onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1 w-full">
          {/* Full Name */}
          <div className="space-y-1.5 w-full">
            <label className="font-semibold text-slate-700">Full Name *</label>
            <input
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="e.g., Sujata Gurung"
              className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                errors.fullName ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
              }`}
            />
            {errors.fullName && <p className="text-rose-500 text-[11px] font-medium mt-0.5">{errors.fullName}</p>}
          </div>

          {/* Event dropdown */}
          <div className="space-y-1.5 w-full">
            <label className="font-semibold text-slate-700">Event *</label>
            <select
              name="event"
              value={formData.event}
              onChange={handleInputChange}
              className={`w-full h-9 px-2.5 border rounded-lg bg-white focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                errors.event ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
              }`}
            >
              <option value="">Select an event</option>
              {eventsList.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            {errors.event && <p className="text-rose-500 text-[11px] font-medium mt-0.5">{errors.event}</p>}
          </div>

          {/* Project Complete toggle */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 w-full">
            <input
              id="isProjectComplete"
              name="isProjectComplete"
              type="checkbox"
              checked={formData.isProjectComplete}
              onChange={handleInputChange}
              className="h-4 w-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
            />
            <div>
              <label htmlFor="isProjectComplete" className="font-semibold text-slate-700 cursor-pointer select-none">
                Project is complete
              </label>
              <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                Check this if the participant has fully submitted and completed their project for this event.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/30 w-full shrink-0">
          <button
            type="button"
            disabled={submitType !== null}
            onClick={onCancel}
            className="h-9 w-full sm:w-auto px-4 order-2 sm:order-1 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitType !== null}
            onClick={handleSubmit}
            className="h-9 w-full sm:w-auto px-4 order-1 sm:order-2 text-xs font-semibold bg-[#0b2574] hover:bg-[#0b2574]/90 text-white rounded-lg cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
          >
            {submitType === "save" ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>
            ) : (
              initialData ? "Save Changes" : "Issue Certificate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}