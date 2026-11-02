"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Megaphone, UploadCloud, X, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { announcementSchema } from "@/lib/Schema/announcementSchema";
import { ModalShell } from "@/components/common/ModalShell";
import { Button } from "@/components/ui/button";

export function AnnouncementModal({
  isOpen,
  initialData = null,
  isSubmitting = false,
  onSubmit,
  onClose,
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    link: initialData?.link || "",
    image: undefined,
  });

  const [imagePreview, setImagePreview] = useState(initialData?.image || null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData?.title || "",
        description: initialData?.description || "",
        link: initialData?.link || "",
        image: undefined,
      });
      setImagePreview(initialData?.image || null);
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const result = announcementSchema.safeParse({
      title: formData.title,
      description: formData.description,
      link: formData.link ? formData.link.trim() : null,
      image: formData.image,
    });

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const payload = new FormData();
    payload.append("title", formData.title.trim());
    payload.append("description", formData.description.trim());
    if (formData.link && formData.link.trim()) {
      payload.append("link", formData.link.trim());
    } else {
      payload.append("link", "");
    }

    if (formData.image instanceof File) {
      payload.append("image", formData.image);
    } else if (formData.image === null && isEdit) {
      payload.append("image", "");
    }

    onSubmit(payload);
  };

  return (
    <ModalShell
      title={isEdit ? "Edit Announcement" : "Create Announcement"}
      subtitle={
        isEdit
          ? "Update announcement content and details."
          : "Publish an announcement and automatically broadcast a mobile push notification."
      }
      icon={Megaphone}
      onClose={onClose}
      closeDisabled={isSubmitting}
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Publish & Send Push"
            )}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Annual Tech Symposium 2026 Registration Open"
            maxLength={200}
            className={`w-full px-3 py-2 text-xs rounded-lg border bg-white dark:bg-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
              errors.title
                ? "border-rose-400 focus:border-rose-500 dark:border-rose-500"
                : "border-slate-200 dark:border-slate-800 focus:border-indigo-500"
            }`}
          />
          {errors.title && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Details of the announcement. This content will also be sent in the push notification body."
            maxLength={2000}
            className={`w-full px-3 py-2 text-xs rounded-lg border bg-white dark:bg-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
              errors.description
                ? "border-rose-400 focus:border-rose-500 dark:border-rose-500"
                : "border-slate-200 dark:border-slate-800 focus:border-indigo-500"
            }`}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description ? (
              <p className="text-[11px] text-rose-500">{errors.description}</p>
            ) : <span />}
            <span className="text-[10px] text-slate-400">
              {formData.description.length}/2000
            </span>
          </div>
        </div>

        {/* Action Link (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Action Link <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <LinkIcon className="h-3.5 w-3.5" />
            </span>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://example.com/details"
              className={`w-full pl-8 pr-3 py-2 text-xs rounded-lg border bg-white dark:bg-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                errors.link
                  ? "border-rose-400 focus:border-rose-500 dark:border-rose-500"
                  : "border-slate-200 dark:border-slate-800 focus:border-indigo-500"
              }`}
            />
          </div>
          {errors.link && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.link}</p>
          )}
        </div>

        {/* Featured Image (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Banner Image <span className="text-slate-400 font-normal">(Optional, max 5MB)</span>
          </label>

          {imagePreview ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 h-40 flex items-center justify-center group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors shadow-md"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
              <UploadCloud className="h-7 w-7 text-slate-400 dark:text-slate-500 mb-1" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Click to upload an image
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                PNG, JPG, or WEBP up to 5MB
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
          {errors.image && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.image}</p>
          )}
        </div>
      </form>
    </ModalShell>
  );
}
