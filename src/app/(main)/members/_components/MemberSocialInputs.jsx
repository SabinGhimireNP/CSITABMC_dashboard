"use client";

import React from "react";

/**
 * MemberSocialInputs handles Facebook, LinkedIn, and GitHub profile URLs.
 * Renders in a spacious, balanced responsive grid.
 */
export function MemberSocialInputs({ formData, onChange, errors = {} }) {
  const inputBase =
    "w-full h-10 px-3.5 border rounded-lg focus:outline-none focus:ring-1 transition-all text-xs bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 shadow-2xs";
  const inputNormal = `${inputBase} border-slate-200 dark:border-slate-800 focus:ring-indigo-500`;
  const inputError = `${inputBase} border-rose-400 focus:ring-rose-500`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      <div className="space-y-2">
        <label className="font-semibold text-slate-700 dark:text-slate-200 block text-xs">Facebook URL</label>
        <input
          name="fb_link"
          type="url"
          value={formData.fb_link || ""}
          onChange={onChange}
          placeholder="https://facebook.com/..."
          className={errors.fb_link ? inputError : inputNormal}
        />
        {errors.fb_link && (
          <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.fb_link}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="font-semibold text-slate-700 dark:text-slate-200 block text-xs">LinkedIn URL</label>
        <input
          name="linkedin_link"
          type="url"
          value={formData.linkedin_link || ""}
          onChange={onChange}
          placeholder="https://linkedin.com/in/..."
          className={errors.linkedin_link ? inputError : inputNormal}
        />
        {errors.linkedin_link && (
          <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.linkedin_link}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="font-semibold text-slate-700 dark:text-slate-200 block text-xs">GitHub URL</label>
        <input
          name="github_link"
          type="url"
          value={formData.github_link || ""}
          onChange={onChange}
          placeholder="https://github.com/..."
          className={errors.github_link ? inputError : inputNormal}
        />
        {errors.github_link && (
          <p className="text-rose-500 text-[11px] font-medium mt-1">{errors.github_link}</p>
        )}
      </div>
    </div>
  );
}
