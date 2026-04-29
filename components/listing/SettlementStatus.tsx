"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const TARGET_CONFIRMATIONS = 32;

export function SettlementStatus({
  onReset,
  txSignature,
}: {
  onReset: () => void;
  /** Real devnet tx signature from the on-chain `create_auction` call. If
   *  omitted, a mock hash is shown (demo fallback). */
  txSignature?: string;
}) {
  const [confirmations, setConfirmations] = useState(0);
  const mockHash = useMockHash();
  const txHash = txSignature ?? mockHash;

  useEffect(() => {
    const id = setInterval(() => {
      setConfirmations((c) => {
        if (c >= TARGET_CONFIRMATIONS) {
          clearInterval(id);
          return c;
        }
        return c + Math.max(1, Math.floor(Math.random() * 3));
      });
    }, 120);
    return () => clearInterval(id);
  }, []);

  const progress = Math.min(1, confirmations / TARGET_CONFIRMATIONS);
  const done = confirmations >= TARGET_CONFIRMATIONS;

  return (
    <div className="panel rounded-[10px] overflow-hidden">
      <div className="p-6 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="h-16 w-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{
            background: done
              ? "rgba(47, 125, 79, 0.14)"
              : "rgba(91, 80, 61, 0.08)",
            border: `1px solid ${done ? "rgba(47, 125, 79, 0.35)" : "rgba(91, 80, 61, 0.22)"}`,
          }}
        >
          {done ? (
            <Check className="text-bid" size={28} />
          ) : (
            <Loader2 className="animate-spin text-text-1" size={22} />
          )}
        </motion.div>

        <h3 className="text-[20px] font-semibold tracking-tight">
          {done ? "You’re live on the market" : "Publishing to Solana…"}
        </h3>
        <p className="text-[13px] text-text-1 mt-2 max-w-[440px] mx-auto">
          {done
            ? "Buyers can fill right now. USDC lands in your wallet the moment someone takes the ask."
            : "Waiting on the block to confirm. Usually under 20 seconds."}
        </p>
      </div>

      <div className="px-6 py-5 hairline-t hairline-b bg-bg-2/40">
        <div className="flex items-center justify-between mb-2">
          <span className="mono text-[10.5px] uppercase tracking-wider text-text-2">
            Confirmations
          </span>
          <span className="mono text-[12px] tabular-nums">
            {confirmations} / {TARGET_CONFIRMATIONS}
          </span>
        </div>
        <div className="h-1 bg-bg-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-bid transition-all duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 space-y-2 text-[12.5px]">
        <Row label="Transaction">
          <a
            href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-bid hover:underline inline-flex items-center gap-1"
          >
            {txHash.slice(0, 10)}…{txHash.slice(-8)}
            <ExternalLink size={10} />
          </a>
        </Row>
        <Row label="Block">
          <span className="mono text-text-0 tabular-nums">
            {done ? "312,478,591" : "pending"}
          </span>
        </Row>
        <Row label="Fee">
          <span className="mono text-text-0">0.000005 SOL</span>
        </Row>
        <Row label="Status">
          {done ? (
            <Badge variant="bid">Confirmed</Badge>
          ) : (
            <Badge variant="outline">Pending</Badge>
          )}
        </Row>
      </div>

      <div className="p-6 pt-0 flex gap-2">
        <Link href="/market" className="flex-1">
          <Button variant="primary" size="md" className="w-full">
            See it on the market
          </Button>
        </Link>
        <Button
          variant="outline"
          size="md"
          onClick={onReset}
          disabled={!done}
        >
          List more credits
        </Button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-2">{label}</span>
      <span>{children}</span>
    </div>
  );
}

function useMockHash() {
  const [h, setH] = useState("5xKXfAP93s1vRQm8f2zB8NwJ9a");
  useEffect(() => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    for (let i = 0; i < 64; i++) out += chars[Math.floor(Math.random() * chars.length)];
    setH(out);
  }, []);
  return h;
}
