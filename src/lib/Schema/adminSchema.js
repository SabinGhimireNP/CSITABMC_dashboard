import { z } from "zod";

// Editable role list — add/remove roles here to update the dropdown and validation
// Super Admin is the owner account — not assignable via the form.
// Only sub-admin roles are listed here.
// Super Admin is the owner account — not assignable via the form.
// Only these roles can be assigned to sub-admins.
export const ADMIN_ROLES = [
  { label: "Admin", value: "admin" },
  { label: "CMS User", value: "cms_user" }
];

export const adminSchema = z.object({
  username: z.string().min(1, "Username is required").max(120, "Name is too long"),

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
});

// Stricter variant used only on Create — password required
export const adminCreateSchema = adminSchema.extend({
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});