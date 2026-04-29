import { gaussian, mulberry32 } from "../format";
import { PROVIDERS, type Provider } from "./providers";

export type Ticker = {
  provider: Provider;
  price: number;
  change24h: number; // pct
};

export function makeTickers(seed: number): Ticker[] {
  const rng = mulberry32(seed);
  return PROVIDERS.map((p) => ({
    provider: p,
    price: p.face * (1 - 0.1 * rng()),
    change24h: gaussian(rng, 0, 1.8),
  }));
}

export function driftTickers(
  tickers: Ticker[],
  rng: () => number = Math.random,
): Ticker[] {
  return tickers.map((t) => {
    const drift = gaussian(rng, 0, t.provider.volatility * 0.35);
    const nextPrice = Math.max(t.provider.face * 0.3, t.price * (1 + drift));
    const nextChange = t.change24h + drift * 100 * 0.1;
    return { ...t, price: nextPrice, change24h: nextChange };
  });
}
