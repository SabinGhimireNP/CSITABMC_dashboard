/**
 * Creates a single-flight / deduplicated version of an async function.
 *
 * If called while a previous call is still running, it reuses the in-flight
 * promise instead of throwing an error or firing duplicate requests.
 *
 * @param {Function} fn - The async function to deduplicate.
 * @returns {Function} A deduplicated wrapper around `fn`.
 */
export function createThrottle(fn) {
  let pendingPromise = null;

  return (...args) => {
    if (pendingPromise) {
      return pendingPromise;
    }
    pendingPromise = (async () => {
      try {
        return await fn(...args);
      } finally {
        pendingPromise = null;
      }
    })();
    return pendingPromise;
  };
}