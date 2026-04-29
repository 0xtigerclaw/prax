"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { BN } from "@coral-xyz/anchor";
import { AppShell } from "@/components/shell/AppShell";
import { StepIndicator } from "@/components/listing/StepIndicator";
import { SelectProvider } from "@/components/listing/SelectProvider";
import { ProofOfBalance } from "@/components/listing/ProofOfBalance";
import { DepositEscrow } from "@/components/listing/DepositEscrow";
import { ListingForm, type ListingDraft } from "@/components/listing/ListingForm";
import { SettlementStatus } from "@/components/listing/SettlementStatus";
import { Button } from "@/components/ui/Button";
import type { Provider } from "@/lib/mock/providers";
import { usePraxWallet } from "@/lib/solana/usePraxWallet";
import { getProgram, createAuctionIx } from "@/lib/solana/client";
import { creditMintFor } from "@/lib/solana/config";

const STEPS = [
  { id: 1, label: "Connect provider" },
  { id: 2, label: "Verify balance" },
  { id: 3, label: "Lock to escrow" },
  { id: 4, label: "Set your price" },
];

export default function ListPage() {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState<ListingDraft | null>(null);
  const [txSignature, setTxSignature] = useState<string | undefined>();
  const [publishing, setPublishing] = useState(false);

  const { connected, publicKey, login, sendInstructions } = usePraxWallet();

  const canNext = (() => {
    if (step === 1) return provider !== null && apiKey.length >= 8;
    if (step === 2) return balance > 0;
    if (step === 3) return false; // advanced by deposit handler
    return true;
  })();

  const reset = () => {
    setStep(1);
    setProvider(null);
    setApiKey("");
    setBalance(0);
    setAmount("");
    setSubmitted(null);
    setTxSignature(undefined);
  };

  const handleSubmit = async (draft: ListingDraft) => {
    if (draft.kind !== "auction") {
      // Fixed-price listings are still mock-only for this session.
      setSubmitted(draft);
      toast.success("Listing transaction submitted");
      return;
    }

    if (!connected || !publicKey) {
      toast.error("Connect your wallet first");
      login();
      return;
    }

    if (!provider) return;

    setPublishing(true);
    try {
      const creditMint = creditMintFor(provider.id);
      const program = getProgram(publicKey);

      const creditAmountWhole = parseInt(amount) || Math.floor(balance / 2);
      const startPricePerCreditUsdc = parseFloat(draft.startPrice ?? "0");
      const floorPricePerCreditUsdc = parseFloat(draft.floorPrice ?? "0");
      const durationSecs = parseFloat(draft.duration) * 3600;

      if (
        !creditAmountWhole ||
        !startPricePerCreditUsdc ||
        !floorPricePerCreditUsdc ||
        !durationSecs
      ) {
        toast.error("Invalid listing parameters");
        return;
      }

      // Use current timestamp as unique seed for this auction.
      const auctionSeed = new BN(Date.now());

      const { instruction } = await createAuctionIx(program, publicKey, {
        auctionSeed,
        creditMint,
        creditAmountWhole,
        startPricePerCreditUsdc,
        floorPricePerCreditUsdc,
        durationSecs,
      });

      const sig = await sendInstructions([instruction]);
      setTxSignature(sig);
      setSubmitted(draft);
      toast.success("Auction created on devnet!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      toast.error(`Transaction failed: ${msg.slice(0, 80)}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-full flex flex-col">
        <div className="max-w-3xl w-full mx-auto px-6 py-10 flex-1">
          <div className="mb-8">
            <div className="mono text-[11px] uppercase tracking-[0.15em] text-bid mb-2">
              List inference · 4 steps · ~2 minutes
            </div>
            <h1 className="text-[32px] font-semibold tracking-[-0.025em] leading-none">
              Turn unused tokens. API balance or GPU output. Into USDC.
            </h1>
            <p className="text-[13.5px] text-text-1 mt-2.5 max-w-[580px] leading-relaxed">
              Whether you have an OpenAI commit you'll never burn or an
              H100 sitting idle next week, prove what you have, lock it
              into on-chain escrow, and choose how you want to sell.
              Fixed price or a falling-price Dutch auction.
            </p>
          </div>

          <div className="mb-8">
            <StepIndicator steps={STEPS} current={step} />
          </div>

          {submitted ? (
            <SettlementStatus onReset={reset} txSignature={txSignature} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {step === 1 && (
                  <SelectProvider
                    selected={provider}
                    onSelect={setProvider}
                    apiKey={apiKey}
                    onApiKey={setApiKey}
                  />
                )}
                {step === 2 && provider && (
                  <ProofOfBalance
                    provider={provider}
                    onVerified={setBalance}
                  />
                )}
                {step === 3 && provider && (
                  <DepositEscrow
                    provider={provider}
                    balance={balance}
                    amount={amount}
                    onAmount={setAmount}
                    onDeposited={() => setStep(4)}
                  />
                )}
                {step === 4 && provider && (
                  <ListingForm
                    provider={provider}
                    amount={parseInt(amount) || balance / 2}
                    onSubmit={handleSubmit}
                    publishing={publishing}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {!submitted && (
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                <ArrowLeft size={14} /> Back
              </Button>
              {step < 3 && (
                <Button
                  variant="primary"
                  size="md"
                  disabled={!canNext}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Continue <ArrowRight size={14} />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
