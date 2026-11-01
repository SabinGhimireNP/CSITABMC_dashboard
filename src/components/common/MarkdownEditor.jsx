"use client";

import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Code,
  Quote,
  Link,
  Minus,
  Image as ImageIcon,
  UploadCloud,
  X,
  Loader2,
  Globe,
} from "lucide-react";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
// ![alt](url) or ![alt](url "title")
const IMAGE_TOKEN_RE = /!\[((?:[^\]\\]|\\.)*)\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;

/** Returns an error message, or "" when the URL is an absolute http(s) URL. */
export function validateImageUrl(raw) {
  const value = (raw || "").trim();
  if (!value) return "Please provide an image URL.";
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return "Enter a valid absolute URL (https://...).";
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return "Only http(s) image URLs are allowed.";
  }
  return "";
}

const escapeAlt = (alt) => alt.replace(/\\/g, "\\\\").replace(/[[\]]/g, "\\$&").replace(/\s+/g, " ").trim();
const unescapeAlt = (alt) => alt.replace(/\\([\\[\]])/g, "$1");
const encodeImageUrl = (url) => url.trim().replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");

/** Finds the ![alt](url) token that contains the given selection, if any. */
function findImageTokenAt(text, start, end) {
  IMAGE_TOKEN_RE.lastIndex = 0;
  let match;
  while ((match = IMAGE_TOKEN_RE.exec(text)) !== null) {
    const tokenStart = match.index;
    const tokenEnd = match.index + match[0].length;
    if (tokenStart <= start && end <= tokenEnd) {
      return { start: tokenStart, end: tokenEnd, alt: unescapeAlt(match[1]), url: match[2] };
    }
  }
  return null;
}

