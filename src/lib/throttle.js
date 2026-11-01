/**
 * Builds a stable key for a call's arguments so only identical calls are merged.
 * FormData is keyed by its entries (files by name, size and type).
 */
function argumentsKey(args) {
  return JSON.stringify(args, (_key, value) => {
    if (typeof FormData !== "undefined" && value instanceof FormData) {
      return Array.from(value.entries()).map(([k, v]) =>
        typeof File !== "undefined" && v instanceof File
          ? [k, `file:${v.name}:${v.size}:${v.type}`]
          : [k, v]
      );
    }
    return value;
  });
}

/**
 * Creates a single-flight / deduplicated version of an async function.
 *
 * If called with the same arguments while a previous call is still running,
 * it reuses the in-flight promise instead of firing a duplicate request.
 * Calls with different arguments run independently.
 *
 * @param {Function} fn - The async function to deduplicate.
 * @returns {Function} A deduplicated wrapper around `fn`.
 */
export function createThrottle(fn) {
  const pending = new Map();

  return (...args) => {
    const key = argumentsKey(args);
    if (pending.has(key)) {
      return pending.get(key);
    }
    const promise = (async () => {
      try {
        return await fn(...args);
      } finally {
        pending.delete(key);
      }
    })();
    pending.set(key, promise);
    return promise;
  };
}
