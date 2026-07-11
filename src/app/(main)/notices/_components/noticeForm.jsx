"use client";

import React, { useState, useEffect } from "react";
import { noticeSchema } from "@/lib/Schema/noticeSchema";
import { renderMarkdownToHtml } from "@/lib/markdownCompiler";
import {
  UploadCloud,
  Loader2,
  X,
  FileText,
  Bold,
  Italic,
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
  Code2,
} from "lucide-react";

export function NoticeFormModal({
  initialData = null,
  isOpen,
  onSubmitSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    image: undefined,
  });

  const [editorTab, setEditorTab] = useState("write");
  const [errors, setErrors] = useState({});
  const [submitType, setSubmitType] = useState(null);

  const [fileMeta, setFileMeta] = useState({
    preview: null,
    isPdf: false,
    name: "",
  });

  // Sync initialData when editing an existing node record
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData?.title || "",
        category: initialData?.category || "",
        description: initialData?.description || "",
        image: undefined,
      });
      setFileMeta({
        preview:
          initialData?.image && !initialData.image.endsWith(".pdf")
            ? initialData.image
            : null,
        isPdf: initialData?.image?.endsWith(".pdf") || false,
        name: initialData?.image ? "Attached Document Asset" : "",
      });
      setErrors({});
      setEditorTab("write");
    }
  }, [initialData, isOpen]);

  // Prevent background scroll when the dialog is active
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const injectMarkdownSyntax = (syntaxType) => {
    const textarea = document.getElementById("notice-modal-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.description;
    const selectedText = text.substring(start, end);

    let replacement = "";
    switch (syntaxType) {
      case "h1":
        replacement = `\n# ${selectedText || "Heading 1"}\n`;
        break;
      case "h2":
        replacement = `\n## ${selectedText || "Heading 2"}\n`;
        break;
      case "h3":
        replacement = `\n### ${selectedText || "Heading 3"}\n`;
        break;
      case "bold":
        replacement = `**${selectedText || "bold text"}**`;
        break;
      case "italic":
        replacement = `*${selectedText || "italic text"}*`;
        break;
      case "quote":
        replacement = `\n> ${selectedText || "Quote"}\n`;
        break;
      case "link":
        replacement = `[${selectedText || "Link Text"}](https://example.com)`;
        break;
      case "code-inline":
        replacement = `\`${selectedText || "inline code"}\``;
        break;
      case "code-block":
        replacement = `\n\`\`\`\n${selectedText || "// code block"}\n\`\`\`\n`;
        break;
      case "ul":
        replacement = `\n- ${selectedText || "List item"}\n`;
        break;
      case "ol":
        replacement = `\n1. ${selectedText || "List item"}\n`;
        break;
      case "hr":
        replacement = `\n---\n`;
        break;
      default:
        return;
    }

    const updatedDescription =
      text.substring(0, start) + replacement + text.substring(end);
    setFormData((prev) => ({ ...prev, description: updatedDescription }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + replacement.length,
        start + replacement.length,
      );
    }, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      if (errors.image) setErrors((prev) => ({ ...prev, image: undefined }));
      const isPdf =
        file.type === "application/pdf" || file.name.endsWith(".pdf");
      if (isPdf) {
        setFileMeta({ preview: null, isPdf: true, name: file.name });
      } else {
        const reader = new FileReader();
        reader.onloadend = () =>
          setFileMeta({
            preview: reader.result,
            isPdf: false,
            name: file.name,
          });
        reader.readAsDataURL(file);
      }
    }
  };

  const handleActionClick = async (e, chosenStatus) => {
    e.preventDefault();
    setSubmitType(chosenStatus);
    setErrors({});

    const dataToValidate = { ...formData, status: chosenStatus };
    const result = noticeSchema.safeParse(dataToValidate);

    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        const pathKey = issue.path[0];
        if (!formattedErrors[pathKey]) formattedErrors[pathKey] = issue.message;
      });
      setErrors(formattedErrors);
      setSubmitType(null);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (onSubmitSuccess) onSubmitSuccess(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Darkened Backdrop Layer Overlay */}
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      />

      {/* Centered Form Dialog Body Card */}
      <div className="relative bg-white w-full max-w-3xl rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in scale-in-95 duration-200 z-10 text-xs">
        {/* Simple Compact Top Border Header */}
        {/* Modal Header Row */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="font-semibold text-lg text-primary">
            {initialData ? "Edit Notice" : "Create Notice"}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Form Content View Pane Container */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 w-full">
          {/* Title & Category Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            <div className="md:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-700">
                Notice Title *
              </label>
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Scheduled Network Optimization Breakout Window"
                className={`w-full h-9 px-3 border rounded-lg focus:outline-none focus:ring-1 transition-all ${
                  errors.title
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              {errors.title && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full h-9 px-2.5 border rounded-lg bg-white focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                  errors.category
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 focus:ring-indigo-500"
                }`}
              >
                <option value="">Select Category</option>
                <option value="Urgent Alert">Urgent Alert</option>
                <option value="Maintenance">Maintenance</option>
                <option value="General News">General News</option>
              </select>
              {errors.category && (
                <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Attachment Node File Slot */}
          <div className="space-y-1.5 w-full">
            <label className="font-semibold text-slate-700">
              Notice Attachment (Image or PDF)
            </label>
            {!fileMeta.preview && !fileMeta.isPdf ? (
              <label className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/40 hover:bg-slate-50 transition-all w-full group">
                <UploadCloud className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <div className="text-center">
                  <p className="font-semibold text-slate-700">
                    Click to upload notice attachment
                  </p>
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                    Supports PNG, JPEG, WEBP or PDF (Max 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="relative border border-slate-200 rounded-xl max-w-md bg-slate-50 p-3 pr-12 flex items-center gap-3 group">
                {fileMeta.isPdf ? (
                  <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center border border-rose-100 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-indigo-50 rounded-lg overflow-hidden border border-indigo-100 shrink-0">
                    <img
                      src={fileMeta.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {fileMeta.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-normal">
                    {fileMeta.isPdf
                      ? "PDF Document Asset"
                      : "Image Media Asset"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFileMeta({ preview: null, isPdf: false, name: "" })
                  }
                  className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 rounded-md cursor-pointer shadow-2xs"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Strapi-Equivalent Markdown Functional Rich Text Editor */}
          <div className="space-y-1.5 w-full">
            <label className="font-semibold text-slate-700">
              Notice Detailed Body Description *
            </label>
            <div
              className={`w-full border rounded-xl bg-white overflow-hidden transition-all flex flex-col ${
                errors.description
                  ? "border-rose-400 ring-1 ring-rose-400/20"
                  : "border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30"
              }`}
            >
              {/* Markdown Toolbar Row */}
              <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between gap-4 select-none flex-wrap">
                <div
                  className={`flex items-center gap-0.5 flex-wrap ${editorTab === "preview" ? "opacity-25 pointer-events-none" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => injectMarkdownSyntax("h1")}
                    className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer font-bold"
                  >
                    <Heading1 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => injectMarkdownSyntax("h2")}
                    className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer font-bold"
                  >
                    <Heading2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => injectMarkdownSyntax("h3")}
                    className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer font-bold"
                  >
                    <Heading3 className="h-3.5 w-3.5" />
                  </button>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => injectMarkdownSyntax("bold")}
                    className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => injectMarkdownSyntax("italic")}
                    className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => injectMarkdownSyntax("quote")}
                    className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer"
                  >
                    <Quote className="h-3.5 w-3.5" />
                  </button>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => injectMarkdownSyntax("ul")}
                    className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => injectMarkdownSyntax("ol")}
                    className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer"
                  >
                    <ListOrdered className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => injectMarkdownSyntax("link")}
                    className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer"
                  >
                    <Link className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => injectMarkdownSyntax("hr")}
                    className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => injectMarkdownSyntax("code-inline")}
                    className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer"
                  >
                    <Code className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => injectMarkdownSyntax("code-block")}
                    className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md flex items-center justify-center cursor-pointer"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex bg-slate-200/70 p-0.5 rounded-lg border border-slate-200/30">
                  <button
                    type="button"
                    onClick={() => setEditorTab("write")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 cursor-pointer ${editorTab === "write" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-600"}`}
                  >
                    <Code className="h-3 w-3" /> Editing
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab("preview")}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1 cursor-pointer ${editorTab === "preview" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-600"}`}
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </button>
                </div>
              </div>

              {/* Input Area Frame */}
              {editorTab === "write" ? (
                <textarea
                  id="notice-modal-textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Type or compile documentation components..."
                  className="w-full p-4 focus:outline-none resize-y min-h-37.5 border-0 text-slate-700 leading-relaxed font-mono text-[11px] bg-transparent"
                />
              ) : (
                <div
                  className="w-full p-5 min-h-37.5 max-h-75 overflow-y-auto bg-slate-50/40 text-slate-700 leading-relaxed prose prose-slate max-w-none prose-sm"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdownToHtml(formData.description),
                  }}
                />
              )}
            </div>
            {errors.description && (
              <p className="text-rose-500 text-[11px] font-medium mt-0.5">
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* 3-Button Layout Modal Sticky Footer Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/30 w-full shrink-0">
          <button
            type="button"
            disabled={submitType !== null}
            onClick={onCancel}
            className="h-9 w-full sm:w-auto px-4 order-3 sm:order-1 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto order-1 sm:order-2 flex-col sm:flex-row">
            <button
              type="button"
              disabled={submitType !== null}
              onClick={(e) => handleActionClick(e, "draft")}
              className="h-9 w-full sm:w-auto px-4 text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
            >
              {submitType === "draft" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Storing...
                </>
              ) : (
                "Save as Draft"
              )}
            </button>
            <button
              type="button"
              disabled={submitType !== null}
              onClick={(e) => handleActionClick(e, "published")}
              className="h-9 w-full sm:w-auto px-4 text-xs font-semibold bg-[#0b2574] hover:bg-[#0b2574]/90 text-white rounded-lg cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
            >
              {submitType === "published" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deploying...
                </>
              ) : (
                "Publish Notice"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
