import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

export const noticeSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters long." })
    .max(100, { message: "Title cannot exceed 100 characters." })
    .trim(),
    
  category: z
    .string()
    .min(1, { message: "Please select a valid notice category." }),
    
  status: z
    .enum(["published", "draft"], {
      errorMap: () => ({ message: "Status must be either Published or Draft." }),
    }),
    
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters long." })
    .max(1000, { message: "Description cannot exceed 1000 characters." })
    .trim(),

  image: z
    .any()
    .optional()
    .refine((file) => !file || file?.size <= MAX_FILE_SIZE, {
      message: "Max file size is 5MB.",
    })
    .refine(
      (file) => !file || ACCEPTED_FILE_TYPES.includes(file?.type || (file?.name?.endsWith('.pdf') ? 'application/pdf' : '')),
      { message: "Only .jpg, .jpeg, .png, .webp, and .pdf formats are supported." }
    ),
});