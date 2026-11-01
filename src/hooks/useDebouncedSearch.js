import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Custom hook to manage debounced search input state and URL query synchronization.
 *
 * @param {Object} options
 * @param {string} [options.initialValue=""] - Current search query value (typically from URL query params)
 * @param {number} [options.delay=300] - Debounce delay in milliseconds
 * @param {Function} options.onSearch - Callback invoked with the updated search string after the delay
 * @returns {{
 *   value: string,
 *   setValue: Function,
 *   handleSearchChange: Function
 * }}
 */
export function useDebouncedSearch({ initialValue = "", delay = 300, onSearch }) {
  const [value, setValue] = useState(initialValue);
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const debounceRef = useRef(null);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Synchronize when the external initialValue (e.g., URL parameter) changes
  if (prevInitialValue !== initialValue) {
    setPrevInitialValue(initialValue);
    setValue(initialValue);
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSearchChange = useCallback(
    (nextVal) => {
      setValue(nextVal);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        if (onSearchRef.current) {
          onSearchRef.current(nextVal);
        }
      }, delay);
    },
    [delay]
  );

  return {
    value,
    setValue,
    handleSearchChange,
  };
}
