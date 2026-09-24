export function parseServerError(err, defaultMessage = "Operation failed") {
  const serverErrors = err?.response?.data;
  
  if (serverErrors && typeof serverErrors === "object") {
    // If it's a detail/message string
    if (typeof serverErrors.detail === "string") return serverErrors.detail;
    if (typeof serverErrors.message === "string") return serverErrors.message;
    if (typeof serverErrors.error === "string") return serverErrors.error;
    
    // If it's field-level errors (DRF standard)
    const detail = Object.entries(serverErrors)
      .map(([k, v]) => {
        const value = Array.isArray(v) ? v.join(", ") : typeof v === "string" ? v : JSON.stringify(v);
        // Capitalize the key for better readability
        const fieldName = k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' ');
        return `${fieldName}: ${value}`;
      })
      .join(" | ");
      
    if (detail) return `Failed: ${detail}`;
  }
  
  if (typeof serverErrors === "string") {
    return serverErrors;
  }

  return err?.message || defaultMessage;
}
