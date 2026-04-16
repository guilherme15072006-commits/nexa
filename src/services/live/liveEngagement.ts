/**
 * NEXA Live — Engagement Engine
 *
 * Sistema psicologico da Live Arena. Cria a sensacao de:
 * "Eu PRECISO ficar aqui."
 *
 * Mecanicas:
 * - XP multiplicador por tempo assistindo
 * - Watch streak (minutos consecutivos)
 * - Live-only missions (so durante a stream)
 * - Momentum indicator (hot/cold/on_fire)
 * - Social proof feed (quem esta apostando)
 * - Near-win feedback
 * - Urgency (time-limited bets)
 *
 * Balance: adaptive system previne burnout (detecta frustacao)
 *
 * Referencia: Twitch drops + Duolingo streaks + Trading momentum
 */

import type { LiveMission, LivePoll, MomentumState, LiveBigWin } from './liveState';
import { auditLog } from '../security/auditLog';

// ─── Config ─────────────────────────────────────────────────

const XP_PER_MINUTE_WATCHING = 5;
const XP_MULTIPLIER_BREAKPOINTS = [
  { minutes: 0, multiplier: 1.0 },
  { minutes: 5, multiplier: 1.2 },
  { minutes: 15, multiplier: 1.5 },
  { minutes: 30, multiplier: 2.0 },
  { minutes: 60, multiplier: 2.5 },
];

const MOMENTUM_THRESHOLDS = {
  cold: 0,
  warming: 2,       // 2+ bets placed
  hot: 5,           // 5+ bets OR 2+ wins
  on_fire: 10,      // 10+ bets OR 3+ wins OR win streak 3
};

// ─── Service ────────────────────────────────────────────────

class LiveEngagementService {
  private watchStart: number | null = null;
  private minutesWatched = 0;
  private betsThisStream = 0;
  private winsThisStream = 0;
  private winStreak = 0;
  private xpAccumulated = 0;
  private missions: LiveMission[] = [];
  private polls: LivePoll[] = [];
  private bigWins: LiveBigWin[] = [];
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Array<(event: EngagementEvent) => void> = [];

  // ── Event system ──────────────────────────────────────────

