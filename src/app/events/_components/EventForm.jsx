"use client";

import React, { useState, useEffect, useRef } from "react";
import { eventSchema, EVENT_CATEGORIES } from "@/lib/Schema/eventSchema";
import { UploadCloud, Loader2, X, ChevronDown, Check } from "lucide-react";
import { MarkdownEditor } from "@/components/common/MarkdownEditor"; // <-- Import the clean editor component

export function EventFormModal({
  initialData = null,
  isOpen,
  mentorsList = [],
  onSubmitSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    title: "",
    registrationOpen: true,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    organizer: "",
    availableSeats: "",
    registrationFormUrl: "",
    registrationFeeBMC: "",
    registrationFee: "",
    location: "",
    category: "",
    status: "published",
    tags: "",
    image: undefined,
    description: "",
    mentors: [],
  });

  const [errors, setErrors] = useState({});
  const [submitType, setSubmitType] = useState(null);
  const [mentorDropdownOpen, setMentorDropdownOpen] = useState(false);
  const mentorDropdownRef = useRef(null);
  const [fileMeta, setFileMeta] = useState({ preview: null, name: "" });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData?.title || "",
        registrationOpen: initialData?.registrationOpen ?? true,
        startDate: initialData?.startDate || "",
        endDate: initialData?.endDate || "",
        startTime: initialData?.startTime || "",
        endTime: initialData?.endTime || "",
        organizer: initialData?.organizer || "",
        availableSeats: initialData?.availableSeats ?? "",
        registrationFormUrl: initialData?.registrationFormUrl || "",
        registrationFeeBMC: initialData?.registrationFeeBMC ?? "",
        registrationFee: initialData?.registrationFee ?? "",
        location: initialData?.location || "",
        category: initialData?.category || "",
        status: initialData?.status || "published",
        tags: Array.isArray(initialData?.tags)
          ? initialData.tags.join(", ")
          : initialData?.tags || "",
        image: undefined,
        description: initialData?.description || "",
        mentors: initialData?.mentors || [],
      });
      setFileMeta({
        preview: initialData?.image || null,
        name: initialData?.image ? "Attached Event Image" : "",
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close mentor dropdown on outside click
  useEffect(() => {
    if (!mentorDropdownOpen) return;
    function handleClickOutside(e) {
      if (
        mentorDropdownRef.current &&
        !mentorDropdownRef.current.contains(e.target)
      ) {
        setMentorDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mentorDropdownOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const toggleMentor = (mentorId) => {
    setFormData((prev) => {
      const exists = prev.mentors.includes(mentorId);
      return {
        ...prev,
        mentors: exists
          ? prev.mentors.filter((id) => id !== mentorId)
          : [...prev.mentors, mentorId],
      };
    });
    if (errors.mentors) setErrors((prev) => ({ ...prev, mentors: undefined }));
  };

  const selectedMentorNames = formData.mentors
    .map((id) => mentorsList.find((m) => String(m.id) === String(id))?.fullName)
    .filter(Boolean);

  const handleActionClick = async (e, chosenStatus) => {
    e.preventDefault();
    setSubmitType(chosenStatus);
    setErrors({});

    const dataToValidate = {
      ...formData,
      registrationOpen:
        chosenStatus === "open" ? true : formData.registrationOpen,
    };
    const result = eventSchema.safeParse(dataToValidate);

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

      <div className="relative bg-white w-full max-w-3xl rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in scale-in-95 duration-200 z-10 text-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="font-semibold text-lg text-[#0b2574]">
            {initialData ? "Edit Event" : "Create Event"}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1 w-full">
          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            <div className="md:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-700">
                Event Title *
              </label>
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Intro to Web Development Bootcamp"
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                  errors.title
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.title && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full h-9 px-2.5 border rounded-lg bg-white focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                  errors.category
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              >
                <option value="">Select Category</option>
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.category}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full h-9 px-2.5 border rounded-lg bg-white focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                  errors.status ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
                }`}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              {errors.status && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.status}
                </p>
              )}
            </div>
          </div>

          {/* Organizer & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Organizer *
              </label>
              <input
                name="organizer"
                type="text"
                value={formData.organizer}
                onChange={handleInputChange}
                placeholder="e.g., Code Collective"
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                  errors.organizer
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.organizer && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.organizer}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Location *</label>
              <input
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Innovation Hub, Kathmandu / Online"
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                  errors.location
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.location && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.location}
                </p>
              )}
            </div>
          </div>

          {/* Date / Time Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 w-full">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Start Date *
              </label>
              <input
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                  errors.startDate
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.startDate && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.startDate}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">End Date *</label>
              <input
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                  errors.endDate
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.endDate && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.endDate}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Start Time *
              </label>
              <input
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                  errors.startTime
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.startTime && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.startTime}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">End Time *</label>
              <input
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                  errors.endTime
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.endTime && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.endTime}
                </p>
              )}
            </div>
          </div>

          {/* Seats, Fees */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Available Seats *
              </label>
              <input
                name="availableSeats"
                type="number"
                min="0"
                value={formData.availableSeats}
                onChange={handleInputChange}
                placeholder="e.g., 40"
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                  errors.availableSeats
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.availableSeats && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.availableSeats}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Registration Fee (BMC)
              </label>
              <input
                name="registrationFeeBMC"
                type="number"
                min="0"
                value={formData.registrationFeeBMC}
                onChange={handleInputChange}
                placeholder="0"
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                  errors.registrationFeeBMC
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.registrationFeeBMC && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.registrationFeeBMC}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Registration Fee
              </label>
              <input
                name="registrationFee"
                type="number"
                min="0"
                value={formData.registrationFee}
                onChange={handleInputChange}
                placeholder="0"
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                  errors.registrationFee
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.registrationFee && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.registrationFee}
                </p>
              )}
            </div>
          </div>

          {/* Registration URL & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Registration Form URL *
              </label>
              <input
                name="registrationFormUrl"
                type="text"
                value={formData.registrationFormUrl}
                onChange={handleInputChange}
                placeholder="https://forms.example.com/your-event"
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                  errors.registrationFormUrl
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.registrationFormUrl && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.registrationFormUrl}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Tags</label>
              <input
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="comma, separated, tags"
                className="w-full h-9 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Mentors multi-select */}
          <div className="space-y-1.5 w-full" ref={mentorDropdownRef}>
            <label className="font-semibold text-slate-700">Mentors</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMentorDropdownOpen((prev) => !prev)}
                className="w-full min-h-9 px-3 py-1.5 border border-slate-200 rounded-lg bg-white flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 transition-all text-left"
              >
                <span className="flex flex-wrap gap-1 flex-1">
                  {selectedMentorNames.length === 0 ? (
                    <span className="text-slate-400">
                      Select mentors for this event
                    </span>
                  ) : (
                    selectedMentorNames.map((name) => (
                      <span
                        key={name}
                        className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-semibold border border-indigo-100"
                      >
                        {name}
                      </span>
                    ))
                  )}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${mentorDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {mentorDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-100">
                  {mentorsList.length === 0 ? (
                    <p className="px-3 py-2 text-slate-400 text-[11px]">
                      No mentors available yet.
                    </p>
                  ) : (
                    mentorsList.map((mentor) => {
                      const checked = formData.mentors.includes(mentor.id);
                      return (
                        <button
                          key={mentor.id}
                          type="button"
                          onClick={() => toggleMentor(mentor.id)}
                          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <span>
                            {mentor.fullName}{" "}
                            <span className="text-slate-400 font-normal">
                              — {mentor.role}
                            </span>
                          </span>
                          {checked && (
                            <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Registration Open Toggle */}
          <div className="flex items-center gap-2.5 w-full">
            <input
              id="registrationOpen"
              name="registrationOpen"
              type="checkbox"
              checked={formData.registrationOpen}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label
              htmlFor="registrationOpen"
              className="font-semibold text-slate-700 cursor-pointer select-none"
            >
              Registration is currently open
            </label>
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5 w-full">
            <label className="font-semibold text-slate-700">Event Image</label>
            {!fileMeta.preview ? (
              <label className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/40 hover:bg-slate-50 transition-all w-full group">
                <UploadCloud className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <div className="text-center">
                  <p className="font-semibold text-slate-700">
                    Click to upload event image
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
              <div className="relative border border-slate-200 rounded-xl max-w-md bg-slate-50 p-3 pr-12 flex items-center gap-3 group">
                <div className="h-10 w-10 bg-indigo-50 rounded-lg overflow-hidden border border-indigo-100 shrink-0">
                  <img
                    src={fileMeta.preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {fileMeta.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-normal">
                    Image Media Asset
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFileMeta({ preview: null, name: "" })}
                  className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 rounded-md cursor-pointer shadow-2xs"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {errors.image && (
              <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                {errors.image}
              </p>
            )}
          </div>

          {/* Integrated Reusable Markdown Description Field */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">
              Description *
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
            onClick={(e) => handleActionClick(e, "save")}
            className="h-9 w-full sm:w-auto px-4 order-1 sm:order-2 text-xs font-semibold bg-[#0b2574] hover:bg-[#0b2574]/90 text-white rounded-lg cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
          >
            {submitType === "save" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
              </>
            ) : initialData ? (
              "Save Changes"
            ) : (
              "Create Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}