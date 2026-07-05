import { z } from "zod";

// Editable role list — add/remove roles here to update the dropdown and validation
// Super Admin is the owner account — not assignable via the form.
// Only sub-admin roles are listed here.
// Super Admin is the owner account — not assignable via the form.
// Only these roles can be assigned to sub-admins.
export const ADMIN_ROLES = ["Admin", "Manager"];

export const adminSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(120, "Name is too long"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Must be a valid email address"),

  // On create: required. On edit: optional (leave blank to keep existing password)
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters",
    }),

  role: z.string().min(1, "Role is required"),

  status: z.enum(["active", "inactive"]).default("active"),

  createdAt: z.string().optional(),
});

// Stricter variant used only on Create — password required
export const adminCreateSchema = adminSchema.extend({
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});