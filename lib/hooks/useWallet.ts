"use client";

import { useCallback, useEffect, useState } from "react";
import { randomPubkey } from "../format";

export type WalletProvider = "phantom" | "solflare" | "backpack";

export type WalletState = {
  connected: boolean;
  provider: WalletProvider | null;
  pubkey: string | null;
  balanceSOL: number;
  balanceUSDC: number;
};

const STORAGE_KEY = "prax.wallet";

const DEFAULT: WalletState = {
  connected: false,
  provider: null,
  pubkey: null,
  balanceSOL: 0,
  balanceUSDC: 0,
};

function loadFromStorage(): WalletState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

let listeners: Array<(s: WalletState) => void> = [];
let globalState: WalletState = DEFAULT;

function setGlobal(next: WalletState) {
  globalState = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l(next));
}

export function useWallet() {
  const [state, setState] = useState<WalletState>(DEFAULT);

  useEffect(() => {
    // Sync from storage after mount (avoid SSR mismatch)
    globalState = loadFromStorage();
    setState(globalState);
    const fn = (s: WalletState) => setState(s);
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }, []);

  const connect = useCallback((provider: WalletProvider) => {
    const pubkey = randomPubkey();
    const next: WalletState = {
      connected: true,
      provider,
      pubkey,
      balanceSOL: 12.4829,
      balanceUSDC: 8421.53,
    };
    setGlobal(next);
    return next;
  }, []);

  const disconnect = useCallback(() => {
    setGlobal(DEFAULT);
  }, []);

  return { ...state, connect, disconnect };
}

export const WALLET_PROVIDERS: {
  id: WalletProvider;
  name: string;
  color: string;
  icon: string; // single-char fallback glyph
}[] = [
  { id: "phantom", name: "Phantom", color: "#AB9FF2", icon: "P" },
  { id: "solflare", name: "Solflare", color: "#FFA500", icon: "S" },
  { id: "backpack", name: "Backpack", color: "#E33E3F", icon: "B" },
];
