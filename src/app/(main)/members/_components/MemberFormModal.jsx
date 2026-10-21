"use client";

import React, { useState, useEffect } from "react";
import { Loader2, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { masterMemberSchema } from "@/lib/Schema/memberSchema";
import { useCreateMember, useUpdateMember } from "@/hooks/useMembers";
import { MarkdownEditor } from "@/components/common/MarkdownEditor";
import { parseServerError } from "@/lib/errorUtils";

function MemberFormModalContent({
  initialData = null,
  onSubmitSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || initialData?.fullName || "",
    email: initialData?.email || "",
    image: initialData?.image || undefined,
    fb_link: initialData?.fb_link || initialData?.facebookLink || "",
    linkedin_link: initialData?.linkedin_link || initialData?.linkedinLink || "",
    github_link: initialData?.github_link || initialData?.githubLink || "",
    description: initialData?.description || "",
    skills: Array.isArray(initialData?.skills) ? initialData.skills : [],
    status: initialData?.status || "published",
  });

  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({});
  const [fileMeta, setFileMeta] = useState({
    preview: initialData?.image || null,
    name: initialData?.image ? "Profile Photo" : "",
  });

  const createMemberMutation = useCreateMember();
  const updateMemberMutation = useUpdateMember();
  const isSubmitting = createMemberMutation.isPending || updateMemberMutation.isPending;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddSkill = (skill) => {
    const trimmed = (skill || skillInput).trim().replace(/^[,\s]+|[,\s]+$/g, "");
    if (!trimmed) return;
    if (formData.skills.includes(trimmed)) {
      setSkillInput("");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }));
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSkill(skillInput);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image size must not exceed 5MB." }));
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileMeta({ preview: reader.result, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setFileMeta({ preview: null, name: "" });
  };

  const handleSubmitWithStatus = async (targetStatus) => {
    setErrors({});

    const submitData = {
      ...formData,
      status: targetStatus,
    };

    const result = masterMemberSchema.safeParse(submitData);
    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (!formattedErrors[fieldName]) {
          formattedErrors[fieldName] = issue.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    const payload = new FormData();
    payload.append("name", submitData.name.trim());
    payload.append("email", submitData.email.trim());
    payload.append("status", targetStatus);

    if (submitData.description?.trim()) {
      payload.append("description", submitData.description.trim());
    } else {
      payload.append("description", "");
    }

    payload.append("skills", JSON.stringify(submitData.skills || []));

    if (submitData.fb_link?.trim()) {
      payload.append("fb_link", submitData.fb_link.trim());
    }
    if (submitData.linkedin_link?.trim()) {
      payload.append("linkedin_link", submitData.linkedin_link.trim());
    }
    if (submitData.github_link?.trim()) {
      payload.append("github_link", submitData.github_link.trim());
    }

    if (submitData.image instanceof File) {
      payload.append("image", submitData.image);
    } else if (submitData.image === null && initialData?.slug) {
      payload.append("image", "");
    }

    try {
      if (initialData?.slug) {
        await updateMemberMutation.mutateAsync({
          slug: initialData.slug,
          formData: payload,
        });
        toast.success(
          targetStatus === "draft"
            ? "Member saved as draft."
            : "Member updated successfully."
        );
      } else {
        await createMemberMutation.mutateAsync(payload);
        toast.success(
          targetStatus === "draft"
            ? "Member saved as draft."
            : "Member created successfully."
        );
      }

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      const errorMsg = parseServerError(err);
      toast.error(errorMsg || "Failed to save member.");
    }
  };

  const inputBase =
    "w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all text-xs bg-white";
  const inputNormal = `${inputBase} border-slate-200 focus:ring-indigo-500`;
  const inputError = `${inputBase} border-rose-400 focus:ring-rose-500`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      />

      <div className="relative bg-white w-full max-w-5xl rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 z-10 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="font-semibold text-lg text-[#0b2574]">
            {initialData ? "Edit Member" : "Add Member"}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitWithStatus(formData.status || "published");
          }}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Full Name *</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Aarav Sharma"
                className={errors.name ? inputError : inputNormal}
              />
              {errors.name && (
                <p className="text-rose-500 text-[11px] font-medium">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Email Address *</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., member@csitabmc.edu.np"
                className={errors.email ? inputError : inputNormal}
              />
              {errors.email && (
                <p className="text-rose-500 text-[11px] font-medium">{errors.email}</p>
              )}
            </div>

            {/* Profile Image Asset */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Profile Image</label>
              {!fileMeta.preview ? (
                <label
                  className={`border-2 border-dashed ${
                    errors.image
                      ? "border-rose-300 bg-rose-50/10"
                      : "border-slate-200 bg-slate-50/40"
                  } hover:border-indigo-300 rounded-xl h-28 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all group`}
                >
                  <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Plus className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <p className="text-[10px] text-indigo-500 font-medium">
                    Click to upload a profile photo (max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="relative border border-slate-200 rounded-xl overflow-hidden h-28 w-28 bg-slate-100 group">
                  <img
                    src={fileMeta.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-white/90 border border-slate-200 rounded-md text-slate-500 hover:text-rose-600 shadow-sm cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {errors.image && (
                <p className="text-rose-500 text-[11px] font-medium">{errors.image}</p>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Skills</label>
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white border border-slate-200 rounded-lg min-h-[42px] focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={() => {
                    if (skillInput.trim()) {
                      handleAddSkill(skillInput);
                    }
                  }}
                  placeholder={
                    formData.skills.length === 0
                      ? "Type a skill and press Enter or comma..."
                      : "Add more..."
                  }
                  className="flex-1 min-w-[140px] text-xs outline-none bg-transparent placeholder:text-slate-400"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Press Enter or comma to add skills (e.g., Python, React, UI/UX).
              </p>
            </div>

            {/* Description / Bio */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Description / Bio</label>
              <MarkdownEditor
                id="member-description-editor"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Write member description or biography..."
                rows={5}
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Facebook URL</label>
                <input
                  name="fb_link"
                  type="url"
                  value={formData.fb_link}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/..."
                  className={errors.fb_link ? inputError : inputNormal}
                />
                {errors.fb_link && (
                  <p className="text-rose-500 text-[11px] font-medium">{errors.fb_link}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">LinkedIn URL</label>
                <input
                  name="linkedin_link"
                  type="url"
                  value={formData.linkedin_link}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/..."
                  className={errors.linkedin_link ? inputError : inputNormal}
                />
                {errors.linkedin_link && (
                  <p className="text-rose-500 text-[11px] font-medium">{errors.linkedin_link}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">GitHub URL</label>
              <input
                name="github_link"
                type="url"
                value={formData.github_link}
                onChange={handleInputChange}
                placeholder="https://github.com/..."
                className={errors.github_link ? inputError : inputNormal}
              />
              {errors.github_link && (
                <p className="text-rose-500 text-[11px] font-medium">{errors.github_link}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/30 shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancel}
              className="h-9 w-full sm:w-auto px-4 order-2 sm:order-1 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm transition-all"
            >
              Cancel
            </button>

            <div className="grid grid-cols-2 gap-2.5 w-full order-1 sm:order-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitWithStatus("draft")}
                className="h-9 w-full sm:w-auto px-2 sm:px-4 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm transition-all text-center flex items-center justify-center"
              >
                Save as Draft
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-9 w-full sm:w-auto px-2 sm:px-4 text-xs font-semibold bg-[#0b2574] hover:bg-[#0b2574]/90 text-white rounded-lg cursor-pointer shadow-sm transition-all flex items-center justify-center text-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    <span>{initialData ? "Updating..." : "Creating..."}</span>
                  </>
                ) : initialData ? (
                  initialData.status === "draft" ? "Publish Member" : "Update Member"
                ) : (
                  "Add Member"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MemberFormModal(props) {
  if (!props.isOpen) return null;
  const key = props.initialData?.slug || "new-member";
  return <MemberFormModalContent key={key} {...props} />;
}
