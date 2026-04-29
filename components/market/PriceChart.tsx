"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { makeCandles, type Candle } from "@/lib/mock/candles";
import { fmtPrice } from "@/lib/format";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { Tab, TabList, Tabs } from "@/components/ui/Tabs";
import { MountedOnly } from "@/components/ui/MountedOnly";
import { CHART } from "@/lib/chartColors";

type Props = {
  provider: { id: string; face: number; volatility: number };
  seed?: number;
};

const TIMEFRAMES = [
  { id: "1H", hours: 1, count: 60 },
  { id: "4H", hours: 4, count: 72 },
  { id: "1D", hours: 24, count: 90 },
  { id: "1W", hours: 168, count: 84 },
];

export function PriceChart({ provider, seed = 7 }: Props) {
  const [tf, setTf] = useState("1D");
  const cfg = TIMEFRAMES.find((t) => t.id === tf)!;

  const candles: Candle[] = useMemo(
    () =>
      makeCandles(
        provider.face,
        cfg.count,
        seed + provider.id.length,
        provider.volatility,
      ),
    [provider.face, provider.id, provider.volatility, cfg.count, seed],
  );

  // Derived fields for custom bar rendering
  const data = useMemo(() => {
    return candles.map((c) => {
      const isUp = c.close >= c.open;
      return {
        ...c,
        isUp,
        // for body Bar: [min(o,c), max(o,c)]
        body: [Math.min(c.open, c.close), Math.max(c.open, c.close)],
        // for wick Bar: [low, high]
        wick: [c.low, c.high],
        volColor: isUp ? CHART.bid : CHART.ask,
      };
    });
  }, [candles]);

  const yDomain = useMemo(() => {
    const lows = candles.map((c) => c.low);
    const highs = candles.map((c) => c.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const pad = (max - min) * 0.08;
    return [min - pad, max + pad];
  }, [candles]);

  return (
    <Panel className="flex-1 min-h-0">
      <PanelHeader
        title="Price"
        sub="Candles + volume"
        right={
          <Tabs value={tf} onValueChange={setTf}>
            <TabList>
              {TIMEFRAMES.map((t) => (
                <Tab key={t.id} value={t.id}>
                  {t.id}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        }
      />
      <PanelBody className="relative p-2">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <MountedOnly
          fallback={
            <div className="h-full w-full flex items-center justify-center text-text-2 mono text-[11px]">
              loading chart…
            </div>
          }
        >
        <div className="h-[62%] relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 50, bottom: 0, left: 0 }}
              barCategoryGap={2}
            >
              <CartesianGrid
                stroke={CHART.gridLineSoft}
                strokeDasharray="2 4"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke={CHART.axis}
                tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains)", fill: CHART.axisTick }}
                tickLine={false}
                axisLine={{ stroke: CHART.axisLine }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                domain={yDomain}
                orientation="right"
                stroke={CHART.axis}
                tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains)", fill: CHART.axisTick }}
                tickLine={false}
                axisLine={{ stroke: CHART.axisLine }}
                width={50}
                tickFormatter={(v) => fmtPrice(v)}
              />
              <Tooltip
                cursor={{ stroke: CHART.cursorLine, strokeWidth: 1 }}
                contentStyle={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--line)",
                  borderRadius: 6,
                  fontSize: 11,
                  fontFamily: "var(--font-jetbrains)",
                  color: "var(--text-0)",
                }}
                labelStyle={{ color: CHART.tooltipLabel, fontSize: 10 }}
                itemStyle={{ color: "var(--text-0)" }}
                formatter={((_v: unknown, name: unknown, p: { payload?: Candle }) => {
                  const c = p.payload;
                  if (!c) return [String(_v ?? ""), String(name ?? "")];
                  if (name === "body") {
                    return [
                      `O ${fmtPrice(c.open)}  H ${fmtPrice(c.high)}  L ${fmtPrice(c.low)}  C ${fmtPrice(c.close)}`,
                      "OHLC",
                    ];
                  }
                  if (name === "wick") return ["", ""];
                  return [String(_v ?? ""), String(name ?? "")];
                }) as never}
              />
              {/* Wick */}
              <Bar dataKey="wick" barSize={1.5} isAnimationActive={false}>
                {data.map((d, i) => (
                  <Cell
                    key={`w-${i}`}
                    fill={d.isUp ? CHART.bid : CHART.ask}
                  />
                ))}
              </Bar>
              {/* Body */}
              <Bar dataKey="body" barSize={6} isAnimationActive={false}>
                {data.map((d, i) => (
                  <Cell
                    key={`b-${i}`}
                    fill={d.isUp ? CHART.bid : CHART.ask}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="h-[32%] relative mt-1">
          <div className="mono text-[9px] text-text-2 absolute top-1 left-2 uppercase tracking-wider z-10">
            Volume
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 50, bottom: 0, left: 0 }}
              barCategoryGap={2}
            >
              <CartesianGrid
                stroke={CHART.gridLineSoft}
                strokeDasharray="2 4"
                vertical={false}
              />
              <XAxis dataKey="time" hide />
              <YAxis
                orientation="right"
                stroke={CHART.axis}
                tick={{ fontSize: 9, fontFamily: "var(--font-jetbrains)", fill: CHART.axisTickSub }}
                tickLine={false}
                axisLine={{ stroke: CHART.axisLine }}
                width={50}
                tickFormatter={(v) => `${Math.round(v)}`}
              />
              <Bar dataKey="volume" isAnimationActive={false}>
                {data.map((d, i) => (
                  <Cell
                    key={`v-${i}`}
                    fill={d.isUp ? CHART.bidSoft : CHART.askSoft}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        </MountedOnly>
      </PanelBody>
    </Panel>
  );
}
