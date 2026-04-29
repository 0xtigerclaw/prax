"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { makeListings, decayAuctions } from "@/lib/mock/listings";
import { useLiveFeed } from "@/lib/hooks/useLiveFeed";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { fmtPrice, fmtInt, fmtPct, fmtDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Gavel, Clock } from "lucide-react";

export function FeaturedAuctions() {
  const initial = useMemo(
    () => makeListings(11).filter((l) => l.kind === "auction").slice(0, 4),
    [],
  );
  const auctions = useLiveFeed(initial, (prev) => decayAuctions(prev, 800), 800);

  return (
    <section className="bg-bg-0">
      <div className="max-w-[1440px] mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.15em] text-bid mb-2 flex items-center gap-2">
              <Gavel size={11} />
              Live auctions
            </div>
            <h2 className="text-[36px] font-semibold tracking-[-0.025em]">
              These credits expire in hours.
              <br />
              <span className="text-text-2 font-normal">The price drops until a developer buys.</span>
            </h2>
          </div>
          <Link href="/market">
            <Button variant="outline" size="md">
              Browse all expiring credits →
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {auctions.map((a) => (
            <AuctionCard key={a.id} listing={a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AuctionCard({ listing: a }: { listing: ReturnType<typeof makeListings>[number] }) {
  const remaining = useCountdown(a.expiry);
  const progress =
    a.startPrice && a.floorPrice
      ? 1 - (a.price - a.floorPrice) / (a.startPrice - a.floorPrice)
      : 0;

  return (
    <div className="panel p-4 rounded-[10px] group hover:border-bid/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-[8px] bg-bg-2 border border-line flex items-center justify-center">
            <Image
              src={a.provider.logo}
              alt=""
              width={18}
              height={18}
              className="opacity-90"
            />
          </div>
          <div>
            <div className="text-[12.5px] font-semibold tracking-tight leading-tight">
              {a.provider.short}
            </div>
            <div className="mono text-[10px] text-text-2 leading-tight mt-0.5">
              {a.provider.name}
            </div>
          </div>
        </div>
        <Badge variant="ask">
          <Gavel size={9} /> Dutch
        </Badge>
      </div>

      <div className="mb-3">
        <div className="mono text-[10px] text-text-2 uppercase tracking-wider mb-1">
          Current price · per 1K
        </div>
        <div className="flex items-baseline gap-2">
          <span className="mono text-[26px] tracking-tight tabular-nums">
            ${fmtPrice(a.price)}
          </span>
          <span className="mono text-[11px] text-text-2 line-through">
            ${fmtPrice(a.provider.face)}
          </span>
        </div>
        <div className="delta-up mono text-[11px] mt-0.5">
          {fmtPct(-a.discount * 100, 1)} vs face
        </div>
      </div>

      {/* decay progress */}
      <div className="h-1 bg-bg-3 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-bid to-ask"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
        <div>
          <div className="text-text-2 mono text-[10px] uppercase tracking-wider">
            Credits
          </div>
          <div className="mono text-text-0 mt-0.5">
            {fmtInt(a.credits)}K
          </div>
        </div>
        <div>
          <div className="text-text-2 mono text-[10px] uppercase tracking-wider">
            Expires
          </div>
          <div className="mono text-text-0 mt-0.5 flex items-center gap-1">
            <Clock size={10} className="text-ask" />
            {fmtDuration(remaining)}
          </div>
        </div>
      </div>

      <Link href="/market">
        <Button variant="primary" size="sm" className="w-full">
          Grab it before it drops further
        </Button>
      </Link>
    </div>
  );
}
