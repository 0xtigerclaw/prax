"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/shell/AppShell";
import {
  ComputeRequestForm,
  type RequestForm,
} from "@/components/routing/ComputeRequestForm";
import { RouteComparison } from "@/components/routing/RouteComparison";
import { ExecutionPath } from "@/components/routing/ExecutionPath";
import { makeRoutes } from "@/lib/mock/routes";

export default function RoutePage() {
  const [form, setForm] = useState<RequestForm>({
    providerId: "gpt4o",
    inputTokens: 12_000,
    outputTokens: 3_000,
    priority: "balanced",
  });

  const [seed, setSeed] = useState(101);
  const routes = useMemo(() => makeRoutes(form.providerId, seed), [form.providerId, seed]);
  const [selected, setSelected] = useState<string>(routes[0]?.id ?? "");

  const totalTokens = form.inputTokens + form.outputTokens;

  return (
    <AppShell>
      <div className="p-3 flex flex-col gap-3 min-h-full">
        <div className="flex items-end justify-between px-1">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.15em] text-bid mb-1">
              Smart routing
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight leading-none">
              Pay less for the same API call.
            </h1>
          </div>
          <div className="mono text-[11px] text-text-2">
            scanning direct + {routes.length - 1} secondary sources
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] gap-3 min-h-[520px]">
          <ComputeRequestForm
            value={form}
            onChange={setForm}
            onFind={() => {
              setSeed((s) => s + 1);
            }}
          />
          <RouteComparison
            routes={routes}
            selected={selected}
            onSelect={setSelected}
            totalTokens={totalTokens}
          />
        </div>

        <ExecutionPath
          route={routes.find((r) => r.id === selected) ?? routes[0]}
          totalTokens={totalTokens}
        />
      </div>
    </AppShell>
  );
}
