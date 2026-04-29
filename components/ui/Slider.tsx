"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn("relative h-8 flex items-center", className)}>
      <div className="absolute inset-x-0 h-1 bg-bg-3 rounded-full">
        <div
          className="absolute inset-y-0 left-0 bg-bid rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
      />
      <div
        className="absolute h-3.5 w-3.5 rounded-full bg-bid border-2 border-bg-0 pointer-events-none shadow-lg"
        style={{ left: `calc(${pct}% - 7px)` }}
      />
    </div>
  );
}
