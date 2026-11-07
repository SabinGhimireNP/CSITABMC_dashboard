import { z } from "zod";

export const BLOG_LIMITS = {
  title: 255,
  excerpt: 300,
  alt: 255,
};

const httpUrl = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, { message: "Image URL must be an absolute http(s) URL." });

// Slug and SEO values are derived on the backend, so they are not part of the form schema.
export const blogSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { message: "Blog title is required." })
      .max(BLOG_LIMITS.title, { message: `Title cannot exceed ${BLOG_LIMITS.title} characters.` }),

    // Organization Member id; optional for drafts, required to publish (also enforced by the backend)
    authorId: z.union([z.number(), z.string(), z.null()]),

    excerpt: z
      .string()
      .max(BLOG_LIMITS.excerpt, { message: `Excerpt cannot exceed ${BLOG_LIMITS.excerpt} characters.` }),

    content: z.string().refine((value) => value.trim().length > 0, {
      message: "Article content cannot be empty.",
    }),

    featuredImageUrl: httpUrl,
    featuredImageAlt: z.string().max(BLOG_LIMITS.alt, { message: "Alt text is too long." }),

    status: z.enum(["draft", "published"]),
  })
  .superRefine((data, ctx) => {
    if (data.status === "published" && !data.authorId) {
      ctx.addIssue({
        code: "custom",
        path: ["authorId"],
        message: "Select an author before publishing this article.",
      });
    }
  });
