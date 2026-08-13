import { z } from "zod";

export const alumniFormSchema = z.object({
  // The Alumni serializer requires an existing Member (PK) configured in a
  // valid tenure context. The form chooses a single tenure and sends it as a
  // one-item list because the API expects `tenure_ids`.
  memberId: z
    .union([z.number(), z.string()])
    .refine((val) => val !== "" && val !== null && val !== undefined, {
      message: "Please select a member.",
    })
    .transform((val) => Number(val)),

  tenureIds: z
    .array(z.union([z.number(), z.string()]))
    .min(1, { message: "Please select a tenure." })
    .transform((vals) => vals.map((val) => Number(val))),

  // Graduation year — optional for alumni
  graduationYear: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val ? Number(val) : null)),

  // Bio — optional for alumni
  bio: z.string().optional(),
});