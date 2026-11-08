/**
 * Standardized Date and Time Formatting Utility for the CSITABMC CMS Dashboard.
 * Formats timestamps in Nepal Time (Asia/Kathmandu, UTC+5:45) matching the Activity Log style.
 */

/**
 * Formats a date string or timestamp into a consistent, human-friendly Nepal Time string.
 * Example output: "Nov 8, 2026, 12:05:30 PM"
 *
 * @param {string|number|Date|null|undefined} dateValue - Timestamp to format
 * @param {object} [options] - Optional override settings
 * @param {boolean} [options.includeSeconds=true] - Whether to include seconds (default: true)
 * @returns {string} Formatted date/time string, or "—" if empty/invalid
 */
export function formatNepalDateTime(dateValue, options = {}) {
  if (!dateValue) return "—";
  try {
    const date = typeof dateValue === "object" && dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "—";

    const { includeSeconds = true } = options;

    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kathmandu",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      ...(includeSeconds ? { second: "2-digit" } : {}),
      hour12: true,
    }).format(date);
  } catch {
    return String(dateValue || "—");
  }
}

/**
 * Alias matching the original Activity Log helper for direct drop-in compatibility.
 */
export const formatNepalTime = formatNepalDateTime;

/**
 * Formats a date string into Nepal Time date-only (without time component).
 * Example output: "Nov 8, 2026"
 */
export function formatNepalDate(dateValue) {
  if (!dateValue) return "—";
  try {
    const date = typeof dateValue === "object" && dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kathmandu",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return String(dateValue || "—");
  }
}

