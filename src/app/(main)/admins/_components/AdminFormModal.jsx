"use client";

import React, { useState, useEffect } from "react";
import { adminSchema, adminCreateSchema, ADMIN_ROLES } from "@/lib/Schema/adminSchema";
import { Loader2, X, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { isSuperadminUser } from "@/lib/roles";

export function AdminFormModal({
  initialData = null,
  isOpen,
  onSubmitSuccess,
  onCancel,
  isPending,
}) {
  const isEditMode = Boolean(initialData && (initialData.id != null || initialData.email || initialData.username));
  const currentUser = useAuthStore((state) => state.user);
  // Only Superadmins may assign the Admin role; an account's current role is always kept selectable.
  const assignableRoles = ADMIN_ROLES.filter(
    (r) => isSuperadminUser(currentUser) || r.value === "cms_user" || r.value === initialData?.role
  );
  if (initialData?.role && !assignableRoles.some((r) => r.value === initialData.role)) {
    assignableRoles.push({ label: initialData.role === "superadmin" ? "Superadmin" : initialData.role, value: initialData.role });
  }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      />

      <div className="relative bg-white w-full max-w-lg rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in scale-in-95 duration-200 z-10 text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="font-semibold text-lg text-primary">
            {isEditMode ? "Edit Admin" : "Add Admin"}
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
              <label className="font-semibold text-slate-700">Username *</label>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="e.g., nisha.tamang"
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                  errors.username ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.username && <p className="text-rose-500 text-[11px] font-medium mt-0.5">{errors.username}</p>}
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
                {assignableRoles.map((roleObj) => (
                  <option key={roleObj.value} value={roleObj.value}>{roleObj.label}</option>
                ))}
              </select>
              {errors.role && <p className="text-rose-500 text-[11px] font-medium mt-0.5">{errors.role}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5 w-full">
            <label className="font-semibold text-slate-700">Email Address *</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g., admin@platform.dev"
              className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                errors.email ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
              }`}
            />
            {errors.email && <p className="text-rose-500 text-[11px] font-medium mt-0.5">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5 w-full">
            <label className="font-semibold text-slate-700">
              Password {isEditMode ? <span className="text-slate-400 font-normal">(leave blank to keep current)</span> : "*"}
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder={isEditMode ? "Enter new password to change" : "Min. 8 characters"}
                className={`w-full h-9 px-3 pr-10 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                  errors.password ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors.password && <p className="text-rose-500 text-[11px] font-medium mt-0.5">{errors.password}</p>}
          </div>

          {/* Removed Status Field */}
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
            disabled={submitType !== null || isPending}
            onClick={handleSubmit}
            className="h-9 w-full sm:w-auto px-4 order-1 sm:order-2 text-xs font-semibold bg-[#0b2574] hover:bg-[#0b2574]/90 text-white rounded-lg cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
          >
            {(submitType === "save" || isPending) ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {isEditMode ? "Saving" : "Adding"}</>
            ) : (
              isEditMode ? "Save Changes" : "Add Admin"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}