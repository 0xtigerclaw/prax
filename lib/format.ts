/**
 * Formatting utilities — all numbers rendered with tabular-nums elsewhere.
 */

export function fmtUsd(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function fmtCompact(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(digits)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(digits)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(digits)}K`;
  return n.toFixed(digits);
}

export function fmtUsdCompact(n: number, digits = 2): string {
  return `$${fmtCompact(n, digits)}`;
}

export function fmtInt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString("en-US");
}

export function fmtPct(n: number, digits = 2, signed = true): string {
  if (!Number.isFinite(n)) return "—";
  const s = `${n.toFixed(digits)}%`;
  if (!signed) return s;
  return n > 0 ? `+${s}` : s;
}

export function fmtPrice(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 100)
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  if (n >= 1)
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
}

export function fmtAddr(addr: string, left = 4, right = 4): string {
  if (!addr || addr.length <= left + right) return addr;
  return `${addr.slice(0, left)}…${addr.slice(-right)}`;
}

export function fmtDuration(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (d > 0) return `${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function fmtRelative(ts: number): string {
  const diff = ts - Date.now();
  const abs = Math.abs(diff);
  const s = Math.round(abs / 1000);
  if (s < 60) return diff >= 0 ? `in ${s}s` : `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return diff >= 0 ? `in ${m}m` : `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return diff >= 0 ? `in ${h}h` : `${h}h ago`;
  const d = Math.round(h / 24);
  return diff >= 0 ? `in ${d}d` : `${d}d ago`;
}

/** Seeded PRNG (mulberry32) — deterministic for SSR stability */
export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gaussian noise via Box-Muller */
export function gaussian(rng: () => number, mean = 0, stddev = 1): number {
  const u = 1 - rng();
  const v = rng();
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return z * stddev + mean;
}

/** Generate a random base58-looking Solana pubkey (44 chars) */
const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
export function randomPubkey(rng: () => number = Math.random): string {
  let s = "";
  for (let i = 0; i < 44; i++) {
    s += BASE58[Math.floor(rng() * BASE58.length)];
  }
  return s;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
