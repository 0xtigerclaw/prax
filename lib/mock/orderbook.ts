import { clamp, gaussian, mulberry32 } from "../format";

export type OrderRow = {
  price: number;
  size: number; // normalized credits
  total: number; // cumulative
};

export type OrderBook = {
  bids: OrderRow[];
  asks: OrderRow[];
  spread: number;
  mid: number;
  lastPrice: number;
  lastSide: "bid" | "ask";
};

/**
 * Generate a stable-seeded orderbook around a mid price.
 * Each tick sizes 0.01% of mid; levels are unevenly spaced to feel real.
 */
export function makeOrderBook(
  mid: number,
  seed: number,
  levels = 15,
): OrderBook {
  const rng = mulberry32(seed);
  const tick = mid * 0.0008;
  const bids: OrderRow[] = [];
  const asks: OrderRow[] = [];

  let bidCum = 0;
  let askCum = 0;
  let bp = mid - tick;
  let ap = mid + tick;

  for (let i = 0; i < levels; i++) {
    const gap = 1 + Math.floor(rng() * 3);
    bp -= tick * gap * (i === 0 ? 0 : 1);
    ap += tick * gap * (i === 0 ? 0 : 1);

    const bSize = clamp(
      Math.abs(gaussian(rng, 40, 25)) + 8 + i * 1.5,
      2,
      400,
    );
    const aSize = clamp(
      Math.abs(gaussian(rng, 40, 25)) + 8 + i * 1.5,
      2,
      400,
    );

    bidCum += bSize;
    askCum += aSize;

    bids.push({ price: bp, size: bSize, total: bidCum });
    asks.push({ price: ap, size: aSize, total: askCum });
  }

  return {
    bids,
    asks,
    spread: asks[0].price - bids[0].price,
    mid,
    lastPrice: mid,
    lastSide: rng() > 0.5 ? "bid" : "ask",
  };
}

/**
 * Mutate an existing book: shift prices slightly, resize a few rows.
 */
export function jitterOrderBook(
  book: OrderBook,
  newMid: number,
  rng: () => number = Math.random,
): OrderBook {
  const tick = newMid * 0.0008;
  const shift = newMid - book.mid;
  const mutate = (rows: OrderRow[]): OrderRow[] => {
    let cum = 0;
    return rows.map((r) => {
      const sizeJitter = 1 + (rng() - 0.5) * 0.35;
      const size = clamp(r.size * sizeJitter, 2, 500);
      const price = r.price + shift + (rng() - 0.5) * tick * 0.3;
      cum += size;
      return { price, size, total: cum };
    });
  };

  const bids = mutate(book.bids);
  const asks = mutate(book.asks);

  return {
    bids,
    asks,
    mid: newMid,
    spread: asks[0].price - bids[0].price,
    lastPrice: rng() > 0.5 ? bids[0].price : asks[0].price,
    lastSide: rng() > 0.5 ? "bid" : "ask",
  };
}
