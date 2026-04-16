/**
 * NEXA Economy System
 *
 * Dominio independente. Wallet, pagamentos, marketplace, creator payouts.
 *
 * Modulos internos:
 * - walletManager    → Saldo, deposito, saque
 * - marketplaceGuard → Comissao 20%, reviews, fraud detection
 * - creatorPayout    → Earnings, payout via Pix
 * - currencyExchange → Coins ↔ BRL conversion
 *
 * Uso: import { economySystem } from './services/economy';
 */

import { auditLog } from '../security/auditLog';
import { tradeGuard, type TradeCheck } from '../security/tradeGuard';
import { penaltyEngine } from '../security/penaltyEngine';

// ─── Types ──────────────────────────────────────────────────

export interface DepositResult {
  allowed: boolean;
  tradeCheck: TradeCheck;
  error: string | null;
}

export interface WithdrawResult {
  allowed: boolean;
  holdMinutes: number;
  error: string | null;
}

export interface MarketplacePurchase {
  allowed: boolean;
  commission: number;
  sellerPayout: number;
  holdMinutes: number;
  error: string | null;
}

// ─── Constants ────────────────────────────���─────────────────

export const MARKETPLACE_COMMISSION_RATE = 0.20;
export const COINS_TO_BRL_RATE = 100; // 100 coins = R$1.00
export const MIN_PAYOUT_COINS = 500;
export const MIN_LISTING_PRICE = 50;

// ─── Wallet Manager ────────────────────────────────────────

class WalletManager {
  /** Validate deposit */
  validateDeposit(userId: string, amount: number, mfaEnabled: boolean): DepositResult {
    const restrictions = penaltyEngine.getRestrictions(userId);
    if (!restrictions.canDeposit) {
      return { allowed: false, tradeCheck: {} as TradeCheck, error: 'Depositos bloqueados' };
    }

    const tradeCheck = tradeGuard.check(userId, 'deposit', amount, mfaEnabled);
    if (!tradeCheck.allowed) {
      return { allowed: false, tradeCheck, error: tradeCheck.reason };
    }

    auditLog.log({ userId, action: 'deposit', resource: 'economy', detail: { amount, method: 'pix' }, result: 'success' });
    return { allowed: true, tradeCheck, error: null };
  }

  /** Validate withdrawal */
  validateWithdraw(userId: string, amount: number, balance: number): WithdrawResult {
    // Withdraw is ALWAYS allowed (legal obligation) but may have holds
    if (balance < amount) {
      return { allowed: false, holdMinutes: 0, error: 'Saldo insuficiente' };
    }

    const tradeCheck = tradeGuard.check(userId, 'withdraw', amount, true);
    auditLog.log({ userId, action: 'withdraw', resource: 'economy', detail: { amount }, result: 'success' });
    return { allowed: true, holdMinutes: tradeCheck.holdMinutes, error: null };
  }
}

// ─── Marketplace Guard ──────────────────────────────────────

class MarketplaceGuard {
  /** Validate marketplace purchase */
  validatePurchase(userId: string, itemPrice: number, userCoins: number): MarketplacePurchase {
    if (userCoins < itemPrice) {
      return { allowed: false, commission: 0, sellerPayout: 0, holdMinutes: 0, error: 'Coins insuficientes' };
    }

    const restrictions = penaltyEngine.getRestrictions(userId);
    if (!restrictions.canTrade) {
      return { allowed: false, commission: 0, sellerPayout: 0, holdMinutes: 0, error: 'Trades bloqueados' };
    }

    const commission = Math.round(itemPrice * MARKETPLACE_COMMISSION_RATE);
    const sellerPayout = itemPrice - commission;
    const tradeCheck = tradeGuard.check(userId, 'marketplace_buy', itemPrice, false);

    auditLog.log({ userId, action: 'trade', resource: 'marketplace', detail: { itemPrice, commission, sellerPayout }, result: 'success' });

    return { allowed: true, commission, sellerPayout, holdMinutes: tradeCheck.holdMinutes, error: null };
  }

  /** Validate listing creation */
  validateListing(userId: string, price: number): { allowed: boolean; error: string | null } {
    if (price < MIN_LISTING_PRICE) {
      return { allowed: false, error: `Preco minimo: ${MIN_LISTING_PRICE} coins` };
    }
    const restrictions = penaltyEngine.getRestrictions(userId);
    if (!restrictions.canCreateContent) {
      return { allowed: false, error: 'Criacao de conteudo restrita' };
    }
    return { allowed: true, error: null };
  }
}

// ─── Creator Payout ─────────────────────────────────────────

class CreatorPayoutManager {
  /** Validate payout request */
  validatePayout(userId: string, coinsAmount: number, availableCoins: number): { allowed: boolean; brlAmount: number; error: string | null } {
    if (coinsAmount < MIN_PAYOUT_COINS) {
      return { allowed: false, brlAmount: 0, error: `Minimo para saque: ${MIN_PAYOUT_COINS} coins (R$${(MIN_PAYOUT_COINS / COINS_TO_BRL_RATE).toFixed(2)})` };
    }
    if (availableCoins < coinsAmount) {
      return { allowed: false, brlAmount: 0, error: 'Saldo de coins insuficiente' };
    }

    const brlAmount = coinsAmount / COINS_TO_BRL_RATE;
    auditLog.log({ userId, action: 'withdraw', resource: 'creator_payout', detail: { coins: coinsAmount, brl: brlAmount }, result: 'success' });
    return { allowed: true, brlAmount, error: null };
  }

  /** Convert coins to BRL */
  coinsToBRL(coins: number): number {
    return coins / COINS_TO_BRL_RATE;
  }

  /** Convert BRL to coins */
  brlToCoins(brl: number): number {
    return Math.round(brl * COINS_TO_BRL_RATE);
  }
}

// ─── Orchestrator ───────────────────────────────────────────

class EconomySystem {
  readonly wallet = new WalletManager();
  readonly marketplace = new MarketplaceGuard();
  readonly creatorPayout = new CreatorPayoutManager();

  /** Get financial summary for a user */
  getSummary(balance: number, coins: number): { balanceBRL: number; coinsValue: number; totalBRL: number } {
    const coinsValue = coins / COINS_TO_BRL_RATE;
    return { balanceBRL: balance, coinsValue, totalBRL: balance + coinsValue };
  }
}

export const economySystem = new EconomySystem();
