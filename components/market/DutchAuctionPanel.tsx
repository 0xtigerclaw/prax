"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Gavel, Clock } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { decayAuctions, makeListings } from "@/lib/mock/listings";
import { useLiveFeed } from "@/lib/hooks/useLiveFeed";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { useNow } from "@/lib/hooks/useLiveFeed";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fmtDuration, fmtInt, fmtPct, fmtPrice } from "@/lib/format";
import { usePraxWallet } from "@/lib/solana/usePraxWallet";
import { getProgram, placeBidIx, currentPrice, type AuctionAccount } from "@/lib/solana/client";
import { PROVIDERS } from "@/lib/mock/providers";
import { CREDIT_MINTS } from "@/lib/solana/config";

// ─── live devnet auction poller ──────────────────────────────────────

type LiveAuction = {
  pubkey: PublicKey;
  account: AuctionAccount;
  providerLogoSrc: string;
  providerShort: string;
};

function useLiveAuctions(refresh = 12_000) {
  const [auctions, setAuctions] = useState<LiveAuction[]>([]);

  const fetch = useCallback(async () => {
    try {
      const program = getProgram();
      const raw = await program.account.auction.all();
      const now = Math.floor(Date.now() / 1000);
      const active = raw.filter(
        (a) =>
          !a.account.filled &&
          now < a.account.startTs.toNumber() + a.account.durationSecs.toNumber(),
      );
      // Resolve provider logo from credit mint address
      const creditMintEntries = Object.entries(CREDIT_MINTS);
      const live: LiveAuction[] = active.map((a) => {
        const mintStr = a.account.creditMint.toBase58();
        const entry = creditMintEntries.find(([, pk]) => pk.toBase58() === mintStr);
        const providerId = entry?.[0];
        const provider = PROVIDERS.find((p) => p.id === providerId);
        return {
          pubkey: a.publicKey,
          account: a.account,
          providerLogoSrc: provider?.logo ?? "/logos/prax.svg",
          providerShort: provider?.short ?? "Unknown",
        };
      });
      setAuctions(live);
    } catch {
      // Silently ignore network errors — mock data will fill the UI.
    }
  }, []);

  useEffect(() => {
    const kick = setTimeout(fetch, 0);
    const id = setInterval(fetch, refresh);
    return () => {
      clearTimeout(kick);
      clearInterval(id);
    };
  }, [fetch, refresh]);

  return auctions;
}

// ─── component ───────────────────────────────────────────────────────

export function DutchAuctionPanel() {
  const mockInitial = useMemo(
    () =>
      makeListings(33)
        .filter((l) => l.kind === "auction")
        .slice(0, 6),
    [],
  );
  const mockAuctions = useLiveFeed(
    mockInitial,
    decayAuctions,
    800,
  );
  const liveAuctions = useLiveAuctions();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    scrollerRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const totalCount = liveAuctions.length + mockAuctions.length;

  return (
    <Panel className="h-full">
      <PanelHeader
        title={
          <span className="flex items-center gap-1.5">
            <Gavel size={11} /> Dutch Auctions
          </span>
        }
        sub={`${totalCount} active${liveAuctions.length > 0 ? ` · ${liveAuctions.length} live` : ""}`}
        right={
          <>
            <button
              onClick={() => scroll(-1)}
              className="h-6 w-6 rounded-[4px] hover:bg-bg-3 text-text-1 hover:text-text-0 flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="h-6 w-6 rounded-[4px] hover:bg-bg-3 text-text-1 hover:text-text-0 flex items-center justify-center transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </>
        }
      />
      <PanelBody>
        <div
          ref={scrollerRef}
          className="flex gap-2 p-2 overflow-x-auto no-scrollbar"
        >
          {/* Real devnet auctions first */}
          {liveAuctions.map((a) => (
            <LiveAuctionCard key={a.pubkey.toBase58()} live={a} />
          ))}
          {/* Mock auctions fill the rest */}
          {mockAuctions.map((a) => (
            <MockAuctionCard key={a.id} listing={a} />
          ))}
        </div>
      </PanelBody>
    </Panel>
  );
}

// ─── live auction card ────────────────────────────────────────────────

