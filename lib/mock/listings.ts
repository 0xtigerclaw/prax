import { clamp, gaussian, mulberry32, randomPubkey } from "../format";
import { PROVIDERS, type Provider } from "./providers";

export type Listing = {
  id: string;
  provider: Provider;
  kind: "fixed" | "auction";
  credits: number; // normalized credits; 1 credit = 1K billable token-equivalent units
  expiry: number; // ms timestamp
  price: number; // current $ per credit
  startPrice?: number;
  floorPrice?: number;
  discount: number; // 0..1
  seller: string; // pubkey
  filled: number; // 0..1
  createdAt: number;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function makeListings(seed: number, count = 24): Listing[] {
  const rng = mulberry32(seed);
  const now = Date.now();
  const out: Listing[] = [];

  for (let i = 0; i < count; i++) {
    const provider = PROVIDERS[Math.floor(rng() * PROVIDERS.length)];
    const kind: "fixed" | "auction" = rng() > 0.45 ? "fixed" : "auction";
    const credits = clamp(
      Math.round(Math.abs(gaussian(rng, 4000, 2500)) + 200),
      100,
      25000,
    );
    const expiry = now + clamp(rng() * 14 * DAY, 2 * HOUR, 14 * DAY);
    const discount = clamp(0.05 + rng() * 0.45, 0.03, 0.55);
    const startPrice = provider.face * (1 - discount * 0.3);
    const floorPrice = provider.face * (1 - discount);
    const price =
      kind === "auction"
        ? startPrice - (startPrice - floorPrice) * rng() * 0.8
        : provider.face * (1 - discount);
    out.push({
      id: `L-${(seed + i).toString(36).toUpperCase()}${i}`,
      provider,
      kind,
      credits,
      expiry,
      price,
      startPrice: kind === "auction" ? startPrice : undefined,
      floorPrice: kind === "auction" ? floorPrice : undefined,
      discount,
      seller: randomPubkey(rng),
      filled: rng() * 0.4,
      createdAt: now - rng() * 6 * HOUR,
    });
  }
  return out.sort((a, b) => b.discount - a.discount);
}

/** Decay Dutch auction prices towards floor */
export function decayAuctions(listings: Listing[]): Listing[] {
  return listings.map((l) => {
    if (l.kind !== "auction" || l.floorPrice == null || l.startPrice == null)
      return l;
    const totalDuration = l.expiry - l.createdAt;
    const elapsed = Date.now() - l.createdAt;
    const t = clamp(elapsed / totalDuration, 0, 1);
    const target = l.startPrice - (l.startPrice - l.floorPrice) * t;
    // Converge softly
    const next = l.price + (target - l.price) * 0.15;
    return { ...l, price: Math.max(l.floorPrice, next) };
  });
}
