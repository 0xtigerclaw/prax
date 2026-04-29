"use client";

import { useEffect, useRef, useState } from "react";

type StatRow = {
  label: string;
  target: number;
  prefix: string;
  suffix?: string;
};

const STATS: StatRow[] = [
  { label: "Modeled credits at risk", target: 24_000_000, prefix: "$", suffix: "M+" },
  { label: "Modeled buyer savings", target: 9_000_000, prefix: "$", suffix: "M+" },
  { label: "Modeled avg discount", target: 43, prefix: "", suffix: "%" },
  { label: "Modeled enterprise sellers", target: 1_200, prefix: "", suffix: "K+" },
];

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const fire = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      startRef.current = performance.now();
      const tick = (t: number) => {
        const elapsed = t - (startRef.current ?? t);
        const p = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(target * ease);
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };
    fire();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return val;
}

function Stat({
  label,
  target,
  prefix,
  suffix,
}: {
  label: string;
  target: number;
  prefix: string;
  suffix?: string;
}) {
  const v = useCountUp(target);
  const sfx = suffix ?? "";
  const formatted =
    target >= 1_000_000
      ? `${prefix}${Math.round(v / 1_000_000)}${sfx}`
      : target >= 1000
        ? `${prefix}${(v / 1000).toFixed(1)}${sfx}`
        : `${prefix}${Math.round(v).toLocaleString()}${sfx}`;
  return (
    <div className="flex-1 px-8 py-10 hairline-r last:border-r-0">
      <div className="mono text-[10px] uppercase tracking-[0.12em] text-text-2 mb-2">
        {label}
      </div>
      <div className="mono text-[40px] font-medium tracking-tight tabular-nums">
        {formatted}
      </div>
    </div>
  );
}

export function StatsBand() {
  return (
    <section className="bg-bg-0">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="panel rounded-[10px] overflow-hidden flex">
          {STATS.map((s) => (
            <Stat
              key={s.label}
              label={s.label}
              target={s.target}
              prefix={s.prefix}
              suffix={s.suffix}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
