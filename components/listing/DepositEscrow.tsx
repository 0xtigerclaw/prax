"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ExternalLink, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import type { Provider } from "@/lib/mock/providers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { usePraxWallet } from "@/lib/solana/usePraxWallet";
import { fmtAddr, fmtInt } from "@/lib/format";
import { toast } from "sonner";

export function DepositEscrow({
  provider,
  balance,
  amount,
  onAmount,
  onDeposited,
}: {
  provider: Provider;
  balance: number;
  amount: string;
  onAmount: (s: string) => void;
  onDeposited: () => void;
}) {
  const wallet = usePraxWallet();
  const { setVisible } = useWalletModal();
  const [signing, setSigning] = useState(false);

  const sign = async () => {
    if (!wallet.connected) {
      toast.error("Connect a wallet to continue");
      setVisible(true);
      return;
    }
    if (!amount || parseInt(amount) <= 0) {
      toast.error("Enter how many credits to sell");
      return;
    }
    setSigning(true);
    await new Promise((r) => setTimeout(r, 1600));
    setSigning(false);
    toast.success("Credits locked in escrow", {
      description: "You’re ready to set a price.",
    });
    onDeposited();
  };

  return (
    <div className="space-y-5">
      <div className="panel rounded-[10px] p-5">
        <div className="flex items-center gap-3 mb-5">
          <Image src={provider.logo} alt="" width={26} height={26} />
          <div>
            <div className="text-[13px] font-semibold">{provider.short}</div>
            <div className="mono text-[11px] text-text-2 mt-0.5">
              available {fmtInt(balance)} credits
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 mono text-[11.5px] uppercase tracking-wider text-text-2">
            <Lock size={13} /> on-chain escrow
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-wider text-text-2 mb-1.5">
              How much to sell (credits)
            </div>
            <Input
              value={amount}
              onChange={(e) => onAmount(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder={fmtInt(balance / 2)}
              inputMode="numeric"
            />
            <div className="flex gap-1 mt-2">
              {[25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  onClick={() =>
                    onAmount(Math.floor((balance * p) / 100).toString())
                  }
                  className="flex-1 h-6 rounded-[4px] bg-bg-2 hover:bg-bg-3 border border-line text-[10.5px] mono text-text-1 hover:text-text-0 transition-colors"
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
          <div className="text-text-2 pb-2">→</div>
          <div>
            <div className="mono text-[10.5px] uppercase tracking-wider text-text-2 mb-1.5">
              Tradeable units
            </div>
            <div className="h-9 px-3 rounded-[6px] bg-bid/5 border border-bid/30 flex items-center mono text-[13px] text-bid tabular-nums">
              {amount && parseInt(amount) > 0
                ? `${fmtInt(parseInt(amount))} credits`
                : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="panel rounded-[10px] p-5 space-y-2.5 text-[12.5px]">
        <Row label="Program ID">
          <a
            href="https://explorer.solana.com/address/NcrmnMRfv3fZaqND9P6XtiXhf1dKo6kt2rC3umtRsuH?cluster=devnet"
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-bid hover:underline inline-flex items-center gap-1"
          >
            NcrmnM…RsuH <ExternalLink size={10} />
          </a>
        </Row>
        <Row label="Network">
          <span className="mono text-text-0">Solana devnet</span>
        </Row>
        <Row label="Your wallet">
          <span className="mono text-text-0">
            {wallet.address ? fmtAddr(wallet.address, 6, 6) : "not connected"}
          </span>
        </Row>
        <Row label="Withdraw anytime">
          <span className="mono text-text-0">
            yes. any unsold credits
          </span>
        </Row>
        <Row label="Price oracle">
          <span className="mono text-text-0">Pyth · PYTHIA-4o</span>
        </Row>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={sign}
        disabled={signing}
        className="w-full"
      >
        {signing ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Waiting for your signature…
          </>
        ) : (
          <>
            <Check size={14} /> Sign &amp; lock credits
          </>
        )}
      </Button>

      {signing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-[11.5px] text-text-2"
        >
          Open your wallet and approve the escrow transaction…
        </motion.div>
      )}
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
