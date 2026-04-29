"use client";

import Image from "next/image";
import { ArrowRight, TrendingDown, BookOpen, Shuffle, Lock, CheckCircle } from "lucide-react";

function Connector() {
  return (
    <div className="hidden md:flex flex-col items-center justify-center gap-1.5 shrink-0 px-1">
      <div className="h-px w-8 bg-gradient-to-r from-line to-bid/50" />
      <ArrowRight size={12} className="text-bid -ml-1" />
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="hairline-t hairline-b bg-bg-1/40">
      <div className="max-w-[1440px] mx-auto px-6 py-20">

        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.15em] text-bid mb-3">
              How it works
            </div>
            <h2 className="text-[44px] font-semibold tracking-[-0.03em] leading-none">
              List it. Clear it.
              <br />
              Settle in 400ms.
            </h2>
          </div>
          <p className="hidden md:block text-[13px] text-text-2 max-w-[300px] leading-relaxed">
            Three steps. Enterprise lists expiring credits, Prax finds a
            buyer, Solana settles it. No middlemen. No waiting.
          </p>
        </div>

        {/* Seller → Prax → Buyer */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-0 items-stretch">

          {/* Seller */}
          <div className="flex-1 panel rounded-[12px] p-5">
            <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-text-2 mb-4">01 · Seller lists</div>
            <div className="space-y-2 mb-5">
              {[
                { logo: "/logos/openai.svg",    label: "GPT-4o credits",      amount: "500K",  tag: "unused commit" },
                { logo: "/logos/anthropic.svg", label: "Claude Opus credits", amount: "180K",  tag: "expires in 2d" },
                { logo: "/logos/together.svg",  label: "Llama-3.1 tokens",    amount: "2.4M",  tag: "idle H100" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2 p-2 rounded-[6px] bg-bg-2 border border-line">
                  <Image src={row.logo} alt="" width={13} height={13} />
                  <span className="text-[11px] text-text-0 font-medium flex-1 truncate">{row.label}</span>
                  <span className="mono text-[10px] text-text-2 tabular-nums">{row.amount}</span>
                  <span className="mono text-[8.5px] text-ask bg-ask/10 border border-ask/20 px-1.5 py-0.5 rounded-full shrink-0">{row.tag}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-2">
              <Lock size={10} className="text-bid" />
              Locked into on-chain escrow
            </div>
          </div>

          <Connector />

          {/* Prax */}
          <div className="flex-1 panel rounded-[12px] p-5 border-bid/25 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-bid/4 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-bid mb-4">02 · Prax clears it</div>
              <div className="space-y-2 mb-5">
                {[
                  { icon: <BookOpen size={10} />, label: "Fixed price",    desc: "Instant fill at your ask", color: "text-bid", bg: "bg-bid/10 border-bid/20" },
                  { icon: <TrendingDown size={10} />, label: "Dutch auction", desc: "Price decays to floor",     color: "text-ask", bg: "bg-ask/10 border-ask/20" },
                  { icon: <Shuffle size={10} />,  label: "Smart routing",  desc: "Auto-routes to cheapest",  color: "text-sol", bg: "bg-sol/10 border-sol/20" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-2 p-2 rounded-[6px] bg-bg-2 border border-line">
                    <span className={`h-5 w-5 rounded-[4px] border flex items-center justify-center shrink-0 ${r.bg} ${r.color}`}>{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[11px] font-medium ${r.color}`}>{r.label}</div>
                      <div className="text-[10px] text-text-2">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 hairline-t">
                <span className="mono text-[9.5px] text-text-2 uppercase tracking-wider">Settlement</span>
                <span className="mono text-[10px] text-text-0 flex items-center gap-1">
                  <span className="text-sol font-bold">◎</span> Solana · 400ms
                </span>
              </div>
            </div>
          </div>

          <Connector />

          {/* Buyer */}
          <div className="flex-1 panel rounded-[12px] p-5">
            <div className="mono text-[9.5px] uppercase tracking-[0.14em] text-text-2 mb-4">03 · Developer saves</div>
            <div className="space-y-2 mb-5">
              {[
                { label: "GPT-4o",        saving: "38% off list", usdc: "$187" },
                { label: "Claude Opus",   saving: "51% off list", usdc: "$84"  },
                { label: "Llama-3.1-70B", saving: "22% off list", usdc: "$11"  },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2 p-2 rounded-[6px] bg-bg-2 border border-line">
                  <span className="text-[11px] text-text-0 font-medium flex-1">{row.label}</span>
                  <span className="mono text-[10px] delta-up">{row.saving}</span>
                  <span className="mono text-[10px] text-text-0 tabular-nums">{row.usdc}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-text-2">
              <CheckCircle size={10} className="text-bid" />
              Credits in wallet. USDC to seller.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
