"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Filter, ArrowUpDown, Gavel, Tag } from "lucide-react";
import { toast } from "sonner";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { makeListings, decayAuctions } from "@/lib/mock/listings";
import { useLiveFeed } from "@/lib/hooks/useLiveFeed";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { PROVIDERS } from "@/lib/mock/providers";
import {
  fmtAddr,
  fmtDuration,
  fmtInt,
  fmtPct,
  fmtPrice,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type SortKey = "discount" | "price" | "credits" | "expiry";

export function CreditListingsTable() {
  const initial = useMemo(() => makeListings(19, 30), []);
  const listings = useLiveFeed(
    initial,
    decayAuctions,
    1200,
  );

  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [minDiscount, setMinDiscount] = useState<string>("0");
  const [sortKey, setSortKey] = useState<SortKey>("discount");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const filtered = useMemo(() => {
    const md = parseFloat(minDiscount) / 100;
    let arr = listings.filter(
      (l) =>
        (providerFilter === "all" || l.provider.id === providerFilter) &&
        l.discount >= md,
    );
    arr = [...arr].sort((a, b) => {
      const av =
        sortKey === "discount"
          ? a.discount
          : sortKey === "price"
            ? a.price
            : sortKey === "credits"
              ? a.credits
              : a.expiry;
      const bv =
        sortKey === "discount"
          ? b.discount
          : sortKey === "price"
            ? b.price
            : sortKey === "credits"
              ? b.credits
              : b.expiry;
      return (av - bv) * sortDir;
    });
    return arr;
  }, [listings, providerFilter, minDiscount, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(k);
      setSortDir(-1);
    }
  };

  return (
    <Panel className="flex-1">
      <PanelHeader
        title="All listings"
        sub={`${filtered.length} of ${listings.length} · updated live`}
        right={
          <>
            <Select
              value={providerFilter}
              onChange={setProviderFilter}
              options={[
                { label: "All providers", value: "all" },
                ...PROVIDERS.map((p) => ({ label: p.short, value: p.id })),
              ]}
              className="w-[140px]"
            />
            <Select
              value={minDiscount}
              onChange={setMinDiscount}
              options={[
                { label: "Any discount", value: "0" },
                { label: ">= 10%", value: "10" },
                { label: ">= 20%", value: "20" },
                { label: ">= 30%", value: "30" },
              ]}
              className="w-[130px]"
            />
            <div className="text-text-2">
              <Filter size={13} />
            </div>
          </>
        }
      />
      <PanelBody className="flex flex-col">
        <div className="grid grid-cols-[140px_80px_1fr_1fr_110px_120px_140px_100px] px-3 h-8 items-center text-[10px] uppercase tracking-[0.08em] text-text-2 mono hairline-b bg-bg-2/40 shrink-0">
          <span>Provider</span>
          <span>Type</span>
          <SortHeader
            label="Credits"
            active={sortKey === "credits"}
            dir={sortDir}
            onClick={() => toggleSort("credits")}
          />
          <SortHeader
            label="Expiry"
            active={sortKey === "expiry"}
            dir={sortDir}
            onClick={() => toggleSort("expiry")}
          />
          <SortHeader
            label="Discount"
            active={sortKey === "discount"}
            dir={sortDir}
            onClick={() => toggleSort("discount")}
            align="right"
          />
          <SortHeader
            label="Price / credit"
            active={sortKey === "price"}
            dir={sortDir}
            onClick={() => toggleSort("price")}
            align="right"
          />
          <span>Seller</span>
          <span className="text-right">Action</span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {filtered.map((l) => (
            <ListingRow key={l.id} listing={l} />
          ))}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-[12px] text-text-2">
              No listings match your filters.
            </div>
          )}
        </div>
      </PanelBody>
    </Panel>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: 1 | -1;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 hover:text-text-0 transition-colors",
        active ? "text-text-0" : "text-text-2",
        align === "right" && "justify-end",
      )}
    >
      <span>{label}</span>
      <ArrowUpDown
        size={10}
        className={cn(active ? "opacity-100" : "opacity-40", dir === 1 && "rotate-180")}
      />
    </button>
  );
}

function ListingRow({ listing: l }: { listing: ReturnType<typeof makeListings>[number] }) {
  const remaining = useCountdown(l.expiry);
  return (
    <div className="grid grid-cols-[140px_80px_1fr_1fr_110px_120px_140px_100px] px-3 h-11 items-center hairline-b last:border-b-0 hover:bg-bg-2/40 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <Image
          src={l.provider.logo}
          alt=""
          width={14}
          height={14}
          className="shrink-0 opacity-90"
        />
        <span className="text-[12px] font-medium truncate">{l.provider.short}</span>
      </div>
      <div>
        <Badge variant={l.kind === "auction" ? "ask" : "outline"}>
          {l.kind === "auction" ? <Gavel size={9} /> : <Tag size={9} />}
          {l.kind}
        </Badge>
      </div>
      <span className="mono text-[12px] text-text-0 tabular-nums">
        {fmtInt(l.credits)}K
      </span>
      <span className="mono text-[12px] text-text-1 tabular-nums">
        {fmtDuration(remaining)}
      </span>
      <span className="text-right mono text-[12px] text-bid tabular-nums">
        {fmtPct(-l.discount * 100, 1)}
      </span>
      <span className="text-right mono text-[12px] text-text-0 tabular-nums">
        ${fmtPrice(l.price)}
      </span>
      <span className="mono text-[11px] text-text-2 tabular-nums">
        {fmtAddr(l.seller)}
      </span>
      <div className="flex justify-end">
        <Button
          size="sm"
          variant={l.kind === "auction" ? "primary" : "secondary"}
          onClick={() =>
            toast.success(`Bought ${fmtInt(l.credits)}K ${l.provider.short} credits`, {
              description:
                l.kind === "auction"
                  ? "Filled at the current auction price."
                  : "Filled at the listed price.",
            })
          }
        >
          Buy
        </Button>
      </div>
    </div>
  );
}
