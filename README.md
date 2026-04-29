# Prax

A tokenized marketplace for AI compute credits — settled on Solana devnet.

> **Hybrid demo + devnet.** Dutch auctions are real on Solana devnet with
> wallet-adapter signing. Exchange quotes, market data, and stats are modeled
> frontend previews until backend swap endpoints are connected.

## Screens

| Route       | Description                                                        |
| ----------- | ------------------------------------------------------------------ |
| `/`         | Landing — hero, ticker, featured Dutch auctions, stats             |
| `/exchange` | Buyer spot quote — preview-only credit pricing (primary buyer flow)|
| `/market`   | Advanced terminal — candles, orderbook, trade panel, portfolio     |
| `/list`     | Listing flow — 4-step wizard: provider → attest → escrow → publish |
| `/route`    | Routing aggregator — compare direct / secondary / auction / alt    |

## Keyboard

- `⌘K` / `Ctrl+K` — command palette
- `/` — command palette (when not in input)
- `B` — set trade panel to Buy (on `/market`)
- `S` — set trade panel to Sell (on `/market`)

## Stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
- Tailwind v4 (CSS-first `@theme`) · hand-rolled primitives
- Recharts · framer-motion · lucide-react · sonner
- `@solana/wallet-adapter-react` (Phantom, Solflare) · Anchor · Token-2022
- `next/font` for Inter + JetBrains Mono

Exchange quotes and market surfaces use modeled client-side data. Dutch
auctions interact with a real devnet Anchor program (`NcrmnMRfv3fZaqND9P6XtiXhf1dKo6kt2rC3umtRsuH`).

## Run

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

## Build

```bash
pnpm build
pnpm start
```

## Project structure

```
app/
  page.tsx              # Landing
  exchange/page.tsx     # Buyer spot quote (preview-only)
  market/page.tsx       # Advanced terminal
  list/page.tsx         # Listing wizard
  route/page.tsx        # Routing aggregator
  layout.tsx            # Fonts, toaster, command palette, wallet provider
  globals.css           # Design tokens, utilities

components/
  landing/              # Hero, HowItWorks, FeaturedAuctions, StatsBand, CTAFooter
  shell/                # Sidebar, TopBar, MarketTicker, WalletConnect, CommandPalette
  market/               # MarketHeader, PriceChart, OrderBook, TradePanel, DutchAuctionPanel, PortfolioPanel, CreditListingsTable
  listing/              # StepIndicator, SelectProvider, ProofOfBalance, DepositEscrow, ListingForm, SettlementStatus
  routing/              # ComputeRequestForm, RouteComparison, ExecutionPath
  ui/                   # Button, Panel, Dialog, Input, Tabs, Badge, Select, Slider, MountedOnly

lib/
  exchange/quotes.ts    # Shared quote math for the exchange page
  mock/                 # Seeded data generators (orderbook, candles, listings, pools, tickers, portfolio, routes)
  hooks/                # useLiveFeed, useWallet, useCountdown
  solana/               # wallet-adapter provider, Anchor client, IDL, config
  format.ts             # Number/addr/time formatters + mulberry32 PRNG
  utils.ts              # cn()

public/logos/           # Provider SVG marks
```
