import { z } from "zod";

// Editable category list — lives here so the dropdown and validation always agree.
// Add/remove values here to change what's selectable in the Event form.
export const EVENT_CATEGORIES = [
  "Workshop",
  "Webinar",
  "Hackathon",
  "Bootcamp",
  "Networking",
  "Conference",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const eventSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(150, "Title is too long"),

    registrationOpen: z.boolean().default(true),

    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),

    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),

    organizer: z.string().min(1, "Organizer is required"),

    availableSeats: z
      .union([z.string(), z.number()])
      .refine((val) => val !== "" && !isNaN(Number(val)), {
        message: "Available seats must be a number",
      })
      .transform((val) => Number(val))
      .refine((val) => val >= 0, "Available seats cannot be negative"),

    registrationFormUrl: z
      .string()
      .min(1, "Registration form URL is required")
      .url("Must be a valid URL"),

    registrationFeeBMC: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val === "" || val === undefined ? 0 : Number(val)))
      .refine((val) => !isNaN(val) && val >= 0, "BMC fee must be a non-negative number"),

    registrationFee: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val === "" || val === undefined ? 0 : Number(val)))
      .refine((val) => !isNaN(val) && val >= 0, "Registration fee must be a non-negative number"),

    location: z.string().min(1, "Location is required"),

    category: z.string().min(1, "Category is required"),

    tags: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (Array.isArray(val)) return val;
        if (!val) return [];
        return val
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }),

    image: z
      .any()
      .optional()
      .refine((file) => !file || !(file instanceof File) || file.size <= MAX_IMAGE_SIZE, {
        message: "Image must be smaller than 5MB",
      }),

    description: z.string().min(1, "Description is required"),

    // Stored as an array of mentor IDs selected from the Mentors list
    mentors: z.union([z.string(), z.array(z.union([z.string(), z.number()]))]).optional().transform((val) => {
      if (Array.isArray(val)) return val;
      return val ? [val] : [];
    }),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    { message: "End date cannot be before start date", path: ["endDate"] }
  );