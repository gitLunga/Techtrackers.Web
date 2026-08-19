/**
 * src/hooks/useApi.js
 * -----------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 *   Every data-loading component in the old app repeated the same block: a
 *   useState for data, another for loading, a useEffect with fetch, a try/catch,
 *   and a console.error. Around 40 copies, each subtly different — and most
 *   forgot the cleanup, so navigating away mid-request logged React's
 *   "state update on an unmounted component" warning.
 *
 * WHAT IT ACHIEVES
 *   `const { data, loading, error, reload } = useApi(() => logs.list(), [])`.
 *   Handles loading and error state, cancels cleanly on unmount, and gives every
 *   screen a `reload()` to call after a mutation.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export default function useApi(fetcher, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // Tracks the latest request so a slow earlier response cannot overwrite a
  // faster later one (the classic out-of-order-response bug in filtered lists).
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const run = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const response = await fetcher();
      if (mounted.current && id === requestId.current) {
        setData(response.data);
        setMeta(response.meta ?? null);
      }
      return response;
    } catch (err) {
      if (mounted.current && id === requestId.current) setError(err);
      return null;
    } finally {
      if (mounted.current && id === requestId.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, immediate]);

  return { data, meta, loading, error, reload: run, setData };
}
