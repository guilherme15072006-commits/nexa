/**
 * NEXA Gamification System
 *
 * Dominio independente. XP, niveis, badges, missoes, temporadas, battle pass.
 *
 * Modulos internos:
 * - xpEngine      → Calculo de XP, level up, curva exponencial
 * - badgeManager  → Desbloqueio, raridade, progress tracking
 * - missionEngine → Daily/weekly/hidden missions
 * - seasonManager → Battle pass, rank rewards, auto-reset
 * - streakTracker → Daily check-in, streak risk
 *
 * Uso: import { gamificationSystem } from './services/gamification';
 */

import { auditLog } from '../security/auditLog';

// ─── Types ──────────────────────────────────────────────────

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface XPGain {
  amount: number;
  source: string;
  leveledUp: boolean;
  newLevel: number | null;
}

export interface BadgeUnlock {
  id: string;
  title: string;
  icon: string;
  rarity: BadgeRarity;
}

export interface MissionProgress {
  missionId: string;
  progress: number;
  target: number;
  completed: boolean;
  reward: { xp: number; coins: number };
}

// ─── XP Engine ──────────────────────────────────────────────

class XPEngine {
  /** Calculate XP needed for a level */
  xpForLevel(level: number): number {
    return Math.round(500 * Math.pow(1.4, level - 1));
  }

  /** Calculate level from total XP */
  levelFromXP(totalXP: number): { level: number; currentXP: number; xpToNext: number } {
    let level = 1;
    let remaining = totalXP;
    while (remaining >= this.xpForLevel(level)) {
      remaining -= this.xpForLevel(level);
      level++;
    }
    return { level, currentXP: remaining, xpToNext: this.xpForLevel(level) };
  }

  /** Add XP and check level up */
  addXP(userId: string, currentXP: number, currentLevel: number, xpToNext: number, amount: number, source: string): XPGain {
    const newXP = currentXP + amount;
    const leveledUp = newXP >= xpToNext;
    const newLevel = leveledUp ? currentLevel + 1 : currentLevel;

    auditLog.log({ userId, action: 'bet_placed' as any, resource: 'gamification', detail: { xpGained: amount, source, leveledUp, newLevel }, result: 'success' });

    return { amount, source, leveledUp, newLevel: leveledUp ? newLevel : null };
  }
}

// ─── Badge Manager ──────────────────────────────────────────

class BadgeManager {
  private readonly RARITY_XP_BONUS: Record<BadgeRarity, number> = {
    common: 50, rare: 150, epic: 300, legendary: 500,
  };

  /** Get XP bonus for unlocking a badge */
  getXPBonus(rarity: BadgeRarity): number {
    return this.RARITY_XP_BONUS[rarity];
  }

  /** Check if badge unlock conditions are met */
  checkUnlock(badgeId: string, conditions: Record<string, number>, userStats: Record<string, number>): boolean {
    return Object.entries(conditions).every(([key, target]) => (userStats[key] ?? 0) >= target);
  }
}

// ─── Mission Engine ─────────────────────────────────────────

class MissionEngine {
  /** Update mission progress */
  updateProgress(mission: { id: string; progress: number; target: number; completed: boolean; xpReward: number; coinsReward: number }, increment: number): MissionProgress {
    const newProgress = Math.min(mission.progress + increment, mission.target);
    const completed = newProgress >= mission.target && !mission.completed;

    if (completed) {
      auditLog.log({ action: 'penalty_applied' as any, resource: 'gamification', detail: { missionId: mission.id, reward: { xp: mission.xpReward, coins: mission.coinsReward } }, result: 'success' });
    }

    return {
      missionId: mission.id,
      progress: newProgress,
      target: mission.target,
      completed,
      reward: { xp: mission.xpReward, coins: mission.coinsReward },
    };
  }
}

// ─── Season Manager ─────────────────────────────────────────

class SeasonManager {
  /** Calculate battle pass level from season XP */
  getLevel(seasonXP: number, tiers: Array<{ level: number; xpRequired: number }>): number {
    let level = 0;
    for (const tier of tiers) {
      if (seasonXP >= tier.xpRequired) level = tier.level;
    }
    return level;
  }

  /** Check if season tier is claimable */
  canClaim(seasonXP: number, tierXPRequired: number, alreadyClaimed: boolean): boolean {
    return seasonXP >= tierXPRequired && !alreadyClaimed;
  }

  /** Get rank tier based on position */
  getRankTier(rank: number, tiers: Array<{ rankMin: number; rankMax: number; tier: string }>): string {
    const found = tiers.find(t => rank >= t.rankMin && rank <= t.rankMax);
    return found?.tier ?? 'Participante';
  }
}

// ─── Streak Tracker ─────────────────────────────────────────

class StreakTracker {
  /** Check if streak is at risk (not checked in today) */
  isAtRisk(lastCheckinDate: string | null, currentStreak: number): boolean {
    if (currentStreak === 0) return false;
    if (!lastCheckinDate) return true;
    const today = new Date().toISOString().slice(0, 10);
    return lastCheckinDate !== today;
  }

  /** Calculate streak reward (escalating) */
  getReward(streak: number): { xp: number; coins: number } {
    const base = { xp: 50, coins: 100 };
    const multiplier = Math.min(streak / 7, 3); // max 3x at 21 days
    return { xp: Math.round(base.xp * (1 + multiplier * 0.5)), coins: Math.round(base.coins * (1 + multiplier * 0.3)) };
  }
}

// ─── Orchestrator ───────────────────────────────────────────

class GamificationSystem {
  readonly xp = new XPEngine();
  readonly badges = new BadgeManager();
  readonly missions = new MissionEngine();
  readonly seasons = new SeasonManager();
  readonly streaks = new StreakTracker();
}

export const gamificationSystem = new GamificationSystem();
