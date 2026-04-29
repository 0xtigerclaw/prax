"use client";

import { useEffect, useState } from "react";

/** Returns ms remaining until target. Stable on SSR (returns target - target = 0 initially until mounted). */
export function useCountdown(target: number, tickMs = 1000): number {
  const [remaining, setRemaining] = useState<number>(() => {
    // SSR-stable sentinel: recompute client-side after mount
    return 0;
  });

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, tickMs);
    return () => clearInterval(id);
  }, [target, tickMs]);

  return remaining;
}
