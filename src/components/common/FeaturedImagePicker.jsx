"use client";

import React, { useState } from "react";
import { UploadCloud, Globe, X, RefreshCw, Loader2, Link2 } from "lucide-react";
import { validateImageUrl } from "@/components/common/MarkdownEditor";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

/** Resolves when the URL loads as an image in the browser. */
function probeImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("unreachable"));
    img.src = url;
  });
}

/**
 * FeaturedImagePicker
 * Featured/cover image chooser independent of article content images. Supports an
 * external URL or a device upload (sent through `onUpload`, which returns `{ url, publicId }`).
 */
export function FeaturedImagePicker({
  imageUrl = "",
  imageAlt = "",
  isUploadedAsset = false,
  onChange,
  onAltChange,
  onRemove,
  onUpload,
  error,
}) {
  const [activeTab, setActiveTab] = useState("upload");
  const [draftUrl, setDraftUrl] = useState("");
  const [localError, setLocalError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReplacing, setIsReplacing] = useState(false);

  const hasImage = Boolean(imageUrl) && !isReplacing;
  const busy = isUploading || isChecking;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setLocalError("Only PNG, JPG, or WEBP images are supported.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setLocalError("Image file size cannot exceed 5MB.");
      return;
    }

    setLocalError("");
    setIsUploading(true);
    setProgress(0);
    try {
      const { url, publicId } = await onUpload(file, { onProgress: setProgress });
      onChange?.({ url, publicId, suggestedAlt: file.name.replace(/\.[^/.]+$/, "") });
      setIsReplacing(false);
    } catch (err) {
      setLocalError(
        err.response?.data?.image?.[0] || err.response?.data?.detail || "Failed to upload image. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyUrl = async () => {
    const urlError = validateImageUrl(draftUrl);
    if (urlError) {
      setLocalError(urlError);
      return;
    }
    const url = draftUrl.trim();
    setIsChecking(true);
    setLocalError("");
    try {
      await probeImage(url);
      onChange?.({ url, publicId: "" });
      setDraftUrl("");
      setIsReplacing(false);
    } catch {
      setLocalError("This URL could not be loaded as an image. Check the link and try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const fileInput = (
    <input
      type="file"
      accept={ACCEPTED_IMAGE_TYPES.join(",")}
      className="hidden"
      disabled={busy}
      onChange={handleFile}
    />
  );

  return (
    <div className="space-y-4 w-full">
      {hasImage ? (
        <div className="border border-slate-200 rounded-xl bg-slate-50/60 p-4 flex flex-col md:flex-row gap-5">
          <div className="w-full md:w-72 aspect-[1.91/1] bg-white rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={imageAlt || "Featured image preview"}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-800 truncate" title={imageUrl}>
                {imageUrl}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isUploadedAsset ? "Uploaded to media storage" : "External web image"}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="featured-image-alt" className="font-semibold text-slate-700 block text-xs">
                Featured Image Alt Text
              </label>
              <input
                id="featured-image-alt"
                type="text"
                maxLength={255}
                value={imageAlt}
                onChange={(e) => onAltChange?.(e.target.value)}
                placeholder="Describe the image for accessibility & search engines"
                className="w-full h-10 px-3.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => { setIsReplacing(true); setLocalError(""); }}
                className="h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-400" /> Replace Image
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="h-8 px-3 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-[11px] font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <X className="h-3.5 w-3.5 text-rose-500" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
              {[
                { id: "upload", label: "Upload", icon: UploadCloud },
                { id: "url", label: "Image URL", icon: Globe },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  disabled={busy}
                  onClick={() => { setActiveTab(id); setLocalError(""); }}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-md flex items-center gap-1.5 cursor-pointer transition-colors ${
                    activeTab === id ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
            {isReplacing && (
              <button
                type="button"
                disabled={busy}
                onClick={() => { setIsReplacing(false); setLocalError(""); }}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Keep current image
              </button>
            )}
          </div>

          {activeTab === "upload" ? (
            <label
              className={`border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-slate-50/40 transition-all w-full ${
                busy ? "cursor-wait" : "cursor-pointer hover:border-indigo-400 hover:bg-slate-50"
              }`}
            >
              {isUploading ? (
                <div className="w-full max-w-xs space-y-2 text-center" aria-live="polite">
                  <Loader2 className="h-6 w-6 text-indigo-600 animate-spin mx-auto" />
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-200" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-500 tabular-nums">Uploading… {progress}%</p>
                </div>
              ) : (
                <>
                  <UploadCloud className="h-7 w-7 text-slate-400" />
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-700">Click to upload a featured cover image</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB · 1200×630 recommended</p>
                  </div>
                </>
              )}
              {fileInput}
            </label>
          ) : (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-2">
              <label htmlFor="featured-image-url" className="font-semibold text-slate-700 block text-xs">
                External Image URL
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="featured-image-url"
                  type="url"
                  value={draftUrl}
                  onChange={(e) => { setDraftUrl(e.target.value); setLocalError(""); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyUrl();
                    }
                  }}
                  placeholder="https://images.example.com/cover.jpg"
                  className="flex-1 h-10 px-3.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={busy || !draftUrl.trim()}
                  className="h-10 px-4 text-xs font-semibold bg-[#0b2574] hover:bg-[#0b2574]/90 disabled:opacity-50 text-white rounded-lg cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  {isChecking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
                  {isChecking ? "Checking…" : "Use Image"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {(localError || error) && (
        <p role="alert" className="text-[11px] text-rose-500 font-medium">{localError || error}</p>
      )}
    </div>
  );
}
