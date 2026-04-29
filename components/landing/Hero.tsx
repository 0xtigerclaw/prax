"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, ShieldCheck, Gavel } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroOrderbook } from "./HeroOrderbook";

export function Hero() {
  return (
    <section className="relative hero-glow overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 mono text-[10.5px] tracking-[0.15em] text-bid uppercase mb-6 px-2.5 h-6 rounded-full bg-bid/10 border border-bid/20">
            <span className="h-1.5 w-1.5 rounded-full bg-bid animate-pulse" />
            The marketplace for expiring AI credits
          </div>
          <h1 className="text-[clamp(44px,6vw,76px)] font-semibold leading-[0.96] tracking-[-0.035em]">
            Your unused{" "}
            <span className="bg-gradient-to-r from-bid via-[#3f8f5d] to-[#1d5e3a] bg-clip-text text-transparent">
              AI credits
            </span>
            <br />
            <span className="italic font-normal text-text-1">are worth real money.</span>
          </h1>
          <p className="mt-6 text-[16px] leading-relaxed text-text-1 max-w-[580px]">
            Enterprises prepay for Claude, GPT-4o, Gemini, and routinely
            burn less than half before the commit expires. Solo developers
            and startups need that capacity right now, at half the price.
            Prax is the exchange that connects them. Solana settles
            every trade in 400ms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/exchange">
              <Button variant="primary" size="xl">
                Buy credits at a discount
                <ArrowRight size={15} />
              </Button>
            </Link>
            <Link href="/list">
              <Button variant="outline" size="xl">
                List your unused credits
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-[580px]">
            <Feature
              icon={<Zap size={14} />}
              title="Enterprises"
              sub="Recover value before expiry"
            />
            <Feature
              icon={<ShieldCheck size={14} />}
              title="Developers"
              sub="30–60% below list price"
            />
            <Feature
              icon={<Gavel size={14} />}
              title="On-chain"
              sub="Solana escrow, 400ms settle"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, rotate: 6 }}
          animate={{ opacity: 1, y: 0, rotate: 6 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
          style={{ perspective: 1200 }}
        >
          <HeroOrderbook />
        </motion.div>
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-bid">
        {icon}
        <span className="text-[12px] font-semibold tracking-tight">
          {title}
        </span>
      </div>
      <div className="text-[11.5px] text-text-2">{sub}</div>
    </div>
  );
}
