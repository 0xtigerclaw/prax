"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { jitterOrderBook, makeOrderBook, type OrderRow } from "@/lib/mock/orderbook";
import { useLiveFeed } from "@/lib/hooks/useLiveFeed";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { fmtPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  mid: number;
  onPick?: (row: OrderRow, side: "bid" | "ask") => void;
  seed?: number;
};

export function OrderBook({ mid, onPick, seed = 21 }: Props) {
  const initial = useMemo(() => makeOrderBook(mid, seed, 14), [mid, seed]);
  const book = useLiveFeed(
    initial,
    (prev) => {
      const drift = (Math.random() - 0.5) * mid * 0.004;
      return jitterOrderBook(prev, Math.max(mid * 0.5, prev.mid + drift));
    },
    1000,
  );

  const maxCum = Math.max(
    book.bids[book.bids.length - 1]?.total ?? 0,
    book.asks[book.asks.length - 1]?.total ?? 0,
  );

  const spread = book.asks[0].price - book.bids[0].price;
  const spreadPct = (spread / book.mid) * 100;

  // Flash update
  const [flashSide, setFlashSide] = useState<"bid" | "ask" | null>(null);
  const firstRef = useRef(true);
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    setFlashSide(book.lastSide);
    const t = setTimeout(() => setFlashSide(null), 550);
    return () => clearTimeout(t);
  }, [book]);

  return (
    <Panel className="h-full">
      <PanelHeader title="Order Book" sub="bids & asks · 15 levels" />
      <PanelBody className="flex flex-col relative">
        <div className="grid grid-cols-[1fr_1fr_1fr] px-3 h-6 items-center text-[9.5px] uppercase tracking-[0.08em] text-text-2 mono shrink-0">
          <span>Price (USDC)</span>
          <span className="text-right">Size (1K)</span>
          <span className="text-right">Total</span>
        </div>

        {/* asks — reversed so best ask is closest to spread */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col-reverse">
          {book.asks.map((row, i) => (
            <Row
              key={`a-${i}`}
              row={row}
              side="ask"
              maxCum={maxCum}
              onPick={onPick}
              isBest={i === 0}
              flash={flashSide === "ask" && i === 0}
            />
          ))}
        </div>

        {/* spread divider */}
        <div className="hairline-t hairline-b h-9 px-3 flex items-center justify-between bg-bg-2/40 shrink-0">
          <div className="flex flex-col leading-none">
            <span className={cn("mono text-[16px] font-medium tabular-nums", flashSide === "bid" ? "text-bid" : "text-ask")}>
              ${fmtPrice(book.mid)}
            </span>
            <span className="mono text-[9px] text-text-2 uppercase tracking-wider mt-1">
              Mid
            </span>
          </div>
          <div className="text-right">
            <div className="mono text-[11px] text-text-1">
              ${fmtPrice(spread)}
            </div>
            <div className="mono text-[9px] text-text-2 mt-0.5">
              {spreadPct.toFixed(3)}% spread
            </div>
          </div>
        </div>

        {/* bids */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {book.bids.map((row, i) => (
            <Row
              key={`b-${i}`}
              row={row}
              side="bid"
              maxCum={maxCum}
              onPick={onPick}
              isBest={i === 0}
              flash={flashSide === "bid" && i === 0}
            />
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}

function Row({
  row,
  side,
  maxCum,
  onPick,
  isBest,
  flash,
}: {
  row: OrderRow;
  side: "bid" | "ask";
  maxCum: number;
  onPick?: (row: OrderRow, side: "bid" | "ask") => void;
  isBest?: boolean;
  flash?: boolean;
}) {
  const w = (row.total / maxCum) * 100;
  return (
    <button
      onClick={() => onPick?.(row, side)}
      className={cn(
        "relative grid grid-cols-[1fr_1fr_1fr] items-center h-[22px] px-3 text-[11.5px] mono text-left w-full hover:bg-bg-3/50 transition-colors",
        flash && (side === "bid" ? "flash-bid" : "flash-ask"),
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 right-0 pointer-events-none",
          side === "bid" ? "bg-bid/8" : "bg-ask/8",
        )}
        style={{ width: `${w}%`, backgroundColor: side === "bid" ? "rgba(47, 125, 79, 0.14)" : "rgba(181, 93, 22, 0.14)" }}
      />
      <span
        className={cn(
          "relative tabular-nums",
          side === "bid" ? "text-bid" : "text-ask",
          isBest && "font-semibold",
        )}
      >
        {fmtPrice(row.price)}
      </span>
      <span className="relative text-right tabular-nums text-text-0">
        {row.size.toFixed(1)}
      </span>
      <span className="relative text-right tabular-nums text-text-2">
        {row.total.toFixed(0)}
      </span>
    </button>
  );
}
