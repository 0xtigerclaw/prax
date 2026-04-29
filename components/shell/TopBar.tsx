"use client";

import { Search } from "lucide-react";
import { WalletConnect } from "./WalletConnect";
import { Badge } from "@/components/ui/Badge";
import { NetStatus } from "./NetStatus";

export function TopBar() {
  return (
    <header className="h-12 hairline-b bg-bg-1 flex items-center gap-3 px-4 shrink-0 relative z-20">
      <div className="flex-1 max-w-[440px] relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-2 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Find a model, seller, or listing…"
          className="w-full h-8 pl-8 pr-16 rounded-[6px] bg-bg-2 border border-line hover:border-line-2 focus:border-bid/60 focus:ring-2 focus:ring-bid/15 text-[12.5px] placeholder:text-text-2 outline-none transition-colors"
        />
        <span className="kbd absolute right-2 top-1/2 -translate-y-1/2">
          ⌘K
        </span>
      </div>
      <div className="flex-1" />
      <NetStatus />
      <div className="h-6 w-px bg-line" />
      <button className="h-8 px-2.5 rounded-[6px] bg-bg-2 border border-line hover:border-line-2 flex items-center gap-1.5 transition-colors">
        <span className="h-4 w-4 rounded-full bg-gradient-to-br from-sol to-bid" />
        <span className="text-[12px] text-text-0">Solana</span>
        <Badge variant="sol">Devnet</Badge>
      </button>
      <WalletConnect />
    </header>
  );
}
