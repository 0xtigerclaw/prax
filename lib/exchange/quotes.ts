import { PROVIDERS } from "@/lib/mock/providers";

/** Mock SOL price in USD. In production this comes from an oracle. */
export const SOL_PRICE_USD = 142.5;

export const PAY_TOKENS = [
  { id: "usdc" as const, name: "USDC", kind: "stablecoin" as const },
  { id: "sol" as const, name: "SOL", kind: "native" as const },
];

export type PayToken = "usdc" | "sol";

/** Credits per $1 USDC. */
export const RATES: Record<string, number> = {
  claude: 38.2,
  gpt4o: 32.0,
  gemini: 41.5,
  llama: 142.0,
  mistral: 118.0,
  cohere: 95.0,
  "gpu-llama70b": 155.0,
};

export function getRate(providerId: string, payToken: PayToken): number {
  const base = RATES[providerId] || 35;
  return payToken === "sol" ? base * SOL_PRICE_USD : base;
}

export function getCreditQuote({
  payToken,
  payAmount,
  providerId,
}: {
  payToken: PayToken;
  payAmount: number;
  providerId: string;
}): number {
  if (!payAmount || payAmount <= 0) return 0;
  return payAmount * getRate(providerId, payToken);
}

export function getSavingsVsList(providerId: string): number {
  const provider = PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return 43;
  return provider.kind === "closed" ? 43 : 52;
}

export function getInventorySource(providerId: string): string {
  const provider = PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return "Expiring enterprise credits";
  return provider.kind === "open"
    ? "Independent GPU operators"
    : "Expiring enterprise credits";
}
