import { z } from "zod";

// Editable role list — same pattern as EVENT_CATEGORIES
export const MENTOR_ROLES = [
  "Lead Mentor",
  "Co-Mentor",
  "Technical Mentor",
  "Guest Speaker",
  "Advisor",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const mentorSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(120, "Name is too long"),

  socialLink: z
    .string()
    .min(1, "Social link is required")
    .url("Must be a valid URL"),

  image: z
    .any()
    .optional()
    .refine((file) => !file || !(file instanceof File) || file.size <= MAX_IMAGE_SIZE, {
      message: "Image must be smaller than 5MB",
    }),

  // Stored as an array of event IDs selected from the Events list
  events: z
    .union([z.string(), z.array(z.union([z.string(), z.number()]))])
    .optional()
    .transform((val) => {
      if (Array.isArray(val)) return val;
      return val ? [val] : [];
    }),

  role: z.string().min(1, "Role is required"),
});