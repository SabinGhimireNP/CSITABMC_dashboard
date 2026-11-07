import { z } from "zod";

// Schema for Master Member records (managed on /members)
export const masterMemberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Full name is required." }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required." })
    .email({ message: "Enter a valid email address." }),
  image: z.any().optional(),
  fb_link: z
    .string()
    .trim()
    .url({ message: "Enter a valid Facebook URL." })
    .or(z.literal(""))
    .optional(),
  linkedin_link: z
    .string()
    .trim()
    .url({ message: "Enter a valid LinkedIn URL." })
    .or(z.literal(""))
    .optional(),
  github_link: z
    .string()
    .trim()
    .url({ message: "Enter a valid GitHub URL." })
    .or(z.literal(""))
    .optional(),
  description: z.string().optional().default(""),
  skills: z
    .array(z.string())
    .optional()
    .default([]),
  status: z.enum(["published", "draft"]).default("published"),
});

// Backwards-compatible alias for existing imports during refactor
export const memberFormSchema = masterMemberSchema;

// Schema for assigning an existing Member to a Tenure (TenureMembership)
export const tenureAssignmentSchema = z.object({
  memberId: z
    .coerce
    .number({ message: "Please select an existing member." })
    .positive({ message: "Please select an existing member." }),
  role_type: z
    .enum(["EXECUTIVE", "ADVISOR"], {
      message: "Please select a valid role type (Executive Board or Advisor).",
    })
    .default("EXECUTIVE"),
  designation: z
    .string()
    .trim()
    .min(1, { message: "Designation/post is required." }),
  order: z
    .coerce
    .number()
    .int()
    .min(1, { message: "Hierarchy order must be 1 or greater." })
    .default(99),
  status: z.enum(["published", "draft"]).default("published"),
});

// Schema for creating and updating a Tenure
export const tenureFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: "Tenure name is required." }),
    startDate: z
      .string()
      .min(1, { message: "Start date is required." }),
    endDate: z
      .string()
      .min(1, { message: "End date is required." }),
    signature: z.any().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    { message: "End date must be on or after start date.", path: ["endDate"] }
  );
