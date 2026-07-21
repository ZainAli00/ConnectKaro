import { useEffect, useState } from 'react';

/**
 * src/hooks/useDebouncedValue.js
 *
 * Returns a debounced copy of `value` that only updates after `delayMs`
 * has elapsed with no further changes. Generic — not tied to any feature.
 *
 * @param {*} value
 * @param {number} [delayMs=300]
 * @returns {*} the debounced value
 */
export function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export default useDebouncedValue;
