"use client";

import { useEffect, useState } from "react";

/** Render children only after client hydration. Prevents SSR measurement of 0-dim charts. */
export function MountedOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);
  return <>{mounted ? children : fallback}</>;
}