export function MarkdownEditor({
  id = "markdown-editor-textarea",
  name,
  value = "",
  onChange,
  error,
  placeholder = "Write something in markdown...",
  rows = 6,
  minHeight = 220,
  // Image insertion is opt-in: URL insertion via `allowImages`, device upload via `onUploadImage`
  allowImages = false,
  onUploadImage,
  onImageUploaded,
}) {
  const [editorTab, setEditorTab] = useState("write");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalTab, setImageModalTab] = useState("url"); // "url" | "upload"
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  // Selection range captured when the image dialog opens; `replace` when editing an existing image
  const [imageTarget, setImageTarget] = useState(null);
  const fileInputRef = useRef(null);

  const canUpload = typeof onUploadImage === "function";

  const emitChange = (updated, cursorPos) => {
    if (onChange) onChange({ target: { name, value: updated } });
    setTimeout(() => {
      const textarea = document.getElementById(id);
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const injectMarkdown = (type) => {
    const textarea = document.getElementById(id);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const sel = value.substring(start, end);

    const map = {
      h1: `\n# ${sel || "Heading 1"}\n`,
      h2: `\n## ${sel || "Heading 2"}\n`,
      h3: `\n### ${sel || "Heading 3"}\n`,
      bold: `**${sel || "bold text"}**`,
      italic: `*${sel || "italic text"}*`,
      underline: `<u>${sel || "underlined"}</u>`,
      quote: `\n> ${sel || "Quote"}\n`,
      link: `[${sel || "Link Text"}](https://example.com)`,
      "code-inline": `\`${sel || "inline code"}\``,
      "code-block": `\n\`\`\`\n${sel || "// code block"}\n\`\`\`\n`,
      ul: `\n- ${sel || "List item"}\n`,
      ol: `\n1. ${sel || "List item"}\n`,
      hr: `\n---\n`,
    };

    const replacement = map[type];
    if (!replacement) return;
    emitChange(value.substring(0, start) + replacement + value.substring(end), start + replacement.length);
  };

  const openImageModal = () => {
    const textarea = document.getElementById(id);
    const start = textarea ? textarea.selectionStart : value.length;
    const end = textarea ? textarea.selectionEnd : value.length;
    const existing = findImageTokenAt(value, start, end);

    if (existing) {
      setImageTarget({ start: existing.start, end: existing.end, replace: true });
      setImageUrl(existing.url);
      setImageAlt(existing.alt);
      setImageModalTab("url");
    } else {
      setImageTarget({ start, end, replace: false });
      setImageModalTab(allowImages ? "url" : "upload");
    }
    setShowImageModal(true);
  };

  const insertImage = (url, alt) => {
    const target = imageTarget || { start: value.length, end: value.length, replace: false };
    const token = `![${escapeAlt(alt)}](${encodeImageUrl(url)})`;
    const snippet = target.replace ? token : `\n${token}\n`;
    emitChange(value.substring(0, target.start) + snippet + value.substring(target.end), target.start + snippet.length);
  };

  const handleInsertUrlImage = (e) => {
    e.preventDefault();
    const urlError = validateImageUrl(imageUrl);
    if (urlError) {
      setUploadError(urlError);
      return;
    }
    insertImage(imageUrl, imageAlt.trim() || "Article image");
    closeImageModal();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("Only PNG, JPG, WEBP, or GIF images are supported.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError("Image file size must be less than 5MB.");
      return;
    }

    setSelectedFile(file);
    setUploadError("");
    setFilePreview(URL.createObjectURL(file));
  };

  const handleUploadAndInsert = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError("Please choose an image file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError("");

    try {
      const result = await onUploadImage(selectedFile, { onProgress: setUploadProgress });
      const url = typeof result === "string" ? result : result?.url;
      const publicId = typeof result === "string" ? "" : result?.publicId || result?.public_id || "";

      if (!url) {
        setUploadError("Upload succeeded but no image URL was returned.");
        return;
      }
      const alt = imageAlt.trim() || selectedFile.name.replace(/\.[^/.]+$/, "");
      insertImage(url, alt);
      onImageUploaded?.({ url, publicId, alt });
      closeImageModal();
    } catch (err) {
      const msg =
        err.response?.data?.image?.[0] ||
        err.response?.data?.detail ||
        "Failed to upload image. Please try again.";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setImageUrl("");
    setImageAlt("");
    setSelectedFile(null);
    setFilePreview("");
    setUploadError("");
    setUploadProgress(0);
    setIsUploading(false);
    setImageTarget(null);
  };

  const showImageButton = allowImages || canUpload;

  return (
    <div className="space-y-1.5 w-full relative">
      <div
        className={`w-full border rounded-xl bg-white overflow-hidden transition-all flex flex-col ${
          error
            ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500/30"
            : "border-slate-200 focus-within:border-indigo-500 focus-within:ring-indigo-500/30"
        } focus-within:ring-1`}
      >
        {/* Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between gap-4 flex-wrap select-none">
          <div className={`flex items-center gap-0.5 flex-wrap ${editorTab === "preview" ? "opacity-25 pointer-events-none" : ""}`}>
            {[{ icon: Heading1, type: "h1" }, { icon: Heading2, type: "h2" }, { icon: Heading3, type: "h3" }].map(({ icon: Icon, type }) => (
              <button key={type} type="button" onClick={() => injectMarkdown(type)} className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer">
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
            <div className="w-px h-4 bg-slate-200 mx-1" />
            {[{ icon: Bold, type: "bold" }, { icon: Italic, type: "italic" }, { icon: Underline, type: "underline" }, { icon: Quote, type: "quote" }].map(({ icon: Icon, type }) => (
              <button key={type} type="button" onClick={() => injectMarkdown(type)} className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer">
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
            <div className="w-px h-4 bg-slate-200 mx-1" />
            {[{ icon: List, type: "ul" }, { icon: ListOrdered, type: "ol" }, { icon: Link, type: "link" }, { icon: Minus, type: "hr" }].map(({ icon: Icon, type }) => (
              <button key={type} type="button" onClick={() => injectMarkdown(type)} className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer">
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
            {showImageButton && (
              <>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={openImageModal}
                  title="Insert image, or place the cursor on an existing image to edit it"
                  aria-label="Insert or edit image"
                  className="h-7 px-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 rounded-md flex items-center gap-1 cursor-pointer text-xs"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="hidden sm:inline font-medium text-[11px]">Image</span>
                </button>
              </>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-200/70 p-0.5 rounded-lg border border-slate-200/30">
            <button type="button" onClick={() => setEditorTab("write")} className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 cursor-pointer ${editorTab === "write" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"}`}>
              <Code className="h-3 w-3" /> Editing
            </button>
            <button type="button" onClick={() => setEditorTab("preview")} className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 cursor-pointer ${editorTab === "preview" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"}`}>
              <Eye className="h-3 w-3" /> Preview
            </button>
          </div>
        </div>

        {/* Content Pane */}
        {editorTab === "write" ? (
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full p-4 focus:outline-none resize-y border-0 text-slate-700 leading-relaxed font-mono text-[11px] bg-transparent"
          />
        ) : (
          <div
            style={{ minHeight, maxHeight: Math.max(minHeight * 1.5, 384) }}
            className="w-full p-5 overflow-y-auto bg-slate-50/40 text-slate-700 text-xs break-words
            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-1 [&_h1]:text-[#0b2574]
            [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-2.5 [&_h2]:mb-1 [&_h2]:text-[#0b2574]
            [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-0.5
            [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_blockquote]:text-slate-500
            [&_u]:underline
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
            [&_p]:mb-2 [&_p]:leading-relaxed
            [&_a]:text-indigo-600 [&_a]:underline
            [&_img]:max-h-72 [&_img]:rounded-lg [&_img]:my-3 [&_img]:object-contain [&_img]:border [&_img]:border-slate-200 [&_img]:shadow-2xs"
          >
            {value.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <span className="text-slate-400 italic text-[11px]">Nothing to preview</span>
            )}
          </div>
        )}
      </div>

      {/* Image Insertion Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-indigo-600" />
                <h3 className="font-semibold text-xs text-slate-800">
                  {imageTarget?.replace ? "Edit Article Image" : "Insert Image into Article"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeImageModal}
                disabled={isUploading}
                aria-label="Close image dialog"
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            {allowImages && canUpload && (
              <div className="flex border-b border-slate-100 px-5 pt-3 gap-2 bg-slate-50/30">
                <button
                  type="button"
                  onClick={() => { setImageModalTab("url"); setUploadError(""); }}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    imageModalTab === "url"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" /> Image URL
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => { setImageModalTab("upload"); setUploadError(""); }}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    imageModalTab === "upload"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <UploadCloud className="h-3.5 w-3.5" /> Upload File
                </button>
              </div>
            )}

            <div className="p-5 space-y-4">
              {uploadError && (
                <div role="alert" className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-[11px] rounded-lg">
                  {uploadError}
                </div>
              )}

              {imageModalTab === "url" ? (
                <form onSubmit={handleInsertUrlImage} className="space-y-3" noValidate>
                  <div className="space-y-1">
                    <label htmlFor={`${id}-image-url`} className="text-[11px] font-semibold text-slate-700">Image Web URL</label>
                    <input
                      id={`${id}-image-url`}
                      type="url"
                      placeholder="https://example.com/images/banner.jpg"
                      value={imageUrl}
                      onChange={(e) => { setImageUrl(e.target.value); setUploadError(""); }}
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  {imageUrl && !validateImageUrl(imageUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl.trim()}
                      alt="Image URL preview"
                      className="max-h-32 rounded-lg border border-slate-200 object-contain bg-slate-50"
                      onError={() => setUploadError("This URL could not be loaded as an image. Check the link.")}
                    />
                  )}
                  <div className="space-y-1">
                    <label htmlFor={`${id}-image-alt`} className="text-[11px] font-semibold text-slate-700">Alternative Text (Alt)</label>
                    <input
                      id={`${id}-image-alt`}
                      type="text"
                      maxLength={255}
                      placeholder="Descriptive image label for SEO & accessibility"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closeImageModal}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                    >
                      {imageTarget?.replace ? "Update Image" : "Insert Image"}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleUploadAndInsert} className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-700">Select Image File</span>
                    {!filePreview ? (
                      <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <UploadCloud className="h-6 w-6 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700">Click to choose image</span>
                        <span className="text-[10px] text-slate-400">PNG, JPG, WEBP, GIF up to 5MB</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept={ACCEPTED_IMAGE_TYPES.join(",")}
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative border border-slate-200 rounded-xl p-2 bg-slate-50 flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={filePreview}
                          alt="Upload preview"
                          className="h-14 w-14 object-cover rounded-lg border border-slate-200 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{selectedFile?.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {(selectedFile?.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        {!isUploading && (
                          <button
                            type="button"
                            onClick={() => { setSelectedFile(null); setFilePreview(""); }}
                            aria-label="Remove selected file"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isUploading && (
                    <div className="space-y-1" aria-live="polite">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 tabular-nums">Uploading… {uploadProgress}%</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label htmlFor={`${id}-upload-alt`} className="text-[11px] font-semibold text-slate-700">Alternative Text (Alt)</label>
                    <input
                      id={`${id}-upload-alt`}
                      type="text"
                      maxLength={255}
                      placeholder="Descriptive image label for SEO & accessibility"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closeImageModal}
                      disabled={isUploading}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading || !selectedFile}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      {isUploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {isUploading ? "Uploading..." : imageTarget?.replace ? "Upload & Replace" : "Upload & Insert"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
