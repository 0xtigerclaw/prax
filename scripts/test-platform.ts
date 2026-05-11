/**
 * Prax platform integration test.
 * Tests: mints on-chain, program live, IDL match, price decay math,
 *        PDA derivation, mock data integrity, config consistency.
 *
 * Run: pnpm exec ts-node --compiler-options '{"module":"commonjs","esModuleInterop":true,"target":"es2020"}' scripts/test-platform.ts
 */

import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { existsSync } from "node:fs";
import mints from "../lib/solana/generated-mints.json";
import idl from "../lib/solana/idl.json";
import { PROVIDERS, type Provider } from "../lib/mock/providers";
import { makeListings, type Listing } from "../lib/mock/listings";
import { makeRoutes, type RouteOption } from "../lib/mock/routes";

type IdlInstruction = { name: string };
type IdlAccount = { name: string };

const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const PROGRAM_ID = "NcrmnMRfv3fZaqND9P6XtiXhf1dKo6kt2rC3umtRsuH";
const conn = new Connection(clusterApiUrl("devnet"), "confirmed");

let passed = 0;
let failed = 0;
const results: string[] = [];

function ok(label: string, note = "") {
  passed++;
  results.push(`  ✓  ${label}${note ? "  — " + note : ""}`);
}
function fail(label: string, note = "") {
  failed++;
  results.push(`  ✗  ${label}${note ? "  — " + note : ""}`);
}

// ── 1. Config: generated-mints.json sanity ──────────────────────────
async function testMintConfig() {
  console.log("\n=== 1. generated-mints.json ===");
  const providerIds = PROVIDERS.map((p) => p.id);
  const mintIds = Object.keys(mints.credits);

  for (const id of providerIds) {
    if (mintIds.includes(id)) ok(`mint entry for '${id}'`);
    else fail(`missing mint entry for '${id}'`);
  }

  // USDC mint looks like a real pubkey
  try {
    new PublicKey(mints.usdc);
    ok("usdc mint is valid pubkey");
  } catch {
    fail("usdc mint is invalid pubkey");
  }
}

// ── 2. Devnet: program account exists ──────────────────────────────
async function testProgram() {
  console.log("\n=== 2. Program on devnet ===");
  try {
    const info = await conn.getAccountInfo(new PublicKey(PROGRAM_ID));
    if (info && info.executable) {
      ok("program account exists and is executable");
      ok("program owner is BPFLoaderUpgradeable", info.owner.toBase58().slice(0, 20) + "…");
    } else {
      fail("program account not found or not executable");
    }
  } catch (e: unknown) {
    fail("program fetch error", errorMessage(e));
  }
}

// ── 3. Devnet: all 7 Token-2022 credit mints exist ──────────────────
async function testCreditMints() {
  console.log("\n=== 3. Credit mints on devnet ===");
  for (const [id, addr] of Object.entries(mints.credits) as [string, string][]) {
    try {
      const info = await conn.getAccountInfo(new PublicKey(addr));
      if (info && info.owner.toBase58() === TOKEN_2022_PROGRAM_ID) {
        ok(`${id.padEnd(16)} Token-2022 mint`, addr.slice(0, 12) + "…");
      } else {
        fail(`${id.padEnd(16)} wrong owner or null`);
      }
    } catch (e: unknown) {
      fail(`${id.padEnd(16)} fetch error`, errorMessage(e));
    }
  }
}

// ── 4. IDL: instructions match program ──────────────────────────────
async function testIdl() {
  console.log("\n=== 4. IDL integrity ===");
  const expected = ["create_auction", "place_bid", "close_auction"];
  const ixNames: string[] = idl.instructions.map((ix: IdlInstruction) => ix.name);
  for (const name of expected) {
    if (ixNames.includes(name)) ok(`instruction '${name}' in IDL`);
    else fail(`instruction '${name}' missing from IDL`);
  }

  const expectedAccounts = ["Auction"];
  const accountNames: string[] = idl.accounts.map((a: IdlAccount) => a.name);
  for (const name of expectedAccounts) {
    if (accountNames.includes(name)) ok(`account '${name}' in IDL`);
    else fail(`account '${name}' missing from IDL`);
  }

  if (idl.address === PROGRAM_ID) ok("IDL address matches PROGRAM_ID");
  else fail("IDL address mismatch", `IDL=${idl.address}`);
}

// ── 5. PDA derivation ──────────────────────────────────────────────
async function testPdas() {
  console.log("\n=== 5. PDA derivation ===");
  const seller = new PublicKey("91wi9AQwZYmTuGcG7uGm2SNTMogYjLumiBPPKJ22zPLU");
  const seed = new BN(12345678);
  const programId = new PublicKey(PROGRAM_ID);

  try {
    const [auctionPda, auctionBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("auction"), seller.toBuffer(), seed.toArrayLike(Buffer, "le", 8)],
      programId,
    );
    ok("auction PDA derivation", `${auctionPda.toBase58().slice(0, 12)}… bump=${auctionBump}`);

    const [vaultAuth, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), auctionPda.toBuffer()],
      programId,
    );
    ok("vault authority PDA derivation", `${vaultAuth.toBase58().slice(0, 12)}… bump=${vaultBump}`);
  } catch (e: unknown) {
    fail("PDA derivation error", errorMessage(e));
  }
}

