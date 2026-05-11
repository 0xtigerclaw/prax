import { mulberry32 } from "../format";
import { PROVIDERS, type Provider } from "./providers";

export type Holding = {
  provider: Provider;
  credits: number; // normalized credits
  avgCost: number;
  sparkline: number[];
};

export type OpenOrder = {
  id: string;
  provider: Provider;
  side: "buy" | "sell";
  price: number;
  size: number;
  filled: number;
  placedAt: number;
};

export function makeHoldings(seed: number): Holding[] {
  const rng = mulberry32(seed);
  return PROVIDERS.slice(0, 4).map((p) => {
    const credits = Math.round(100 + rng() * 4000);
    const avgCost = p.face * (1 - 0.1 - rng() * 0.2);
    const sparkline = Array.from({ length: 24 }, (_, i) => {
      return avgCost * (1 + (rng() - 0.45) * 0.06 * (i + 1) * 0.05);
    });
    return { provider: p, credits, avgCost, sparkline };
  });
}

export function makeOpenOrders(seed: number): OpenOrder[] {
  const rng = mulberry32(seed + 99);
  const out: OpenOrder[] = [];
  for (let i = 0; i < 3; i++) {
    const provider = PROVIDERS[Math.floor(rng() * PROVIDERS.length)];
    out.push({
      id: `O-${i}-${Math.floor(rng() * 9999)}`,
      provider,
      side: rng() > 0.5 ? "buy" : "sell",
      price: provider.face * (0.85 + rng() * 0.2),
      size: Math.round(50 + rng() * 800),
      filled: rng() * 0.4,
      placedAt: Date.now() - rng() * 3600_000,
    });
  }
  return out;
}
