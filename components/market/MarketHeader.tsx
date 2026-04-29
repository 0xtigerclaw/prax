"use client";

import Image from "next/image";
import { ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import { PROVIDERS, type Provider } from "@/lib/mock/providers";
import { fmtPrice, fmtUsdCompact, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function MarketHeader({
  provider,
  onProvider,
  price,
  change24h,
  high24h,
  low24h,
  volume24h,
  openInterest,
}: {
  provider: Provider;
  onProvider: (p: Provider) => void;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  openInterest: number;
}) {
  const [open, setOpen] = useState(false);
  const up = change24h >= 0;

  return (
    <div className="hairline-b bg-bg-1 px-4 h-16 flex items-center gap-6 shrink-0 relative">
      {/* pair selector */}
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 h-10 pr-2 pl-1.5 rounded-[6px] hover:bg-bg-2 transition-colors"
        >
          <div className="h-9 w-9 rounded-[8px] bg-bg-2 border border-line flex items-center justify-center">
            <Image
              src={provider.logo}
              alt=""
              width={18}
              height={18}
              className="opacity-90"
            />
          </div>
          <div className="text-left leading-none">
            <div className="text-[14px] font-semibold tracking-tight">
              {provider.short}
              <span className="text-text-2 font-normal"> / USDC</span>
            </div>
            <div className="mono text-[10px] text-text-2 mt-1 uppercase tracking-wider">
              {provider.model}
            </div>
          </div>
          <ChevronDown size={14} className="text-text-2 ml-1" />
        </button>
        {open && (
          <div className="absolute top-full mt-1 left-0 z-30 panel-2 rounded-[8px] w-64 py-1 shadow-2xl max-h-80 overflow-y-auto">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onProvider(p);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-3 h-11 flex items-center gap-2.5 hover:bg-bg-3 text-left transition-colors",
                  p.id === provider.id && "bg-bg-3/50",
                )}
              >
                <Image src={p.logo} alt="" width={16} height={16} />
                <div className="flex-1">
                  <div className="text-[12.5px] font-medium">
                    {p.short} / USDC
                  </div>
                  <div className="mono text-[10px] text-text-2 mt-0.5">
                    ${fmtPrice(p.face)}
                  </div>
                </div>
                {p.id === provider.id && (
                  <span className="h-1.5 w-1.5 rounded-full bg-bid" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-10 w-px bg-line" />

      {/* Price */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-2">
          <span className={cn("mono text-[22px] tracking-tight tabular-nums", up ? "text-bid" : "text-ask")}>
            ${fmtPrice(price)}
          </span>
          <span
            className={cn(
              "mono text-[12px] flex items-center gap-0.5",
              up ? "delta-up" : "delta-down",
            )}
          >
            {up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
            {fmtPct(change24h, 2)}
          </span>
        </div>
        <div className="mono text-[10px] text-text-2 uppercase tracking-wider mt-1.5">
          Mark · Pyth oracle
        </div>
      </div>

      <div className="flex-1" />

      {/* Stats */}
      <div className="flex items-center gap-6">
        <Stat label="24h High" value={`$${fmtPrice(high24h)}`} />
        <Stat label="24h Low" value={`$${fmtPrice(low24h)}`} />
        <Stat label="24h Volume" value={fmtUsdCompact(volume24h)} />
        <Stat label="Open Interest" value={fmtUsdCompact(openInterest)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col leading-none">
      <div className="mono text-[10px] uppercase tracking-wider text-text-2">
        {label}
      </div>
      <div className="mono text-[13px] text-text-0 mt-1.5 tabular-nums">
        {value}
      </div>
    </div>
  );
}
