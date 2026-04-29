import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "bid" | "ask" | "sol" | "outline" | "warn";
  className?: string;
}) {
  const variantClass = {
    default: "bg-bg-3 text-text-0 border border-line",
    bid: "bg-bid/10 text-bid border border-bid/20",
    ask: "bg-ask/10 text-ask border border-ask/20",
    warn: "bg-warn/10 text-warn border border-warn/20",
    sol: "bg-sol/10 text-sol border border-sol/30",
    outline: "text-text-1 border border-line",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 h-[20px] rounded-[4px] text-[10.5px] font-medium uppercase tracking-[0.04em] mono",
        variantClass,
        className,
      )}
    >
      {children}
    </span>
  );
}
