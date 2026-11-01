// Role helpers shared by route guards, navigation and the Admin accounts table.
// The backend enforces the same hierarchy: superadmin > admin > cms_user.

export const getUserRole = (user) => user?.user_role || user?.role || null;

export const isSuperadminUser = (user) => getUserRole(user) === "superadmin";

/** Superadmins and Admins can open the Admin accounts page. */
export const isAdminRole = (user) => ["admin", "superadmin"].includes(getUserRole(user));

/**
 * Whether `user` may edit `target`. Superadmins manage everyone; Admins manage
 * CMS users and their own account, but never other Admins or Superadmins.
 */
export const canEditAccount = (user, target) => {
  if (isSuperadminUser(user)) return true;
  if (getUserRole(user) !== "admin" || !target) return false;
  if (String(target.id) === String(user?.id)) return true;
  return target.role === "cms_user";
};

/** Whether `user` may delete `target` (never their own account). */
export const canDeleteAccount = (user, target) =>
  Boolean(target) && String(target.id) !== String(user?.id) && canEditAccount(user, target);
