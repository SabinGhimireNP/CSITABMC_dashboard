"use client";

import React, { useState, useEffect } from "react";
import { mentorSchema, MENTOR_ROLES } from "@/lib/Schema/mentorSchema";
import {
  UploadCloud,
  X,
} from "lucide-react";
import { FormSection } from "@/components/common/FormSection";
import { MentorSocialInputs } from "./MentorSocialInputs";
import { MentorEventsSelect } from "./MentorEventsSelect";
import { MODAL_OVERLAY_CLASS, modalPanelClass } from "@/components/common/ModalShell";
import { Button } from "@/components/ui/button";

export function MentorFormModal(props) {
  if (!props.isOpen) return null;
  const key = props.initialData?.id || "new-mentor";
  return <MentorFormModalContent key={key} {...props} />;
}

function MentorFormModalContent({
  initialData = null,
  isOpen,
  eventsList = [],
  onSubmitSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState(() => ({
    fullName: initialData?.fullName || "",
    socialLink: initialData?.socialLink || "",
    image: undefined,
    role: initialData?.role || "",
    status: initialData?.status || "published",
  }));

  const [assignedEvents, setAssignedEvents] = useState(() => {
    if (Array.isArray(initialData?.eventAssignments)) {
      return initialData.eventAssignments.map((a) => ({
        eventId: a.eventId || a.event_id,
        eventTitle: a.eventTitle || "",
        role: a.role || "main_mentor",
        customRole: a.customRole || a.custom_role || "",
        responsibility: a.responsibility || "",
      }));
    }
    return [];
  });

  const [errors, setErrors] = useState({});
  const [submitType, setSubmitType] = useState(null);
  const [fileMeta, setFileMeta] = useState(() => ({
    preview: initialData?.image || null,
    name: initialData?.image ? "Attached Profile Photo" : "",
  }));

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
      const reader = new FileReader();
      reader.onloadend = () =>
        setFileMeta({ preview: reader.result, name: file.name });
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvent = (eventId) => {
    setAssignedEvents((prev) => {
      if (prev.some((a) => String(a.eventId) === String(eventId))) return prev;
      return [
        ...prev,
        {
          eventId,
          role: "main_mentor",
          customRole: "",
          responsibility: "",
        },
      ];
    });
  };

  const handleRemoveEvent = (eventId) => {
    setAssignedEvents((prev) =>
      prev.filter((a) => String(a.eventId) !== String(eventId))
    );
  };

  const handleUpdateAssignment = (eventId, field, value) => {
    setAssignedEvents((prev) =>
      prev.map((a) =>
        String(a.eventId) === String(eventId) ? { ...a, [field]: value } : a
      )
    );
  };

  const handleSubmit = async (e, statusOverride) => {
    if (e && e.preventDefault) e.preventDefault();
    const targetType = statusOverride === "draft" ? "draft" : "publish";
    setSubmitType(targetType);
    setErrors({});

    const dataToValidate = {
      ...formData,
      status: statusOverride || formData.status,
    };

    const result = mentorSchema.safeParse(dataToValidate);

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
      if (onSubmitSuccess) {
        await onSubmitSuccess({
          ...result.data,
          assignedEvents,
        });
      }
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

      <div className={modalPanelClass("max-w-2xl")}>
        {/* Header */}
        <div className="p-5 sm:px-8 border-b border-border/80 dark:border-white/10 flex items-center justify-between bg-muted/40 dark:bg-[#16181e] shrink-0">
          <div>
            <h2 className="font-semibold text-lg text-foreground">
              {initialData ? "Edit Mentor" : "Add Mentor"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {initialData
                ? "Update mentor details, photo, and external portfolio."
                : "Register a mentor to guide association workshops and events."}
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

        {/* Scrollable Form Body with Semantic Sections */}
        <div className="p-4 sm:p-8 overflow-y-auto min-h-0 space-y-8 sm:space-y-10 flex-1 w-full overflow-x-hidden">
          {/* Section 1: Mentor Details */}
          <FormSection
            title="Mentor Details"
            description="Personal name, default mentor role, and external profile link."
            withDivider={false}
          >
            <div className="space-y-6 sm:space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 block text-xs">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g., Aarav Sharma"
                    className={errors.fullName ? inputError : inputNormal}
                  />
                  {errors.fullName && (
                    <p className="text-rose-500 text-[11px] font-medium mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 block text-xs">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`cursor-pointer ${errors.role ? inputError : inputNormal}`}
                  >
                    <option value="">Select Role</option>
                    {MENTOR_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="text-rose-500 text-[11px] font-medium mt-1">
                      {errors.role}
                    </p>
                  )}
                </div>
              </div>

              {/* Social Link */}
              <MentorSocialInputs
                value={formData.socialLink}
                onChange={handleInputChange}
                error={errors.socialLink}
              />
            </div>
          </FormSection>

          {/* Section 2: Event Assignments */}
          <FormSection
            title="Event Assignments"
            description="Assign this mentor to events, specify their roles, or remove existing assignments."
          >
            <MentorEventsSelect
              eventsList={eventsList}
              assignments={assignedEvents}
              onAddEvent={handleAddEvent}
              onRemoveEvent={handleRemoveEvent}
              onUpdateAssignment={handleUpdateAssignment}
            />
          </FormSection>

          {/* Section 3: Profile Photo */}
          <FormSection
            title="Profile Photo"
            description="Upload an avatar or headshot for public display."
          >
            {!fileMeta.preview ? (
              <label className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer bg-slate-50/40 hover:bg-slate-50 transition-all w-full group">
                <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <div className="text-center">
                  <p className="font-semibold text-slate-700 text-xs">
                    Click to upload profile photo
                  </p>
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                    Supports PNG, JPEG, WEBP (Max 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="relative border border-slate-200 rounded-xl max-w-sm bg-slate-50 p-3.5 pr-12 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-indigo-50 overflow-hidden border border-indigo-100 shrink-0">
                  <img
                    src={fileMeta.preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {fileMeta.name || "Profile Photo"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-normal">
                    Uploaded Photo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFileMeta({ preview: null, name: "" })}
                  className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 text-muted-foreground hover:text-destructive bg-card border border-border rounded-md cursor-pointer shadow-2xs transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {errors.image && (
              <p className="text-rose-500 text-[11px] font-medium mt-1">
                {errors.image}
              </p>
            )}
          </FormSection>
        </div>

        {/* Footer with Ergonomic Responsive Layout */}
        <div className="px-4 py-3 sm:p-5 sm:px-8 border-t border-border/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted/40 dark:bg-[#16181e] w-full shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={submitType !== null}
            onClick={onCancel}
            className="w-full sm:w-auto order-2 sm:order-1 shadow-2xs"
          >
            Cancel
          </Button>

          <div className="grid grid-cols-2 gap-3 w-full order-1 sm:order-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={submitType !== null}
              loading={submitType === "draft"}
              loadingText="Saving..."
              onClick={(e) => handleSubmit(e, "draft")}
              className="w-full sm:w-auto shadow-2xs"
            >
              Save as Draft
            </Button>

            <Button
              type="button"
              disabled={submitType !== null}
              loading={submitType === "published"}
              loadingText={initialData ? "Saving..." : "Publishing..."}
              onClick={(e) => handleSubmit(e, "published")}
              className="w-full sm:w-auto shadow-2xs"
            >
              {initialData ? "Save Changes" : "Add Mentor"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
