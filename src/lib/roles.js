// Role helpers. Role names and labels come from the backend (role, role_label).

export const getUserRole = (user) => user?.user_role || user?.role || null;

export const getRoleLabel = (user) => user?.role_label || getUserRole(user) || "";

export const isSuperadminUser = (user) => getUserRole(user) === "superadmin";

export const isAdminUser = (user) => getUserRole(user) === "admin";

export const ORDINARY_CMS_ROLES = ["cms_user", "operations", "papers", "notice", "blog"];

/**
 * Enforces the permission matrix on the frontend:
 * - Superadmin: Can manage regular Admins and ordinary CMS users; cannot manage self or other superadmins.
 * - Admin: Can manage ordinary CMS users; cannot manage self, other Admins, or Superadmins.
 * - Ordinary CMS users: Cannot manage accounts.
 */
export const canManageAccount = (user, target) => {
  if (!user || !target) return false;
  if (String(target.id) === String(user.id)) return false; // Never manage own account through Admin Access
  const myRole = getUserRole(user);
  const targetRole = getUserRole(target);
  const isTargetSuper = targetRole === "superadmin" || Boolean(target.is_superuser);

  if (myRole === "superadmin") {
    return !isTargetSuper;
  }
  if (myRole === "admin") {
    return !isTargetSuper && targetRole !== "admin" && ORDINARY_CMS_ROLES.includes(targetRole);
  }
  return false;
};

/** Whether `user` may delete `target` */
export const canDeleteAccount = (user, target) => canManageAccount(user, target);