  onEvent(listener: (event: EngagementEvent) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  private emit(event: EngagementEvent): void {
    this.listeners.forEach(l => l(event));
  }

  // ── Lifecycle ─────────────────────────────────────────────

  /** Start tracking when user enters live arena */
  startWatching(): void {
    this.watchStart = Date.now();
    this.minutesWatched = 0;
    this.betsThisStream = 0;
    this.winsThisStream = 0;
    this.winStreak = 0;
    this.xpAccumulated = 0;

    // Tick every 60s for XP + streak
    this.tickTimer = setInterval(() => this.tick(), 60_000);

    // Generate live missions
    this.missions = this.generateMissions();
    this.emit({ type: 'missions_loaded', missions: this.missions });
  }

  /** Stop tracking when user leaves */
  stopWatching(): { minutesWatched: number; xpEarned: number; bets: number; wins: number } {
    if (this.tickTimer) { clearInterval(this.tickTimer); this.tickTimer = null; }
    const summary = {
      minutesWatched: this.minutesWatched,
      xpEarned: this.xpAccumulated,
      bets: this.betsThisStream,
      wins: this.winsThisStream,
    };
    this.watchStart = null;
    return summary;
  }

  private tick(): void {
    if (!this.watchStart) return;
    this.minutesWatched++;

    // Award XP with multiplier
    const multiplier = this.getCurrentMultiplier();
    const xp = Math.round(XP_PER_MINUTE_WATCHING * multiplier);
    this.xpAccumulated += xp;

    this.emit({ type: 'xp_tick', xp, multiplier, totalXP: this.xpAccumulated, minutesWatched: this.minutesWatched });

    // Check missions
    this.checkMissions();

    // Multiplier milestone
    const prev = this.getMultiplierForMinutes(this.minutesWatched - 1);
    if (multiplier > prev) {
      this.emit({ type: 'multiplier_increased', multiplier, minutesWatched: this.minutesWatched });
    }
  }

  // ── Multiplier ────────────────────────────────────────────

  getCurrentMultiplier(): number {
    return this.getMultiplierForMinutes(this.minutesWatched);
  }

  private getMultiplierForMinutes(minutes: number): number {
    let mult = 1;
    for (const bp of XP_MULTIPLIER_BREAKPOINTS) {
      if (minutes >= bp.minutes) mult = bp.multiplier;
    }
    return mult;
  }

  // ── Momentum ──────────────────────────────────────────────

  getMomentum(): MomentumState {
    const score = this.betsThisStream + (this.winsThisStream * 3) + (this.winStreak * 2);
    if (score >= MOMENTUM_THRESHOLDS.on_fire) return 'on_fire';
    if (score >= MOMENTUM_THRESHOLDS.hot) return 'hot';
    if (score >= MOMENTUM_THRESHOLDS.warming) return 'warming';
    return 'cold';
  }

  /** Record a bet placed during live */
  recordBet(): void {
    this.betsThisStream++;
    this.updateMissionProgress('bets', 1);
    this.emit({ type: 'momentum_changed', momentum: this.getMomentum() });
  }

  /** Record a bet result */
  recordResult(won: boolean, amount?: number): void {
    if (won) {
      this.winsThisStream++;
      this.winStreak++;
      this.updateMissionProgress('wins', 1);
      if (amount && amount >= 100) {
        const bigWin: LiveBigWin = {
          id: `bw_${Date.now()}`,
          username: 'voce',
          userTier: 'pro',
          amount,
          odds: 0,
          matchLabel: '',
          timestamp: Date.now(),
        };
        this.bigWins.push(bigWin);
        this.emit({ type: 'big_win', win: bigWin });
      }
    } else {
      this.winStreak = 0;
    }
    this.emit({ type: 'momentum_changed', momentum: this.getMomentum() });
  }

  // ── Missions ──────────────────────────────────────────────

  private generateMissions(): LiveMission[] {
    const now = Date.now();
    return [
      { id: 'lm1', title: 'Assistir 15 minutos', description: 'Fique na live por 15 min', progress: 0, target: 15, xpReward: 100, coinsReward: 50, expiresAt: now + 3600_000 },
      { id: 'lm2', title: 'Fazer 3 apostas', description: 'Aposte em 3 mercados diferentes', progress: 0, target: 3, xpReward: 150, coinsReward: 75, expiresAt: now + 3600_000 },
      { id: 'lm3', title: 'Copiar 1 pick', description: 'Copie uma analise do streamer', progress: 0, target: 1, xpReward: 80, coinsReward: 40, expiresAt: now + 3600_000 },
      { id: 'lm4', title: 'Enviar 5 mensagens', description: 'Participe do chat', progress: 0, target: 5, xpReward: 60, coinsReward: 30, expiresAt: now + 3600_000 },
    ];
  }

  private updateMissionProgress(type: string, increment: number): void {
    const missionMap: Record<string, string> = { bets: 'lm2', wins: 'lm2', watch: 'lm1', chat: 'lm4', copy: 'lm3' };
    const missionId = missionMap[type];
    if (!missionId) return;

    const mission = this.missions.find(m => m.id === missionId);
    if (!mission || mission.progress >= mission.target) return;

    mission.progress = Math.min(mission.progress + increment, mission.target);
    if (mission.progress >= mission.target) {
      this.emit({ type: 'mission_completed', mission });
    }
  }

  private checkMissions(): void {
    // Watch time mission
    this.updateMissionProgress('watch', 1);
  }

  getMissions(): LiveMission[] {
    return this.missions;
  }

  // ── Polls ─────────────────────────────────────────────────

  createPoll(question: string, options: string[], durationSec: number, createdBy: string): LivePoll {
    const poll: LivePoll = {
      id: `poll_${Date.now()}`,
      question,
      options: options.map(o => ({ label: o, votes: 0, percentage: 0 })),
      totalVotes: 0,
      expiresAt: Date.now() + durationSec * 1000,
      createdBy,
    };
    this.polls.push(poll);
    this.emit({ type: 'poll_created', poll });
    return poll;
  }

  votePoll(pollId: string, optionIndex: number): boolean {
    const poll = this.polls.find(p => p.id === pollId);
    if (!poll || Date.now() > poll.expiresAt) return false;
    if (optionIndex < 0 || optionIndex >= poll.options.length) return false;

    poll.options[optionIndex].votes++;
    poll.totalVotes++;
    poll.options.forEach(o => { o.percentage = poll.totalVotes > 0 ? Math.round((o.votes / poll.totalVotes) * 100) : 0; });
    this.emit({ type: 'poll_updated', poll });
    return true;
  }

  getActivePoll(): LivePoll | null {
    return this.polls.find(p => Date.now() <= p.expiresAt) ?? null;
  }

  // ── Stats ─────────────────────────────────────────────────

  getStats(): { minutesWatched: number; xpEarned: number; bets: number; wins: number; momentum: MomentumState; multiplier: number } {
    return {
      minutesWatched: this.minutesWatched,
      xpEarned: this.xpAccumulated,
      bets: this.betsThisStream,
      wins: this.winsThisStream,
      momentum: this.getMomentum(),
      multiplier: this.getCurrentMultiplier(),
    };
  }
}

// ─── Event Types ────────────────────────────────────────────

type EngagementEvent =
  | { type: 'xp_tick'; xp: number; multiplier: number; totalXP: number; minutesWatched: number }
  | { type: 'multiplier_increased'; multiplier: number; minutesWatched: number }
  | { type: 'momentum_changed'; momentum: MomentumState }
  | { type: 'mission_completed'; mission: LiveMission }
  | { type: 'missions_loaded'; missions: LiveMission[] }
  | { type: 'big_win'; win: LiveBigWin }
  | { type: 'poll_created'; poll: LivePoll }
  | { type: 'poll_updated'; poll: LivePoll };

export type { EngagementEvent };
export const liveEngagement = new LiveEngagementService();
