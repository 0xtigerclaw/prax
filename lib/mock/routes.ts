import { mulberry32, randomPubkey } from "../format";
import { PROVIDERS, type Provider } from "./providers";

export type RouteOption = {
  id: string;
  kind: "direct" | "secondary" | "auction" | "alt-model";
  label: string;
  provider: Provider;
  effective: number; // $ per normalized credit
  latencyMs: number;
  reputation: number; // 0..1
  expiresIn?: number; // ms
  qualityDelta?: number; // pct vs target model
  seller?: string;
  savingsPct: number;
};

export function makeRoutes(
  targetProviderId: string,
  seed: number,
): RouteOption[] {
  const rng = mulberry32(seed);
  const target =
    PROVIDERS.find((p) => p.id === targetProviderId) ?? PROVIDERS[0];
  const base = target.face;

  const routes: RouteOption[] = [];
  routes.push({
    id: "r-direct",
    kind: "direct",
    label: `Direct (${target.name} API)`,
    provider: target,
    effective: base,
    latencyMs: 380 + rng() * 120,
    reputation: 1,
    savingsPct: 0,
  });
  routes.push({
    id: "r-sec",
    kind: "secondary",
    label: `Prax secondary`,
    provider: target,
    effective: base * (0.76 + rng() * 0.04),
    latencyMs: 520 + rng() * 140,
    reputation: 0.94,
    seller: randomPubkey(rng),
    savingsPct: 0,
  });
  routes.push({
    id: "r-auc",
    kind: "auction",
    label: `Prax auction`,
    provider: target,
    effective: base * (0.62 + rng() * 0.04),
    latencyMs: 610 + rng() * 180,
    reputation: 0.86,
    expiresIn: 3_600_000 + rng() * 10_800_000,
    seller: randomPubkey(rng),
    savingsPct: 0,
  });

  // compute savings vs direct
  const direct = routes[0].effective;
  for (const r of routes) {
    r.savingsPct = ((direct - r.effective) / direct) * 100;
  }
  return routes.sort((a, b) => a.effective - b.effective);
}
