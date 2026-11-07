"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { ModalShell } from "@/components/common/ModalShell";
import { PasswordRequirements } from "@/components/common/PasswordRequirements";
import { useChangePassword } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function ChangePasswordModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errors, setErrors] = useState({});

  const changePasswordMutation = useChangePassword();

  if (!isOpen) return null;

  const handleReset = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOld(false);
    setShowNew(false);
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!oldPassword) newErrors.old_password = "Old password is required.";
    if (!newPassword) newErrors.new_password = "New password is required.";
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirm_password = "Passwords do not match.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully. Other sessions have been signed out.");
      handleClose();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const formatted = {};
        if (data.error) formatted.old_password = data.error;
        if (data.detail) formatted.old_password = data.detail;
        if (data.new_password) {
          formatted.new_password = Array.isArray(data.new_password)
            ? data.new_password.join(" ")
            : data.new_password;
        }
        if (data.old_password) {
          formatted.old_password = Array.isArray(data.old_password)
            ? data.old_password.join(" ")
            : data.old_password;
        }
        setErrors(formatted);
      } else {
        toast.error("Failed to change password. Please verify your credentials.");
      }
    }
  };

  const footer = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={changePasswordMutation.isPending}
        onClick={handleClose}
        className="w-full sm:w-auto order-2 sm:order-1 shadow-2xs"
      >
        Cancel
      </Button>
      <Button
        type="button"
        size="sm"
        disabled={changePasswordMutation.isPending}
        loading={changePasswordMutation.isPending}
        loadingText="Changing..."
        onClick={handleSubmit}
        className="w-full sm:w-auto order-1 sm:order-2 shadow-2xs"
      >
        Change Password
      </Button>
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Your Password"
      maxWidthClass="max-w-md"
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        {/* Old Password */}
        <div className="space-y-1.5 w-full">
          <label className="font-semibold text-foreground text-xs">Current Password *</label>
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                if (errors.old_password) setErrors((prev) => ({ ...prev, old_password: undefined }));
              }}
              placeholder="Enter current password"
              className={`w-full h-9 px-3 pr-10 border rounded-lg bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                errors.old_password ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowOld((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showOld ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {errors.old_password && <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.old_password}</p>}
        </div>

        {/* New Password */}
        <div className="space-y-1.5 w-full">
          <label className="font-semibold text-foreground text-xs">New Password *</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.new_password) setErrors((prev) => ({ ...prev, new_password: undefined }));
              }}
              placeholder="Enter new strong password"
              className={`w-full h-9 px-3 pr-10 border rounded-lg bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                errors.new_password ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNew((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {errors.new_password && (
            <p className="text-destructive text-[11px] font-medium mt-1 whitespace-pre-line">
              {errors.new_password}
            </p>
          )}

          {/* Live password requirements indicator */}
          <PasswordRequirements password={newPassword} />
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5 w-full">
          <label className="font-semibold text-foreground text-xs">Confirm New Password *</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirm_password) setErrors((prev) => ({ ...prev, confirm_password: undefined }));
            }}
            placeholder="Confirm new password"
            className={`w-full h-9 px-3 border rounded-lg bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
              errors.confirm_password ? "border-destructive focus:ring-destructive" : "border-input focus:ring-primary"
            }`}
          />
          {errors.confirm_password && (
            <p className="text-destructive text-[11px] font-medium mt-0.5">{errors.confirm_password}</p>
          )}
        </div>
      </form>
    </ModalShell>
  );
}
