import { z } from "zod";

export const certificateSchema = z.object({
  // Stores the selected event's id; the dropdown is populated from the Events list
  event: z.union([z.string(), z.number()]).refine((val) => val !== "" && val !== undefined && val !== null, {
    message: "Event is required",
  }),

  fullName: z.string().min(1, "Full name is required").max(120, "Name is too long"),

  isProjectComplete: z.boolean().default(false),
});