import * as React from "react";
import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "panel rounded-[8px] overflow-hidden flex flex-col",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  right,
  className,
  sub,
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3.5 h-10 hairline-b shrink-0",
        className,
      )}
    >
      <div className="flex items-baseline gap-2 min-w-0">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-1 truncate">
          {title}
        </h3>
        {sub && (
          <span className="text-[11px] text-text-2 truncate mono">{sub}</span>
        )}
      </div>
      {right && <div className="flex items-center gap-1.5">{right}</div>}
    </div>
  );
}

export function PanelBody({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 min-h-0", className)}>{children}</div>;
}
