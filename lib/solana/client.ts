"use client";

import {
  AnchorProvider,
  Program,
  BN,
  type Idl,
  type Wallet,
} from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  VersionedTransaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import idl from "./idl.json";
import type { PraxAuction } from "./idl-types";
import { DEVNET_RPC, PROGRAM_ID, USDC_MINT } from "./config";

/** Read-only connection for reads that don't need signing. */
export function readOnlyConnection(): Connection {
  return new Connection(DEVNET_RPC, "confirmed");
}

/**
 * A dummy Wallet used for the Program client when we only need to build
 * instructions (not sign). Anchor's Program needs a Wallet to instantiate
 * the Provider even if no transaction ever goes through it, because we
 * call `.instruction()` (build only) and sign/send ourselves via usePraxWallet().
 */
class ReadOnlyWallet implements Wallet {
  readonly publicKey: PublicKey;
  // biome-ignore lint/suspicious/noExplicitAny: anchor Wallet requires a payer field.
  readonly payer: any = {};
  constructor(publicKey?: PublicKey) {
    // Use a throwaway pubkey if none provided. Only matters if you try to
    // actually send through this Wallet — we never do.
    this.publicKey = publicKey ?? PublicKey.default;
  }
  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    throw new Error("ReadOnlyWallet cannot sign. Route signing via usePraxWallet().");
  }
  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    throw new Error("ReadOnlyWallet cannot sign. Route signing via usePraxWallet().");
  }
}

export function getProgram(
  publicKey?: PublicKey,
  connection?: Connection,
): Program<PraxAuction> {
  const conn = connection ?? readOnlyConnection();
  const provider = new AnchorProvider(conn, new ReadOnlyWallet(publicKey), {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  return new Program<PraxAuction>(idl as Idl as PraxAuction, provider);
}

// ─────────────────── PDA helpers ────────────────────────────────────

export function auctionPda(seller: PublicKey, seed: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("auction"), seller.toBuffer(), seed.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID,
  );
}

export function vaultAuthorityPda(auction: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), auction.toBuffer()],
    PROGRAM_ID,
  );
}

// ─────────────────── high-level actions ─────────────────────────────

export type CreateAuctionParams = {
  /** Random 64-bit discriminator so a seller can have many auctions. */
  auctionSeed: BN;
  creditMint: PublicKey;
  /** Whole credits to list; will be multiplied by 10^6 atoms. */
  creditAmountWhole: number;
  /** USDC per credit at start; multiplied by 10^6 atoms. */
  startPricePerCreditUsdc: number;
  floorPricePerCreditUsdc: number;
  /** Auction duration in seconds (max 7 days, enforced on-chain). */
  durationSecs: number;
};

