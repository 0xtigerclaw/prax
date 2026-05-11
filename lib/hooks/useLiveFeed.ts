"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Server-stable initial value, then mutate on interval client-side.
 * Avoids hydration mismatch: SSR renders `initial`, client calls `update` after mount.
 */
export function useLiveFeed<T>(
  initial: T,
  update: (prev: T) => T,
  intervalMs: number,
  enabled = true,
): T {
  const [state, setState] = useState<T>(initial);
  const updateRef = useRef(update);

  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      setState((prev) => updateRef.current(prev));
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);

  return state;
}

/**
 * Tick a value immediately on mount (one extra client-side update),
 * useful when you want the "live" look to start almost instantly.
 */
export function useLiveFeedEager<T>(
  initial: T,
  update: (prev: T) => T,
  intervalMs: number,
): T {
  const [state, setState] = useState<T>(initial);
  const updateRef = useRef(update);

  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  useEffect(() => {
    // First tick after a short delay to avoid hydration diff
    const kick = setTimeout(() => {
      setState((prev) => updateRef.current(prev));
    }, 120);
    const id = setInterval(() => {
      setState((prev) => updateRef.current(prev));
    }, intervalMs);
    return () => {
      clearTimeout(kick);
      clearInterval(id);
    };
  }, [intervalMs]);

  return state;
}

/** Client-only "now" tick, stable on SSR. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState<number>(() => 0); // 0 = pre-hydration sentinel
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const kick = setTimeout(tick, 0);
    const id = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(kick);
      clearInterval(id);
    };
  }, [intervalMs]);
  return now;
}
