"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2, CheckCircle2, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { FormSection } from "@/components/common/FormSection";
import { MarkdownEditor } from "@/components/common/MarkdownEditor";
import { FeaturedImagePicker } from "@/components/common/FeaturedImagePicker";
import { useBlog, useCreateBlog, useUpdateBlog, uploadBlogImage, deleteBlogImage, toBlogPayload } from "@/hooks/useBlogs";
import { useMembersList } from "@/hooks/useMembers";
import { MemberSearchCombobox } from "@/components/common/MemberSearchCombobox";
import { blogSchema, BLOG_LIMITS } from "@/lib/Schema/blogSchema";
import { parseServerError } from "@/lib/errorUtils";
import { BlogConfirmDialog } from "./BlogDeleteDialog";
import { slugifyText, formatDate } from "./blogUtils";
import { MODAL_OVERLAY_CLASS, MODAL_BACKDROP_CLASS, modalPanelClass } from "@/components/common/ModalShell";

// API field name → form field name, for mapping server validation errors
const SERVER_FIELD_MAP = {
  title: "title",
  author_id: "authorId",
  excerpt: "excerpt",
  content: "content",
  content_images: "content",
  featured_image_url: "featuredImageUrl",
  featured_image_alt: "featuredImageAlt",
  featured_image_public_id: "featuredImageUrl",
  status: "status",
};

const EMPTY_FORM = {
  title: "",
  authorId: null,
  excerpt: "",
  content: "",
  contentImages: [],
  featuredImageUrl: "",
  featuredImagePublicId: "",
  featuredImageAlt: "",
  status: "draft",
};

const inputBase =
  "w-full h-10 px-3.5 border rounded-lg focus:outline-none focus:ring-1 transition-all text-xs bg-white shadow-2xs";
const inputNormal = `${inputBase} border-slate-200 focus:ring-indigo-500`;
const inputError = `${inputBase} border-rose-400 focus:ring-rose-500`;

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-rose-500 text-[11px] font-medium mt-1">{message}</p>;
}

function CharCount({ value, limit }) {
  const over = value.length > limit;
  return (
    <span className={`text-[10px] tabular-nums ${over ? "text-rose-500 font-semibold" : "text-slate-400"}`}>
      {value.length}/{limit}
    </span>
  );
}

function ModalShell({ title, subtitle, onClose, children, footer, headerExtra }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className={MODAL_OVERLAY_CLASS}>
      <div className={MODAL_BACKDROP_CLASS} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="blog-form-title"
        className={modalPanelClass("max-w-6xl", "sm:max-h-[94dvh]")}
      >
        <div className="px-4 py-4 sm:p-5 sm:px-8 border-b border-border/80 dark:border-white/10 flex items-center justify-between gap-4 bg-muted/40 dark:bg-[#16181e] shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 id="blog-form-title" className="font-semibold text-base sm:text-lg text-foreground break-words">{title}</h2>
              {headerExtra}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-white/10 transition-all cursor-pointer shrink-0"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {children}
        {footer}
      </div>
    </div>
  );
}

