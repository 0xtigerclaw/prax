"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/shell/AppShell";
import { MarketHeader } from "@/components/market/MarketHeader";
import { PriceChart } from "@/components/market/PriceChart";
import { OrderBook } from "@/components/market/OrderBook";
import { TradePanel } from "@/components/market/TradePanel";
import { DutchAuctionPanel } from "@/components/market/DutchAuctionPanel";
import { PortfolioPanel } from "@/components/market/PortfolioPanel";
import { CreditListingsTable } from "@/components/market/CreditListingsTable";
import { PROVIDERS } from "@/lib/mock/providers";
import { useLiveFeed } from "@/lib/hooks/useLiveFeed";
import { mulberry32 } from "@/lib/format";

export default function MarketPage() {
  const [provider, setProvider] = useState(PROVIDERS[0]);
  const [prefill, setPrefill] = useState<{ price: number; side?: "buy" | "sell" } | null>(
    null,
  );

  // Keyboard: B / S to set trade side
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.matches(
        "input,textarea,[contenteditable=true]",
      );
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "b" || e.key === "B") {
        setPrefill((p) => ({ price: p?.price ?? 0, side: "buy" }));
        toast("Buy mode", { duration: 900 });
      } else if (e.key === "s" || e.key === "S") {
        setPrefill((p) => ({ price: p?.price ?? 0, side: "sell" }));
        toast("Sell mode", { duration: 900 });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Drifting mark price
  const basePrice = provider.face * 0.93;
  const price = useLiveFeed(
    basePrice,
    (prev) => {
      const rng = mulberry32(Date.now());
      const drift = (rng() - 0.5) * provider.volatility * prev;
      return Math.max(provider.face * 0.4, prev + drift);
    },
    1500,
  );

  const change24h = useMemo(
    () => (price / provider.face - 1) * 100 + 2.4,
    [price, provider.face],
  );
  const high24h = provider.face * 1.02;
  const low24h = provider.face * 0.85;
  const volume24h = 3_200_000 * (provider.face / 0.03);
  const openInterest = 12_400_000 * (provider.face / 0.03);

  return (
    <AppShell>
      <div className="flex flex-col h-full min-h-0">
        <MarketHeader
          provider={provider}
          onProvider={(p) => {
            setProvider(p);
            setPrefill(null);
          }}
          price={price}
          change24h={change24h}
          high24h={high24h}
          low24h={low24h}
          volume24h={volume24h}
          openInterest={openInterest}
        />

        {/* 3-column Bloomberg grid */}
        <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,1fr)] gap-2 p-2 flex-1 min-h-[640px]">
          {/* Left column: chart + auctions */}
          <div className="flex flex-col gap-2 min-h-0">
            <PriceChart provider={provider} />
            <div className="h-[200px] shrink-0">
              <DutchAuctionPanel />
            </div>
          </div>

          {/* Middle: orderbook */}
          <OrderBook
            mid={price}
            seed={provider.id.length + 11}
            onPick={(row, side) =>
              setPrefill({
                price: row.price,
                side: side === "ask" ? "buy" : "sell",
              })
            }
          />

          {/* Right: trade panel + portfolio */}
          <div className="flex flex-col gap-2 min-h-0">
            <div className="h-[540px] shrink-0">
              <TradePanel mid={price} prefill={prefill} />
            </div>
            <div className="flex-1 min-h-0">
              <PortfolioPanel />
            </div>
          </div>
        </div>

        {/* Bottom: listings table */}
        <div className="p-2 pt-0">
          <CreditListingsTable />
        </div>
      </div>
    </AppShell>
  );
}
