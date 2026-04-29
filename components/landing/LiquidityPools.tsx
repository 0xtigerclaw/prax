"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { makePools } from "@/lib/mock/pools";
import { fmtUsdCompact, fmtPct } from "@/lib/format";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export function LiquidityPools() {
  const pools = useMemo(() => makePools(9).slice(0, 4), []);

  return (
    <section className="bg-bg-1/40 hairline-t hairline-b">
      <div className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.15em] text-bid mb-2">
              Liquidity pools
            </div>
            <h2 className="text-[36px] font-semibold tracking-[-0.025em]">
              Earn yield from the gap between
              <br />
              face value and expiry price.
            </h2>
          </div>
          <div className="text-[13px] text-text-2 max-w-[300px] leading-relaxed">
            Deposit USDC. The pool automatically buys expiring credits
            below fair value and resells them. You earn 0.30% of every
            fill plus the discount spread.
          </div>
        </div>

        <div className="panel rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] px-5 h-10 hairline-b bg-bg-2 text-[10.5px] uppercase tracking-[0.08em] text-text-2 mono items-center">
            <span>Pool</span>
            <span className="text-right">TVL</span>
            <span className="text-right">24h Volume</span>
            <span className="text-right">APY</span>
            <span className="text-right">Action</span>
          </div>
          {pools.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_0.6fr] px-5 h-14 hairline-b last:border-b-0 items-center hover:bg-bg-2/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex -space-x-1.5">
                  <div className="h-7 w-7 rounded-full bg-bg-3 border-2 border-bg-1 flex items-center justify-center">
                    <Image
                      src={p.provider.logo}
                      alt=""
                      width={14}
                      height={14}
                      className="opacity-90"
                    />
                  </div>
                  <div className="h-7 w-7 rounded-full bg-[#2775ca] border-2 border-bg-1 flex items-center justify-center text-[9px] font-bold text-white">
                    $
                  </div>
                </div>
                <div>
                  <div className="text-[13px] font-medium">{p.pair}</div>
                  <div className="mono text-[10px] text-text-2 mt-0.5">
                    fee 0.30% · Solana
                  </div>
                </div>
              </div>
              <div className="text-right mono text-[13px]">
                {fmtUsdCompact(p.tvl)}
              </div>
              <div className="text-right mono text-[13px]">
                {fmtUsdCompact(p.volume24h)}
              </div>
              <div className="text-right">
                <Badge variant={p.apy > 30 ? "bid" : "outline"}>
                  {fmtPct(p.apy, 1, false)}
                </Badge>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/market"
                  className="h-7 w-7 rounded-[6px] hover:bg-bg-3 flex items-center justify-center text-text-1 hover:text-text-0 transition-colors"
                >
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
