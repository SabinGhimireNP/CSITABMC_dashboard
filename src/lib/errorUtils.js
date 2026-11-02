/**
 * Normalizes API and network errors for user-facing toasts, alerts, and forms.
 *
 * Guarantees that raw HTML (such as Django debug or 404/500 error pages),
 * stack traces, and internal server paths are NEVER returned as UI messages.
 */

const STATUS_MESSAGES = {
  400: "Invalid request. Please check the submitted data.",
  401: "Authentication required or session expired. Please log in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found on the server.",
  408: "Request timed out. Please verify your connection.",
  429: "Too many requests. Please slow down and try again shortly.",
};

/**
 * Checks whether a response or string payload looks like HTML markup.
 */
export function isHtmlContent(data, contentType = "") {
  if (typeof contentType === "string" && contentType.toLowerCase().includes("text/html")) {
    return true;
  }
  if (typeof data !== "string") {
    return false;
  }
  const trimmed = data.trim().toLowerCase();
  return (
    trimmed.startsWith("<!doctype") ||
    trimmed.startsWith("<html") ||
    trimmed.includes("<head") ||
    trimmed.includes("<body") ||
    trimmed.includes("<title>") ||
    trimmed.includes("<div id=\"summary\">") ||
    trimmed.includes("class=\"exception_value\"") ||
    /<[a-z][\s\S]*>/i.test(data)
  );
}

/**
 * Extracts a map of field-level validation errors from DRF responses.
 * Returns an object with { fieldName: errorMessage } or null if not applicable.
 */
export function extractFieldErrors(err) {
  const data = err?.response?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const fieldErrors = {};
  let hasFields = false;

  for (const [key, value] of Object.entries(data)) {
    if (["detail", "message", "error"].includes(key)) {
      continue;
    }
    hasFields = true;
    if (Array.isArray(value)) {
      fieldErrors[key] = value.map(v => (typeof v === "object" ? JSON.stringify(v) : String(v))).join(", ");
    } else if (typeof value === "string") {
      fieldErrors[key] = value;
    } else if (value && typeof value === "object") {
      fieldErrors[key] = JSON.stringify(value);
    }
  }

  return hasFields ? fieldErrors : null;
}

/**
 * Main error parsing function used across dashboard pages and mutations.
 *
 * @param {any} err - The caught error object (Axios error, Error, or string)
 * @param {string} defaultMessage - Fallback message if no specific error can be parsed
 * @returns {string} Clean, safe, user-facing error message
 */
export function parseServerError(err, defaultMessage = "Operation failed") {
  if (!err) {
    return defaultMessage;
  }

  // If already a plain string error passed directly
  if (typeof err === "string") {
    if (isHtmlContent(err)) {
      return defaultMessage;
    }
    return err.length < 300 ? err : defaultMessage;
  }

  const response = err?.response;
  const status = response?.status;
  const headers = response?.headers || {};
  const contentType = headers["content-type"] || headers["Content-Type"] || "";
  const serverErrors = response?.data;

  // 1. Detect and prevent raw HTML responses (e.g. Django debug 404 / 500 pages)
  if (isHtmlContent(serverErrors, contentType)) {
    if (status && status >= 500) {
      return "A server-side problem occurred. Please try again later.";
    }
    if (status && STATUS_MESSAGES[status]) {
      return STATUS_MESSAGES[status];
    }
    return defaultMessage;
  }

  // 2. Structured JSON error responses
  if (serverErrors && typeof serverErrors === "object") {
    // Non-field errors or top-level detail
    if (typeof serverErrors.detail === "string" && !isHtmlContent(serverErrors.detail)) {
      return serverErrors.detail;
    }
    if (typeof serverErrors.message === "string" && !isHtmlContent(serverErrors.message)) {
      return serverErrors.message;
    }
    if (typeof serverErrors.error === "string" && !isHtmlContent(serverErrors.error)) {
      return serverErrors.error;
    }

    if (Array.isArray(serverErrors.non_field_errors) && serverErrors.non_field_errors.length > 0) {
      return serverErrors.non_field_errors.join(", ");
    }

    // DRF field-level errors: format as readable text
    const entries = Object.entries(serverErrors).filter(
      ([key]) => !["detail", "message", "error"].includes(key)
    );

    if (entries.length > 0) {
      const details = entries
        .map(([k, v]) => {
          const value = Array.isArray(v)
            ? v.join(", ")
            : typeof v === "string"
            ? v
            : JSON.stringify(v);
          const fieldName = k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, " ");
          return `${fieldName}: ${value}`;
        })
        .join(" | ");

      if (details && !isHtmlContent(details)) {
        return `Failed: ${details}`;
      }
    }
  }

  // 3. String response that is plain text (not HTML)
  if (typeof serverErrors === "string") {
    const trimmed = serverErrors.trim();
    if (!isHtmlContent(trimmed) && trimmed.length < 300) {
      return trimmed;
    }
  }

  // 4. HTTP Status Code fallbacks
  if (status) {
    if (status >= 500 && status <= 599) {
      return "A server-side problem occurred. Please try again later.";
    }
    if (STATUS_MESSAGES[status]) {
      return STATUS_MESSAGES[status];
    }
  }

  // 5. Network, connection timeout, and abort errors
  if (err?.code === "ECONNABORTED" || (typeof err?.message === "string" && err.message.toLowerCase().includes("timeout"))) {
    return "Request timed out. Please verify your connection.";
  }

  if (
    err?.code === "ERR_NETWORK" ||
    err?.message === "Network Error" ||
    (!response && Boolean(err?.request))
  ) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  // 6. Generic JS Error message fallback (if safe)
  if (typeof err?.message === "string" && !isHtmlContent(err.message) && err.message.length < 200) {
    return err.message;
  }

  return defaultMessage;
}
