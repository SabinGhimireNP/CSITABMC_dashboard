"use client";

import React, { useState, useEffect, useMemo } from "react";
import { adminSchema, adminCreateSchema } from "@/lib/Schema/adminSchema";
import { Eye, EyeOff } from "lucide-react";
import { useRoles } from "@/hooks/useAdmins";
import { useAuthStore } from "@/lib/store/authStore";
import { getUserRole, ORDINARY_CMS_ROLES } from "@/lib/roles";
import { ModalShell } from "@/components/common/ModalShell";
import { PasswordRequirements } from "@/components/common/PasswordRequirements";
import { Button } from "@/components/ui/button";

export function AdminFormModal({
  initialData = null,
  isOpen,
  onSubmitSuccess,
  onCancel,
  isPending,
}) {
  const isEditMode = Boolean(initialData && (initialData.id != null || initialData.email || initialData.username));
  const { data: assignableRoles = [] } = useRoles();
  const currentUser = useAuthStore((state) => state.user);
  const currentRole = getUserRole(currentUser);

  // Filter roles: Superadmin cannot be assigned through Admin Access.
  // Regular Admins can only assign ordinary CMS user roles.
  const filteredRoles = useMemo(() => {
    return assignableRoles.filter((r) => {
      if (r.value === "superadmin") return false;
      if (currentRole === "admin") {
        return ORDINARY_CMS_ROLES.includes(r.value);
      }
      return true;
    });
  }, [assignableRoles, currentRole]);

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [submitType, setSubmitType] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Synchronize form values when modal opens or initialData changes
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        username: initialData?.username || "",
        first_name: initialData?.first_name || "",
        last_name: initialData?.last_name || "",
        email: initialData?.email || "",
        password: "", // Never pre-fill password
        role: initialData?.role || (currentRole === "admin" ? "cms_user" : "admin"),
      });
      setErrors({});
      setShowPassword(false);
    }
  }, [initialData, isOpen, currentRole]);

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
      if (onSubmitSuccess) {
        await onSubmitSuccess(result.data);
      }
    } catch (err) {
      const serverErrors = err?.response?.data;
      if (serverErrors && typeof serverErrors === "object") {
        const formatted = {};
        Object.entries(serverErrors).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            formatted[key] = val.join(" ");
          } else if (typeof val === "string") {
            formatted[key] = val;
          }
        });
        setErrors((prev) => ({ ...prev, ...formatted }));
      }
    } finally {
      setSubmitType(null);
    }
  };

  const footer = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={submitType !== null}
        onClick={onCancel}
        className="w-full sm:w-auto order-2 sm:order-1 shadow-2xs"
      >
        Cancel
      </Button>
      <Button
        type="button"
        size="sm"
        loading={submitType !== null || isPending}
        loadingText={isEditMode ? "Saving" : "Adding"}
        disabled={submitType !== null || isPending}
        onClick={handleSubmit}
        className="w-full sm:w-auto order-1 sm:order-2 shadow-2xs"
      >
        {isEditMode ? "Save Changes" : "Add Account"}
      </Button>
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onCancel}
      title={isEditMode ? "Edit Account" : currentRole === "admin" ? "Add CMS User" : "Add Admin / CMS User"}
      maxWidthClass="max-w-lg"
      footer={footer}
    >
      <div className="space-y-4 w-full">
        {/* Username & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
              {filteredRoles.map((roleObj) => (
                <option key={roleObj.value} value={roleObj.value}>{roleObj.label}</option>
              ))}
            </select>
            {errors.role && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.role}</p>}
          </div>
        </div>

        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground text-xs">First Name</label>
            <input
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleInputChange}
              placeholder="e.g., Nisha"
              className={`w-full h-9 px-3 border rounded-lg bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                errors.first_name ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
              }`}
            />
            {errors.first_name && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.first_name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground text-xs">Last Name</label>
            <input
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleInputChange}
              placeholder="e.g., Tamang"
              className={`w-full h-9 px-3 border rounded-lg bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                errors.last_name ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
              }`}
            />
            {errors.last_name && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.last_name}</p>}
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
              placeholder={isEditMode ? "Enter new password to change" : "Min. 8 characters with upper, digit & symbol"}
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
          {errors.password && <p className="text-destructive text-[11px] font-medium mt-1 whitespace-pre-line">{errors.password}</p>}

          {/* Live password requirements indicator */}
          {(!isEditMode || formData.password.length > 0) && (
            <PasswordRequirements password={formData.password} />
          )}
        </div>
      </div>
    </ModalShell>
  );
}