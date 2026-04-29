import { gaussian, mulberry32 } from "../format";

export type Candle = {
  t: number; // bucket index (used as X)
  time: string; // HH:MM label
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

/**
 * Generate N candles for a given start price using geometric Brownian motion.
 * Seeded for SSR stability.
 */
export function makeCandles(
  start: number,
  count: number,
  seed: number,
  volatility = 0.02,
): Candle[] {
  const rng = mulberry32(seed);
  const out: Candle[] = [];
  let price = start;
  const now = new Date();
  now.setMinutes(0, 0, 0);

  for (let i = 0; i < count; i++) {
    const drift = -0.0002; // slight negative drift for feel
    const shock = gaussian(rng, 0, volatility);
    const open = price;
    const close = Math.max(0.0001, open * (1 + drift + shock));
    const wick = Math.abs(gaussian(rng, 0, volatility * 0.7));
    const high = Math.max(open, close) * (1 + wick);
    const low = Math.min(open, close) * (1 - wick);
    const volume = Math.abs(gaussian(rng, 1200, 500)) + 200;

    const bucketTime = new Date(
      now.getTime() - (count - 1 - i) * 60 * 60 * 1000,
    );
    const hh = bucketTime.getHours().toString().padStart(2, "0");
    const mm = bucketTime.getMinutes().toString().padStart(2, "0");

    out.push({
      t: i,
      time: `${hh}:${mm}`,
      open,
      high,
      low,
      close,
      volume,
    });

    price = close;
  }
  return out;
}
