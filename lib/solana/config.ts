import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import mintsJson from "./generated-mints.json";

/**
 * Compile-time devnet config.
 *
 * Program id is baked into the IDL (`lib/solana/idl.json`). The
 * Token-2022 credit mints and the USDC mint were created by
 * `scripts/setup-devnet.ts` and are read from
 * `lib/solana/generated-mints.json` so redeploying doesn't require a
 * code change.
 */
export const PROGRAM_ID = new PublicKey(
  "NcrmnMRfv3fZaqND9P6XtiXhf1dKo6kt2rC3umtRsuH",
);

export const DEVNET_RPC = clusterApiUrl("devnet");

export const USDC_MINT = new PublicKey(mintsJson.usdc);

/** Map provider.id (from lib/mock/providers.ts) → Token-2022 mint pubkey. */
export const CREDIT_MINTS: Record<string, PublicKey> = Object.fromEntries(
  Object.entries(mintsJson.credits).map(([id, addr]) => [
    id,
    new PublicKey(addr as string),
  ]),
);

/** Credit mints use 6 decimals (matches USDC). Also matches our setup script. */
export const CREDIT_DECIMALS = 6;
export const USDC_DECIMALS = 6;

export function creditMintFor(providerId: string): PublicKey {
  const m = CREDIT_MINTS[providerId];
  if (!m) {
    throw new Error(
      `No Token-2022 credit mint for provider "${providerId}". Run scripts/setup-devnet.ts.`,
    );
  }
  return m;
}
