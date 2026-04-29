"use client";

import Image from "next/image";
import { Check, CheckCircle2, AlertTriangle } from "lucide-react";
import { PROVIDERS, type Provider } from "@/lib/mock/providers";
import { Input } from "@/components/ui/Input";
import { fmtPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SelectProvider({
  selected,
  onSelect,
  apiKey,
  onApiKey,
}: {
  selected: Provider | null;
  onSelect: (p: Provider) => void;
  apiKey: string;
  onApiKey: (s: string) => void;
}) {
  const openProviders = PROVIDERS.filter((p) => p.kind === "open");
  const closedProviders = PROVIDERS.filter((p) => p.kind === "closed");

  return (
    <div className="space-y-8">
      <div>
        <div className="mono text-[11px] uppercase tracking-wider text-text-2 mb-4">
          What are you selling?
        </div>

        {/* Open-source group */}
        <GroupHeader
          tone="bid"
          icon={<CheckCircle2 size={11} />}
          label="Open-source inference"
          sub="Fully transferable · GPU operator is the producer · settles end-to-end on-chain"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
          {openProviders.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              active={selected?.id === p.id}
              onSelect={() => onSelect(p)}
            />
          ))}
        </div>

        {/* Closed-source group */}
        <GroupHeader
          tone="ask"
          icon={<AlertTriangle size={11} />}
          label="Hosted API credits"
          sub="Resale contested under provider ToS · permissionless settlement enables this market anyway"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {closedProviders.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              active={selected?.id === p.id}
              onSelect={() => onSelect(p)}
            />
          ))}
        </div>
      </div>

      {selected && (
        <div>
          <div className="mono text-[11px] uppercase tracking-wider text-text-2 mb-2">
            {selected.kind === "open"
              ? "Operator endpoint key (read-only)"
              : "Read-only API key"}
          </div>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKey(e.target.value)}
            placeholder="sk-••••••••••••••••••••••••"
          />
          <p className="text-[12px] text-text-2 mt-2 leading-relaxed">
            {selected.kind === "open" ? (
              <>
                Used once to verify capacity at your endpoint, then
                discarded. We never store it. Scope the key to{" "}
                <span className="mono text-bid">read:capacity</span>.
              </>
            ) : (
              <>
                Used once to verify your remaining balance, then discarded.
                We never store it. Generate a key scoped only to{" "}
                <span className="mono text-bid">read:balance</span> for
                maximum safety.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function GroupHeader({
  tone,
  icon,
  label,
  sub,
}: {
  tone: "bid" | "ask";
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  const toneBg = tone === "bid" ? "bg-bid/10 border-bid/20 text-bid" : "bg-ask/10 border-ask/20 text-ask";
  return (
    <div className="flex items-start gap-3 mb-3">
      <div
        className={cn(
          "mono inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] px-2 h-5 rounded-full border",
          toneBg,
        )}
      >
        {icon}
        {label}
      </div>
      <div className="text-[11.5px] text-text-2 leading-snug pt-[2px]">
        {sub}
      </div>
    </div>
  );
}

function ProviderCard({
  provider: p,
  active,
  onSelect,
}: {
  provider: Provider;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "panel p-4 rounded-[8px] text-left transition-all hover:border-bid/40 relative",
        active && "border-bid bg-bid/5",
      )}
    >
      {active && (
        <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-bid text-bg-0 flex items-center justify-center">
          <Check size={12} />
        </div>
      )}
      <div className="h-9 w-9 rounded-[8px] bg-bg-2 border border-line flex items-center justify-center mb-3">
        <Image src={p.logo} alt="" width={18} height={18} />
      </div>
      <div className="text-[13px] font-semibold tracking-tight">
        {p.short}
      </div>
      <div className="mono text-[10.5px] text-text-2 mt-1 uppercase tracking-wider">
        {p.name}
      </div>
      <div className="mono text-[11px] text-text-1 mt-2 tabular-nums">
        face ${fmtPrice(p.face)}/1K
      </div>
    </button>
  );
}
