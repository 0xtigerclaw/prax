"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Gavel,
  Star,
  TrendingDown,
  Zap,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fmtAddr, fmtDuration, fmtPct, fmtPrice } from "@/lib/format";
import type { RouteOption } from "@/lib/mock/routes";
import { cn } from "@/lib/utils";

export function RouteComparison({
  routes,
  selected,
  onSelect,
  totalTokens,
}: {
  routes: RouteOption[];
  selected: string | null;
  onSelect: (id: string) => void;
  totalTokens: number;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Panel className="h-full">
      <PanelHeader
        title="Where to buy this call"
        sub={`${routes.length} sources · cheapest first`}
        right={
          <Badge variant="bid">
            <TrendingDown size={9} /> biggest savings on top
          </Badge>
        }
      />
      <PanelBody className="overflow-y-auto">
        <div className="grid grid-cols-[1fr_100px_100px_120px_90px] px-4 h-9 items-center text-[10px] uppercase tracking-[0.08em] text-text-2 mono hairline-b bg-bg-2/40">
          <span>Route</span>
          <span className="text-right">$ / 1K</span>
          <span className="text-right">Savings</span>
          <span className="text-right">Total cost</span>
          <span className="text-right">Action</span>
        </div>

        {routes.map((r) => {
          const totalCost = (totalTokens / 1000) * r.effective;
          const isExp = expanded === r.id;
          const isSelected = selected === r.id;

          return (
            <div key={r.id} className="hairline-b last:border-b-0">
              <button
                onClick={() => setExpanded(isExp ? null : r.id)}
                className={cn(
                  "grid grid-cols-[1fr_100px_100px_120px_90px] px-4 h-14 items-center w-full text-left hover:bg-bg-2/40 transition-colors",
                  isSelected && "bg-bid/5",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button className="h-5 w-5 rounded hover:bg-bg-3 flex items-center justify-center text-text-2 shrink-0">
                    {isExp ? (
                      <ChevronDown size={12} />
                    ) : (
                      <ChevronRight size={12} />
                    )}
                  </button>
                  <Image
                    src={r.provider.logo}
                    alt=""
                    width={18}
                    height={18}
                    className="opacity-90 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium truncate">
                      {r.label}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <KindBadge kind={r.kind} />
                      {r.seller && (
                        <span className="mono text-[10px] text-text-2">
                          {fmtAddr(r.seller, 4, 4)}
                        </span>
                      )}
                      {r.qualityDelta != null && (
                        <span className="mono text-[10px] text-ask">
                          Δ quality {fmtPct(r.qualityDelta, 1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-right mono text-[13px] tabular-nums">
                  ${fmtPrice(r.effective)}
                </span>
                <span className="text-right">
                  {r.savingsPct > 0 ? (
                    <Badge variant="bid">
                      −{r.savingsPct.toFixed(0)}%
                    </Badge>
                  ) : (
                    <span className="mono text-[11px] text-text-2">—</span>
                  )}
                </span>
                <span className="text-right mono text-[12px] text-text-0 tabular-nums">
                  ${totalCost.toFixed(4)}
                </span>
                <div className="flex justify-end">
                  <Button
                    variant={isSelected ? "primary" : "outline"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(r.id);
                    }}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </Button>
                </div>
              </button>

              {isExp && (
                <div className="px-4 py-3 bg-bg-2/30 grid grid-cols-4 gap-4">
                  <Detail
                    icon={<Clock size={12} />}
                    label="Latency"
                    value={`${r.latencyMs.toFixed(0)} ms`}
                  />
                  <Detail
                    icon={<Star size={12} />}
                    label="Seller reputation"
                    value={`${(r.reputation * 100).toFixed(1)}%`}
                  />
                  <Detail
                    icon={<Clock size={12} />}
                    label="Expires"
                    value={r.expiresIn ? fmtDuration(r.expiresIn) : "—"}
                  />
                  <Detail
                    icon={<ShieldCheck size={12} />}
                    label="Settlement"
                    value="Solana · 400ms"
                  />
                </div>
              )}
            </div>
          );
        })}
      </PanelBody>
    </Panel>
  );
}

function KindBadge({ kind }: { kind: RouteOption["kind"] }) {
  const map: Record<
    RouteOption["kind"],
    { label: string; variant: "outline" | "bid" | "ask" | "sol" }
  > = {
    direct: { label: "List price", variant: "outline" },
    secondary: { label: "Resale", variant: "bid" },
    auction: { label: "Auction", variant: "ask" },
    "alt-model": { label: "Swap model", variant: "sol" },
  };
  const v = map[kind];
  return (
    <Badge variant={v.variant}>
      {kind === "auction" && <Gavel size={9} />}
      {kind === "secondary" && <Zap size={9} />}
      {v.label}
    </Badge>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-text-2 mono text-[10px] uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="mono text-[12.5px] mt-1 tabular-nums">{value}</div>
    </div>
  );
}
