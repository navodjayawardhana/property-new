"use client";

import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stopped changing for `delay` ms.
 *
 * Used to keep per-keystroke filtering off the main thread on the search and
 * filter inputs, which is the usual cause of poor INP on listing sites: the
 * input itself stays fully controlled and responsive, while the expensive
 * list-filtering work runs once the typing settles.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
