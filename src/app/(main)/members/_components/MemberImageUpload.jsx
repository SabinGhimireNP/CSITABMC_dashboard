import React from "react";
import { Plus, X } from "lucide-react";

/**
 * MemberImageUpload renders the file input dropzone/preview for profile photos.
 */
export function MemberImageUpload({ preview, onFileChange, onRemoveImage, error }) {
  return (
    <div className="space-y-1.5">
      <label className="font-semibold text-slate-700">Profile Image</label>
      {!preview ? (
        <label
          className={`border-2 border-dashed ${
            error
              ? "border-rose-300 bg-rose-50/10"
              : "border-slate-200 bg-slate-50/40"
          } hover:border-indigo-300 rounded-xl h-28 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all group`}
        >
          <div className="h-7 w-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <Plus className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <p className="text-[10px] text-indigo-500 font-medium">
            Click to upload a profile photo (max 5MB)
          </p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </label>
      ) : (
        <div className="relative border border-slate-200 rounded-xl overflow-hidden h-28 w-28 bg-slate-100 group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onRemoveImage}
            className="absolute top-2 right-2 p-1 bg-white/90 border border-slate-200 rounded-md text-slate-500 hover:text-rose-600 shadow-sm cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      {error && (
        <p className="text-rose-500 text-[11px] font-medium">{error}</p>
      )}
    </div>
  );
}
