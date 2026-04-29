"use client";

import Image from "next/image";
import { useMemo } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { makeTickers, driftTickers } from "@/lib/mock/tickers";
import { useLiveFeed } from "@/lib/hooks/useLiveFeed";
import { fmtPrice, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MarketTicker({
  className,
  edgeToEdge = false,
}: {
  className?: string;
  edgeToEdge?: boolean;
}) {
  const initial = useMemo(() => makeTickers(7), []);
  const tickers = useLiveFeed(initial, (prev) => driftTickers(prev), 1500);

  const items = [...tickers, ...tickers]; // doubled for marquee

  return (
    <div
      className={cn(
        "hairline-t hairline-b bg-bg-1 h-9 relative overflow-hidden",
        className,
      )}
    >
      <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap items-center">
        {items.map((t, i) => {
          const up = t.change24h >= 0;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 px-5 h-9 shrink-0 hairline-r"
            >
              <Image
                src={t.provider.logo}
                alt=""
                width={14}
                height={14}
                className={cn(
                  "opacity-85",
                  t.provider.id === "openai" && "invert-0",
                )}
              />
              <span className="text-[11px] font-semibold text-text-0 tracking-tight">
                {t.provider.short}
              </span>
              <span className="mono text-[12px] text-text-0">
                ${fmtPrice(t.price)}
              </span>
              <span
                className={cn(
                  "mono text-[11px] flex items-center gap-0.5",
                  up ? "delta-up" : "delta-down",
                )}
              >
                {up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                {fmtPct(t.change24h, 2)}
              </span>
            </div>
          );
        })}
      </div>
      {/* edge fades */}
      {edgeToEdge && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-bg-0 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-bg-0 to-transparent" />
        </>
      )}
    </div>
  );
}
