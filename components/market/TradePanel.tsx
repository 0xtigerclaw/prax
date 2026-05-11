"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { Tab, TabList, Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { usePraxWallet } from "@/lib/solana/usePraxWallet";
import { fmtPrice } from "@/lib/format";
import { ExternalLink, Info, Shield } from "lucide-react";

type Mode = "buy" | "sell" | "bid";

export function TradePanel({
  mid,
  prefill,
}: {
  mid: number;
  prefill?: { price: number; side?: "buy" | "sell" } | null;
}) {
  const [mode, setMode] = useState<Mode>("buy");
  const [price, setPrice] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [pct, setPct] = useState(0);
  const wallet = usePraxWallet();
  const { setVisible } = useWalletModal();
  const balanceUSDC = wallet.connected ? 8421.53 : 0;

  // Prefill from orderbook click
  useEffect(() => {
    if (!prefill?.price) return;
    const id = setTimeout(() => {
      setPrice(prefill.price.toFixed(4));
      if (prefill.side) setMode(prefill.side);
    }, 0);
    return () => clearTimeout(id);
  }, [prefill?.price, prefill?.side]);

  const effectivePrice = price === "" ? mid : parseFloat(price);

  const total =
    !isNaN(parseFloat(size)) && !isNaN(effectivePrice)
      ? parseFloat(size) * effectivePrice
      : 0;
  const gasEst = 0.000005;

  const buyColor = mode === "sell" ? "ask" : "bid";

  const submit = () => {
    if (!wallet.connected) {
      toast.error("Connect a wallet to trade", {
        description: "Use the Connect Wallet button in the header.",
      });
      setVisible(true);
      return;
    }
    if (!size || parseFloat(size) <= 0) {
      toast.error("Enter an amount");
      return;
    }
    toast.success(
      `${mode === "buy" ? "Bought" : mode === "sell" ? "Sold" : "Bid placed on"} ${size} credits`,
      {
        description: `Filled at $${fmtPrice(effectivePrice)} · demo only`,
      },
    );
    setSize("");
    setPct(0);
  };

  return (
    <Panel className="h-full">
      <PanelHeader
        title="Trade"
        right={
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabList>
              <Tab value="buy" variant="bid">
                Buy
              </Tab>
              <Tab value="sell" variant="ask">
                Sell
              </Tab>
              <Tab value="bid">Bid</Tab>
            </TabList>
          </Tabs>
        }
      />
      <PanelBody className="p-4 flex flex-col gap-3 overflow-y-auto">
        <Field label="Price · USDC per credit">
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={fmtPrice(mid)}
            inputMode="decimal"
          />
        </Field>

        <Field label="Size · credits">
          <Input
            value={size}
            onChange={(e) => {
              setSize(e.target.value);
              const max = balanceUSDC / effectivePrice;
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && max > 0)
                setPct(Math.min(100, (v / max) * 100));
            }}
            placeholder="0.00"
            inputMode="decimal"
          />
        </Field>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] uppercase tracking-wider text-text-2 mono">
              % of balance
            </span>
            <span className="mono text-[11px] text-text-1 tabular-nums">
              {pct.toFixed(0)}%
            </span>
          </div>
          <Slider
            value={pct}
            onChange={(v) => {
              setPct(v);
              const max = balanceUSDC / Math.max(effectivePrice, 1e-6);
              setSize(((max * v) / 100).toFixed(2));
            }}
            max={100}
          />
          <div className="flex gap-1.5 mt-2">
            {[25, 50, 75, 100].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPct(p);
                  const max =
                    balanceUSDC / Math.max(effectivePrice, 1e-6);
                  setSize(((max * p) / 100).toFixed(2));
                }}
                className="flex-1 h-6 rounded-[4px] bg-bg-2 hover:bg-bg-3 border border-line text-[10.5px] mono text-text-1 hover:text-text-0 transition-colors"
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-line my-1" />

        <div className="space-y-1.5 text-[11.5px]">
          <Row label="Total">${total.toFixed(2)} USDC</Row>
          <Row label="Est. network fee">
            {gasEst.toFixed(6)} SOL <span className="text-text-2">(~$0.001)</span>
          </Row>
          <Row label="Protocol fee">0.10%</Row>
          <Row label="You receive" strong>
            {mode === "sell"
              ? `$${total.toFixed(2)} USDC`
              : `${size || "0"} credits`}
          </Row>
        </div>

        <Button
          variant={buyColor === "bid" ? "primary" : "ask"}
          size="lg"
          onClick={submit}
          className="mt-1"
        >
          {mode === "buy"
            ? "Buy Credits"
            : mode === "sell"
              ? "Sell Credits"
              : "Place Bid"}
        </Button>

        <div className="panel-2 rounded-[6px] p-2.5 text-[11px] text-text-1 flex gap-2 items-start">
          <Shield size={13} className="text-bid shrink-0 mt-0.5" />
          <div>
            Credits represent 1K provider-normalized billable units and settle through Solana escrow{" "}
            <a
              href="#"
              className="mono text-bid hover:underline inline-flex items-center gap-0.5"
            >
              NcrmnM…RsuH <ExternalLink size={10} />
            </a>
            . No provider key ever changes hands.
          </div>
        </div>

        {!wallet.connected && (
          <div className="panel-2 rounded-[6px] p-2.5 text-[11px] text-text-1 flex gap-2 items-start border-ask/30 bg-ask/5">
            <Info size={13} className="text-ask shrink-0 mt-0.5" />
            <div>Connect a Solana wallet to buy, sell, or bid.</div>
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider text-text-2 mono mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}

function Row({
  label,
  children,
  strong,
}: {
  label: string;
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-2">{label}</span>
      <span className={strong ? "mono text-text-0 font-medium" : "mono text-text-0"}>
        {children}
      </span>
    </div>
  );
}
