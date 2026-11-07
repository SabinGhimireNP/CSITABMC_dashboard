import { z } from "zod";

// Role options come from GET /users/roles/ (backend ROLE_DEFINITIONS).
export const ADMIN_ROLES = [];

export const passwordComplexityRule = (val) => {
  if (!val) return true;
  return (
    val.length >= 8 &&
    /[A-Z]/.test(val) &&
    /[0-9]/.test(val) &&
    /[^A-Za-z0-9]/.test(val)
  );
};

export const adminSchema = z.object({
  username: z.string().min(1, "Username is required").max(120, "Username is too long"),
  first_name: z.string().optional().default(""),
  last_name: z.string().optional().default(""),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Must be a valid email address"),

  // On create: required. On edit: optional (leave blank to keep existing password)
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters long.",
    })
    .refine((val) => !val || /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter.",
    })
    .refine((val) => !val || /[0-9]/.test(val), {
      message: "Password must contain at least one number.",
    })
    .refine((val) => !val || /[^A-Za-z0-9]/.test(val), {
      message: "Password must contain at least one special character.",
    }),

  role: z.string().min(1, "Role is required"),
});

// Stricter variant used only on Create — password required
export const adminCreateSchema = adminSchema.extend({
  password: z
    .string()
    .min(1, "Password is required")
    .refine((val) => val.length >= 8, {
      message: "Password must be at least 8 characters long.",
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter.",
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Password must contain at least one number.",
    })
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
      message: "Password must contain at least one special character.",
    }),
});