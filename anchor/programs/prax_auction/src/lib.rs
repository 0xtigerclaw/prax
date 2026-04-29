// Prax — Dutch auction program for inference credit tokens.
//
// Scope (this file): happy path only.
//   1. `create_auction` — seller escrows `credit_amount` of a Token-2022
//      credit mint and commits (start_price, floor_price, start_ts,
//      duration_secs). Price is measured in USDC atoms per credit atom.
//   2. `place_bid` — buyer pays the *current* auction price (computed from
//      on-chain clock, linear decay between start_price and floor_price),
//      receives the credits, seller receives USDC. One bid fills the
//      whole auction; partial fills are out of scope.
//   3. `close_auction` — after expiry with no bid, seller reclaims the
//      escrowed credits. Only callable by the seller.
//
// Deliberate omissions (TODO in follow-up sessions):
//   - Partial fills.
//   - Cancel-before-bid.
//   - Protocol fee / treasury cut.
//   - Price-curve shapes other than linear.
//   - Oracle-gated USDC mint whitelist.

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
    },
};

declare_id!("NcrmnMRfv3fZaqND9P6XtiXhf1dKo6kt2rC3umtRsuH");

#[program]
pub mod prax_auction {
    use super::*;

    pub fn create_auction(
        ctx: Context<CreateAuction>,
        auction_seed: u64,
        credit_amount: u64,
        start_price: u64,
        floor_price: u64,
        duration_secs: i64,
    ) -> Result<()> {
        require!(credit_amount > 0, PraxError::ZeroAmount);
        require!(start_price > floor_price, PraxError::BadPriceCurve);
        require!(floor_price > 0, PraxError::BadPriceCurve);
        require!(
            duration_secs > 0 && duration_secs <= 7 * 24 * 3600,
            PraxError::BadDuration
        );

        let now = Clock::get()?.unix_timestamp;
        let a = &mut ctx.accounts.auction;
        a.seed = auction_seed;
        a.seller = ctx.accounts.seller.key();
        a.credit_mint = ctx.accounts.credit_mint.key();
        a.quote_mint = ctx.accounts.quote_mint.key();
        a.credit_amount = credit_amount;
        a.start_price = start_price;
        a.floor_price = floor_price;
        a.start_ts = now;
        a.duration_secs = duration_secs;
        a.filled = false;
        a.bump = ctx.bumps.auction;
        a.vault_bump = ctx.bumps.credit_vault_authority;

        // Pull credits from seller into the auction's vault ATA.
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.seller_credit_ata.to_account_info(),
            mint: ctx.accounts.credit_mint.to_account_info(),
            to: ctx.accounts.credit_vault.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        transfer_checked(
            CpiContext::new(
                ctx.accounts.credit_token_program.key(),
                cpi_accounts,
            ),
            credit_amount,
            ctx.accounts.credit_mint.decimals,
        )?;

        emit!(AuctionCreated {
            auction: a.key(),
            seller: a.seller,
            credit_mint: a.credit_mint,
            quote_mint: a.quote_mint,
            credit_amount,
            start_price,
            floor_price,
            start_ts: now,
            duration_secs,
        });
        Ok(())
    }

    pub fn place_bid(ctx: Context<PlaceBid>) -> Result<()> {
        let a = &mut ctx.accounts.auction;
        require!(!a.filled, PraxError::AlreadyFilled);

        let now = Clock::get()?.unix_timestamp;
        let price_per_credit = current_price(a, now);
        let total_quote = (price_per_credit as u128)
            .checked_mul(a.credit_amount as u128)
            .ok_or(PraxError::MathOverflow)?;
        // price is quote-atoms per credit-atom; divide by 10^credit_decimals
        // so the buyer pays a reasonable total.
        let credit_decimals = ctx.accounts.credit_mint.decimals as u32;
        let divisor = 10u128
            .checked_pow(credit_decimals)
            .ok_or(PraxError::MathOverflow)?;
        let total_quote = total_quote
            .checked_div(divisor)
            .ok_or(PraxError::MathOverflow)? as u64;
        require!(total_quote > 0, PraxError::ZeroAmount);

        // Buyer → Seller: USDC (quote).
        let quote_cpi = TransferChecked {
            from: ctx.accounts.buyer_quote_ata.to_account_info(),
            mint: ctx.accounts.quote_mint.to_account_info(),
            to: ctx.accounts.seller_quote_ata.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        transfer_checked(
            CpiContext::new(
                ctx.accounts.quote_token_program.key(),
                quote_cpi,
            ),
            total_quote,
            ctx.accounts.quote_mint.decimals,
        )?;

        // Vault → Buyer: credits. Auction PDA signs.
        let auction_key = a.key();
        let seeds: &[&[u8]] = &[
            b"vault",
            auction_key.as_ref(),
            &[a.vault_bump],
        ];
        let signer_seeds: &[&[&[u8]]] = &[seeds];

        let credit_cpi = TransferChecked {
            from: ctx.accounts.credit_vault.to_account_info(),
            mint: ctx.accounts.credit_mint.to_account_info(),
            to: ctx.accounts.buyer_credit_ata.to_account_info(),
            authority: ctx.accounts.credit_vault_authority.to_account_info(),
        };
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.credit_token_program.key(),
                credit_cpi,
                signer_seeds,
            ),
            a.credit_amount,
            ctx.accounts.credit_mint.decimals,
        )?;

