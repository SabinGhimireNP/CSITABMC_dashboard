import React from "react";

/**
 * MentorSocialInputs manages the mentor's social media and portfolio URL inputs.
 */
export function MentorSocialInputs({ value = "", onChange, error }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="font-semibold text-slate-700">
        Social / Profile Link *
      </label>
      <input
        name="socialLink"
        type="text"
        value={value}
        onChange={onChange}
        placeholder="https://linkedin.com/in/yourprofile"
        className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
          error
            ? "border-rose-400 focus:ring-rose-500"
            : "border-slate-200 focus:ring-indigo-500"
        }`}
      />
      {error && (
        <p className="text-rose-500 text-[11px] font-medium mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