function LiveAuctionCard({ live }: { live: LiveAuction }) {
  const { connected, publicKey, login, sendInstructions } = usePraxWallet();
  const [buying, setBuying] = useState(false);
  const nowMs = useNow(1000);
  const now = Math.floor((nowMs || live.account.startTs.toNumber() * 1000) / 1000);
  const a = live.account;
  const expiryMs = (a.startTs.toNumber() + a.durationSecs.toNumber()) * 1000;
  const remaining = useCountdown(expiryMs);

  const priceAtoms = currentPrice(a, now);
  // Price is USDC atoms per whole normalized credit.
  const displayPrice = priceAtoms / 1e6;
  const startDisplay = a.startPrice.toNumber() / 1e6;
  const progress = 1 - (priceAtoms - a.floorPrice.toNumber()) /
    Math.max(1, a.startPrice.toNumber() - a.floorPrice.toNumber());

  const handleBuy = async () => {
    if (!connected || !publicKey) {
      toast("Connect your wallet to buy");
      login();
      return;
    }
    setBuying(true);
    try {
      const program = getProgram(publicKey);
      const ix = await placeBidIx(program, publicKey, {
        auction: live.pubkey,
        creditMint: a.creditMint,
        seller: a.seller,
      });
      const sig = await sendInstructions([ix]);
      toast.success(
        `Filled! Tx: ${sig.slice(0, 8)}… · View on Explorer`,
        {
          action: {
            label: "Explorer",
            onClick: () =>
              window.open(
                `https://explorer.solana.com/tx/${sig}?cluster=devnet`,
                "_blank",
              ),
          },
        },
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Buy failed: ${msg.slice(0, 80)}`);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="shrink-0 w-[240px] panel-2 rounded-[8px] p-3 hover:border-bid/40 border-bid/20 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Image
            src={live.providerLogoSrc}
            alt=""
            width={16}
            height={16}
            className="opacity-90"
          />
          <span className="text-[12px] font-semibold tracking-tight">
            {live.providerShort}
          </span>
          <Badge variant="bid" className="text-[9px]">LIVE</Badge>
        </div>
        <Badge variant="ask">
          <Clock size={8} /> {fmtDuration(remaining).slice(0, 8)}
        </Badge>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="mono text-[18px] font-medium tabular-nums">
          ${fmtPrice(displayPrice)}
        </span>
        <span className="mono text-[10px] text-text-2 line-through">
          ${fmtPrice(startDisplay)}
        </span>
      </div>
      <div className="delta-up mono text-[10.5px] mb-2">
        {fmtPct(((startDisplay - displayPrice) / startDisplay) * 100, 1)} off start
      </div>
      <div className="h-1 bg-bg-3 rounded-full overflow-hidden mb-2.5">
        <div
          className="h-full bg-gradient-to-r from-bid to-ask"
          style={{ width: `${Math.min(1, progress) * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between mb-2.5 text-[10.5px] mono">
        <span className="text-text-2">Credits</span>
        <span className="text-text-0">{fmtInt(a.creditAmount.toNumber() / 1e6)}</span>
      </div>
      <Button
        variant="primary"
        size="sm"
        className="w-full"
        onClick={handleBuy}
        disabled={buying}
      >
        {buying ? "Confirming…" : "Buy now"}
      </Button>
    </div>
  );
}

// ─── mock auction card (unchanged) ───────────────────────────────────

function MockAuctionCard({ listing: a }: { listing: ReturnType<typeof makeListings>[number] }) {
  const remaining = useCountdown(a.expiry);
  const progress =
    a.startPrice && a.floorPrice
      ? 1 - (a.price - a.floorPrice) / (a.startPrice - a.floorPrice)
      : 0;
  return (
    <div className="shrink-0 w-[240px] panel-2 rounded-[8px] p-3 hover:border-ask/40 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Image
            src={a.provider.logo}
            alt=""
            width={16}
            height={16}
            className="opacity-90"
          />
          <span className="text-[12px] font-semibold tracking-tight">
            {a.provider.short}
          </span>
        </div>
        <Badge variant="ask">
          <Clock size={8} /> {fmtDuration(remaining).slice(0, 8)}
        </Badge>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="mono text-[18px] font-medium tabular-nums">
          ${fmtPrice(a.price)}
        </span>
        <span className="mono text-[10px] text-text-2 line-through">
          ${fmtPrice(a.provider.face)}
        </span>
      </div>
      <div className="delta-up mono text-[10.5px] mb-2">
        {fmtPct(-a.discount * 100, 1)} vs face
      </div>
      <div className="h-1 bg-bg-3 rounded-full overflow-hidden mb-2.5">
        <div
          className="h-full bg-gradient-to-r from-bid to-ask"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between mb-2.5 text-[10.5px] mono">
        <span className="text-text-2">Credits</span>
        <span className="text-text-0">{fmtInt(a.credits)}K</span>
      </div>
      <Button variant="primary" size="sm" className="w-full">
        Buy now
      </Button>
    </div>
  );
}