        a.filled = true;
        a.fill_ts = now;
        a.fill_price = price_per_credit;

        emit!(AuctionFilled {
            auction: auction_key,
            buyer: ctx.accounts.buyer.key(),
            fill_ts: now,
            fill_price: price_per_credit,
            total_quote,
        });
        Ok(())
    }

    pub fn close_auction(ctx: Context<CloseAuction>) -> Result<()> {
        let a = &ctx.accounts.auction;
        require!(!a.filled, PraxError::AlreadyFilled);
        let now = Clock::get()?.unix_timestamp;
        require!(
            now >= a.start_ts + a.duration_secs,
            PraxError::NotYetExpired
        );

        // Return remaining credits to seller.
        let auction_key = a.key();
        let seeds: &[&[u8]] = &[
            b"vault",
            auction_key.as_ref(),
            &[a.vault_bump],
        ];
        let signer_seeds: &[&[&[u8]]] = &[seeds];

        let cpi = TransferChecked {
            from: ctx.accounts.credit_vault.to_account_info(),
            mint: ctx.accounts.credit_mint.to_account_info(),
            to: ctx.accounts.seller_credit_ata.to_account_info(),
            authority: ctx.accounts.credit_vault_authority.to_account_info(),
        };
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.credit_token_program.key(),
                cpi,
                signer_seeds,
            ),
            a.credit_amount,
            ctx.accounts.credit_mint.decimals,
        )?;

        emit!(AuctionClosed {
            auction: auction_key,
            ts: now,
        });
        Ok(())
    }
}

/// Linear decay: at t=0, price = start_price; at t=duration, price = floor.
/// After expiry, price stays at floor.
fn current_price(a: &Auction, now: i64) -> u64 {
    if now <= a.start_ts {
        return a.start_price;
    }
    let elapsed = (now - a.start_ts) as i128;
    let dur = a.duration_secs as i128;
    if elapsed >= dur {
        return a.floor_price;
    }
    let spread = (a.start_price as i128) - (a.floor_price as i128);
    // price = start - spread * elapsed / dur
    let drop = spread * elapsed / dur;
    ((a.start_price as i128) - drop) as u64
}

// ───────────────────────────── accounts ──────────────────────────────

