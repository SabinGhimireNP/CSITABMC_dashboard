"use client";

import React, { useState, useEffect } from "react";
import { pastPaperSchema, SEMESTER_LABELS } from "@/lib/Schema/pastPaperSchema";
import { Loader2, X, Link } from "lucide-react";
import { SUBJECTS_LIST } from "@/hooks/usePastPapers";

export function PastPaperFormModal(props) {
  if (!props.isOpen) return null;
  const key = props.initialData?.id || "new-past-paper";
  return <PastPaperFormModalContent key={key} {...props} />;
}

function PastPaperFormModalContent({
  initialData = null,
  isOpen,
  onSubmitSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState(() => ({
    subject_code: initialData?.subject_code || "",
    semester: initialData?.semester ?? "",
    model_set: initialData?.model_set ?? false,
    is_old_course: initialData?.is_old_course ?? false,
    exam_year: initialData?.exam_year ?? "",
    drive_link: initialData?.drive_link || "",
  }));

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    setErrors({});

    const result = pastPaperSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        const pathKey = issue.path[0];
        if (!formattedErrors[pathKey]) formattedErrors[pathKey] = issue.message;
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

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 15 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div onClick={onCancel} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200" />

      <div className="relative bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in scale-in-95 duration-200 z-10 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="font-semibold text-lg text-primary">
            {initialData ? "Edit Past Paper" : "Add Past Paper"}
          </div>
          <button type="button" onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Subject Select */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Subject *</label>
            <select
              name="subject_code"
              value={formData.subject_code}
              onChange={handleInputChange}
              className={`w-full h-9 px-2.5 border rounded-lg bg-white focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                errors.subject_code ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
              }`}
            >
              <option value="">Select subject</option>
              {formData.subject_code && !SUBJECTS_LIST.some((s) => s.id === formData.subject_code) && (
                <option value={formData.subject_code}>
                  {formData.subject_code} (Custom / Unmapped)
                </option>
              )}
              {SUBJECTS_LIST.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.label}
                </option>
              ))}
            </select>
            {errors.subject_code && <p className="text-rose-500 text-[11px] font-medium">{errors.subject_code}</p>}
          </div>

          {/* Semester */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Semester *</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className={`w-full h-9 px-2.5 border rounded-lg bg-white focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                errors.semester ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
              }`}
            >
              <option value="">Select</option>
              {SEMESTER_LABELS.map((s) => (
                <option key={s.number} value={s.number}>{s.label}</option>
              ))}
            </select>
            {errors.semester && <p className="text-rose-500 text-[11px] font-medium">{errors.semester}</p>}
          </div>

          {/* Exam Year & Type */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Exam Year *</label>
              <select
                name="exam_year"
                value={formData.exam_year}
                onChange={handleInputChange}
                className={`w-full h-9 px-2.5 border rounded-lg bg-white focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                  errors.exam_year ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
                }`}
              >
                <option value="">Select year</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              {errors.exam_year && <p className="text-rose-500 text-[11px] font-medium">{errors.exam_year}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Paper Type</label>
              <div className="flex items-center gap-4 h-9">
                {[{ value: false, label: "Board Exam" }, { value: true, label: "Model Set" }].map(({ value, label }) => (
                  <label key={label} className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="model_set"
                      checked={formData.model_set === value}
                      onChange={() => setFormData((prev) => ({ ...prev, model_set: value }))}
                      className="h-3.5 w-3.5 border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="font-medium text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Course Syllabus Version (Old Course vs New Course) */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">Syllabus Version</label>
              <span className="text-[10px] text-slate-400">Mark if this paper is from an older curriculum</span>
            </div>
            <div className="flex items-center gap-6 h-8">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="is_old_course"
                  checked={!formData.is_old_course}
                  onChange={() => setFormData((prev) => ({ ...prev, is_old_course: false }))}
                  className="h-3.5 w-3.5 border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="font-medium text-slate-700">New / Current Course</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="is_old_course"
                  checked={Boolean(formData.is_old_course)}
                  onChange={() => setFormData((prev) => ({ ...prev, is_old_course: true }))}
                  className="h-3.5 w-3.5 border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className="font-medium text-amber-800 flex items-center gap-1.5">
                  Old Course
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold border border-amber-200">Legacy</span>
                </span>
              </label>
            </div>
          </div>

          {/* Drive Link */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Google Drive Link *</label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                name="drive_link"
                type="text"
                value={formData.drive_link}
                onChange={handleInputChange}
                placeholder="https://drive.google.com/file/d/..."
                className={`w-full h-9 pl-8 pr-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                  errors.drive_link ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
            </div>
            {errors.drive_link && <p className="text-rose-500 text-[11px] font-medium">{errors.drive_link}</p>}
            <p className="text-[10px] text-slate-400 font-normal">Paste a Google Drive share link for a file or folder.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/30 shrink-0">
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="h-9 w-full sm:w-auto px-4 order-2 sm:order-1 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="h-9 w-full sm:w-auto px-4 order-1 sm:order-2 text-xs font-semibold bg-[#0b2574] hover:bg-[#0b2574]/90 text-white rounded-lg cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {initialData ? "Updating" : "Adding"}</>
            ) : (
              initialData ? "Save Changes" : "Add Paper"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}