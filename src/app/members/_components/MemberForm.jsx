"use client";

import React, { useState, useEffect } from "react";
import { Loader2, X, Plus } from "lucide-react";

import { POST_OPTIONS } from "@/api/Member";
import { memberFormSchema } from "@/lib/Schema/memberSchema";
import { MarkdownEditor } from "@/components/common/MarkdownEditor"; // <-- Import the clean editor component

export function MemberFormModal({
  initialData = null,
  isOpen,
  onSubmitSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    post: "",
    email: "",
    facebookLink: "",
    linkedinLink: "",
    githubLink: "",
    tags: [],
    description: "",
    image: undefined,
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [submitType, setSubmitType] = useState(null);
  const [fileMeta, setFileMeta] = useState({ preview: null, name: "" });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: initialData?.fullName || "",
        post: initialData?.post || "",
        email: initialData?.email || "",
        facebookLink: initialData?.facebookLink || "",
        linkedinLink: initialData?.linkedinLink || "",
        githubLink: initialData?.githubLink || "",
        tags: initialData?.tags || [],
        description: initialData?.description || "",
        image: initialData?.image || undefined,
      });
      setFileMeta({
        preview: initialData?.image || null,
        name: initialData?.image ? "Profile Photo" : "",
      });
      setTagInput("");
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, image: file }));
    if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
    
    const reader = new FileReader();
    reader.onloadend = () => setFileMeta({ preview: reader.result, name: file.name });
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: undefined }));
    setFileMeta({ preview: null, name: "" });
  };

  const handleAddTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, "");
      if (newTag && !formData.tags.includes(newTag)) {
        const updatedTags = [...formData.tags, newTag];
        setFormData((prev) => ({ ...prev, tags: updatedTags }));
        if (errors.tags) setErrors((prev) => ({ ...prev, tags: undefined }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleActionClick = async (e, chosenStatus) => {
    e.preventDefault();
    setSubmitType(chosenStatus);
    setErrors({});

    const result = memberFormSchema.safeParse(formData);

    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (!formattedErrors[fieldName]) {
          formattedErrors[fieldName] = issue.message;
        }
      });
      setErrors(formattedErrors);
      setSubmitType(null);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (onSubmitSuccess) onSubmitSuccess({ ...result.data, status: chosenStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitType(null);
    }
  };

  const inputBase = "w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all text-xs bg-white";
  const inputNormal = `${inputBase} border-slate-200 focus:ring-indigo-500`;
  const inputError = `${inputBase} border-rose-400 focus:ring-rose-500`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div onClick={onCancel} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" />

      <div className="relative bg-white w-full max-w-3xl rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 z-10 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="font-semibold text-lg text-[#0b2574]">
            {initialData ? "Edit Member" : "Add Member"}
          </div>
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer">
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Row 1: Full Name + Post */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Full Name *</label>
              <input name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} placeholder="e.g., Aarav Sharma" className={errors.fullName ? inputError : inputNormal} />
              {errors.fullName && <p className="text-rose-500 text-[11px] font-medium">{errors.fullName}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Post *</label>
              <select name="post" value={formData.post} onChange={handleInputChange} className={`${errors.post ? inputError : inputNormal} cursor-pointer`}>
                <option value="">Choose here</option>
                {POST_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.post && <p className="text-rose-500 text-[11px] font-medium">{errors.post}</p>}
            </div>
          </div>

          {/* Row 2: Image + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Image *</label>
              {!fileMeta.preview ? (
                <label className={`border-2 border-dashed ${errors.image ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200 bg-slate-50/40'} hover:border-indigo-300 rounded-xl h-28 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all group`}>
                  <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Plus className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <p className="text-[10px] text-indigo-500 font-medium">Click to add an asset or drag and drop</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative border border-slate-200 rounded-xl overflow-hidden h-28 bg-slate-100 group">
                  <img src={fileMeta.preview} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 p-1 bg-white/90 border border-slate-200 rounded-md text-slate-500 hover:text-rose-600 shadow-sm cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {errors.image && <p className="text-rose-500 text-[11px] font-medium">{errors.image}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Email *</label>
              <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="e.g., member@csitabmc.edu.np" className={errors.email ? inputError : inputNormal} />
              {errors.email && <p className="text-rose-500 text-[11px] font-medium">{errors.email}</p>}
            </div>
          </div>

          {/* Row 3: Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Facebook Link</label>
              <input name="facebookLink" type="url" value={formData.facebookLink} onChange={handleInputChange} placeholder="https://facebook.com/username" className={inputNormal} />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">LinkedIn Link</label>
              <input name="linkedinLink" type="url" value={formData.linkedinLink} onChange={handleInputChange} placeholder="https://linkedin.com/in/username" className={inputNormal} />
            </div>
          </div>

          {/* Row 4: GitHub + Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">GitHub Link</label>
              <input name="githubLink" type="url" value={formData.githubLink} onChange={handleInputChange} placeholder="https://github.com/username" className={inputNormal} />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Tags *</label>
              <div className={`min-h-9 px-2 py-1.5 border rounded-lg flex flex-wrap gap-1.5 items-center focus-within:ring-1 transition-all bg-white ${errors.tags ? 'border-rose-400 focus-within:ring-rose-500' : 'border-slate-200 focus-within:ring-indigo-500'}`}>
                {formData.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-md px-2 py-0.5 text-[10px] font-semibold">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="text-indigo-400 hover:text-indigo-700 cursor-pointer leading-none">×</button>
                  </span>
                ))}
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder={formData.tags.length === 0 ? "e.g. Leadership, Event Management" : "Add tag..."} className="flex-1 min-w-25 outline-none bg-transparent text-slate-700 placeholder:text-slate-400" />
              </div>
              {errors.tags ? <p className="text-rose-500 text-[11px] font-medium">{errors.tags}</p> : <p className="text-[10px] text-slate-400">Press Enter or comma to add a tag</p>}
            </div>
          </div>

          {/* Reusable Description Rich Text Editor Component */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Description *</label>
            <MarkdownEditor
              id="member-modal-textarea"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              error={errors.description}
              placeholder="Write member bio, achievements, or role description..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/30 shrink-0">
          <button type="button" disabled={submitType !== null} onClick={onCancel} className="h-9 w-full sm:w-auto px-4 order-3 sm:order-1 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm">Cancel</button>
          <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2 flex-col sm:flex-row">
            <button type="button" disabled={submitType !== null} onClick={(e) => handleActionClick(e, "draft")} className="h-9 w-full sm:w-auto px-4 text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg cursor-pointer shadow-sm flex items-center justify-center gap-1.5">
              {submitType === "draft" ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Storing...</> : "Save as Draft"}
            </button>
            <button type="button" disabled={submitType !== null} onClick={(e) => handleActionClick(e, "active")} className="h-9 w-full sm:w-auto px-4 text-xs font-semibold bg-[#0b2574] hover:bg-[#0b2574]/90 text-white rounded-lg cursor-pointer shadow-sm flex items-center justify-center gap-1.5">
              {submitType === "active" ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</> : (initialData ? "Update Member" : "Add Member")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}