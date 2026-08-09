import { z } from "zod";

export const alumniFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Full name is required." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email({ message: "Enter a valid email address." }),
  facebookLink: z.string().optional(),
  linkedinLink: z.string().optional(),
  githubLink: z.string().optional(),

  // Tags must have at least 1 item
  tags: z
    .array(z.string())
    .min(1, { message: "At least one tag is required." }),

  // Description cannot be empty string
  description: z
    .string()
    .trim()
    .min(1, { message: "Description is required." }),

  // Image must be provided (File object or existing image string URL from initialData)
  image: z
    .any()
    .refine((file) => file !== undefined && file !== null && file !== "", {
      message: "Profile image asset is required.",
    }),

  // Graduation year — optional for alumni
  graduationYear: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val ? Number(val) : null)),
});