import { mulberry32 } from "../format";
import { PROVIDERS } from "./providers";

export type Pool = {
  id: string;
  pair: string; // "GPT-4o / USDC"
  provider: (typeof PROVIDERS)[number];
  tvl: number;
  volume24h: number;
  apy: number;
  fee: number; // 0.003 = 0.30%
};

export function makePools(seed: number): Pool[] {
  const rng = mulberry32(seed);
  return PROVIDERS.map((p, i) => {
    const tvl = 250_000 + rng() * 8_000_000;
    const volume24h = tvl * (0.08 + rng() * 0.6);
    const apy = 6 + rng() * 42;
    return {
      id: `P-${p.id}`,
      pair: `${p.short} / USDC`,
      provider: p,
      tvl,
      volume24h,
      apy,
      fee: 0.003,
    };
  });
}
