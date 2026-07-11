"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, LogIn } from "lucide-react";
import axios from "axios";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // TODO: Replace with actual authentication API call
      console.log("Login attempt:", formData);

     const response = await axios.post(`${process.env.NEXT_PUBLIC_URL}/login/`, formData);
      console.log("Login response:", response.data);
      alert("Login successful! (This is a demo)");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
            {/* Error Message */}
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
                  className="pl-10 h-11"
                  disabled={isLoading}
                />
              </div>
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
                  className="pl-10 h-11"
                  disabled={isLoading}
                />
              </div>
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
              disabled={isLoading}
            >
              {isLoading ? (
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