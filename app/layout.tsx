import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { SolanaWalletProvider } from "@/lib/solana/wallet-adapter-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prax | The open market for inference",
  description:
    "Sell the inference you’re not using. Unused OpenAI commits, idle H100s, Anthropic tokens a team won’t burn by expiry. Prax is where sellers list, buyers save 20–50%, and Solana settles it in 400ms.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} antialiased`}
    >
      <body className="min-h-screen bg-bg-0 text-text-0">
        <SolanaWalletProvider>
          {children}
          <CommandPalette />
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--bg-2)",
                border: "1px solid var(--line)",
                color: "var(--text-0)",
                fontFamily: "var(--font-sans)",
              },
            }}
          />
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
