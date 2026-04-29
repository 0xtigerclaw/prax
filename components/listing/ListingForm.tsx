"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { Provider } from "@/lib/mock/providers";
import { Tab, TabList, Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { MountedOnly } from "@/components/ui/MountedOnly";
import { CHART } from "@/lib/chartColors";
import { fmtDuration, fmtInt, fmtPrice } from "@/lib/format";

export type ListingDraft = {
  kind: "fixed" | "auction";
  price?: string;
  startPrice?: string;
  floorPrice?: string;
  duration: string; // hours
  decay?: "linear" | "exp";
};

export function ListingForm({
  provider,
  amount,
  onSubmit,
  publishing = false,
}: {
  provider: Provider;
  amount: number;
  onSubmit: (draft: ListingDraft) => void;
  publishing?: boolean;
}) {
  const [kind, setKind] = useState<"fixed" | "auction">("fixed");
  const [price, setPrice] = useState(
    (provider.face * 0.82).toFixed(4),
  );
  const [startPrice, setStartPrice] = useState(
    (provider.face * 0.95).toFixed(4),
  );
  const [floorPrice, setFloorPrice] = useState(
    (provider.face * 0.55).toFixed(4),
  );
  const [duration, setDuration] = useState("48");
  const [decay, setDecay] = useState<"linear" | "exp">("linear");

  const sp = parseFloat(startPrice);
  const fp = parseFloat(floorPrice);
  const dur = parseFloat(duration);

  const decayData = useMemo(() => {
    const steps = 36;
    const out: { t: number; price: number; label: string }[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = i / steps;
      const p =
        decay === "linear"
          ? sp - (sp - fp) * x
          : sp * Math.pow(fp / sp, x);
      out.push({
        t: i,
        price: p,
        label: `${((dur * x) | 0)}h`,
      });
    }
    return out;
  }, [sp, fp, decay, dur]);

  const submit = () => {
    onSubmit({
      kind,
      price: kind === "fixed" ? price : undefined,
      startPrice: kind === "auction" ? startPrice : undefined,
      floorPrice: kind === "auction" ? floorPrice : undefined,
      duration,
      decay: kind === "auction" ? decay : undefined,
    });
  };

  return (
    <div className="grid md:grid-cols-[1fr_1fr] gap-5">
      {/* Left: form */}
      <div className="space-y-4">
        <Tabs value={kind} onValueChange={(v) => setKind(v as "fixed" | "auction")}>
          <TabList className="w-full">
            <Tab value="fixed" className="flex-1">
              Fixed price
            </Tab>
            <Tab value="auction" className="flex-1">
              Falling-price auction
            </Tab>
          </TabList>
        </Tabs>

        {kind === "fixed" ? (
          <>
            <Field label="Ask price · USDC per 1K tokens">
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="decimal"
              />
            </Field>
            <Field label="Keep listing open for">
              <Select
                value={duration}
                onChange={setDuration}
                options={[
                  { label: "6 hours", value: "6" },
                  { label: "12 hours", value: "12" },
                  { label: "24 hours", value: "24" },
                  { label: "48 hours", value: "48" },
                  { label: "7 days", value: "168" },
                ]}
                className="w-full"
              />
            </Field>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start at (USDC / 1K)">
                <Input
                  value={startPrice}
                  onChange={(e) => setStartPrice(e.target.value)}
                  inputMode="decimal"
                />
              </Field>
              <Field label="Won't go below (USDC / 1K)">
                <Input
                  value={floorPrice}
                  onChange={(e) => setFloorPrice(e.target.value)}
                  inputMode="decimal"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Falls over">
                <Select
                  value={duration}
                  onChange={setDuration}
                  options={[
                    { label: "6 hours", value: "6" },
                    { label: "12 hours", value: "12" },
                    { label: "24 hours", value: "24" },
                    { label: "48 hours", value: "48" },
                  ]}
                  className="w-full"
                />
              </Field>
              <Field label="Price curve">
                <Select
                  value={decay}
                  onChange={(v) => setDecay(v as "linear" | "exp")}
                  options={[
                    { label: "Straight line", value: "linear" },
                    { label: "Fast at first, then slow", value: "exp" },
                  ]}
                  className="w-full"
                />
              </Field>
            </div>

            {/* Preview chart */}
            <div className="panel-2 rounded-[8px] p-3 h-[160px]">
              <div className="flex items-center justify-between mb-1">
                <span className="mono text-[10px] uppercase tracking-wider text-text-2">
                  How your price will fall
                </span>
                <Badge variant="ask">auction · {decay}</Badge>
              </div>
              <MountedOnly>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={decayData} margin={{ top: 4, right: 6, bottom: 2, left: -18 }}>
                  <defs>
                    <linearGradient id="decay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.ask} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={CHART.ask} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART.gridLineSoft} strokeDasharray="2 4" />
                  <XAxis
                    dataKey="label"
                    stroke={CHART.axis}
                    tick={{ fontSize: 9, fontFamily: "var(--font-jetbrains)", fill: CHART.axisTickSub }}
                    tickLine={false}
                    interval={Math.max(1, decayData.length / 6 - 1)}
                  />
                  <YAxis
                    stroke={CHART.axis}
                    tick={{ fontSize: 9, fontFamily: "var(--font-jetbrains)", fill: CHART.axisTickSub }}
                    tickLine={false}
                    width={44}
                    tickFormatter={(v) => fmtPrice(v)}
                    domain={["dataMin", "dataMax"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={CHART.ask}
                    strokeWidth={1.5}
                    fill="url(#decay)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              </MountedOnly>
            </div>
          </>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={submit}
          disabled={publishing}
        >
          {publishing ? "Publishing to Solana…" : "Publish listing"}
        </Button>
      </div>

      {/* Right: buyer preview card */}
      <div>
        <div className="mono text-[11px] uppercase tracking-wider text-text-2 mb-2">
          How buyers will see it
        </div>
        <div className="panel rounded-[10px] p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-[8px] bg-bg-2 border border-line flex items-center justify-center">
                <Image src={provider.logo} alt="" width={20} height={20} />
              </div>
              <div>
                <div className="text-[14px] font-semibold">
                  {provider.short}
                </div>
                <div className="mono text-[11px] text-text-2 mt-0.5">
                  {provider.name}
                </div>
              </div>
            </div>
            <Badge variant={kind === "auction" ? "ask" : "outline"}>
              {kind === "auction" ? "Dutch" : "Fixed"}
            </Badge>
          </div>

          <div className="mb-3">
            <div className="mono text-[10.5px] uppercase tracking-wider text-text-2 mb-1">
              {kind === "auction" ? "Starts at" : "Price"} · per 1K tokens
            </div>
            <div className="mono text-[26px] font-medium tabular-nums">
              ${fmtPrice(kind === "auction" ? sp : parseFloat(price))}
            </div>
            {kind === "auction" && (
              <div className="mono text-[11px] text-text-2 mt-1">
                falls to ${fmtPrice(fp)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11.5px] mb-4">
            <Stat label="Credits for sale" value={`${fmtInt(amount / 1000)}K`} />
            <Stat label="Closes in" value={fmtDuration(dur * 3600 * 1000)} />
          </div>

          <Button variant="primary" size="md" className="w-full">
            {kind === "auction" ? "Buy now" : "Buy credits"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mono text-[10.5px] uppercase tracking-wider text-text-2 mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono text-[10px] uppercase tracking-wider text-text-2">
        {label}
      </div>
      <div className="mono text-[13px] text-text-0 mt-1 tabular-nums">
        {value}
      </div>
    </div>
  );
}
