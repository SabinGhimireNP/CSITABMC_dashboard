// Role helpers. Role names and labels come from the backend (role, role_label).

export const getUserRole = (user) => user?.user_role || user?.role || null;

export const getRoleLabel = (user) => user?.role_label || getUserRole(user) || "";

export const isSuperadminUser = (user) => getUserRole(user) === "superadmin";

/** Whether `user` may delete `target` (superadmin only, never their own account). */
export const canDeleteAccount = (user, target) =>
  isSuperadminUser(user) && Boolean(target) && String(target.id) !== String(user?.id);
