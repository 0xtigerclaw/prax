"use client";

import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { Tab, TabList, Tabs } from "@/components/ui/Tabs";
import { PROVIDERS } from "@/lib/mock/providers";
import { Zap } from "lucide-react";
import { fmtInt } from "@/lib/format";

export type RequestForm = {
  providerId: string;
  inputTokens: number;
  outputTokens: number;
  priority: "cost" | "balanced" | "latency";
};

export function ComputeRequestForm({
  value,
  onChange,
  onFind,
}: {
  value: RequestForm;
  onChange: (v: RequestForm) => void;
  onFind: () => void;
}) {
  return (
    <Panel className="h-full">
      <PanelHeader
        title="Your request"
        sub="What are you calling?"
        right={
          <span className="mono text-[10.5px] text-text-2 uppercase tracking-wider">
            live quotes
          </span>
        }
      />
      <PanelBody className="p-5 space-y-5 overflow-y-auto">
        <div>
          <div className="mono text-[10.5px] uppercase tracking-wider text-text-2 mb-1.5">
            Model
          </div>
          <Select
            value={value.providerId}
            onChange={(v) => onChange({ ...value, providerId: v })}
            options={PROVIDERS.map((p) => ({
              label: `${p.short} · ${p.name}`,
              value: p.id,
              hint: `$${p.face.toFixed(4)}`,
            }))}
            className="w-full"
          />
        </div>

        <SliderField
          label="Input tokens"
          value={value.inputTokens}
          onChange={(v) => onChange({ ...value, inputTokens: v })}
          min={100}
          max={100000}
          step={100}
        />

        <SliderField
          label="Output tokens"
          value={value.outputTokens}
          onChange={(v) => onChange({ ...value, outputTokens: v })}
          min={100}
          max={20000}
          step={100}
        />

        <div>
          <div className="mono text-[10.5px] uppercase tracking-wider text-text-2 mb-1.5">
            Optimize for
          </div>
          <Tabs
            value={value.priority}
            onValueChange={(v) =>
              onChange({ ...value, priority: v as RequestForm["priority"] })
            }
          >
            <TabList className="w-full">
              <Tab value="cost" className="flex-1">
                Lowest cost
              </Tab>
              <Tab value="balanced" className="flex-1">
                Balanced
              </Tab>
              <Tab value="latency" className="flex-1">
                Fastest
              </Tab>
            </TabList>
          </Tabs>
        </div>

        <div className="panel-2 rounded-[6px] p-3 space-y-1.5 text-[11.5px]">
          <Row label="Total tokens">
            <span className="mono">
              {fmtInt(value.inputTokens + value.outputTokens)}
            </span>
          </Row>
          <Row label="Ratio (in:out)">
            <span className="mono">
              {(value.inputTokens / Math.max(1, value.outputTokens)).toFixed(1)}:1
            </span>
          </Row>
          <Row label="If you call direct">
            <span className="mono text-text-0">
              $
              {(
                ((value.inputTokens + value.outputTokens) / 1000) *
                (PROVIDERS.find((p) => p.id === value.providerId)?.face ??
                  PROVIDERS[0].face)
              ).toFixed(4)}
            </span>
          </Row>
        </div>

        <Button variant="primary" size="lg" onClick={onFind} className="w-full">
          <Zap size={14} /> Find cheapest route
        </Button>
      </PanelBody>
    </Panel>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="mono text-[10.5px] uppercase tracking-wider text-text-2">
          {label}
        </span>
        <span className="mono text-[12px] tabular-nums">{fmtInt(value)}</span>
      </div>
      <Slider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
      />
      <div className="flex justify-between mt-1 mono text-[9.5px] text-text-3 tabular-nums">
        <span>{fmtInt(min)}</span>
        <span>{fmtInt(max)}</span>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-2">{label}</span>
      {children}
    </div>
  );
}
