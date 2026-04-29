"use client";

import Image from "next/image";
import { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { makeHoldings, makeOpenOrders } from "@/lib/mock/portfolio";
import { useWallet } from "@/lib/hooks/useWallet";
import { fmtInt, fmtPct, fmtPrice } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { useLiveFeed } from "@/lib/hooks/useLiveFeed";
import { MountedOnly } from "@/components/ui/MountedOnly";
import { CHART } from "@/lib/chartColors";

export function PortfolioPanel() {
  const holdings = useMemo(() => makeHoldings(55), []);
  const orders = useMemo(() => makeOpenOrders(77), []);
  const wallet = useWallet();

  // drift mark prices to animate P&L
  const marks = useLiveFeed(
    holdings.map((h) => h.provider.face),
    (prev) =>
      prev.map(
        (p, i) =>
          p *
          (1 + (Math.random() - 0.5) * holdings[i].provider.volatility * 0.5),
      ),
    1600,
  );

  return (
    <Panel className="h-full">
      <PanelHeader title="Portfolio" />
      <PanelBody className="overflow-y-auto">
        {/* Wallet summary */}
        <div className="px-3 py-3 hairline-b grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-2 mono">
              USDC
            </div>
            <div className="mono text-[16px] font-medium mt-1 tabular-nums">
              {wallet.balanceUSDC.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-2 mono">
              SOL
            </div>
            <div className="mono text-[16px] font-medium mt-1 tabular-nums">
              {wallet.balanceSOL.toFixed(4)}
            </div>
          </div>
        </div>

        <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-2 mono hairline-b bg-bg-2/30">
          Credit holdings
        </div>
        {holdings.map((h, i) => {
          const mark = marks[i];
          const pnlPct = ((mark - h.avgCost) / h.avgCost) * 100;
          const pnlUsd = (mark - h.avgCost) * h.credits;
          const up = pnlPct >= 0;
          return (
            <div
              key={h.provider.id}
              className="px-3 py-2.5 hairline-b flex items-center gap-3 hover:bg-bg-2/50 transition-colors"
            >
              <Image
                src={h.provider.logo}
                alt=""
                width={18}
                height={18}
                className="opacity-90 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium leading-none">
                  {h.provider.short}
                </div>
                <div className="mono text-[10px] text-text-2 mt-1 tabular-nums">
                  {fmtInt(h.credits)}K · avg ${fmtPrice(h.avgCost)}
                </div>
              </div>
              <div className="w-[60px] h-7 shrink-0">
                <MountedOnly>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={h.sparkline.map((v, idx) => ({ v, idx }))}
                    >
                      <YAxis hide domain={["dataMin", "dataMax"]} />
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke={up ? CHART.bid : CHART.ask}
                        strokeWidth={1.25}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </MountedOnly>
              </div>
              <div className="text-right shrink-0">
                <div
                  className={cn(
                    "mono text-[12px] tabular-nums",
                    up ? "text-bid" : "text-ask",
                  )}
                >
                  {up ? "+" : ""}
                  {pnlUsd.toFixed(2)}
                </div>
                <div
                  className={cn(
                    "mono text-[10px] tabular-nums",
                    up ? "text-bid" : "text-ask",
                  )}
                >
                  {fmtPct(pnlPct, 2)}
                </div>
              </div>
            </div>
          );
        })}

        <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-text-2 mono hairline-b bg-bg-2/30">
          Open orders · {orders.length}
        </div>
        {orders.map((o) => (
          <div
            key={o.id}
            className="px-3 py-2 hairline-b flex items-center gap-2 text-[11px]"
          >
            <Badge variant={o.side === "buy" ? "bid" : "ask"}>
              {o.side}
            </Badge>
            <Image src={o.provider.logo} alt="" width={14} height={14} />
            <span className="text-[11px] font-medium">{o.provider.short}</span>
            <div className="flex-1" />
            <span className="mono text-text-1 tabular-nums">
              {o.size}K @ ${fmtPrice(o.price)}
            </span>
            <div className="w-10 h-1 bg-bg-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-bid"
                style={{ width: `${o.filled * 100}%` }}
              />
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="px-3 py-6 text-center text-[11px] text-text-2">
            No open orders.
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}
