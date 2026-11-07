"use client";

import React, { useState } from "react";
import { UploadCloud, Globe, X, RefreshCw, Loader2, Link2, Trash2, AlertTriangle } from "lucide-react";
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
 * Features dual-control preview:
 * - "X" button: Clears preview from draft without deleting remote asset.
 * - "Trash" button: Permanently destroys asset from Cloudinary storage after confirmation & reference check.
 */
export function FeaturedImagePicker({
  imageUrl = "",
  imageAlt = "",
  isUploadedAsset = false,
  publicId = "",
  onChange,
  onAltChange,
  onRemove,
  onDestroy,
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
  const [showDestroyModal, setShowDestroyModal] = useState(false);
  const [isDestroying, setIsDestroying] = useState(false);
  const [destroyError, setDestroyError] = useState("");

  const hasImage = Boolean(imageUrl) && !isReplacing;
  const busy = isUploading || isChecking || isDestroying;


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
        <div className="border border-border rounded-xl bg-muted/20 p-4 flex flex-col md:flex-row gap-5">
          <div className="w-full md:w-72 aspect-[1.91/1] bg-card rounded-lg overflow-hidden border border-border shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={imageAlt || "Featured image preview"}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <p className="text-xs font-semibold text-foreground truncate" title={imageUrl}>
                {imageUrl}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isUploadedAsset ? "Uploaded to media storage" : "External web image"}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="featured-image-alt" className="font-semibold text-foreground block text-xs">
                Featured Image Alt Text
              </label>
              <input
                id="featured-image-alt"
                type="text"
                maxLength={255}
                value={imageAlt}
                onChange={(e) => onAltChange?.(e.target.value)}
                placeholder="Describe the image for accessibility & search engines"
                className="w-full h-10 px-3.5 text-xs border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => { setIsReplacing(true); setLocalError(""); }}
                className="h-8 px-3 bg-card border border-border hover:bg-muted text-foreground text-[11px] font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" /> Replace Image
              </button>
              <button
                type="button"
                onClick={onRemove}
                title="Remove preview from this form without deleting remote file"
                className="h-8 px-3 bg-card border border-border hover:bg-muted text-foreground text-[11px] font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" /> Clear from Draft
              </button>
              {onDestroy && (
                <button
                  type="button"
                  onClick={() => { setShowDestroyModal(true); setDestroyError(""); }}
                  title="Permanently delete asset from Cloudinary media storage"
                  className="h-8 px-3 bg-card border border-destructive/30 hover:bg-destructive/10 text-destructive text-[11px] font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" /> Delete from Storage
                </button>
              )}
            </div>

            {/* Confirmation Dialog for Permanent Cloudinary Asset Destruction */}
            {showDestroyModal && (
              <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
                <div className="bg-card rounded-2xl max-w-md w-full max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-border space-y-4 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-destructive/10 rounded-xl border border-destructive/20 shrink-0">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">
                        Permanently Delete Cloudinary Asset?
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This action will permanently destroy this file from media storage. If this asset is referenced by other posts, events, notices, or members, deletion will be rejected to prevent broken media.
                      </p>
                    </div>
                  </div>

                  {destroyError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive font-medium">
                      {destroyError}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isDestroying}
                      onClick={() => setShowDestroyModal(false)}
                      className="px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-lg cursor-pointer transition-colors"
                    >
                      Keep File
                    </button>
                    <button
                      type="button"
                      disabled={isDestroying}
                      onClick={async () => {
                        setIsDestroying(true);
                        setDestroyError("");
                        try {
                          await onDestroy({ url: imageUrl, publicId });
                          setShowDestroyModal(false);
                          onRemove?.();
                        } catch (err) {
                          const msg = err.response?.data?.detail || err.message || "Failed to delete remote asset.";
                          const refs = err.response?.data?.references;
                          setDestroyError(refs ? `${msg} In use by: ${refs.join(", ")}` : msg);
                        } finally {
                          setIsDestroying(false);
                        }
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50 transition-colors"
                    >
                      {isDestroying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Permanently Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex bg-muted p-0.5 rounded-lg border border-border">
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
                    activeTab === id ? "bg-card text-primary shadow-2xs" : "text-muted-foreground hover:text-foreground"
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
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Keep current image
              </button>
            )}
          </div>

          {activeTab === "upload" ? (
            <label
              className={`border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-2 bg-muted/20 transition-all w-full ${
                busy ? "cursor-wait" : "cursor-pointer hover:border-primary/50 hover:bg-muted/40"
              }`}
            >
              {isUploading ? (
                <div className="w-full max-w-xs space-y-2 text-center" aria-live="polite">
                  <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" />
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground tabular-nums">Uploading… {progress}%</p>
                </div>
              ) : (
                <>
                  <UploadCloud className="h-7 w-7 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-xs font-semibold text-foreground">Click to upload a featured cover image</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 5MB · 1200×630 recommended</p>
                  </div>
                </>
              )}
              {fileInput}
            </label>
          ) : (
            <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-2">
              <label htmlFor="featured-image-url" className="font-semibold text-foreground block text-xs">
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
                  className="flex-1 h-10 px-3.5 text-xs border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-background text-foreground shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={busy || !draftUrl.trim()}
                  className="h-10 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
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
