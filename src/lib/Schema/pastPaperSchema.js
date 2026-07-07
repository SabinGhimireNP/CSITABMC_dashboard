import { z } from "zod";

export const SEMESTER_LABELS = [
  { number: 1, label: "First Semester" },
  { number: 2, label: "Second Semester" },
  { number: 3, label: "Third Semester" },
  { number: 4, label: "Fourth Semester" },
  { number: 5, label: "Fifth Semester" },
  { number: 6, label: "Sixth Semester" },
  { number: 7, label: "Seventh Semester" },
  { number: 8, label: "Eighth Semester" },
];

export const pastPaperSchema = z.object({
  subject_code: z
    .string()
    .min(1, "Subject code is required")
    .max(20, "Subject code is too long")
    .toUpperCase(),

  subject_name: z
    .string()
    .min(1, "Subject name is required")
    .max(120, "Subject name is too long"),

  semester: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && !isNaN(Number(val)), {
      message: "Semester is required",
    })
    .transform((val) => Number(val))
    .refine((val) => val >= 1 && val <= 8, "Semester must be between 1 and 8"),

  model_set: z.boolean().default(false),

  exam_year: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && !isNaN(Number(val)), {
      message: "Exam year is required",
    })
    .transform((val) => Number(val))
    .refine(
      (val) => val >= 2000 && val <= new Date().getFullYear() + 1,
      "Enter a valid exam year"
    ),

  drive_link: z
    .string()
    .min(1, "Drive link is required")
    .url("Must be a valid URL")
    .refine((val) => val.includes("drive.google.com"), {
      message: "Must be a Google Drive link",
    }),
});