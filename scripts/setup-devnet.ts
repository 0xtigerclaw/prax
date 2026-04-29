/**
 * Prax devnet setup.
 *
 * Creates one Token-2022 credit mint per provider in lib/mock/providers.ts,
 * mints a treasury balance (1M whole tokens, 6 decimals → 1e12 atoms) to
 * the deployer, and writes the resulting mint addresses to
 * lib/solana/generated-mints.json so the client can pick them up.
 *
 * Also emits the Circle devnet USDC mint id into the same file for
 * convenience.
 *
 * Run: pnpm ts-node --compiler-options '{"module":"commonjs"}' scripts/setup-devnet.ts
 */

import {
  Connection,
  Keypair,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  getMintLen,
  MINT_SIZE,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
  createMintToInstruction,
} from "@solana/spl-token";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const DECIMALS = 6;
const TREASURY_MINT = 1_000_000n * 10n ** BigInt(DECIMALS); // 1M tokens
// Circle devnet USDC
const USDC_DEVNET_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

const PROVIDERS = [
  "llama",
  "gpu-llama70b",
  "mistral",
  "gpt4o",
  "claude",
  "gemini",
  "cohere",
];

function loadKeypair(path: string): Keypair {
  const secret = JSON.parse(readFileSync(path, "utf8"));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

async function main() {
  const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
  const deployer = loadKeypair(join(homedir(), ".config/solana/id.json"));
  console.log("Deployer:", deployer.publicKey.toBase58());
  const bal = await conn.getBalance(deployer.publicKey);
  console.log("Balance:", bal / 1e9, "SOL");
  if (bal < 0.3 * 1e9) {
    throw new Error("Deployer needs ≥ 0.3 SOL for mint rent + tx fees");
  }

  const mints: Record<string, string> = {};

  for (const id of PROVIDERS) {
    const mintKp = Keypair.generate();
    const mintLen = getMintLen([]); // no extensions
    const rent = await conn.getMinimumBalanceForRentExemption(mintLen);

    const ata = getAssociatedTokenAddressSync(
      mintKp.publicKey,
      deployer.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
    );

    const tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: deployer.publicKey,
        newAccountPubkey: mintKp.publicKey,
        space: mintLen,
        lamports: rent,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mintKp.publicKey,
        DECIMALS,
        deployer.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID,
      ),
      createAssociatedTokenAccountIdempotentInstruction(
        deployer.publicKey,
        ata,
        deployer.publicKey,
        mintKp.publicKey,
        TOKEN_2022_PROGRAM_ID,
      ),
      createMintToInstruction(
        mintKp.publicKey,
        ata,
        deployer.publicKey,
        TREASURY_MINT,
        [],
        TOKEN_2022_PROGRAM_ID,
      ),
    );

    const sig = await sendAndConfirmTransaction(conn, tx, [deployer, mintKp], {
      commitment: "confirmed",
    });
    mints[id] = mintKp.publicKey.toBase58();
    console.log(`  ${id.padEnd(14)} → ${mints[id]}  tx=${sig.slice(0, 12)}…`);
  }

  const out = {
    cluster: "devnet",
    usdc: USDC_DEVNET_MINT,
    credits: mints,
    generatedAt: new Date().toISOString(),
  };

  mkdirSync("lib/solana", { recursive: true });
  writeFileSync(
    "lib/solana/generated-mints.json",
    JSON.stringify(out, null, 2),
  );
  console.log("\nWrote lib/solana/generated-mints.json");
  console.log(
    "\nTreasury: ",
    (TREASURY_MINT / 10n ** BigInt(DECIMALS)).toString(),
    "tokens each, in deployer ATAs",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
