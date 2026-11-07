import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const announcementSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long." })
    .max(200, { message: "Title cannot exceed 200 characters." })
    .trim(),

  description: z
    .string()
    .min(5, { message: "Description must be at least 5 characters long." })
    .max(2000, { message: "Description cannot exceed 2000 characters." })
    .trim(),

  link: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || val === "" || /^https?:\/\/.+/i.test(val), {
      message: "Please enter a valid URL (starting with http:// or https://)",
    }),

  image: z
    .any()
    .optional()
    .refine((file) => !file || typeof file === "string" || file?.size <= MAX_FILE_SIZE, {
      message: "Max file size is 5MB.",
    })
    .refine(
      (file) => !file || typeof file === "string" || ACCEPTED_FILE_TYPES.includes(file?.type),
      { message: "Only .jpg, .jpeg, .png, and .webp formats are supported." }
    ),
});