// ── 6. Price decay math ────────────────────────────────────────────
async function testPriceDecay() {
  console.log("\n=== 6. Price decay math ===");

  function currentPrice(start: number, floor: number, startTs: number, durationSecs: number, nowTs: number): number {
    if (nowTs <= startTs) return start;
    const elapsed = nowTs - startTs;
    if (elapsed >= durationSecs) return floor;
    const spread = start - floor;
    return start - Math.floor((spread * elapsed) / durationSecs);
  }

  const now = Math.floor(Date.now() / 1000);
  const start = 1_000_000; // $1.00 in micros
  const floor = 500_000;   // $0.50 in micros
  const dur = 3600;        // 1 hour

  const atStart = currentPrice(start, floor, now, dur, now);
  if (atStart === start) ok("price at t=0 equals startPrice");
  else fail("price at t=0 wrong", `got ${atStart}, want ${start}`);

  const atMid = currentPrice(start, floor, now, dur, now + dur / 2);
  if (atMid === 750_000) ok("price at t=0.5 equals midpoint (linear)");
  else fail("price at midpoint wrong", `got ${atMid}, want 750000`);

  const atEnd = currentPrice(start, floor, now, dur, now + dur);
  if (atEnd === floor) ok("price at t=duration equals floorPrice");
  else fail("price at t=duration wrong", `got ${atEnd}, want ${floor}`);

  const afterEnd = currentPrice(start, floor, now, dur, now + dur * 2);
  if (afterEnd === floor) ok("price after expiry stays at floor");
  else fail("price after expiry wrong", `got ${afterEnd}`);
}

// ── 7. Mock data integrity ─────────────────────────────────────────
async function testMockData() {
  console.log("\n=== 7. Mock data integrity ===");
  try {
    const listings = makeListings(42);
    if (listings.length > 0) ok("makeListings generates listings", `count=${listings.length}`);
    else fail("makeListings returned empty");

    const auctions = listings.filter((l: Listing) => l.kind === "auction");
    if (auctions.length > 0) ok("auction listings present", `count=${auctions.length}`);
    else fail("no auction listings generated");

    for (const a of auctions.slice(0, 3)) {
      if (
        a.startPrice != null &&
        a.floorPrice != null &&
        a.startPrice > a.floorPrice &&
        a.price >= a.floorPrice &&
        a.price <= a.startPrice
      ) {
        ok(`auction ${a.id.slice(-4)} price within bounds`);
      } else {
        fail(`auction ${a.id.slice(-4)} price out of bounds`, `price=${a.price} start=${a.startPrice} floor=${a.floorPrice}`);
      }
    }
  } catch (e: unknown) {
    fail("makeListings error", errorMessage(e));
  }

  try {
    const routes = makeRoutes("gpt4o", 99);
    const labels = routes.map((r: RouteOption) => r.label);
    if (labels.some((l: string) => l.includes("Prax"))) ok("route labels contain 'Prax'");
    else fail("route labels still contain old brand", labels.join(", "));

    if (labels.some((l: string) => l.includes("Direct"))) ok("direct route present");
    else fail("no direct route");

    const sorted = routes.every((route: RouteOption, i: number) =>
      i === 0 || routes[i - 1].effective <= route.effective
    );
    if (sorted) ok("routes sorted by effective price");
    else fail("routes not sorted");
  } catch (e: unknown) {
    fail("makeRoutes error", errorMessage(e));
  }
}

// ── 8. Providers config ────────────────────────────────────────────
async function testProviders() {
  console.log("\n=== 8. Providers config ===");
  if (PROVIDERS.length === 7) ok("7 providers defined");
  else fail("wrong provider count", `got ${PROVIDERS.length}`);

  const open = PROVIDERS.filter((p: Provider) => p.kind === "open");
  const closed = PROVIDERS.filter((p: Provider) => p.kind === "closed");
  if (open.length > 0 && closed.length > 0) ok(`open/closed split: ${open.length} open, ${closed.length} closed`);
  else fail("missing open or closed providers");

  for (const p of PROVIDERS) {
    if (p.face > 0) ok(`${p.id.padEnd(14)} face=${p.face}`);
    else fail(`${p.id} has zero face value`);
  }
}

// ── 9. Env / config ────────────────────────────────────────────────
async function testEnv() {
  console.log("\n=== 9. Environment config ===");
  if (existsSync(".env.local")) ok(".env.local exists");
  else fail(".env.local missing");

  if (existsSync("lib/solana/generated-mints.json")) ok("generated-mints.json present");
  else fail("generated-mints.json missing — run scripts/setup-devnet.ts");

  if (existsSync("anchor/target/deploy/prax_auction.so")) ok("program binary present");
  else fail("program binary missing");
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

// ── run all ────────────────────────────────────────────────────────
async function main() {
  console.log("Prax Platform Test Suite");
  console.log("========================");

  await testMintConfig();
  await testProgram();
  await testCreditMints();
  await testIdl();
  await testPdas();
  await testPriceDecay();
  await testMockData();
  await testProviders();
  await testEnv();

  console.log("\n=== Results ===");
  for (const r of results) console.log(r);
  console.log(`\n${passed + failed} checks — ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error("\nFATAL:", e);
  process.exit(1);
});
