"use client";

import { useCallback, useMemo } from "react";
import {
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  Connection,
  Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import { DEVNET_RPC } from "./config";

/**
 * Higher-level wallet hook used throughout the Prax UI.
 *
 * Backed by @solana/wallet-adapter-react (Phantom, Solflare).
 */
export function usePraxWallet() {
  const wallet = useWallet();
  const { connection } = useConnection();

  const publicKey = wallet.publicKey;
  const connected = wallet.connected;
  const ready = !wallet.connecting;

  const sendInstructions = useCallback(
    async (ixs: TransactionInstruction[]): Promise<string> => {
      if (!connected || !publicKey || !wallet.signTransaction) {
        throw new Error("No Solana wallet connected.");
      }
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      const tx = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(...ixs);

      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      // Wait for confirmation
      await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        "confirmed",
      );

      return sig;
    },
    [connected, publicKey, wallet, connection],
  );

  return {
    ready,
    authenticated: connected, // wallet adapter doesn't have auth, just connection
    connected,
    publicKey,
    address: publicKey?.toBase58() ?? null,
    connection: useMemo(() => new Connection(DEVNET_RPC, "confirmed"), []),
    login: wallet.connect,
    logout: wallet.disconnect,
    sendInstructions,
  };
}
