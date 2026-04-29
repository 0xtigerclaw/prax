"use client";

import * as React from "react";
import { Copy, LogOut, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/Button";
import { fmtAddr } from "@/lib/format";
import { cn } from "@/lib/utils";

export function WalletConnect({ compact = false }: { compact?: boolean }) {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const address = wallet.publicKey?.toBase58() ?? null;
  const connected = wallet.connected;

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (connected && address) {
    return (
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={cn(
            "h-9 pl-2 pr-3 rounded-[6px] bg-bg-2 border border-line hover:border-line-2 flex items-center gap-2 transition-colors",
          )}
        >
          <span className="h-6 w-6 rounded-full bg-gradient-to-br from-sol to-bid" />
          <div className="flex flex-col items-start leading-none">
            <span className="mono text-[12px] text-text-0">
              {fmtAddr(address)}
            </span>
            {!compact && (
              <span className="mono text-[10px] text-text-2 mt-0.5">
                devnet
              </span>
            )}
          </div>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-64 panel-2 rounded-[8px] shadow-2xl z-40 overflow-hidden">
            <div className="px-3 py-2.5 hairline-b">
              <div className="text-[11px] uppercase tracking-wide text-text-2 mb-1">
                Solana Devnet
              </div>
              <div className="mono text-[12px] text-text-0 break-all">
                {address}
              </div>
            </div>
            <div className="p-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  toast.success("Address copied");
                  setMenuOpen(false);
                }}
                className="w-full h-8 px-2 rounded-[4px] text-[12px] text-left flex items-center gap-2 hover:bg-bg-3 text-text-1 hover:text-text-0 transition-colors"
              >
                <Copy size={12} />
                Copy address
              </button>
              <button
                onClick={() => {
                  wallet.disconnect();
                  toast("Disconnected");
                  setMenuOpen(false);
                }}
                className="w-full h-8 px-2 rounded-[4px] text-[12px] text-left flex items-center gap-2 hover:bg-warn/10 text-text-1 hover:text-warn transition-colors"
              >
                <LogOut size={12} />
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="md"
      onClick={() => setVisible(true)}
    >
      <WalletIcon size={14} />
      Connect Wallet
    </Button>
  );
}
