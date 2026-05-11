"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Upload,
  Route as RouteIcon,
  LayoutDashboard,
  Search,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";
import { PROVIDERS } from "@/lib/mock/providers";

type Item = {
  id: string;
  label: string;
  sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const router = useRouter();

  const setPaletteOpen = (next: boolean) => {
    if (next) {
      setQ("");
      setIdx(0);
    }
    setOpen(next);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isTyping = (e.target as HTMLElement)?.matches(
        "input,textarea,[contenteditable=true]",
      );
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
        setOpen((v) => {
          if (!v) {
            setQ("");
            setIdx(0);
          }
          return !v;
        });
      } else if (!isTyping && e.key === "/" && !open) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const items: Item[] = [
    {
      id: "go-market",
      label: "Open the market",
      sub: "Browse live listings and the orderbook",
      icon: BarChart3,
      action: () => router.push("/market"),
    },
    {
      id: "go-list",
      label: "Sell my credits",
      sub: "List your unused API balance",
      icon: Upload,
      action: () => router.push("/list"),
    },
    {
      id: "go-route",
      label: "Cheapest way to run a call",
      sub: "Compare direct, resale, and auction prices",
      icon: RouteIcon,
      action: () => router.push("/route"),
    },
    {
      id: "go-home",
      label: "Home",
      sub: "Back to the landing page",
      icon: LayoutDashboard,
      action: () => router.push("/"),
    },
    ...PROVIDERS.map((p) => ({
      id: `pair-${p.id}`,
      label: `Trade ${p.short}`,
      sub: `Buy or sell ${p.name} credits against USDC`,
      icon: Wallet,
      action: () => router.push("/market"),
    })),
  ];

  const filtered = q
    ? items.filter((i) =>
        (i.label + (i.sub ?? "")).toLowerCase().includes(q.toLowerCase()),
      )
    : items;

  return (
    <Dialog open={open} onOpenChange={setPaletteOpen} width="max-w-lg" className="p-0">
      <div className="-m-5">
        <div className="relative hairline-b">
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-2 pointer-events-none"
          />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIdx((i) => Math.min(filtered.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIdx((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter") {
                filtered[idx]?.action();
                setOpen(false);
              }
            }}
            placeholder="Jump to a page or find a market…"
            className="w-full h-12 pl-11 pr-4 bg-transparent text-[13.5px] outline-none"
          />
        </div>
        <div className="max-h-[360px] overflow-y-auto p-1">
          {filtered.length === 0 && (
            <div className="py-10 text-center text-[12px] text-text-2">
              No matches.
            </div>
          )}
          {filtered.map((it, i) => {
            const Icon = it.icon;
            const active = i === idx;
            return (
              <button
                key={it.id}
                onMouseEnter={() => setIdx(i)}
                onClick={() => {
                  it.action();
                  setOpen(false);
                }}
                className={cn(
                  "w-full h-11 px-3 rounded-[6px] flex items-center gap-3 text-left transition-colors",
                  active ? "bg-bg-3" : "hover:bg-bg-3/60",
                )}
              >
                <Icon size={14} className="text-text-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-text-0 truncate">
                    {it.label}
                  </div>
                  {it.sub && (
                    <div className="text-[11px] text-text-2 mono truncate">
                      {it.sub}
                    </div>
                  )}
                </div>
                {active && <ArrowRight size={12} className="text-text-2" />}
              </button>
            );
          })}
        </div>
        <div className="hairline-t px-4 h-9 flex items-center justify-between text-[10.5px] text-text-2">
          <div className="flex items-center gap-3">
            <span>
              <span className="kbd">↑</span> <span className="kbd">↓</span> navigate
            </span>
            <span>
              <span className="kbd">↵</span> select
            </span>
          </div>
          <span>
            <span className="kbd">esc</span> close
          </span>
        </div>
      </div>
    </Dialog>
  );
}
