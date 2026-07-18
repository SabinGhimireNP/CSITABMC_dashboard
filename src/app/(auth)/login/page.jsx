"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema } from "@/lib/Schema/loginSchema";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const router = useRouter();

  const loginMutation = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrors({});

    // Validate with Zod
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

    loginMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Login successful! Welcome back.");
        router.push("/dashboard");
      },
      onError: () => {
        toast.error("Invalid email or password. Please try again.");
        setError("Invalid email or password");
      },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0b2574] text-white mb-4">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-sm text-slate-600">Sign in to your admin dashboard</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Server Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`pl-10 h-11 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                  disabled={loginMutation.isPending}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`pl-10 h-11 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                  disabled={loginMutation.isPending}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-[#0b2574] focus:ring-[#0b2574]"
                />
                <span className="text-slate-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-[#0b2574] hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#0b2574] hover:bg-[#0b2574]/90 text-white font-medium"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-2">Demo Credentials:</p>
            <p className="text-xs text-slate-600">Email: admin@example.com</p>
            <p className="text-xs text-slate-600">Password: any password</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          © 2026 Admin Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}