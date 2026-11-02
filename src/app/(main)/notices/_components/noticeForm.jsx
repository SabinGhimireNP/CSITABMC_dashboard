"use client";

import React, { useState, useEffect } from "react";
import { noticeSchema } from "@/lib/Schema/noticeSchema";
import { Loader2, X } from "lucide-react";
import { MarkdownEditor } from "@/components/common/MarkdownEditor";
import { FormSection } from "@/components/common/FormSection";
import { NoticeAttachmentUpload } from "./NoticeAttachmentUpload";
import { MODAL_OVERLAY_CLASS, modalPanelClass } from "@/components/common/ModalShell";

function NoticeFormModalContent({
  initialData = null,
  onSubmitSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "",
    description: initialData?.description || "",
    image: undefined,
  });

  const [errors, setErrors] = useState({});
  const [submitType, setSubmitType] = useState(null);

  const [fileMeta, setFileMeta] = useState({
    preview: initialData?.image || null,
    isPdf: false,
    name: initialData?.image ? "Attached Document Asset" : "",
  });

  // Prevent background scroll when the dialog is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
      const reader = new FileReader();
      reader.onloadend = () =>
        setFileMeta({
          preview: reader.result,
          isPdf: false,
          name: file.name,
        });
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setFileMeta({ preview: null, isPdf: false, name: "" });
  };

  const handleActionClick = async (e, chosenStatus) => {
    e.preventDefault();
    if (submitType !== null) return;

    setSubmitType(chosenStatus);
    setErrors({});

    const dataToValidate = { ...formData, status: chosenStatus };
    const result = noticeSchema.safeParse(dataToValidate);

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

  const inputBase =
    "w-full h-10 px-3.5 border rounded-lg focus:outline-none focus:ring-1 transition-all text-xs bg-background text-foreground shadow-2xs";
  const inputNormal = `${inputBase} border-input focus:ring-primary`;
  const inputError = `${inputBase} border-destructive focus:ring-destructive`;

  return (
    <div className={MODAL_OVERLAY_CLASS}>
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      />

      <div className={modalPanelClass("max-w-3xl")}>
        {/* Header */}
        <div className="p-5 sm:px-8 border-b border-border/80 dark:border-white/10 flex items-center justify-between bg-muted/40 dark:bg-[#16181e] shrink-0">
          <div>
            <h2 className="font-semibold text-lg text-foreground">
              {initialData ? "Edit Notice" : "Create Notice"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {initialData
                ? "Update notice announcements, body text, or attached documents."
                : "Publish an official announcement to the association portal."}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-8 overflow-y-auto min-h-0 space-y-8 sm:space-y-10 flex-1 w-full overflow-x-hidden">
          {/* Section 1: Notice Information */}
          <FormSection
            title="Notice Information"
            description="Announcement headline and category classification."
            withDivider={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
              <div className="md:col-span-2 space-y-2">
                <label className="font-semibold text-slate-700 block text-xs">
                  Notice Title <span className="text-rose-500">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Semester Exam Routine Fall 2026"
                  className={errors.title ? inputError : inputNormal}
                />
                {errors.title && (
                  <p className="text-rose-500 text-[11px] font-medium mt-1">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block text-xs">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`cursor-pointer ${errors.category ? inputError : inputNormal}`}
                >
                  <option value="">Select Category</option>
                  <option value="administrative">Administrative</option>
                  <option value="academic">Academic</option>
                  <option value="events">Events</option>
                </select>
                {errors.category && (
                  <p className="text-rose-500 text-[11px] font-medium mt-1">
                    {errors.category}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Section 2: Detailed Content */}
          <FormSection
            title="Notice Content"
            description="Detailed message, announcements, or instructions formatted with Markdown."
          >
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 block text-xs">
                Detailed Body Description <span className="text-rose-500">*</span>
              </label>
              <MarkdownEditor
                id="notice-modal-textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={errors.description}
                placeholder="Type or compile documentation components..."
                rows={6}
              />
            </div>
          </FormSection>

          {/* Section 3: Attachment & Document */}
          <FormSection
            title="Attachment & Media"
            description="Upload an official document, circular PDF, or announcement image."
          >
            <NoticeAttachmentUpload
              fileMeta={fileMeta}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
              error={errors.image}
            />
          </FormSection>
        </div>

        {/* Footer with Balanced Responsive Buttons */}
        <div className="px-4 py-3 sm:p-5 sm:px-8 border-t border-border/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted/40 dark:bg-[#16181e] w-full shrink-0">
          <button
            type="button"
            disabled={submitType !== null}
            onClick={onCancel}
            className="h-10 w-full sm:w-auto px-5 order-2 sm:order-1 text-xs font-semibold border border-border/80 dark:border-white/12 text-foreground bg-card dark:bg-[#1f232b] rounded-lg hover:bg-muted/50 dark:hover:bg-white/10 cursor-pointer shadow-2xs transition-colors"
          >
            Cancel
          </button>

          <div className="grid grid-cols-2 gap-3 w-full order-1 sm:order-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
            <button
              type="button"
              disabled={submitType !== null}
              onClick={(e) => handleActionClick(e, "draft")}
              className="h-10 w-full sm:w-auto px-4 sm:px-5 text-xs font-semibold border border-border/80 dark:border-white/12 text-foreground bg-card dark:bg-[#1f232b] hover:bg-muted/50 dark:hover:bg-white/10 cursor-pointer shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              {submitType === "draft" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                  {initialData ? "Updating..." : "Saving..."}
                </>
              ) : initialData ? (
                "Update Draft"
              ) : (
                "Save as Draft"
              )}
            </button>
            <button
              type="button"
              disabled={submitType !== null}
              onClick={(e) => handleActionClick(e, "published")}
              className="h-10 w-full sm:w-auto px-5 sm:px-6 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cursor-pointer shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              {submitType === "published" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                  {initialData ? "Updating..." : "Publishing..."}
                </>
              ) : initialData ? (
                "Update Notice"
              ) : (
                "Publish Notice"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NoticeFormModal(props) {
  if (!props.isOpen) return null;
  const key = props.initialData?.slug || props.initialData?.id || "new-notice";
  return <NoticeFormModalContent key={key} {...props} />;
}
