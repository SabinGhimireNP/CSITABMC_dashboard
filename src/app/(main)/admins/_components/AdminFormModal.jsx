"use client";

import React, { useState, useEffect } from "react";
import { adminSchema, adminCreateSchema } from "@/lib/Schema/adminSchema";
import { Loader2, X, Eye, EyeOff } from "lucide-react";
import { useRoles } from "@/hooks/useAdmins";
import { ModalShell } from "@/components/common/ModalShell";

export function AdminFormModal({
  initialData = null,
  isOpen,
  onSubmitSuccess,
  onCancel,
  isPending,
}) {
  const isEditMode = Boolean(initialData && (initialData.id != null || initialData.email || initialData.username));
  // Predefined roles come from the backend; only Superadmins reach this form and the API re-validates.
  const { data: assignableRoles = [] } = useRoles();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [submitType, setSubmitType] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: initialData?.username || "",
        email: initialData?.email || "",
        password: "", // Never pre-fill password
        role: initialData?.role || "",
      });
      setErrors({});
      setShowPassword(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitType("save");
    setErrors({});

    // Use stricter schema on create, lenient on edit
    const schema = isEditMode ? adminSchema : adminCreateSchema;
    const result = schema.safeParse(formData);

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

  const footer = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
      <button
        type="button"
        disabled={submitType !== null}
        onClick={onCancel}
        className="h-9 w-full sm:w-auto px-4 order-2 sm:order-1 text-xs font-semibold border border-border text-foreground bg-card rounded-lg hover:bg-muted/50 cursor-pointer shadow-2xs transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={submitType !== null || isPending}
        onClick={handleSubmit}
        className="h-9 w-full sm:w-auto px-4 order-1 sm:order-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
      >
        {(submitType === "save" || isPending) ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {isEditMode ? "Saving" : "Adding"}</>
        ) : (
          isEditMode ? "Save Changes" : "Add Admin"
        )}
      </button>
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onCancel}
      title={isEditMode ? "Edit Admin" : "Add Admin"}
      maxWidthClass="max-w-lg"
      footer={footer}
    >
      <div className="space-y-5 w-full">
        {/* Full Name & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground text-xs">Username *</label>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="e.g., nisha.tamang"
              className={`w-full h-9 px-3 border rounded-lg bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                errors.username ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
              }`}
            />
            {errors.username && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.username}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground text-xs">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`w-full h-9 px-2.5 border rounded-lg bg-background text-foreground text-xs focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                errors.role ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
              }`}
            >
              <option value="">Select Role</option>
              {assignableRoles.map((roleObj) => (
                <option key={roleObj.value} value={roleObj.value}>{roleObj.label}</option>
              ))}
            </select>
            {errors.role && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.role}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5 w-full">
          <label className="font-semibold text-foreground text-xs">Email Address *</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="e.g., admin@platform.dev"
            className={`w-full h-9 px-3 border rounded-lg bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
              errors.email ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
            }`}
          />
          {errors.email && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5 w-full">
          <label className="font-semibold text-foreground text-xs">
            Password {isEditMode ? <span className="text-muted-foreground font-normal">(leave blank to keep current)</span> : "*"}
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              placeholder={isEditMode ? "Enter new password to change" : "Min. 8 characters"}
              className={`w-full h-9 px-3 pr-10 border rounded-lg bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                errors.password ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {errors.password && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.password}</p>}
        </div>
      </div>
    </ModalShell>
  );
}