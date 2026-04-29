"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import type { Provider } from "@/lib/mock/providers";
import { cn } from "@/lib/utils";
import { fmtInt } from "@/lib/format";

const STEPS = [
  { label: "Connecting to the oracle over TLS", duration: 550 },
  { label: "Reading your balance at the provider", duration: 1100 },
  { label: "Signing a zero-knowledge proof of balance", duration: 900 },
  { label: "Recording the proof on Solana", duration: 700 },
];

export function ProofOfBalance({
  provider,
  onVerified,
}: {
  provider: Provider;
  onVerified: (balance: number) => void;
}) {
  const [step, setStep] = useState(0);
  const [balance] = useState(() => 8_000_000 + Math.floor(Math.random() * 15_000_000));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let i = 0; i < STEPS.length; i++) {
        await new Promise((r) => setTimeout(r, STEPS[i].duration));
        if (cancelled) return;
        setStep(i + 1);
      }
      onVerified(balance);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const done = step >= STEPS.length;

  return (
    <div>
      <div className="panel p-5 rounded-[10px] mb-5">
        <div className="flex items-center gap-3 mb-4">
          <Image src={provider.logo} alt="" width={28} height={28} />
          <div>
            <div className="text-[14px] font-semibold">{provider.short}</div>
            <div className="mono text-[11px] text-text-2">
              {provider.name} · {provider.model}
            </div>
          </div>
          <div className="flex-1" />
          {done ? (
            <div className="flex items-center gap-1.5 text-bid mono text-[11.5px] uppercase tracking-wider">
              <ShieldCheck size={14} />
              Verified
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-text-1 mono text-[11.5px] uppercase tracking-wider">
              <Loader2 size={14} className="animate-spin" />
              Checking…
            </div>
          )}
        </div>

        <div className="space-y-2">
          {STEPS.map((s, i) => {
            const isDone = step > i;
            const isActive = step === i;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 px-3 h-9 rounded-[6px] text-[12.5px] transition-colors",
                  isActive && "bg-bid/5",
                )}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                    isDone
                      ? "bg-bid text-bg-0"
                      : isActive
                        ? "bg-bid/20 text-bid"
                        : "bg-bg-3 text-text-2",
                  )}
                >
                  {isDone ? (
                    <Check size={10} />
                  ) : isActive ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <div className="h-1 w-1 rounded-full bg-text-2" />
                  )}
                </div>
                <span
                  className={cn(
                    isDone
                      ? "text-text-1"
                      : isActive
                        ? "text-text-0"
                        : "text-text-2",
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="panel rounded-[10px] overflow-hidden border-bid/30"
        >
          <div className="px-5 py-4 hairline-b bg-bid/5 flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-bid text-bg-0 flex items-center justify-center">
              <Check size={13} />
            </div>
            <span className="text-[13.5px] font-semibold text-bid">
              Balance confirmed. You&rsquo;re cleared to list
            </span>
          </div>
          <div className="p-5 grid grid-cols-3 gap-4">
            <Stat label="Available to sell" value={`${fmtInt(balance)} tokens`} />
            <Stat label="Proof hash" value="0xa4f…c281" mono />
            <Stat label="Proof valid for" value="30 days" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="mono text-[10px] uppercase tracking-wider text-text-2 mb-1.5">
        {label}
      </div>
      <div
        className={cn(
          "text-[14px] text-text-0 font-medium tabular-nums",
          mono && "mono",
        )}
      >
        {value}
      </div>
    </div>
  );
}
