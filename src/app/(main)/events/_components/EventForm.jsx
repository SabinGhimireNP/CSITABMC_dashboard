"use client";

import React, { useEffect } from "react";
import { EVENT_CATEGORIES } from "@/lib/Schema/eventSchema";
import { X } from "lucide-react";
import { MarkdownEditor } from "@/components/common/MarkdownEditor";
import { FormSection } from "@/components/common/FormSection";
import { useEventForm } from "./useEventForm";
import { EventMediaUpload } from "./EventMediaUpload";
import { EventMentorsSelect } from "./EventMentorsSelect";
import { MODAL_OVERLAY_CLASS, modalPanelClass } from "@/components/common/ModalShell";
import { Button } from "@/components/ui/button";

export function EventFormModal(props) {
  if (!props.isOpen) return null;
  const key = props.initialData?.id || props.initialData?.slug || "new-event";
  return <EventFormModalContent key={key} {...props} />;
}

function EventFormModalContent({
  initialData = null,
  isOpen,
  mentorsList = [],
  tenuresList = [],
  onSubmitSuccess,
  onCancel,
}) {
  const {
    formData,
    errors,
    submitType,
    fileMeta,
    handleInputChange,
    handleFileChange,
    handleRemoveFile,
    addMentorAssignment,
    removeMentorAssignment,
    updateMentorAssignment,
    toggleMentor,
    handleSubmit,
  } = useEventForm({ initialData });

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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

      <div className={modalPanelClass("max-w-4xl")}>
        {/* Header */}
        <div className="p-5 sm:px-8 border-b border-border/80 dark:border-white/10 flex items-center justify-between bg-muted/40 dark:bg-[#16181e] shrink-0">
          <div>
            <h2 className="font-semibold text-lg text-foreground">
              {initialData ? "Edit Event" : "Create Event"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {initialData
                ? "Update event schedule, registration, mentors, and content details."
                : "Fill out the sections below to publish or draft a new organization event."}
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

        {/* Scrollable Form Body with Spacious Semantic Sections */}
        <div className="p-4 sm:p-8 overflow-y-auto min-h-0 space-y-8 sm:space-y-10 flex-1 w-full overflow-x-hidden">
          {/* Section 1: Basic Information */}
          <FormSection
            title="Basic Information"
            description="Essential event identity, category classification, and host association."
            withDivider={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
              <div className="md:col-span-2 space-y-2">
                <label className="font-semibold text-slate-700 block text-xs">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Intro to Web Development Bootcamp"
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
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-rose-500 text-[11px] font-medium mt-1">
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block text-xs">
                  Associated Tenure
                </label>
                <select
                  name="tenure"
                  value={formData.tenure || ""}
                  onChange={handleInputChange}
                  className={`cursor-pointer ${inputNormal}`}
                >
                  <option value="">General (No Tenure)</option>
                  {tenuresList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="font-semibold text-slate-700 block text-xs">
                  Organizer <span className="text-rose-500">*</span>
                </label>
                <input
                  name="organizer"
                  type="text"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  placeholder="e.g., Code Collective / CSIT Association"
                  className={errors.organizer ? inputError : inputNormal}
                />
                {errors.organizer && (
                  <p className="text-rose-500 text-[11px] font-medium mt-1">
                    {errors.organizer}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Section 2: Schedule & Location */}
          <FormSection
            title="Schedule & Location"
            description="Specify when and where the event will take place."
          >
            <div className="space-y-6 sm:space-y-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 block text-xs">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`cursor-pointer ${errors.startDate ? inputError : inputNormal}`}
                  />
                  {errors.startDate && (
                    <p className="text-rose-500 text-[11px] font-medium mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 block text-xs">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`cursor-pointer ${errors.endDate ? inputError : inputNormal}`}
                  />
                  {errors.endDate && (
                    <p className="text-rose-500 text-[11px] font-medium mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 block text-xs">
                    Start Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={`cursor-pointer ${errors.startTime ? inputError : inputNormal}`}
                  />
                  {errors.startTime && (
                    <p className="text-rose-500 text-[11px] font-medium mt-1">
                      {errors.startTime}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 block text-xs">
                    End Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className={`cursor-pointer ${errors.endTime ? inputError : inputNormal}`}
                  />
                  {errors.endTime && (
                    <p className="text-rose-500 text-[11px] font-medium mt-1">
                      {errors.endTime}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block text-xs">
                  Location / Venue <span className="text-rose-500">*</span>
                </label>
                <input
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Innovation Hub, Hall B / Google Meet"
                  className={errors.location ? inputError : inputNormal}
                />
                {errors.location && (
                  <p className="text-rose-500 text-[11px] font-medium mt-1">
                    {errors.location}
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Section 3: Registration & Capacity */}
          <FormSection
            title="Registration & Capacity"
            description="Manage capacity limits, ticketing fees, and registration links."
          >
            <div className="space-y-6 sm:space-y-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 block text-xs">
                    Available Seats <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="availableSeats"
                    type="number"
                    min="0"
                    value={formData.availableSeats}
                    onChange={handleInputChange}
                    placeholder="e.g., 40"
                    className={errors.availableSeats ? inputError : inputNormal}
                  />
                  {errors.availableSeats && (
                    <p className="text-rose-500 text-[11px] font-medium mt-1">
                      {errors.availableSeats}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 block text-xs">
                    Registration Fee (BMC)
                  </label>
                  <input
                    name="registrationFeeBMC"
                    type="number"
                    min="0"
                    value={formData.registrationFeeBMC}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={errors.registrationFeeBMC ? inputError : inputNormal}
                  />
                  {errors.registrationFeeBMC && (
                    <p className="text-rose-500 text-[11px] font-medium mt-1">
                      {errors.registrationFeeBMC}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 block text-xs">
                    Registration Fee (General)
                  </label>
                  <input
                    name="registrationFee"
                    type="number"
                    min="0"
                    value={formData.registrationFee}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={errors.registrationFee ? inputError : inputNormal}
                  />
                  {errors.registrationFee && (
                    <p className="text-rose-500 text-[11px] font-medium mt-1">
                      {errors.registrationFee}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block text-xs">
                  Registration Form URL
                </label>
                <input
                  name="registrationFormUrl"
                  type="text"
                  value={formData.registrationFormUrl}
                  onChange={handleInputChange}
                  placeholder="https://forms.example.com/your-event"
                  className={errors.registrationFormUrl ? inputError : inputNormal}
                />
                {errors.registrationFormUrl && (
                  <p className="text-rose-500 text-[11px] font-medium mt-1">
                    {errors.registrationFormUrl}
                  </p>
                )}
              </div>

              {/* Registration Status Checkbox */}
              <label
                htmlFor="registrationOpen"
                className="flex items-center gap-3.5 p-4 sm:p-5 rounded-xl border border-slate-200/90 hover:bg-slate-50/70 transition-colors cursor-pointer select-none bg-slate-50/30"
              >
                <input
                  id="registrationOpen"
                  name="registrationOpen"
                  type="checkbox"
                  checked={formData.registrationOpen}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 block text-xs">
                    Registration is currently open
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal block leading-relaxed">
                    Enable or disable attendee registrations on the public portal.
                  </span>
                </div>
              </label>
            </div>
          </FormSection>

          {/* Section 4: Mentors & Facilitators */}
          <FormSection
            title="Mentors & Facilitators"
            description="Assign mentors to this event, designate their specific roles, and outline their responsibilities."
          >
            <div className="space-y-3">
              <EventMentorsSelect
                mentorsList={mentorsList}
                assignments={formData.assignments}
                onAddMentor={addMentorAssignment}
                onRemoveMentor={removeMentorAssignment}
                onUpdateAssignment={updateMentorAssignment}
              />
              {errors.assignments && (
                <p className="text-rose-500 text-[11px] font-medium">
                  {errors.assignments}
                </p>
              )}
            </div>
          </FormSection>

          {/* Section 5: Media & Attachments */}
          <FormSection
            title="Media & Banner"
            description="Upload a high-resolution promotional cover image or banner."
          >
            <EventMediaUpload
              fileMeta={fileMeta}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
              error={errors.image}
            />
          </FormSection>

          {/* Section 6: Description & Overview */}
          <FormSection
            title="Event Description & Schedule"
            description="Comprehensive event details, prerequisites, and timeline formatted with Markdown."
          >
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 block text-xs">
                Description <span className="text-rose-500">*</span>
              </label>
              <MarkdownEditor
                id="event-modal-textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={errors.description}
                placeholder="Write detailed event schedule, overview, requirements, or timeline..."
              />
            </div>
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

          <div className="grid grid-cols-2 gap-3 w-full order-1 sm:order-2 sm:flex sm:w-auto sm:items-center">
            <Button
              type="button"
              variant="outline"
              disabled={submitType !== null}
              loading={submitType === "draft"}
              loadingText="Saving..."
              onClick={(e) => {
                e.preventDefault();
                handleSubmit("draft", onSubmitSuccess);
              }}
              className="w-full sm:w-auto shadow-2xs"
            >
              Save as Draft
            </Button>

            <Button
              type="button"
              disabled={submitType !== null}
              loading={submitType === "published"}
              loadingText={initialData ? "Saving..." : "Publishing..."}
              onClick={(e) => {
                e.preventDefault();
                handleSubmit("published", onSubmitSuccess);
              }}
              className="w-full sm:w-auto shadow-2xs"
            >
              {initialData ? "Save Changes" : "Publish Event"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}