import { z } from "zod";

export const memberFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Full name is required." }),
  post: z
    .string()
    .min(1, { message: "Please select a post." }),
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

  // Tenure ID — required, will be auto-set
  tenureId: z
    .number({ message: "Tenure is required." }),
});

export const tenureFormSchema = z.object({
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
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, { message: "End date must be on or after start date.", path: ["endDate"] });
