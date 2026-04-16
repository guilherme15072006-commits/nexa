/**
 * NEXA Live — Betting Engine
 *
 * Real-time betting durante streams. Odds atualizam a cada 5-10s.
 * Quick bet: 1 tap para apostar. Copy bet do streamer.
 * Urgency system: "closing soon" → "last chance" → "locked"
 *
 * Referencia: Bet365 in-play + Twitch channel points
 */

import type { LiveBetMarket, LiveBetOption, LiveBetEvent, LiveCopyBet, StreamerPick, BetUrgency } from './liveState';
import { auditLog } from '../security/auditLog';

// ─── Types ──────────────────────────────────────────────────

export interface QuickBetResult {
  success: boolean;
  betId: string | null;
  error: string | null;
  xpGained: number;
}

// ─── Config ─────────────────────────────────────────────────

const ODDS_UPDATE_INTERVAL = 8_000;     // 8s
const URGENCY_WARNING_SEC = 120;         // 2min before close → "closing_soon"
const URGENCY_LAST_CHANCE_SEC = 30;      // 30s → "last_chance"
const COPY_BET_WINDOW_SEC = 60;          // 60s after streamer pick to copy
const XP_PER_LIVE_BET = 15;
const XP_PER_COPY_BET = 25;
const XP_PER_WIN = 50;

// ─── Service ────────────────────────────────────────────────

class LiveBettingService {
  private markets: LiveBetMarket[] = [];
  private recentBets: LiveBetEvent[] = [];
  private oddsTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Array<(markets: LiveBetMarket[]) => void> = [];
  private betListeners: Array<(bet: LiveBetEvent) => void> = [];

  // ── Market management ─────────────────────────────────────

  /** Set active markets for current stream */
  setMarkets(markets: LiveBetMarket[]): void {
    this.markets = markets;
    this.notifyMarkets();
  }

  /** Get current markets */
  getMarkets(): LiveBetMarket[] {
    return this.markets;
  }

  /** Subscribe to market updates */
  onMarketsUpdate(listener: (markets: LiveBetMarket[]) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  /** Subscribe to new bets (for social proof feed) */
  onBetPlaced(listener: (bet: LiveBetEvent) => void): () => void {
    this.betListeners.push(listener);
    return () => { this.betListeners = this.betListeners.filter(l => l !== listener); };
  }

  private notifyMarkets(): void {
    this.listeners.forEach(l => l(this.markets));
  }

  // ── Odds simulation (replaced by real data in production) ─

  /** Start odds update loop */
  startOddsUpdates(): void {
    if (this.oddsTimer) return;
    this.oddsTimer = setInterval(() => this.tickOdds(), ODDS_UPDATE_INTERVAL);
  }

  stopOddsUpdates(): void {
    if (this.oddsTimer) { clearInterval(this.oddsTimer); this.oddsTimer = null; }
  }

  private tickOdds(): void {
    const now = Date.now();
    this.markets = this.markets.map(market => {
      // Update urgency
      let urgency: BetUrgency = 'normal';
      if (market.closesAt) {
        const secsLeft = (market.closesAt - now) / 1000;
        if (secsLeft <= 0) urgency = 'locked';
        else if (secsLeft <= URGENCY_LAST_CHANCE_SEC) urgency = 'last_chance';
        else if (secsLeft <= URGENCY_WARNING_SEC) urgency = 'closing_soon';
      }

      // Simulate odds movement
      const options = market.options.map(opt => {
        const variation = (Math.random() - 0.5) * 0.1;
        const newOdds = Math.max(1.01, +(opt.odds + variation).toFixed(2));
        const movement = newOdds > opt.odds ? 1 : newOdds < opt.odds ? -1 : 0;
        return { ...opt, odds: newOdds, movement } as LiveBetOption;
      });

      return { ...market, options, urgency, bettorsCount: market.bettorsCount + Math.floor(Math.random() * 3) };
    });
    this.notifyMarkets();
  }

  // ── Bet placement ─────────────────────────────────────────

  /** Quick bet — 1 tap */
  quickBet(params: {
    userId: string;
    username: string;
    userLevel: number;
    userTier: string;
    marketId: string;
    optionId: string;
    stake: number;
    matchLabel: string;
  }): QuickBetResult {
    const market = this.markets.find(m => m.id === params.marketId);
    if (!market) return { success: false, betId: null, error: 'Mercado nao encontrado', xpGained: 0 };

    if (market.urgency === 'locked') {
      return { success: false, betId: null, error: 'Mercado fechado', xpGained: 0 };
    }

    const option = market.options.find(o => o.id === params.optionId);
    if (!option) return { success: false, betId: null, error: 'Opcao nao encontrada', xpGained: 0 };

    const betId = `lbet_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const betEvent: LiveBetEvent = {
      id: betId,
      userId: params.userId,
      username: params.username,
      userLevel: params.userLevel,
      userTier: params.userTier,
      side: option.label,
      odds: option.odds,
      stake: params.stake,
      matchLabel: params.matchLabel,
      timestamp: Date.now(),
      isCopy: false,
    };

    this.recentBets.unshift(betEvent);
    if (this.recentBets.length > 50) this.recentBets = this.recentBets.slice(0, 50);

    // Notify listeners (chat feed, social proof)
    this.betListeners.forEach(l => l(betEvent));

    auditLog.log({ userId: params.userId, action: 'bet_placed', resource: 'live_arena', detail: { marketId: params.marketId, side: option.label, odds: option.odds, stake: params.stake }, result: 'success' });

    return { success: true, betId, error: null, xpGained: XP_PER_LIVE_BET };
  }

  // ── Copy bet ──────────────────────────────────────────────

  /** Copy a streamer's pick */
  copyBet(params: {
    userId: string;
    username: string;
    userLevel: number;
    userTier: string;
    pick: StreamerPick;
    stake: number;
  }): QuickBetResult {
    const betId = `lcopy_${Date.now()}`;

    const betEvent: LiveBetEvent = {
      id: betId,
      userId: params.userId,
      username: params.username,
      userLevel: params.userLevel,
      userTier: params.userTier,
      side: params.pick.side,
      odds: params.pick.odds,
      stake: params.stake,
      matchLabel: params.pick.matchLabel,
      timestamp: Date.now(),
      isCopy: true,
    };

    this.recentBets.unshift(betEvent);
    this.betListeners.forEach(l => l(betEvent));

    auditLog.log({ userId: params.userId, action: 'bet_placed', resource: 'live_copy', detail: { pickId: params.pick.id, streamer: params.pick.matchLabel, odds: params.pick.odds, stake: params.stake }, result: 'success' });

    return { success: true, betId, error: null, xpGained: XP_PER_COPY_BET };
  }

  /** Get recent bets (social proof feed) */
  getRecentBets(): LiveBetEvent[] {
    return this.recentBets;
  }
}

export const liveBetting = new LiveBettingService();
