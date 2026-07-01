"use client";

import React, { useState, useEffect, useRef } from "react";
import { mentorSchema, MENTOR_ROLES } from "@/lib/Schema/mentorSchema";
import { UploadCloud, Loader2, X, ChevronDown, Check, UserCircle } from "lucide-react";

export function MentorFormModal({
  initialData = null,
  isOpen,
  eventsList = [],
  onSubmitSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    socialLink: "",
    image: undefined,
    events: [],
    role: "",
    status: "published",
  });

  const [errors, setErrors] = useState({});
  const [submitType, setSubmitType] = useState(null);
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const eventDropdownRef = useRef(null);
  const [fileMeta, setFileMeta] = useState({ preview: null, name: "" });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: initialData?.fullName || "",
        socialLink: initialData?.socialLink || "",
        image: undefined,
        events: initialData?.events || [],
        role: initialData?.role || "",
        status: initialData?.status || "published",
      });
      setFileMeta({
        preview: initialData?.image || null,
        name: initialData?.image ? "Attached Profile Photo" : "",
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => {
    if (!eventDropdownOpen) return;
    function handleClickOutside(e) {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(e.target)) {
        setEventDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [eventDropdownOpen]);

  if (!isOpen) return null;

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
      reader.onloadend = () => setFileMeta({ preview: reader.result, name: file.name });
      reader.readAsDataURL(file);
    }
  };

  const toggleEvent = (eventId) => {
    setFormData((prev) => {
      const exists = prev.events.includes(eventId);
      return {
        ...prev,
        events: exists
          ? prev.events.filter((id) => id !== eventId)
          : [...prev.events, eventId],
      };
    });
  };

  const selectedEventTitles = formData.events
    .map((id) => eventsList.find((e) => String(e.id) === String(id))?.title)
    .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitType("save");
    setErrors({});

    const result = mentorSchema.safeParse(formData);

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

      <div className="relative bg-white w-full max-w-2xl rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in scale-in-95 duration-200 z-10 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="font-semibold text-lg text-primary">
            {initialData ? "Edit Mentor" : "Add Mentor"}
          </div>
          <button type="button" onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1 w-full">
          {/* Full Name & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Full Name *</label>
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="e.g., Aarav Sharma"
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                  errors.fullName ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.fullName && <p className="text-rose-500 text-[11px] font-medium mt-0.5">{errors.fullName}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full h-9 px-2.5 border rounded-lg bg-white focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                  errors.role ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
                }`}
              >
                <option value="">Select Role</option>
                {MENTOR_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {errors.role && <p className="text-rose-500 text-[11px] font-medium mt-0.5">{errors.role}</p>}
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
              {errors.status && <p className="text-rose-500 text-[11px] font-medium mt-0.5">{errors.status}</p>}
            </div>
          </div>

          {/* Social Link */}
          <div className="space-y-1.5 w-full">
            <label className="font-semibold text-slate-700">Social / Profile Link *</label>
            <input
              name="socialLink"
              type="text"
              value={formData.socialLink}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/yourprofile"
              className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                errors.socialLink ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
              }`}
            />
            {errors.socialLink && <p className="text-rose-500 text-[11px] font-medium mt-0.5">{errors.socialLink}</p>}
          </div>

          {/* Events multi-select */}
          <div className="space-y-1.5 w-full" ref={eventDropdownRef}>
            <label className="font-semibold text-slate-700">Linked Events</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setEventDropdownOpen((prev) => !prev)}
                className="w-full min-h-9 px-3 py-1.5 border border-slate-200 rounded-lg bg-white flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 transition-all text-left"
              >
                <span className="flex flex-wrap gap-1 flex-1">
                  {selectedEventTitles.length === 0 ? (
                    <span className="text-slate-400">Select events this mentor is part of</span>
                  ) : (
                    selectedEventTitles.map((title) => (
                      <span key={title} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-semibold border border-indigo-100 truncate max-w-[180px]">
                        {title}
                      </span>
                    ))
                  )}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform ${eventDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {eventDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-100">
                  {eventsList.length === 0 ? (
                    <p className="px-3 py-2 text-slate-400 text-[11px]">No events available yet.</p>
                  ) : (
                    eventsList.map((event) => {
                      const checked = formData.events.includes(event.id);
                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => toggleEvent(event.id)}
                          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <span className="truncate">{event.title} <span className="text-slate-400 font-normal">— {event.category}</span></span>
                          {checked && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Profile Photo */}
          <div className="space-y-1.5 w-full">
            <label className="font-semibold text-slate-700">Profile Photo</label>
            {!fileMeta.preview ? (
              <label className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/40 hover:bg-slate-50 transition-all w-full group">
                <UploadCloud className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <div className="text-center">
                  <p className="font-semibold text-slate-700">Click to upload profile photo</p>
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">Supports PNG, JPEG, WEBP (Max 5MB)</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="relative border border-slate-200 rounded-xl max-w-xs bg-slate-50 p-3 pr-12 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-50 overflow-hidden border border-indigo-100 shrink-0">
                  <img src={fileMeta.preview} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{fileMeta.name}</p>
                  <p className="text-[10px] text-slate-400 font-normal">Profile Photo</p>
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
            {errors.image && <p className="text-rose-500 text-[11px] font-medium mt-0.5">{errors.image}</p>}
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
              initialData ? "Save Changes" : "Add Mentor"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}