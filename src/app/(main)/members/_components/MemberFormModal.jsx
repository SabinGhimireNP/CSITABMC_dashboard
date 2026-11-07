"use client";

import React, { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { masterMemberSchema } from "@/lib/Schema/memberSchema";
import { useCreateMember, useUpdateMember } from "@/hooks/useMembers";
import { MarkdownEditor } from "@/components/common/MarkdownEditor";
import { FormSection } from "@/components/common/FormSection";
import { parseServerError } from "@/lib/errorUtils";
import { MemberSkillsInput } from "./MemberSkillsInput";
import { MemberSocialInputs } from "./MemberSocialInputs";
import { MemberImageUpload } from "./MemberImageUpload";
import { MODAL_OVERLAY_CLASS, modalPanelClass } from "@/components/common/ModalShell";
import { Button } from "@/components/ui/button";

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
    if (!formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
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
    } else if (submitData.image === null) {
      payload.append("image", "");
    }

    try {
      if (initialData?.slug) {
        await updateMemberMutation.mutateAsync({
          slug: initialData.slug,
          data: payload,
        });
        toast.success("Member updated successfully.");
      } else {
        await createMemberMutation.mutateAsync(payload);
        toast.success("Member added successfully.");
      }
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      const errorMsg = parseServerError(err);
      toast.error(errorMsg || "Failed to save member.");
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
              {initialData ? "Edit Member" : "Add Member"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {initialData
                ? "Update member profile, skills, bio, and social channels."
                : "Enter member details below to register a new organization member."}
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitWithStatus(formData.status || "published");
          }}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          <div className="p-4 sm:p-8 overflow-y-auto min-h-0 space-y-8 sm:space-y-10 flex-1 w-full overflow-x-hidden">
            {/* Section 1: Profile & Identity */}
            <FormSection
              title="Profile & Identity"
              description="Primary identity information and official contact email."
              withDivider={false}
            >
              <div className="space-y-6 sm:space-y-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7">
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-700 block text-xs">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Aarav Sharma"
                      className={errors.name ? inputError : inputNormal}
                    />
                    {errors.name && (
                      <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="font-semibold text-slate-700 block text-xs">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g., member@csitabmc.edu.np"
                      className={errors.email ? inputError : inputNormal}
                    />
                    {errors.email && (
                      <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <MemberImageUpload
                  preview={fileMeta.preview}
                  onFileChange={handleFileChange}
                  onRemoveImage={handleRemoveImage}
                  error={errors.image}
                />
              </div>
            </FormSection>

            {/* Section 2: Skills & Expertise */}
            <FormSection
              title="Skills & Expertise"
              description="Areas of technical proficiency, languages, or tools."
            >
              <MemberSkillsInput
                skills={formData.skills}
                onAddSkill={handleAddSkill}
                onRemoveSkill={handleRemoveSkill}
              />
            </FormSection>

            {/* Section 3: Biography & Background */}
            <FormSection
              title="Biography & Background"
              description="Brief overview of background, interests, or achievements."
            >
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block text-xs">Description / Bio</label>
                <MarkdownEditor
                  id="member-description-editor"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Write member description or biography..."
                  rows={5}
                />
              </div>
            </FormSection>

            {/* Section 4: Social & Professional Links */}
            <FormSection
              title="Social & External Profiles"
              description="Connect public developer profiles and social media channels."
            >
              <MemberSocialInputs
                formData={formData}
                onChange={handleInputChange}
                errors={errors}
              />
            </FormSection>
          </div>

          {/* Footer with Balanced Responsive Buttons */}
          <div className="px-4 py-3 sm:p-5 sm:px-8 border-t border-border/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted/40 dark:bg-[#16181e] shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onCancel}
              className="w-full sm:w-auto order-2 sm:order-1 shadow-2xs"
            >
              Cancel
            </Button>

            <div className="grid grid-cols-2 gap-3 w-full order-1 sm:order-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleSubmitWithStatus("draft")}
                className="w-full sm:w-auto shadow-2xs"
              >
                Save as Draft
              </Button>

              <Button
                type="submit"
                loading={isSubmitting}
                loadingText={initialData ? "Updating..." : "Creating..."}
                disabled={isSubmitting}
                className="w-full sm:w-auto shadow-2xs"
              >
                {initialData
                  ? initialData.status === "draft" ? "Publish Member" : "Update Member"
                  : "Add Member"}
              </Button>
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
