import { getUserRole } from "./roles";

/**
 * Frontend permission checks.

 *
 * Roles and permissions are defined only on the backend (apps/core/permissions.py).
 * The API returns the signed-in user's effective permission list (`user.permissions`)
 * and role label (`user.role_label`) from /login/ and /users/me/; the dashboard only
 * maps routes to the permission they need. The backend stays authoritative.
 */

/** Route prefix -> permission required to open it ("*" = any signed-in user). */
export const ROUTE_PERMISSIONS = {
  "/dashboard": "dashboard.view",
  "/account-security": "*",
  "/blogs": "blogs.view",
  "/notices": "notices.view",
  "/events": "events.view",
  "/mentors": "mentors.view",
  "/certificates": "certificates.view",
  "/past-papers": "papers.view",
  "/tenure": "tenures.view",
  "/members": "members.view",
  "/alumni": "alumni.view",
  "/announcements": "announcements.view",
  "/notifications": "notifications.view",
  "/admins": "admin_access.view",
  "/activity-logs": "activity_logs.view",
};

// Older names still used by a few call sites; mapped to the exact backend names.
const LEGACY_PERMISSIONS = {
  "tenure.member_delete": "members.delete",
  "accounts.manage": "accounts.manage",
};

export function normalizePermission(permission) {
  if (!permission) return permission;
  if (LEGACY_PERMISSIONS[permission]) return LEGACY_PERMISSIONS[permission];
  const [module, action = "view"] = permission.split(".");
  const mod = module === "tenure" ? "tenures" : module;
  const act = action === "edit" ? "update" : action;
  return `${mod}.${act}`;
}

/** Exact permission check against the backend-provided list. */
export function hasPermission(user, permission) {
  if (!permission) return false;
  if (!user) return false;
  if (permission === "*") return true;

  // Superadmin has full access to all permissions and modules
  const role = typeof user === "string" ? user : getUserRole(user);
  if (role === "superadmin") return true;

  const list = Array.isArray(user?.permissions) ? user.permissions : [];
  if (list.includes("*")) return true;

  return list.includes(normalizePermission(permission));
}

export function requiredPermissionForPath(path) {
  if (!path) return null;
  for (const [prefix, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (path === prefix || path?.startsWith(prefix + "/")) return permission;
  }
  return null;
}

export function canAccessRoute(user, path) {
  if (!user) return false;
  const permission = requiredPermissionForPath(path);
  // Default deny: if path has no mapped permission, deny access
  if (!permission) return false;
  return hasPermission(user, permission);
}


/**
 * Safe post-login destination: only same-origin dashboard paths.
 * Rejects absolute, protocol-relative ("//x"), backslash ("/\x"), encoded and
 * control-character variants by resolving against the current origin.
 */
export function safeReturnPath(raw, fallback = "/dashboard") {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return fallback;
  }
  if (/[\u0000-\u001f\u007f\\]/.test(raw)) return fallback;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return fallback;
  }
  if (decoded.startsWith("//") || decoded.startsWith("/\\") || /[\u0000-\u001f\u007f]/.test(decoded)) {
    return fallback;
  }
  if (typeof window !== "undefined") {
    try {
      const url = new URL(raw, window.location.origin);
      if (url.origin !== window.location.origin) return fallback;
      if (url.pathname === "/login") return fallback;
      return url.pathname + url.search + url.hash;
    } catch {
      return fallback;
    }
  }
  return raw;
}