function BlogFormContent({ initialData, onClose, onSaved }) {
  const isEditing = Boolean(initialData?.id);
  const wasPublished = Boolean(initialData?.publishedAt);
  const isCurrentlyPublished = initialData?.status === "published";
  const createBlogMutation = useCreateBlog();
  const updateBlogMutation = useUpdateBlog();
  // Full member directory (every tenure), same source as Tenure assignments
  const { data: members = [], isLoading: membersLoading, isError: membersError } = useMembersList();

  const initialForm = useMemo(
    () => ({
      ...EMPTY_FORM,
      ...(initialData
        ? {
            title: initialData.title,
            authorId: initialData.author?.id ?? null,
            excerpt: initialData.excerpt || "",
            content: initialData.content || "",
            contentImages: initialData.contentImages || [],
            featuredImageUrl: initialData.featuredImageUrl || "",
            featuredImagePublicId: initialData.featuredImagePublicId || "",
            featuredImageAlt: initialData.featuredImageAlt || "",
            status: initialData.status || "draft",
          }
        : {}),
    }),
    [initialData]
  );

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitAction, setSubmitAction] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  // The backend owns the slug: it is generated from the title and regenerated when the title changes.
  const titleChanged = isEditing && form.title.trim() !== initialData.title;
  const slugPreview = isEditing && !titleChanged ? initialData.slug : slugifyText(form.title);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const requestClose = () => {
    if (submitAction) return;
    if (!isDirty) {
      onClose();
      return;
    }
    setConfirm({
      title: "Discard unsaved changes?",
      message: "You have unsaved edits to this article. Closing now will discard them.",
      confirmLabel: "Discard Changes",
      tone: "danger",
      onConfirm: () => {
        setConfirm(null);
        onClose();
      },
    });
  };

  const submit = async (action) => {
    if (submitAction) return;
    const targetStatus = action === "publish" || action === "save-published" ? "published" : "draft";
    const candidate = { ...form, status: targetStatus };

    const result = blogSchema.safeParse(candidate);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const payload = toBlogPayload(candidate);

    setSubmitAction(action);
    setErrors({});
    try {
      const saved = isEditing
        ? await updateBlogMutation.mutateAsync({ id: initialData.id, payload })
        : await createBlogMutation.mutateAsync(payload);

      const messages = {
        draft: isEditing ? "Draft saved." : "Draft created.",
        publish: "Article published.",
        "save-published": "Published article updated.",
        unpublish: "Article moved back to draft.",
      };
      toast.success(messages[action]);
      onSaved?.(saved, !isEditing);
      onClose();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object" && !data.detail) {
        const fieldErrors = {};
        Object.entries(data).forEach(([key, value]) => {
          const field = SERVER_FIELD_MAP[key] || key;
          const message = Array.isArray(value)
            ? value.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(" ")
            : String(value);
          fieldErrors[field] = fieldErrors[field] ? `${fieldErrors[field]} ${message}` : message;
        });
        setErrors(fieldErrors);
      }
      toast.error(parseServerError(err, "Failed to save the blog article."));
    } finally {
      setSubmitAction(null);
    }
  };

  const requestUnpublish = () => {
    setConfirm({
      title: "Unpublish this article?",
      message:
        "The article will return to Draft and will no longer be eligible for public display. Its original publication date is kept.",
      confirmLabel: "Unpublish",
      tone: "danger",
      onConfirm: () => {
        setConfirm(null);
        submit("unpublish");
      },
    });
  };

  const busy = submitAction !== null;
  const spinner = (action) => submitAction === action && <Loader2 className="h-3.5 w-3.5 animate-spin" />;

  const statusBadge = (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
        isCurrentlyPublished
          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
          : "bg-amber-50 text-amber-700 border-amber-200/60"
      }`}
    >
      {isCurrentlyPublished ? "PUBLISHED" : "DRAFT"}
    </span>
  );

  const footer = (
    <div className="px-4 py-3 sm:p-5 sm:px-8 border-t border-border/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted/40 dark:bg-[#16181e] w-full shrink-0">
      <button
        type="button"
        disabled={busy}
        onClick={requestClose}
        className="h-10 w-full sm:w-auto px-5 order-2 sm:order-1 text-xs font-semibold border border-border/80 dark:border-white/12 text-foreground bg-card dark:bg-[#1f232b] rounded-lg hover:bg-muted/50 dark:hover:bg-white/10 cursor-pointer shadow-2xs transition-colors"
      >
        Cancel
      </button>

      <div className="grid grid-cols-2 gap-3 w-full order-1 sm:order-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
        {isCurrentlyPublished ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={requestUnpublish}
              className="h-10 w-full sm:w-auto px-4 sm:px-5 text-xs font-semibold border border-border/80 dark:border-white/12 text-foreground bg-card dark:bg-[#1f232b] hover:bg-muted/50 dark:hover:bg-white/10 rounded-lg cursor-pointer shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              {spinner("unpublish") || <EyeOff className="h-3.5 w-3.5" />}
              Unpublish
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => submit("save-published")}
              className="h-10 w-full sm:w-auto px-5 sm:px-6 text-xs font-semibold bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-lg cursor-pointer shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              {spinner("save-published") || <CheckCircle2 className="h-3.5 w-3.5" />}
              Save Changes
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => submit("draft")}
              className="h-10 w-full sm:w-auto px-4 sm:px-5 text-xs font-semibold border border-border/80 dark:border-white/12 text-foreground bg-card dark:bg-[#1f232b] hover:bg-muted/50 dark:hover:bg-white/10 rounded-lg cursor-pointer shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              {spinner("draft")}
              Save Draft
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => submit("publish")}
              className="h-10 w-full sm:w-auto px-5 sm:px-6 text-xs font-semibold bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground rounded-lg cursor-pointer shadow-2xs transition-colors flex items-center justify-center gap-1.5"
            >
              {spinner("publish") || <CheckCircle2 className="h-3.5 w-3.5" />}
              Publish
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <ModalShell
      title={isEditing ? `Edit Article · ${initialData.reference}` : "New Article"}
      subtitle={
        isEditing
          ? `Created ${formatDate(initialData.createdAt)} · Updated ${formatDate(initialData.updatedAt)}${
              initialData.publishedAt ? ` · Published ${formatDate(initialData.publishedAt)}` : ""
            }`
          : "Compose an article, attach media, and review how it appears in search results."
      }
      headerExtra={isEditing ? statusBadge : null}
      onClose={requestClose}
      footer={footer}
    >
      <div className="p-4 sm:p-8 overflow-y-auto min-h-0 space-y-8 sm:space-y-10 flex-1 w-full overflow-x-hidden">
        {/* Section 1: Basic Information */}
        <FormSection
          title="Basic Information"
          description="Article headline and the short summary used in listings, previews, and search results."
          withDivider={false}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7">
            <div className="lg:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="blog-title" className="font-semibold text-slate-700 block text-xs">
                  Title <span className="text-rose-500">*</span>
                </label>
                <CharCount value={form.title} limit={BLOG_LIMITS.title} />
              </div>
              <input
                id="blog-title"
                type="text"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="e.g. Building a Modern Web Stack with Django & Next.js"
                className={errors.title ? inputError : inputNormal}
              />
              <FieldError message={errors.title} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-slate-700 block text-xs">
                  Author <span className="text-slate-400 font-normal">(required to publish)</span>
                </span>
                <span className="text-[10px] text-slate-400">Members from any tenure</span>
              </div>
              <MemberSearchCombobox
                label={null}
                className="relative text-xs"
                popoverClassName="left-0 right-0"
                placeholder="Select the member credited for this article..."
                members={members}
                selectedMemberId={form.authorId}
                selectedMemberFallback={initialData?.author || null}
                onSelectMember={(member) => setField("authorId", member.id)}
                onClear={() => setField("authorId", null)}
                isLoading={membersLoading}
                loadError={membersError}
                error={errors.authorId}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span id="blog-slug-label" className="font-semibold text-slate-700 block text-xs">
                  URL Slug
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                  <Lock className="h-3 w-3" /> Generated automatically from the title
                </span>
              </div>
              <div
                aria-labelledby="blog-slug-label"
                className="flex items-center min-h-[42px] px-3.5 border border-border/80 dark:border-white/10 rounded-xl bg-muted/30 font-mono text-[11px] text-muted-foreground overflow-hidden"
              >
                <span className="text-slate-400 shrink-0">/blogs/</span>
                <span className="truncate">{slugPreview || "—"}</span>
              </div>
              {isEditing && titleChanged ? (
                <p className="text-[11px] text-amber-600">
                  {wasPublished
                    ? "Changing the title will change this published article's URL when you save."
                    : "The slug will be regenerated from the new title when you save."}
                </p>
              ) : (
                !isEditing && (
                  <p className="text-[11px] text-slate-400">
                    A number suffix (e.g. -2) is added on save if another article already uses this slug.
                  </p>
                )
              )}
            </div>

            <div className="lg:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="blog-excerpt" className="font-semibold text-slate-700 block text-xs">
                  Excerpt
                </label>
                <CharCount value={form.excerpt} limit={BLOG_LIMITS.excerpt} />
              </div>
              <textarea
                id="blog-excerpt"
                rows={3}
                value={form.excerpt}
                onChange={(e) => setField("excerpt", e.target.value)}
                placeholder="One or two sentences summarising the article. Also used as the search and social description."
                className={`w-full p-3.5 border rounded-lg text-xs focus:outline-none focus:ring-1 resize-y shadow-2xs leading-relaxed ${
                  errors.excerpt ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-indigo-500"
                }`}
              />
              <FieldError message={errors.excerpt} />
            </div>
          </div>
        </FormSection>

        {/* Section 2: Featured Image */}
        <FormSection
          title="Featured Image"
          description="Cover image shown at the top of the article, on article cards, and when shared on social media. Independent of images inside the article."
        >
          <FeaturedImagePicker
            imageUrl={form.featuredImageUrl}
            imageAlt={form.featuredImageAlt}
            isUploadedAsset={Boolean(form.featuredImagePublicId)}
            publicId={form.featuredImagePublicId}
            onUpload={uploadBlogImage}
            onChange={({ url, publicId, suggestedAlt }) => {
              setForm((prev) => ({
                ...prev,
                featuredImageUrl: url,
                featuredImagePublicId: publicId || "",
                featuredImageAlt: prev.featuredImageAlt || suggestedAlt || "",
              }));
              setErrors((prev) => ({ ...prev, featuredImageUrl: undefined }));
            }}
            onAltChange={(alt) => setField("featuredImageAlt", alt)}
            onRemove={() => {
              setForm((prev) => ({ ...prev, featuredImageUrl: "", featuredImagePublicId: "", featuredImageAlt: "" }));
              toast.info("Image cleared from current form draft.");
            }}
            onDestroy={async ({ url, publicId }) => {
              await deleteBlogImage({ url, publicId, excludeBlogId: initialData?.id });
              setForm((prev) => ({ ...prev, featuredImageUrl: "", featuredImagePublicId: "", featuredImageAlt: "" }));
              toast.success("Asset permanently destroyed from media storage.");
            }}
            error={errors.featuredImageUrl || errors.featuredImageAlt}
          />
        </FormSection>

        {/* Section 3: Main Content */}
        <FormSection
          title="Main Content"
          description="Write the full article in Markdown. Use the toolbar for headings, lists, quotes, links, and images. Place the cursor on an image and click Image to edit it."
        >
          <div className="space-y-2">
            <label htmlFor="blog-content-editor" className="font-semibold text-slate-700 block text-xs">
              Article Body <span className="text-rose-500">*</span>
            </label>
            <MarkdownEditor
              id="blog-content-editor"
              name="content"
              value={form.content}
              onChange={(e) => setField("content", e.target.value)}
              error={errors.content}
              placeholder={"## Introduction\n\nStart writing your article..."}
              rows={20}
              minHeight={480}
              allowImages
              onUploadImage={uploadBlogImage}
              onImageUploaded={({ url, publicId, alt }) =>
                setForm((prev) => ({
                  ...prev,
                  contentImages: [...prev.contentImages.filter((img) => img.url !== url), { url, publicId, alt }],
                }))
              }
            />
            <FieldError message={errors.content} />
          </div>
        </FormSection>

      </div>

      <BlogConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        tone={confirm?.tone}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm?.onConfirm()}
      />
    </ModalShell>
  );
}

function BlogEditLoader({ blogId, onClose, onSaved }) {
  const { data, isLoading, isError, refetch } = useBlog(blogId);

  if (data) {
    return <BlogFormContent key={data.id} initialData={data} onClose={onClose} onSaved={onSaved} />;
  }

  return (
    <ModalShell title="Edit Article" onClose={onClose}>
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        {isLoading && (
          <>
            <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
            <p className="text-xs text-slate-500">Loading article…</p>
          </>
        )}
        {isError && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-rose-500 font-medium">Failed to load this article.</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => refetch()}
                className="h-9 px-4 text-xs font-semibold border border-slate-200 text-slate-700 bg-white rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 text-xs font-semibold bg-[#0b2574] text-white rounded-lg hover:bg-[#0b2574]/90 cursor-pointer shadow-2xs"
              >
                Back to Blogs
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

export function BlogFormModal({ isOpen, blogId = null, onClose, onSaved }) {
  if (!isOpen) return null;
  if (blogId) return <BlogEditLoader key={blogId} blogId={blogId} onClose={onClose} onSaved={onSaved} />;
  return <BlogFormContent key="new-blog" initialData={null} onClose={onClose} onSaved={onSaved} />;
}
