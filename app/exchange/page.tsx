"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Wallet, AlertCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/Button";
import { usePraxWallet } from "@/lib/solana/usePraxWallet";
import { PROVIDERS } from "@/lib/mock/providers";
import {
  getCreditQuote,
  getSavingsVsList,
  getInventorySource,
  getRate,
  SOL_PRICE_USD,
  type PayToken,
} from "@/lib/exchange/quotes";

export default function ExchangePage() {
  const { connected, publicKey, login } = usePraxWallet();
  const [payAmount, setPayAmount] = useState("100");
  const [previewing, setPreviewing] = useState(false);
  const [selectedId, setSelectedId] = useState("claude");
  const [payToken, setPayToken] = useState<PayToken>("usdc");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const selected = useMemo(
    () => PROVIDERS.find((p) => p.id === selectedId) || PROVIDERS[0],
    [selectedId],
  );

  const rate = useMemo(
    () => getRate(selected.id, payToken),
    [selected.id, payToken],
  );

  const receiveAmount = useMemo(() => {
    const n = parseFloat(payAmount);
    if (Number.isNaN(n) || n <= 0) return "";
    return getCreditQuote({
      payToken,
      payAmount: n,
      providerId: selected.id,
    }).toFixed(2);
  }, [payAmount, payToken, selected.id]);

  const payAmountPreview = useMemo(
    () => parseFloat(payAmount),
    [payAmount],
  );

  const handlePayChange = (val: string) => {
    setPayAmount(val);
  };

  const handlePreview = async () => {
    const pay = payAmountPreview;
    const rec = parseFloat(receiveAmount);
    if (!pay || pay <= 0 || !rec || rec <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!connected || !publicKey) {
      toast("Connect your wallet first");
      login();
      return;
    }
    setPreviewing(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Quote ready", {
      description: `${pay.toFixed(payToken === "sol" ? 4 : 2)} ${payToken.toUpperCase()} → ${rec.toFixed(2)} ${selected.short} credits`,
    });
    setPreviewing(false);
  };

  const handleModelChange = (id: string) => {
    setSelectedId(id);
    setModelDropdownOpen(false);
  };

  const savings = useMemo(() => getSavingsVsList(selected.id), [selected.id]);
  const source = useMemo(() => getInventorySource(selected.id), [selected.id]);

  return (
    <AppShell>
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mono text-[11px] uppercase tracking-[0.15em] text-bid mb-3">
            Spot Exchange
          </div>
          <h1 className="text-[36px] font-semibold tracking-[-0.025em] leading-none mb-3">
            Buy {selected.short} credits instantly.
          </h1>
          <p className="text-[14px] text-text-2 max-w-[440px] mx-auto">
            Pay with USDC or SOL. Receive {selected.name} credits directly to
            your wallet. No commit. No expiry risk.
          </p>
        </div>

        {/* Swap Card */}
        <div className="w-full max-w-[440px] panel rounded-[16px] p-1">
          <div className="p-4 space-y-1">
            {/* Pay token segmented control */}
            <div className="flex rounded-[10px] bg-bg-2 border border-line p-1">
              {(["usdc", "sol"] as PayToken[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setPayToken(t)}
                  className={`flex-1 flex items-center justify-center gap-2 h-8 rounded-[8px] text-[13px] font-medium transition-colors ${
                    payToken === t
                      ? "bg-bg-1 text-text-0 shadow-sm"
                      : "text-text-2 hover:text-text-1"
                  }`}
                >
                  <PayTokenIcon tok={t} />
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {/* FROM */}
            <div className="rounded-[12px] bg-bg-2 border border-line p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="mono text-[11px] uppercase tracking-wider text-text-2">
                  You pay
                </span>
                <span className="mono text-[11px] text-text-2">
                  Balance: {connected ? (payToken === "sol" ? "12.45 SOL" : "$1,240.00") : "—"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step={payToken === "sol" ? "0.0001" : "0.01"}
                  placeholder="0.00"
                  value={payAmount}
                  onChange={(e) => handlePayChange(e.target.value)}
                  className="bg-transparent text-[28px] font-medium text-text-0 w-full outline-none placeholder:text-text-2/40"
                />
                <PayTokenDisplay token={payToken} />
              </div>
            </div>

            {/* TO */}
            <div className="rounded-[12px] bg-bg-2 border border-line p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="mono text-[11px] uppercase tracking-wider text-text-2">
                  You receive
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={receiveAmount}
                  readOnly
                  className="bg-transparent text-[28px] font-medium text-text-0 w-full outline-none placeholder:text-text-2/40"
                />
                <ModelSelector
                  selected={selected}
                  open={modelDropdownOpen}
                  setOpen={setModelDropdownOpen}
                  onSelect={handleModelChange}
                />
              </div>
              <div className="text-[11px] text-text-2">
                  ≈ {!Number.isNaN(payAmountPreview) ? payAmountPreview.toFixed(payToken === "sol" ? 4 : 2) : "0.00"} {payToken.toUpperCase()}
              </div>
            </div>

            {/* Quote summary */}
            <div className="rounded-[10px] bg-bid/5 border border-bid/10 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-2">Estimated savings</span>
                <span className="mono text-bid font-medium">{savings}% below list</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-2">Inventory source</span>
                <span className="mono text-text-0">{source}</span>
              </div>
            </div>

            {/* Rate + Info */}
            <div className="rounded-[10px] bg-bg-2/50 border border-line/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-2">Rate</span>
                <span className="mono text-text-0">
                  1 {payToken.toUpperCase()} = {rate.toFixed(1)} {selected.short} credits
                </span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-2">{payToken.toUpperCase()} price</span>
                <span className="mono text-text-0">
                  {payToken === "sol" ? `$${SOL_PRICE_USD.toFixed(2)}` : "$1.00"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-2">Network fee</span>
                <span className="mono text-text-0">~$0.000025</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-text-2">Slippage tolerance</span>
                <span className="mono text-bid">0.5%</span>
              </div>
            </div>

            {/* CTA */}
            {!connected ? (
              <Button
                variant="primary"
                size="xl"
                className="w-full"
                onClick={login}
              >
                <Wallet size={15} />
                Connect Wallet
              </Button>
            ) : (
              <Button
                variant="primary"
                size="xl"
                className="w-full"
                onClick={handlePreview}
                disabled={
                  previewing || !payAmount || parseFloat(payAmount) <= 0
                }
              >
                {previewing ? "Generating quote…" : "Preview quote"}
              </Button>
            )}

            {/* Preview-only note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-2 pt-1">
              <AlertCircle size={11} />
              Preview only. Backend execution not connected yet.
            </div>
          </div>
        </div>

        {/* Bottom explainer */}
        <div className="mt-10 grid md:grid-cols-3 gap-4 max-w-[640px] w-full">
          <Explain
            title="No commit required"
            body="Buy only the credits you need. No monthly minimums, no expiry dates, no waste."
          />
          <Explain
            title="30–60% below list"
            body="Credits come from enterprises with unused balances. You pay less than buying direct."
          />
          <Explain
            title="Instant delivery"
            body="Credits hit your wallet the moment the swap confirms. Usually under 1 second on Solana."
          />
        </div>
      </div>
    </AppShell>
  );
}

/* ─── Payment token display (read-only icon + label) ─────────────────── */

function PayTokenDisplay({ token }: { token: PayToken }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <PayTokenIcon tok={token} />
      <span className="text-[15px] font-semibold text-text-0">
        {token.toUpperCase()}
      </span>
    </div>
  );
}

function PayTokenIcon({ tok }: { tok: PayToken }) {
  if (tok === "usdc") {
    return (
      <div className="h-7 w-7 rounded-full bg-[#2775ca] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
        $
      </div>
    );
  }
  return (
    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#9945ff] to-[#14f195] flex items-center justify-center text-[12px] font-bold text-white shrink-0">
      ◎
    </div>
  );
}

/* ─── Model / credit token selector ──────────────────────────────────── */

function ModelSelector({
  selected,
  open,
  setOpen,
  onSelect,
}: {
  selected: (typeof PROVIDERS)[number];
  open: boolean;
  setOpen: (v: boolean) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 shrink-0 hover:bg-bg-3 rounded-[8px] px-1.5 py-1 transition-colors"
      >
        <div className="h-7 w-7 rounded-full bg-bg-3 border border-line flex items-center justify-center overflow-hidden shrink-0">
          <Image src={selected.logo} alt={selected.short} width={16} height={16} />
        </div>
        <span className="text-[15px] font-semibold text-text-0">
          {selected.short}
        </span>
        <ChevronDown size={14} className="text-text-2" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 panel-2 rounded-[10px] shadow-2xl z-40 overflow-hidden py-1">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg-3 transition-colors text-left ${
                p.id === selected.id ? "bg-bid/5" : ""
              }`}
            >
              <div className="h-7 w-7 rounded-full bg-bg-3 border border-line flex items-center justify-center overflow-hidden shrink-0">
                <Image src={p.logo} alt={p.short} width={16} height={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-text-0">
                  {p.short}
                </div>
                <div className="text-[10px] text-text-2">{p.name}</div>
              </div>
              {p.id === selected.id && (
                <div className="h-1.5 w-1.5 rounded-full bg-bid shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Explain({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center px-3">
      <div className="text-[12.5px] font-semibold text-text-0 mb-1">{title}</div>
      <div className="text-[11.5px] text-text-2 leading-relaxed">{body}</div>
    </div>
  );
}
