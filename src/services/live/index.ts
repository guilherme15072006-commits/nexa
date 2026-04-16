/**
 * NEXA Live — Arena Orchestrator
 *
 * Ponto central do modulo Live. Conecta:
 * - Stream player state
 * - Real-time betting engine
 * - Arena chat (identity-aware)
 * - Engagement system (XP, streaks, missions, momentum)
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │                    LIVE ARENA                            │
 * │                                                          │
 * │  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
 * │  │ Betting  │  │    Chat      │  │   Engagement      │  │
 * │  │ Engine   │  │  (identity)  │  │   (XP, missions)  │  │
 * │  └────┬─────┘  └──────┬───────┘  └─────────┬─────────┘  │
 * │       │               │                    │             │
 * │       └───────────────┼────────────────────┘             │
 * │                       │                                  │
 * │              ┌────────▼─────────┐                        │
 * │              │   Arena State    │                        │
 * │              │   (modelo vivo)  │                        │
 * │              └──────────────────┘                        │
 * └──────────────────────────────────────────────────────────┘
 *
 * Uso:
 *   import { liveArena } from './services/live';
 *   liveArena.joinStream(streamId);
 *   liveArena.quickBet(marketId, optionId, 50);
 *   liveArena.sendChat("Grande jogo!");
 *   liveArena.leaveStream();
 */

// ─── Re-exports ─────────────────────────────────────────────

export { createDefaultArenaState } from './liveState';
export type {
  LiveArenaState, LiveStreamFull, StreamerPick,
  LiveBetMarket, LiveBetOption, LiveBetEvent, LiveBigWin,
  LiveChatMessage, LiveMission, LivePoll,
  MomentumState, BetUrgency, ArenaTab,
} from './liveState';
export { liveBetting, type QuickBetResult } from './liveBetting';
export { liveChat } from './liveChat';
export { liveEngagement, type EngagementEvent } from './liveEngagement';

// ─── Imports ────────────────────────────────────────────────

import { createDefaultArenaState, type LiveArenaState, type LiveStreamFull, type LiveBetMarket } from './liveState';
import { liveBetting } from './liveBetting';
import { liveChat } from './liveChat';
import { liveEngagement } from './liveEngagement';
import { auditLog } from '../security/auditLog';

// ─── Arena Orchestrator ─────────────────────────────────────

class LiveArena {
  private state: LiveArenaState = createDefaultArenaState();
  private userId: string | null = null;
  private username: string = '';
  private userLevel: number = 0;
  private userTier: string = 'free';
  private userRank: number | null = null;

  /** Set user context (call before joining) */
  setUser(params: { userId: string; username: string; level: number; tier: string; rank: number | null }): void {
    this.userId = params.userId;
    this.username = params.username;
    this.userLevel = params.level;
    this.userTier = params.tier;
    this.userRank = params.rank;
  }

  // ── Stream lifecycle ──────────────────────────────────────

  /** Join a live stream */
  joinStream(stream: LiveStreamFull, markets: LiveBetMarket[]): void {
    this.state = createDefaultArenaState();
    this.state.stream = stream;
    this.state.activeBets = markets;
    this.state.viewerCount = stream.viewers;

    // Start all engines
    liveBetting.setMarkets(markets);
    liveBetting.startOddsUpdates();
    liveEngagement.startWatching();

    // Wire betting → chat (social proof)
    liveBetting.onBetPlaced((bet) => {
      liveChat.injectSystemMessage(`${bet.username} apostou ${bet.side} @ ${bet.odds.toFixed(2)}${bet.isCopy ? ' (copy)' : ''}`, 'bet_placed');
      liveEngagement.recordBet();
      this.state.recentBets.unshift(bet);
      if (this.state.recentBets.length > 20) this.state.recentBets = this.state.recentBets.slice(0, 20);
    });

    // Wire engagement → state
    liveEngagement.onEvent((event) => {
      if (event.type === 'momentum_changed') this.state.momentum = event.momentum;
      if (event.type === 'xp_tick') this.state.activeXPMultiplier = event.multiplier;
      if (event.type === 'missions_loaded') this.state.liveMissions = event.missions;
      if (event.type === 'big_win') {
        this.state.bigWins.unshift(event.win);
        liveChat.injectSystemMessage(`BIG WIN! ${event.win.username} ganhou R$${event.win.amount.toFixed(2)}!`, 'big_win');
      }
      if (event.type === 'poll_created') this.state.activePoll = event.poll;
      if (event.type === 'poll_updated') this.state.activePoll = event.poll;
    });

    auditLog.log({ userId: this.userId, action: 'login_success' as any, resource: 'live_arena', detail: { streamId: stream.id, streamer: stream.streamer.username }, result: 'success' });

    liveChat.injectSystemMessage(`${this.username} entrou na arena`);
  }

