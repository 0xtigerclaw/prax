"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
};
const TabsContext = React.createContext<TabsContextValue | null>(null);

export function Tabs({
  value,
  onValueChange,
  children,
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, setValue: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 p-0.5 bg-bg-2 border border-line rounded-[6px]",
        className,
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function Tab({
  value,
  children,
  className,
  variant = "default",
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "bid" | "ask";
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tab must be inside Tabs");
  const active = ctx.value === value;

  const variantClass =
    variant === "bid"
      ? active
        ? "bg-bid/15 text-bid"
        : "text-text-1 hover:text-bid"
      : variant === "ask"
        ? active
          ? "bg-ask/15 text-ask"
          : "text-text-1 hover:text-ask"
        : active
          ? "bg-bg-4 text-text-0"
          : "text-text-1 hover:text-text-0";

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "h-7 px-3 rounded-[4px] text-[12px] font-medium transition-colors",
        variantClass,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabPanel({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabPanel must be inside Tabs");
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}
