export type Provider = {
  id: string;
  name: string;
  short: string; // model short name for display
  model: string; // full model id
  logo: string; // /logos/*.svg
  face: number; // face-value $ per 1K tokens
  color: string; // hex for charts
  volatility: number; // 0..1
  /**
   * "open" — open-source inference produced by GPU operators. Fully
   * transferable; no provider-ToS conflict because the seller is the
   * producer.
   * "closed" — hosted API credits (OpenAI, Anthropic, Google, etc.).
   * Resale contested under provider ToS; the permissionless settlement
   * layer is what makes the market possible.
   */
  kind: "open" | "closed";
};

/** Approximate 2026 public rates per 1K tokens (blended in/out). */
export const PROVIDERS: Provider[] = [
  // ── Open-source inference (GPU-producer side, fully transferable) ──
  {
    id: "llama",
    name: "Together",
    short: "LLAMA-3.1-405B",
    model: "llama-3.1-405b",
    logo: "/logos/together.svg",
    face: 0.0055,
    color: "#1a8a96",
    volatility: 0.03,
    kind: "open",
  },
  {
    id: "gpu-llama70b",
    name: "Independent GPU",
    short: "LLAMA-3.1-70B",
    model: "llama-3.1-70b-selfhosted",
    logo: "/logos/gpu.svg",
    face: 0.0009,
    color: "#2f7d4f",
    volatility: 0.038,
    kind: "open",
  },
  {
    id: "mistral",
    name: "Mistral",
    short: "MISTRAL-L",
    model: "mistral-large-2",
    logo: "/logos/mistral.svg",
    face: 0.0080,
    color: "#b42318",
    volatility: 0.028,
    kind: "open",
  },

  // ── Hosted API credits (resale contested under provider ToS) ──
  {
    id: "gpt4o",
    name: "OpenAI",
    short: "GPT-4o",
    model: "gpt-4o",
    logo: "/logos/openai.svg",
    face: 0.0312,
    color: "#3a6f4f",
    volatility: 0.018,
    kind: "closed",
  },
  {
    id: "claude",
    name: "Anthropic",
    short: "CLAUDE-OPUS",
    model: "claude-3-opus",
    logo: "/logos/anthropic.svg",
    face: 0.0931,
    color: "#b55d16",
    volatility: 0.022,
    kind: "closed",
  },
  {
    id: "gemini",
    name: "Google",
    short: "GEMINI-1.5-PRO",
    model: "gemini-1.5-pro",
    logo: "/logos/google.svg",
    face: 0.0210,
    color: "#2566a8",
    volatility: 0.016,
    kind: "closed",
  },
  {
    id: "cohere",
    name: "Cohere",
    short: "COMMAND-R+",
    model: "command-r-plus",
    logo: "/logos/cohere.svg",
    face: 0.0150,
    color: "#7a3ecf",
    volatility: 0.024,
    kind: "closed",
  },
];

export function providerById(id: string): Provider {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}
