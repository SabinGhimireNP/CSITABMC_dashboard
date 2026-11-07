"use client";

import React, { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema } from "@/lib/Schema/loginSchema";
import { parseServerError } from "@/lib/errorUtils";

function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";

  const loginMutation = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    // Client-side validation
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const pathKey = issue.path[0];
        if (!fieldErrors[pathKey]) fieldErrors[pathKey] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await loginMutation.mutateAsync(formData);
      const isSafeRedirect =
        returnUrl.startsWith("/") &&
        !returnUrl.startsWith("//") &&
        !returnUrl.includes("\\");
      router.replace(isSafeRedirect ? returnUrl : "/dashboard");
    } catch (err) {
      if (err?.response?.status === 429) {
        const retryAfter = err.response.headers?.["retry-after"] || err.response.headers?.["Retry-After"];
        const serverDetail = err.response.data?.detail;
        const msg = serverDetail || (retryAfter ? `Too many failed login attempts. Please try again in ${retryAfter} seconds.` : "Too many requests. Please wait before trying again.");
        setServerError(msg);
      } else {
        const message = parseServerError(
          err,
          "Invalid email or password. Please try again."
        );
        setServerError(message);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (serverError) setServerError("");
  };

  const isPending = loginMutation.isPending;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header Section */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-3 shadow-inner">
          <LogIn className="w-7 h-7" strokeWidth={2} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mb-1.5">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your admin dashboard
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-card text-card-foreground rounded-2xl shadow-xl border border-border p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Server Error Banner */}
          {serverError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="leading-snug">{serverError}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className={`pl-10 h-11 bg-background border-input text-foreground focus-visible:ring-primary ${
                  errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                disabled={isPending}
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                className={`pl-10 pr-10 h-11 bg-background border-input text-foreground focus-visible:ring-primary ${
                  errors.password ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none p-1"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl cursor-pointer transition-colors shadow-sm"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}