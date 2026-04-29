"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { label: string; value: string; hint?: string };

export function Select({
  value,
  onChange,
  options,
  className,
  placeholder = "Select…",
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-9 w-full px-3 rounded-[6px] bg-bg-2 border border-line hover:border-line-2 text-[13px] text-text-0 flex items-center justify-between gap-3 transition-colors"
      >
        <span className="truncate">{current?.label ?? placeholder}</span>
        <ChevronDown size={14} className="text-text-1 shrink-0" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-40 panel-2 rounded-[6px] py-1 shadow-2xl max-h-64 overflow-y-auto">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={cn(
                "w-full px-3 h-8 flex items-center justify-between text-[13px] text-left hover:bg-bg-3 transition-colors",
                o.value === value && "text-bid",
              )}
            >
              <span className="truncate">{o.label}</span>
              {o.hint && (
                <span className="text-text-2 text-[11px] mono ml-2">
                  {o.hint}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
