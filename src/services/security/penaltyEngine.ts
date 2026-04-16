/**
 * NEXA Security — Penalty Engine
 *
 * Modulo independente. Aplica penalidades graduais.
 * Niveis: aviso → restricao → suspensao → ban.
 * Shadow ban para investigacao silenciosa.
 *
 * Consumido por: orchestrator.ts, antiCheat.ts, reportSystem.ts
 * Consome: auditLog.ts
 */

import { auditLog } from './auditLog';

// ─── Types ──────────────────────────────────────────────────

export type PenaltyLevel = 0 | 1 | 2 | 3 | 4;
export type PenaltyType = 'warning' | 'restriction' | 'severe_restriction' | 'suspension' | 'ban' | 'shadow_ban';

export interface UserRestrictions {
  canBet: boolean;
  canDeposit: boolean;
  canWithdraw: boolean;      // NEVER fully block (legal obligation)
  canChat: boolean;
  canCreateContent: boolean;
  canTrade: boolean;
  maxBetAmount: number | null;
  tradeHoldMinutes: number;
}

export interface Penalty {
  id: string;
  userId: string;
  level: PenaltyLevel;
  type: PenaltyType;
  reason: string;
  restrictions: UserRestrictions;
  expiresAt: number | null;  // null = permanent
  appealable: boolean;
  createdAt: number;
}

// ─── Penalty templates ──────────────────────────────────────

const NO_RESTRICTIONS: UserRestrictions = { canBet: true, canDeposit: true, canWithdraw: true, canChat: true, canCreateContent: true, canTrade: true, maxBetAmount: null, tradeHoldMinutes: 0 };

const PENALTY_TEMPLATES: Record<PenaltyLevel, { type: PenaltyType; durationMs: number | null; restrictions: UserRestrictions; appealable: boolean }> = {
  0: { type: 'warning', durationMs: null, restrictions: NO_RESTRICTIONS, appealable: false },
  1: { type: 'restriction', durationMs: 7 * 24 * 3600_000, restrictions: { ...NO_RESTRICTIONS, canChat: false, canCreateContent: false }, appealable: true },
  2: { type: 'severe_restriction', durationMs: 30 * 24 * 3600_000, restrictions: { ...NO_RESTRICTIONS, canChat: false, canCreateContent: false, canTrade: false, maxBetAmount: 100, tradeHoldMinutes: 1440 }, appealable: true },
  3: { type: 'suspension', durationMs: 90 * 24 * 3600_000, restrictions: { canBet: false, canDeposit: false, canWithdraw: true, canChat: false, canCreateContent: false, canTrade: false, maxBetAmount: 0, tradeHoldMinutes: 0 }, appealable: true },
  4: { type: 'ban', durationMs: null, restrictions: { canBet: false, canDeposit: false, canWithdraw: true, canChat: false, canCreateContent: false, canTrade: false, maxBetAmount: 0, tradeHoldMinutes: 0 }, appealable: false },
};

// ─── Service ────────────────────────────────────────────────

class PenaltyEngineService {
  private penalties: Penalty[] = [];
  private shadowBans = new Set<string>();

  /** Apply a penalty to a user */
  apply(userId: string, level: PenaltyLevel, reason: string): Penalty {
    const template = PENALTY_TEMPLATES[level];
    const penalty: Penalty = {
      id: `pen_${Date.now()}`,
      userId,
      level,
      type: template.type,
      reason,
      restrictions: template.restrictions,
      expiresAt: template.durationMs ? Date.now() + template.durationMs : null,
      appealable: template.appealable,
      createdAt: Date.now(),
    };

    this.penalties.push(penalty);
    auditLog.log({ userId, action: 'penalty_applied', resource: 'penalty_engine', detail: { penaltyId: penalty.id, level, type: template.type, reason, expiresAt: penalty.expiresAt }, result: 'success' });
    return penalty;
  }

  /** Apply shadow ban (invisible to user) */
  shadowBan(userId: string, reason: string): void {
    this.shadowBans.add(userId);
    auditLog.log({ userId, action: 'penalty_applied', resource: 'penalty_engine', detail: { type: 'shadow_ban', reason }, result: 'success' });
  }

  /** Remove shadow ban */
  removeShadowBan(userId: string): void {
    this.shadowBans.delete(userId);
  }

  /** Check if user is shadow banned */
  isShadowBanned(userId: string): boolean {
    return this.shadowBans.has(userId);
  }

  /** Get active restrictions for user (merges all active penalties) */
  getRestrictions(userId: string): UserRestrictions {
    const now = Date.now();
    const active = this.penalties.filter(p => p.userId === userId && (p.expiresAt === null || p.expiresAt > now));

    if (active.length === 0) return { ...NO_RESTRICTIONS };

    // Most restrictive wins
    return {
      canBet: active.every(p => p.restrictions.canBet),
      canDeposit: active.every(p => p.restrictions.canDeposit),
      canWithdraw: true, // ALWAYS true (legal)
      canChat: active.every(p => p.restrictions.canChat),
      canCreateContent: active.every(p => p.restrictions.canCreateContent),
      canTrade: active.every(p => p.restrictions.canTrade),
      maxBetAmount: Math.min(...active.filter(p => p.restrictions.maxBetAmount !== null).map(p => p.restrictions.maxBetAmount!), Infinity) || null,
      tradeHoldMinutes: Math.max(...active.map(p => p.restrictions.tradeHoldMinutes), 0),
    };
  }

  /** Get active penalties for user */
  getActivePenalties(userId: string): Penalty[] {
    const now = Date.now();
    return this.penalties.filter(p => p.userId === userId && (p.expiresAt === null || p.expiresAt > now));
  }

  /** Get penalty history */
  getHistory(userId: string): Penalty[] {
    return this.penalties.filter(p => p.userId === userId);
  }

  /** Check and expire old penalties */
  checkExpired(): void {
    const now = Date.now();
    this.penalties.filter(p => p.expiresAt && p.expiresAt <= now).forEach(p => {
      auditLog.log({ userId: p.userId, action: 'penalty_expired', resource: 'penalty_engine', detail: { penaltyId: p.id, type: p.type, level: p.level }, result: 'success' });
    });
  }

  /** Count previous penalties (for escalation) */
  getPenaltyCount(userId: string): number {
    return this.penalties.filter(p => p.userId === userId).length;
  }
}

export const penaltyEngine = new PenaltyEngineService();
