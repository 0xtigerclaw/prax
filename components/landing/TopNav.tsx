"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { WalletConnect } from "@/components/shell/WalletConnect";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-bg-0/70 hairline-b">
      <div className="max-w-[1440px] mx-auto h-14 px-6 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logos/prax.svg"
            alt=""
            width={22}
            height={22}
          />
          <span className="text-[15px] font-semibold tracking-tight">
            Prax
          </span>
          <Badge variant="sol" className="ml-1">
            Devnet
          </Badge>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-[13px] text-text-1">
          <Link href="/exchange" className="hover:text-text-0 transition-colors">
            Buy
          </Link>
          <Link href="/market" className="hover:text-text-0 transition-colors">
            Market
          </Link>
          <Link href="/list" className="hover:text-text-0 transition-colors">
            Sell
          </Link>
        </nav>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <WalletConnect />
          <Link href="/exchange">
            <Button variant="primary" size="md">
              Buy credits
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
