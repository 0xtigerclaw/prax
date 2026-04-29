"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp } from "lucide-react";
import { jitterOrderBook, makeOrderBook } from "@/lib/mock/orderbook";
import { useLiveFeed } from "@/lib/hooks/useLiveFeed";
import { fmtPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function HeroOrderbook() {
  const seed = 42;
  const mid = 0.0284;
  const initial = useMemo(() => makeOrderBook(mid, seed, 10), []);
  const book = useLiveFeed(
    initial,
    (prev) => {
      const drift = (Math.random() - 0.5) * mid * 0.004;
      return jitterOrderBook(prev, Math.max(mid * 0.5, prev.mid + drift));
    },
    900,
  );

  // Slot suffix is client-only to avoid hydration mismatch.
  const [slotSuffix, setSlotSuffix] = useState(0);
  useEffect(() => {
    setSlotSuffix(Math.floor(Math.random() * 999));
  }, []);

  const maxSize = Math.max(
    ...book.bids.map((b) => b.size),
    ...book.asks.map((a) => a.size),
  );

  return (
    <div
      className="glass rounded-[12px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(42,34,24,0.25),0_0_0_1px_rgba(91,80,61,0.08)] w-full max-w-[440px] ml-auto"
      style={{ transform: "rotateY(-10deg) rotateX(6deg)" }}
    >
      {/* header */}
      <div className="flex items-center justify-between px-4 h-10 hairline-b bg-bg-0/30">
        <div className="flex items-center gap-2">
          <Image src="/logos/openai.svg" alt="" width={14} height={14} />
          <span className="text-[12px] font-semibold tracking-tight">
            GPT-4o / USDC
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="mono text-[12px] text-text-0">
            ${fmtPrice(book.mid)}
          </span>
          <span className="delta-up mono text-[10.5px] flex items-center gap-0.5">
            <ArrowUp size={9} /> 1.24%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 text-[9.5px] uppercase tracking-[0.08em] text-text-2 mono px-4 h-6 items-center hairline-b bg-bg-0/20">
        <span>Price</span>
        <span className="text-right">Size (1K)</span>
        <span className="text-right">Total</span>
      </div>

      {/* asks (top, reversed) */}
      <div className="flex flex-col-reverse">
        {book.asks.slice(0, 5).map((a, i) => {
          const w = (a.size / maxSize) * 100;
          return (
            <div
              key={`a-${i}`}
              className="relative grid grid-cols-3 items-center h-6 px-4 text-[11px] mono"
            >
              <div
                className="absolute inset-y-0 right-0 bg-ask/10"
                style={{ width: `${w}%` }}
              />
              <span className="relative text-ask">{fmtPrice(a.price)}</span>
              <span className="relative text-right text-text-0">
                {a.size.toFixed(1)}
              </span>
              <span className="relative text-right text-text-2">
                {a.total.toFixed(0)}
              </span>
            </div>
          );
        })}
      </div>

      {/* spread */}
      <div className="hairline-t hairline-b flex items-center justify-between px-4 h-7 bg-bg-0/30 text-[10.5px]">
        <span className="text-text-2 uppercase tracking-wider">Spread</span>
        <span className="mono text-text-0">
          ${fmtPrice(book.spread)} ·{" "}
          <span className="text-text-2">
            {((book.spread / book.mid) * 100).toFixed(3)}%
          </span>
        </span>
      </div>

      {/* bids */}
      <div className="flex flex-col">
        {book.bids.slice(0, 5).map((b, i) => {
          const w = (b.size / maxSize) * 100;
          return (
            <div
              key={`b-${i}`}
              className="relative grid grid-cols-3 items-center h-6 px-4 text-[11px] mono"
            >
              <div
                className="absolute inset-y-0 right-0 bg-bid/10"
                style={{ width: `${w}%` }}
              />
              <span className="relative text-bid">{fmtPrice(b.price)}</span>
              <span className="relative text-right text-text-0">
                {b.size.toFixed(1)}
              </span>
              <span className="relative text-right text-text-2">
                {b.total.toFixed(0)}
              </span>
            </div>
          );
        })}
      </div>

      {/* footer */}
      <div className="hairline-t px-4 h-9 flex items-center justify-between text-[10.5px] mono text-text-2 bg-bg-0/30">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-bid animate-pulse" />
          Live · slot 312,478,{slotSuffix || "..."}
        </span>
        <span className="text-bid">
          devnet
        </span>
      </div>
    </div>
  );
}