export async function createAuctionIx(
  program: Program<PraxAuction>,
  seller: PublicKey,
  p: CreateAuctionParams,
): Promise<{
  auction: PublicKey;
  vaultAuthority: PublicKey;
  instruction: TransactionInstruction;
}> {
  const [auction] = auctionPda(seller, p.auctionSeed);
  const [vaultAuthority] = vaultAuthorityPda(auction);
  const sellerCreditAta = getAssociatedTokenAddressSync(
    p.creditMint,
    seller,
    false,
    TOKEN_2022_PROGRAM_ID,
  );
  const creditVault = getAssociatedTokenAddressSync(
    p.creditMint,
    vaultAuthority,
    true, // allow PDA owner
    TOKEN_2022_PROGRAM_ID,
  );

  const creditAmount = new BN(Math.round(p.creditAmountWhole * 1e6));
  const startPrice = new BN(Math.round(p.startPricePerCreditUsdc * 1e6));
  const floorPrice = new BN(Math.round(p.floorPricePerCreditUsdc * 1e6));
  const duration = new BN(p.durationSecs);

  const instruction = await program.methods
    .createAuction(
      p.auctionSeed,
      creditAmount,
      startPrice,
      floorPrice,
      duration,
    )
    .accountsPartial({
      seller,
      auction,
      creditMint: p.creditMint,
      quoteMint: USDC_MINT,
      sellerCreditAta,
      creditVaultAuthority: vaultAuthority,
      creditVault,
      creditTokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .instruction();

  return { auction, vaultAuthority, instruction };
}

export type PlaceBidParams = {
  auction: PublicKey;
  creditMint: PublicKey;
  seller: PublicKey;
};

export async function placeBidIx(
  program: Program<PraxAuction>,
  buyer: PublicKey,
  p: PlaceBidParams,
): Promise<TransactionInstruction> {
  const [vaultAuthority] = vaultAuthorityPda(p.auction);
  const creditVault = getAssociatedTokenAddressSync(
    p.creditMint,
    vaultAuthority,
    true,
    TOKEN_2022_PROGRAM_ID,
  );
  const buyerCreditAta = getAssociatedTokenAddressSync(
    p.creditMint,
    buyer,
    false,
    TOKEN_2022_PROGRAM_ID,
  );
  // Circle's devnet USDC is legacy-token, not Token-2022. Use the legacy
  // ATA derivation path.
  const { TOKEN_PROGRAM_ID } = await import("@solana/spl-token");
  const buyerQuoteAta = getAssociatedTokenAddressSync(
    USDC_MINT,
    buyer,
    false,
    TOKEN_PROGRAM_ID,
  );
  const sellerQuoteAta = getAssociatedTokenAddressSync(
    USDC_MINT,
    p.seller,
    false,
    TOKEN_PROGRAM_ID,
  );

  return program.methods
    .placeBid()
    .accountsPartial({
      buyer,
      auction: p.auction,
      creditMint: p.creditMint,
      quoteMint: USDC_MINT,
      creditVaultAuthority: vaultAuthority,
      creditVault,
      buyerCreditAta,
      buyerQuoteAta,
      sellerQuoteAta,
      seller: p.seller,
      creditTokenProgram: TOKEN_2022_PROGRAM_ID,
      quoteTokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

export async function closeAuctionIx(
  program: Program<PraxAuction>,
  seller: PublicKey,
  auction: PublicKey,
  creditMint: PublicKey,
): Promise<TransactionInstruction> {
  const [vaultAuthority] = vaultAuthorityPda(auction);
  const creditVault = getAssociatedTokenAddressSync(
    creditMint,
    vaultAuthority,
    true,
    TOKEN_2022_PROGRAM_ID,
  );
  const sellerCreditAta = getAssociatedTokenAddressSync(
    creditMint,
    seller,
    false,
    TOKEN_2022_PROGRAM_ID,
  );

  return program.methods
    .closeAuction()
    .accountsPartial({
      seller,
      auction,
      creditMint,
      creditVaultAuthority: vaultAuthority,
      creditVault,
      sellerCreditAta,
      creditTokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
}

// ─────────────────── reads ──────────────────────────────────────────

export type AuctionAccount = Awaited<
  ReturnType<Program<PraxAuction>["account"]["auction"]["fetch"]>
>;

export async function fetchAuction(
  program: Program<PraxAuction>,
  auction: PublicKey,
): Promise<AuctionAccount> {
  return program.account.auction.fetch(auction);
}

export async function fetchAllAuctions(
  program: Program<PraxAuction>,
): Promise<Array<{ publicKey: PublicKey; account: AuctionAccount }>> {
  return program.account.auction.all();
}

/**
 * Client-side mirror of the on-chain `current_price` function. Good for
 * UI previews; the program always recomputes authoritatively.
 */
export function currentPrice(
  a: { startPrice: BN; floorPrice: BN; startTs: BN; durationSecs: BN },
  nowSecs: number,
): number {
  const start = a.startTs.toNumber();
  if (nowSecs <= start) return a.startPrice.toNumber();
  const elapsed = nowSecs - start;
  const dur = a.durationSecs.toNumber();
  if (elapsed >= dur) return a.floorPrice.toNumber();
  const spread = a.startPrice.toNumber() - a.floorPrice.toNumber();
  return a.startPrice.toNumber() - Math.floor((spread * elapsed) / dur);
}
