import { z } from "zod";

// Role options are not defined here: they come from GET /users/roles/ (backend ROLE_DEFINITIONS).
export const ADMIN_ROLES = [];

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