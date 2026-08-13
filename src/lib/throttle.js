/**
 * Creates a throttled version of an async function.
 *
 * The returned function will only allow one in-flight execution at a time.
 * If called while a previous call is still running, it throws an error
 * instead of firing a duplicate request. The lock is released only when
 * the underlying request completes (success or failure).
 *
 * @param {Function} fn - The async function to throttle.
 * @returns {Function} A throttled wrapper around `fn`.
 */
export function createThrottle(fn) {
  let inFlight = false;

  return async (...args) => {
    if (inFlight) {
      throw new Error("A request is already in progress. Please wait.");
    }
    inFlight = true;
    try {
      return await fn(...args);
    } finally {
      inFlight = false;
    }
  };
}