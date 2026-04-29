# Prax

A tokenized marketplace for AI compute credits — settled on Solana devnet.

**Live:** [https://computefi.vercel.app](https://computefi.vercel.app)  
**Contract:** [NcrmnMRfv3fZaqND9P6XtiXhf1dKo6kt2rC3umtRsuH](https://explorer.solana.com/address/NcrmnMRfv3fZaqND9P6XtiXhf1dKo6kt2rC3umtRsuH?cluster=devnet)

---

## What is Prax?

Enterprises prepay for AI inference credits (Claude, GPT-4o, Gemini, Llama) and routinely burn less than half before the commit expires. Solo developers and startups need that capacity right now, at half the price.

Prax is the exchange that connects them. Sellers recover value before expiry. Buyers get the same models at 30–60% below list price. Solana settles every trade in ~400ms.

### The Flow

```
Enterprise buys 1,000 Claude credits
        ↓
   Uses 700
        ↓
   300 expire in 2 days → worth $0
        ↓
   Lists on Prax for 50% off
        ↓
   Developer buys → ships their project
        ↓
   Enterprise recovers value instead of $0
```

---

## What's Real vs. Preview

| Feature | Status | Details |
|---------|--------|---------|
| Dutch Auctions | **Real on devnet** | Anchor program with Token-2022 credit mints, wallet-adapter signing |
| Wallet Connection | **Real** | Phantom + Solflare via `@solana/wallet-adapter-react` |
| Exchange Quotes | **Preview-only** | Hardcoded rates, no backend swap endpoint yet |
| Market Data | **Modeled** | Client-side seeded PRNG simulating live feeds |
| Stats | **Modeled estimates** | Honest rounding: `$24M+`, `43% avg discount` |
| Liquidity Pools | **Coming soon** | Not shown until real pools exist |

---

## Routes

| Route | Purpose | Audience |
|-------|---------|----------|
| `/` | Landing page — hero, live ticker, how it works, scenario flow, featured auctions, modeled stats | Everyone |
| `/exchange` | **Primary buyer flow** — simple spot quote. USDC/SOL → AI credits | Developers buying credits |
| `/market` | Advanced terminal — candles, orderbook, trade panel, portfolio, Dutch auction demo | Power users, pro traders |
| `/list` | Seller wizard — 4 steps: select provider → prove balance → escrow → publish | Enterprises with unused credits |
| `/route` | Routing aggregator — compare direct vs. secondary vs. auction vs. alternative providers | Price-sensitive buyers |

---

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript 5 + React 19
- **Styling:** Tailwind CSS v4 (CSS-first `@theme`) with custom beige market-terminal design system
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Icons:** lucide-react
- **Toasts:** sonner
- **Wallet:** `@solana/wallet-adapter-react` (Phantom, Solflare)
- **Solana Program:** Anchor 0.32.1 + Token-2022
- **Fonts:** Inter + JetBrains Mono via `next/font`

---

## Architecture

### Frontend

```
app/
  page.tsx              # Landing composition
  exchange/page.tsx     # Buyer spot quote (preview-only)
  market/page.tsx       # Advanced trading terminal
  list/page.tsx         # 4-step seller wizard
  route/page.tsx        # Routing aggregator
  layout.tsx            # Root layout: fonts, toaster, wallet provider, command palette
  globals.css           # Design tokens, CSS utilities, beige theme

components/
  landing/
    TopNav.tsx          # Sticky nav: Buy / Market / Sell
    Hero.tsx            # Hero with animated orderbook preview
    HeroOrderbook.tsx   # 3D-tilted live orderbook component
    HowItWorks.tsx      # Marketplace flow diagram
    WhySolana.tsx       # Horizontal scenario flow (enterprise → Prax → developer)
    FeaturedAuctions.tsx# Live Dutch auction cards
    StatsBand.tsx       # Modeled market snapshot stats
    CTAFooter.tsx       # Final CTA + footer

  market/
    MarketHeader.tsx    # Ticker, price, change
    PriceChart.tsx      # Candlestick chart with Recharts
    OrderBook.tsx       # Live bid/ask ladder
    TradePanel.tsx      # Buy/Sell/Bid panel (demo-only)
    DutchAuctionPanel.tsx# Real devnet auction interaction
    PortfolioPanel.tsx  # Mock portfolio view
    CreditListingsTable.tsx# Available credit listings

  listing/
    StepIndicator.tsx   # 4-step progress bar
    SelectProvider.tsx  # Choose AI provider (Claude, GPT-4o, etc.)
    ProofOfBalance.tsx  # Simulated balance verification
    DepositEscrow.tsx   # Escrow simulation with devnet program ID
    ListingForm.tsx     # Pricing and duration settings
    SettlementStatus.tsx# Post-listing status

  shell/
    AppShell.tsx        # Page wrapper with sidebar
    MarketTicker.tsx    # Edge-to-edge scrolling ticker
    WalletConnect.tsx   # Wallet adapter connect button
    CommandPalette.tsx  # ⌘K command palette
    Sidebar.tsx         # Navigation sidebar
    TopBar.tsx          # Market page top bar

  ui/
    Button.tsx          # Primary/secondary/outline variants
    Panel.tsx           # Card container with border
    Dialog.tsx          # Modal overlay
    Input.tsx           # Text/number inputs
    Tabs.tsx            # Segmented tab controls
    Badge.tsx           # Status badges
    Select.tsx          # Dropdown select
    Slider.tsx          # Range slider
    MountedOnly.tsx     # Client-side mount gate

lib/
  exchange/quotes.ts    # Shared quote math: getRate, getCreditQuote, getSavingsVsList
  solana/
    wallet-adapter-provider.tsx  # Phantom + Solflare provider
    usePraxWallet.ts    # Higher-level wallet hook (connect, sign, send)
    client.ts           # Anchor program client, PDA helpers, instruction builders
    config.ts           # Devnet RPC, program ID, mint addresses
    idl.json            # Anchor IDL
    idl-types.ts        # TypeScript types from IDL
    generated-mints.json# Token-2022 credit mints created by setup script
  mock/                 # Seeded data generators
    providers.ts        # Provider metadata (Claude, GPT-4o, Gemini, etc.)
    orderbook.ts        # Jittered orderbook simulation
    candles.ts          # OHLCV candle generation
    listings.ts         # Auction listings
    tickers.ts          # Price tickers
    pools.ts            # Liquidity pool data (unused)
    portfolio.ts        # Mock portfolio
    routes.ts           # Route comparison data
  hooks/
    useLiveFeed.ts      # Periodic data refresh with jitter
    useWallet.ts        # Legacy mock wallet (used by TradePanel)
    useCountdown.ts     # Auction countdown timer
  format.ts             # Number, address, time formatters + PRNG
  utils.ts              # cn() for Tailwind class merging
```

### Smart Contract (Anchor)

```
anchor/programs/prax_auction/src/lib.rs
```

**Program ID:** `NcrmnMRfv3fZaqND9P6XtiXhf1dKo6kt2rC3umtRsuH`

**Features:**
- `create_auction` — List credits with start price, floor price, duration
- `place_bid` — Buy credits at current Dutch auction price
- `close_auction` — Seller reclaims unsold credits after expiry
- Token-2022 credit mints with 6 decimals
- Circle devnet USDC as quote token (legacy SPL, not Token-2022)
- PDA-based vault authority for escrow

**Accounts:**
- `Auction` — Stores seed, seller, credit mint, amounts, prices, timestamps
- `Vault Authority` — PDA that owns the credit vault
- `Credit Vault` — Token account holding escrowed credits

---

## Running Locally

### Prerequisites

- Node.js 20+
- pnpm 9+
- Solana CLI (optional, for devnet interaction)

### Install

```bash
pnpm install
```

### Dev server

```bash
pnpm dev
# http://localhost:3000
```

### Production build

```bash
pnpm build
pnpm start
```

---

## Devnet Setup

To create fresh Token-2022 credit mints and fund your devnet wallet:

```bash
# Ensure you have a devnet wallet with SOL
solana config set --url devnet
solana airdrop 2

# Run the setup script
npx ts-node scripts/setup-devnet.ts
```

This creates:
- One devnet USDC mint (legacy SPL for compatibility)
- One Token-2022 credit mint per provider in `lib/mock/providers.ts`
- Writes addresses to `lib/solana/generated-mints.json`

---

## Testing

```bash
# Run platform tests
npx ts-node scripts/test-platform.ts
```

Tests verify:
- No `mainnet-beta` labels in UI
- No fake program IDs (`7XKxAP`)
- Exchange quote math correctness
- No fake Explorer transactions in preview mode

---

## Key Design Decisions

### Beige Terminal Aesthetic
A deliberate departure from generic dark DeFi UIs. The beige palette (`#f5f1eb` backgrounds, `#5b503d` text) signals serious market infrastructure, not a speculative token swap clone.

### Preview-Only Exchange
The `/exchange` page shows real quote math but explicitly states "Preview only. Backend execution not connected yet." No fake tx hashes, no Explorer links, no misleading success states.

### Wallet Adapter Over Privy
Removed `@privy-io/react-auth` in favor of `@solana/wallet-adapter-react` for direct Phantom/Solflare integration. More transparent, fewer dependencies, no embedded wallet abstraction.

### Token-2022 for Credits
Credit tokens use Token-2022 (not legacy SPL) to enable future extensions: transfer hooks for royalty, metadata, or usage tracking. USDC remains legacy SPL because Circle's devnet USDC is not Token-2022.

### Dutch Auction Pricing
Prices decay linearly from `start_price` to `floor_price` over the auction duration. The on-chain program recomputes the current price deterministically; the frontend mirrors this logic for previews.

---

## Environment Variables

Create `.env.local`:

```env
# Optional: override default devnet RPC
NEXT_PUBLIC_DEVNET_RPC=https://api.devnet.solana.com

# Optional: custom program ID (defaults to IDL-baked ID)
NEXT_PUBLIC_PROGRAM_ID=NcrmnMRfv3fZaqND9P6XtiXhf1dKo6kt2rC3umtRsuH
```

---

## Project Stats

- **Languages:** TypeScript 95%, Rust 4%, CSS 1%
- **Lines of code:** ~15K frontend, ~800 lines Anchor program
- **Dependencies:** 25 production packages
- **Bundle size:** ~180KB gzipped (excluding wallet adapter)

---

## License

MIT © 2026 Prax Labs

---

## Contributing

This is an active prototype. Areas needing work:

- [ ] Backend swap endpoint for `/exchange` (move from preview to real execution)
- [ ] Seller API key verification (currently simulated)
- [ ] Real liquidity pools (currently hidden from UI)
- [ ] Route execution (currently comparison only)
- [ ] Mainnet migration path
- [ ] Credit token redemption mechanism (burn credits → API key access)

Open an issue or PR on [GitHub](https://github.com/0xtigerclaw/prax).
