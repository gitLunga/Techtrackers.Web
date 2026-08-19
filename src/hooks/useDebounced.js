/**
 * src/hooks/useDebounced.js
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   The search box writes straight to the URL so the filter is shareable, but
 *   without debouncing that would fire one API request per keystroke — a
 *   ten-character search would hit the backend ten times and the responses
 *   could arrive out of order.
 *
 * WHAT IT ACHIEVES
 *   Returns a value that only updates once the user has stopped typing for
 *   `delay` ms. The input stays instantly responsive; only the request waits.
 */
import { useEffect, useState } from 'react';

export default function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
