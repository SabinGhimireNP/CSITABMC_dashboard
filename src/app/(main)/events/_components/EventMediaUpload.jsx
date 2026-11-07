import React from "react";
import { UploadCloud, X } from "lucide-react";

/**
 * EventMediaUpload renders the image dropzone and preview asset card for events.
 */
export function EventMediaUpload({
  fileMeta,
  onFileChange,
  onRemoveFile,
  error,
}) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="font-semibold text-slate-700">Event Image</label>
      {!fileMeta?.preview ? (
        <label className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/40 hover:bg-slate-50 transition-all w-full group">
          <UploadCloud className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          <div className="text-center">
            <p className="font-semibold text-slate-700">
              Click to upload event image
            </p>
            <p className="text-[10px] text-slate-400 font-normal mt-0.5">
              Supports PNG, JPEG, WEBP (Max 5MB)
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </label>
      ) : (
        <div className="relative border border-slate-200 rounded-xl max-w-md bg-slate-50 p-3 pr-12 flex items-center gap-3 group">
          <div className="h-10 w-10 bg-indigo-50 rounded-lg overflow-hidden border border-indigo-100 shrink-0">
            <img
              src={fileMeta.preview}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {fileMeta.name}
            </p>
            <p className="text-[10px] text-muted-foreground font-normal">
              Image Media Asset
            </p>
          </div>
          <button
            type="button"
            onClick={onRemoveFile}
            className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 text-muted-foreground hover:text-destructive bg-card border border-border rounded-md cursor-pointer shadow-2xs"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {error && (
        <p className="text-rose-500 text-[11px] font-medium mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