  /** Leave current stream */
  leaveStream(): { minutesWatched: number; xpEarned: number; bets: number; wins: number } | null {
    if (!this.state.stream) return null;

    const summary = liveEngagement.stopWatching();
    liveBetting.stopOddsUpdates();
    liveChat.clear();

    auditLog.log({ userId: this.userId, action: 'logout' as any, resource: 'live_arena', detail: { ...summary }, result: 'success' });

    this.state = createDefaultArenaState();
    return summary;
  }

  // ── Quick actions ─────────────────────────────────────────

  /** Quick bet — 1 tap */
  quickBet(marketId: string, optionId: string, stake: number): { success: boolean; error: string | null } {
    if (!this.userId) return { success: false, error: 'Nao autenticado' };

    const result = liveBetting.quickBet({
      userId: this.userId,
      username: this.username,
      userLevel: this.userLevel,
      userTier: this.userTier,
      marketId,
      optionId,
      stake,
      matchLabel: this.state.stream?.match ? `${this.state.stream.match.homeTeam} vs ${this.state.stream.match.awayTeam}` : '',
    });

    return { success: result.success, error: result.error };
  }

  /** Copy streamer pick */
  copyPick(pickId: string, stake: number): { success: boolean; error: string | null } {
    if (!this.userId || !this.state.stream) return { success: false, error: 'Nao autenticado' };

    const pick = this.state.stream.currentPicks.find(p => p.id === pickId);
    if (!pick) return { success: false, error: 'Pick nao encontrado' };

    const result = liveBetting.copyBet({
      userId: this.userId,
      username: this.username,
      userLevel: this.userLevel,
      userTier: this.userTier,
      pick,
      stake,
    });

    return { success: result.success, error: result.error };
  }

  /** Send chat message */
  sendChat(text: string, highlighted = false): { success: boolean; error: string | null } {
    if (!this.userId) return { success: false, error: 'Nao autenticado' };

    const result = liveChat.send({
      userId: this.userId,
      username: this.username,
      userLevel: this.userLevel,
      userTier: this.userTier,
      userRank: this.userRank,
      text,
      highlighted,
    });

    if (result.success) {
      liveEngagement['updateMissionProgress']('chat', 1);
    }

    return result;
  }

  /** Vote on poll */
  votePoll(optionIndex: number): boolean {
    const poll = liveEngagement.getActivePoll();
    if (!poll) return false;
    return liveEngagement.votePoll(poll.id, optionIndex);
  }

  // ── State access ──────────────────────────────────────────

  /** Get current arena state */
  getState(): LiveArenaState {
    return {
      ...this.state,
      messages: liveChat.getMessages().slice(-50),
      pinnedMessage: liveChat.getPinned(),
      activeBets: liveBetting.getMarkets(),
      liveMissions: liveEngagement.getMissions(),
      activePoll: liveEngagement.getActivePoll(),
    };
  }

  /** Get engagement stats */
  getStats() {
    return liveEngagement.getStats();
  }

  /** Is user in a live stream? */
  isActive(): boolean {
    return this.state.stream !== null;
  }
}

export const liveArena = new LiveArena();
