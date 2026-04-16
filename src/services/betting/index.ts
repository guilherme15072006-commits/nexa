/**
 * NEXA Betting System
 *
 * Dominio independente. Gerencia odds, apostas e partidas.
 *
 * Modulos internos:
 * - oddsEngine    → Polling/simulacao de odds em tempo real
 * - betValidator  → Validacao pre-aposta (saldo, limites, cooldown)
 * - matchTracker  → Estado das partidas ao vivo
 *
 * Uso: import { bettingSystem } from './services/betting';
 */

import { auditLog } from '../security/auditLog';
import { tradeGuard } from '../security/tradeGuard';
import { penaltyEngine } from '../security/penaltyEngine';

// ─── Types ──────────────────────────────────────────────────

export interface BetValidation {
  allowed: boolean;
  requireMFA: boolean;
  warnings: string[];
  blockedReason: string | null;
}

export interface OddsUpdate {
  matchId: string;
  home: number;
  draw: number;
  away: number;
  movement: { home: -1 | 0 | 1; draw: -1 | 0 | 1; away: -1 | 0 | 1 };
}

// ─── Odds Engine ────────────────────────────────────────────

class OddsEngine {
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Array<(update: OddsUpdate) => void> = [];

  onUpdate(listener: (update: OddsUpdate) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  start(intervalMs = 360_000): void {
    if (this.pollTimer) return;
    this.pollTimer = setInterval(() => this.tick(), intervalMs);
  }

  stop(): void {
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
  }

  private async tick(): Promise<void> {
    try {
      const { ENV } = require('../../config/env');
      if (ENV.USE_REAL_ODDS) {
        const { getSoccerOdds } = require('../oddsApi');
        const odds = await getSoccerOdds();
        odds.forEach((o: any) => {
          const update: OddsUpdate = {
            matchId: o.matchId,
            home: o.homeOdds, draw: o.drawOdds, away: o.awayOdds,
            movement: { home: 0, draw: 0, away: 0 },
          };
          this.listeners.forEach(l => l(update));
        });
      }
    } catch { /* silent fail, retry next tick */ }
  }
}

// ─── Bet Validator ──────────────────────────────────────────

class BetValidator {
  validate(userId: string, stake: number, userBalance: number, mfaEnabled: boolean): BetValidation {
    const warnings: string[] = [];

    // Check penalties
    const restrictions = penaltyEngine.getRestrictions(userId);
    if (!restrictions.canBet) {
      return { allowed: false, requireMFA: false, warnings: [], blockedReason: 'Conta restrita. Apostas bloqueadas.' };
    }

    // Check max bet amount
    if (restrictions.maxBetAmount !== null && stake > restrictions.maxBetAmount) {
      return { allowed: false, requireMFA: false, warnings: [], blockedReason: `Limite maximo de aposta: R$${restrictions.maxBetAmount}` };
    }

    // Check balance
    if (userBalance < stake) {
      return { allowed: false, requireMFA: false, warnings: [], blockedReason: 'Saldo insuficiente' };
    }

    // Check trade guard
    const tradeCheck = tradeGuard.check(userId, 'bet', stake, mfaEnabled);
    if (!tradeCheck.allowed) {
      return { allowed: false, requireMFA: false, warnings: [], blockedReason: tradeCheck.reason };
    }

    if (tradeCheck.riskScore >= 21) {
      warnings.push('Risco elevado detectado nesta sessao');
    }

    return { allowed: true, requireMFA: tradeCheck.requireMFA, warnings, blockedReason: null };
  }
}

// ─── Orchestrator ───────────────────────────────────────────

class BettingSystem {
  readonly odds = new OddsEngine();
  readonly validator = new BetValidator();

  /** Initialize betting system */
  init(): void {
    this.odds.start();
  }

  /** Validate and log a bet */
  placeBet(userId: string, matchId: string, side: string, odds: number, stake: number, balance: number): BetValidation {
    const validation = this.validator.validate(userId, stake, balance, false);

    if (validation.allowed) {
      auditLog.log({ userId, action: 'bet_placed', resource: 'betting', detail: { matchId, side, odds, stake }, result: 'success' });
    } else {
      auditLog.log({ userId, action: 'bet_blocked', resource: 'betting', detail: { matchId, side, odds, stake, reason: validation.blockedReason }, result: 'blocked' });
    }

    return validation;
  }

  /** Shutdown */
  shutdown(): void {
    this.odds.stop();
  }
}

export const bettingSystem = new BettingSystem();
