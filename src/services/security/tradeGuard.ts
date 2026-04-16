/**
 * NEXA Security — Trade Guard
 *
 * Modulo independente. Protege transacoes economicas.
 * Hold delays, confirmacao 2FA, limites por reputacao.
 *
 * Consumido por: store (deposit, withdraw, purchaseItem), orchestrator.ts
 * Consome: riskEngine.ts, auditLog.ts
 */

import { auditLog } from './auditLog';
import { riskEngine } from './riskEngine';

// ─── Types ──────────────────────────────────────────────────

export type TradeAction = 'deposit' | 'withdraw' | 'marketplace_buy' | 'marketplace_sell' | 'bet';

export interface TradeCheck {
  allowed: boolean;
  requireMFA: boolean;
  holdMinutes: number;
  reason: string | null;
  riskScore: number;
}

export interface HeldTrade {
  id: string;
  userId: string;
  action: TradeAction;
  amount: number;
  holdUntil: number;
  cancellable: boolean;
  createdAt: number;
}

// ─── Config ─────────────────────────────────────────────────

const HOLD_RULES: Record<TradeAction, Array<{ maxAmount: number; holdMinutes: number; requireMFA: boolean }>> = {
  deposit:          [{ maxAmount: 500, holdMinutes: 0, requireMFA: false }, { maxAmount: 5000, holdMinutes: 0, requireMFA: true }, { maxAmount: Infinity, holdMinutes: 15, requireMFA: true }],
  withdraw:         [{ maxAmount: 200, holdMinutes: 0, requireMFA: true }, { maxAmount: 2000, holdMinutes: 15, requireMFA: true }, { maxAmount: Infinity, holdMinutes: 60, requireMFA: true }],
  marketplace_buy:  [{ maxAmount: 500, holdMinutes: 0, requireMFA: false }, { maxAmount: 5000, holdMinutes: 15, requireMFA: true }, { maxAmount: Infinity, holdMinutes: 60, requireMFA: true }],
  marketplace_sell: [{ maxAmount: Infinity, holdMinutes: 0, requireMFA: false }],
  bet:              [{ maxAmount: 1000, holdMinutes: 0, requireMFA: false }, { maxAmount: Infinity, holdMinutes: 0, requireMFA: true }],
};

// ─── Service ────────────────────────────────────────────────

class TradeGuardService {
  private heldTrades: HeldTrade[] = [];

  /** Check if a trade is allowed and what conditions apply */
  check(userId: string, action: TradeAction, amount: number, mfaEnabled: boolean): TradeCheck {
    // Get risk assessment
    const risk = riskEngine.assessTransaction(userId, amount, mfaEnabled);

    // If risk is critical or extreme, block entirely
    if (risk.score >= 76) {
      auditLog.log({ userId, action: 'trade_held', resource: 'trade_guard', detail: { tradeAction: action, amount, reason: 'risk_score_critical', riskScore: risk.score }, result: 'blocked' });
      return { allowed: false, requireMFA: false, holdMinutes: 0, reason: `Transacao bloqueada por risco elevado (score: ${risk.score})`, riskScore: risk.score };
    }

    // Find applicable hold rule
    const rules = HOLD_RULES[action];
    const rule = rules.find(r => amount <= r.maxAmount) ?? rules[rules.length - 1];

    // Elevate hold if risk is high
    let holdMinutes = rule.holdMinutes;
    if (risk.score >= 51) holdMinutes = Math.max(holdMinutes, 60);
    else if (risk.score >= 21) holdMinutes = Math.max(holdMinutes, 15);

    return {
      allowed: true,
      requireMFA: rule.requireMFA || risk.score >= 21,
      holdMinutes,
      reason: holdMinutes > 0 ? `Transacao segurada por ${holdMinutes} minutos` : null,
      riskScore: risk.score,
    };
  }

  /** Place a trade on hold */
  hold(userId: string, action: TradeAction, amount: number, holdMinutes: number): HeldTrade {
    const trade: HeldTrade = {
      id: `hold_${Date.now()}`,
      userId,
      action,
      amount,
      holdUntil: Date.now() + holdMinutes * 60 * 1000,
      cancellable: true,
      createdAt: Date.now(),
    };
    this.heldTrades.push(trade);
    auditLog.log({ userId, action: 'trade_held', resource: 'trade_guard', detail: { tradeId: trade.id, tradeAction: action, amount, holdMinutes }, result: 'pending' });
    return trade;
  }

  /** Cancel a held trade */
  cancel(tradeId: string): boolean {
    const idx = this.heldTrades.findIndex(t => t.id === tradeId && t.cancellable);
    if (idx < 0) return false;
    const trade = this.heldTrades.splice(idx, 1)[0];
    auditLog.log({ userId: trade.userId, action: 'trade_cancelled', resource: 'trade_guard', detail: { tradeId, tradeAction: trade.action, amount: trade.amount }, result: 'success' });
    return true;
  }

  /** Check if a held trade is ready for release */
  isReady(tradeId: string): boolean {
    const trade = this.heldTrades.find(t => t.id === tradeId);
    return trade ? Date.now() >= trade.holdUntil : false;
  }

  /** Get pending held trades for user */
  getPending(userId: string): HeldTrade[] {
    return this.heldTrades.filter(t => t.userId === userId && Date.now() < t.holdUntil);
  }
}

export const tradeGuard = new TradeGuardService();