#[derive(Accounts)]
#[instruction(auction_seed: u64)]
pub struct CreateAuction<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        init,
        payer = seller,
        space = 8 + Auction::SIZE,
        seeds = [b"auction", seller.key().as_ref(), &auction_seed.to_le_bytes()],
        bump,
    )]
    pub auction: Box<Account<'info, Auction>>,

    pub credit_mint: Box<InterfaceAccount<'info, Mint>>,
    pub quote_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = credit_mint,
        associated_token::authority = seller,
        associated_token::token_program = credit_token_program,
    )]
    pub seller_credit_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: PDA that owns the credit vault ATA. Program-derived, not read.
    #[account(
        seeds = [b"vault", auction.key().as_ref()],
        bump,
    )]
    pub credit_vault_authority: UncheckedAccount<'info>,

    #[account(
        init,
        payer = seller,
        associated_token::mint = credit_mint,
        associated_token::authority = credit_vault_authority,
        associated_token::token_program = credit_token_program,
    )]
    pub credit_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    pub credit_token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"auction",
            auction.seller.as_ref(),
            &auction.seed.to_le_bytes(),
        ],
        bump = auction.bump,
    )]
    pub auction: Box<Account<'info, Auction>>,

    #[account(address = auction.credit_mint)]
    pub credit_mint: Box<InterfaceAccount<'info, Mint>>,
    #[account(address = auction.quote_mint)]
    pub quote_mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: PDA-derived auth for the vault.
    #[account(
        seeds = [b"vault", auction.key().as_ref()],
        bump = auction.vault_bump,
    )]
    pub credit_vault_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        associated_token::mint = credit_mint,
        associated_token::authority = credit_vault_authority,
        associated_token::token_program = credit_token_program,
    )]
    pub credit_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = credit_mint,
        associated_token::authority = buyer,
        associated_token::token_program = credit_token_program,
    )]
    pub buyer_credit_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = quote_mint,
        associated_token::authority = buyer,
        associated_token::token_program = quote_token_program,
    )]
    pub buyer_quote_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = quote_mint,
        associated_token::authority = seller,
        associated_token::token_program = quote_token_program,
    )]
    pub seller_quote_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: seller pubkey referenced by the auction; used for the ATA.
    #[account(address = auction.seller)]
    pub seller: UncheckedAccount<'info>,

    pub credit_token_program: Interface<'info, TokenInterface>,
    pub quote_token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseAuction<'info> {
    #[account(mut, address = auction.seller)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"auction",
            auction.seller.as_ref(),
            &auction.seed.to_le_bytes(),
        ],
        bump = auction.bump,
        close = seller,
    )]
    pub auction: Box<Account<'info, Auction>>,

    #[account(address = auction.credit_mint)]
    pub credit_mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: PDA vault authority.
    #[account(
        seeds = [b"vault", auction.key().as_ref()],
        bump = auction.vault_bump,
    )]
    pub credit_vault_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        associated_token::mint = credit_mint,
        associated_token::authority = credit_vault_authority,
        associated_token::token_program = credit_token_program,
    )]
    pub credit_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = credit_mint,
        associated_token::authority = seller,
        associated_token::token_program = credit_token_program,
    )]
    pub seller_credit_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    pub credit_token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// ───────────────────────────── state ─────────────────────────────────

#[account]
pub struct Auction {
    pub seed: u64,
    pub seller: Pubkey,
    pub credit_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub credit_amount: u64,
    pub start_price: u64, // quote atoms per 1.0 credit (i.e. per 10^decimals atoms)
    pub floor_price: u64,
    pub start_ts: i64,
    pub duration_secs: i64,
    pub filled: bool,
    pub fill_ts: i64,
    pub fill_price: u64,
    pub bump: u8,
    pub vault_bump: u8,
}

impl Auction {
    // pubkeys 4*32 + u64 5*8 + i64 3*8 + bool 1 + u8 2 = 128+40+24+1+2 = 195
    pub const SIZE: usize = 8 /*seed*/ + 32*4 + 8*5 + 8*3 + 1 + 1 + 1;
}

// ───────────────────────────── events ────────────────────────────────

#[event]
pub struct AuctionCreated {
    pub auction: Pubkey,
    pub seller: Pubkey,
    pub credit_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub credit_amount: u64,
    pub start_price: u64,
    pub floor_price: u64,
    pub start_ts: i64,
    pub duration_secs: i64,
}

#[event]
pub struct AuctionFilled {
    pub auction: Pubkey,
    pub buyer: Pubkey,
    pub fill_ts: i64,
    pub fill_price: u64,
    pub total_quote: u64,
}

#[event]
pub struct AuctionClosed {
    pub auction: Pubkey,
    pub ts: i64,
}

// ───────────────────────────── errors ────────────────────────────────

#[error_code]
pub enum PraxError {
    #[msg("amount must be > 0")]
    ZeroAmount,
    #[msg("start_price must be > floor_price > 0")]
    BadPriceCurve,
    #[msg("duration must be within (0, 7 days]")]
    BadDuration,
    #[msg("auction already filled")]
    AlreadyFilled,
    #[msg("auction not yet expired")]
    NotYetExpired,
    #[msg("math overflow")]
    MathOverflow,
}
