// Event-specific mentor roles. Values must match EventMentorAssignment.Role on the backend.
export const MENTOR_EVENT_ROLES = [
  { value: "main_mentor", label: "Main Mentor" },
  { value: "co_mentor", label: "Co-Mentor" },
  { value: "speaker", label: "Speaker" },
  { value: "instructor", label: "Instructor" },
  { value: "judge", label: "Judge" },
  { value: "custom", label: "Custom" },
];

/** Label shown for an assignment: the custom name for Custom, otherwise the built-in label. */
export function getAssignmentRoleLabel(assignment) {
  if (!assignment) return "";
  if (assignment.role === "custom" && assignment.custom_role?.trim()) {
    return assignment.custom_role.trim();
  }
  return (
    assignment.role_label ||
    MENTOR_EVENT_ROLES.find((r) => r.value === assignment.role)?.label ||
    assignment.role ||
    ""
  );
}
