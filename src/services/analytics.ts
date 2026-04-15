// =====================================================
// NEXA Analytics — Amplitude Integration
// Rastreia TODOS os eventos de engajamento, retencao,
// conversao e comportamento do usuario
// =====================================================

import { Platform } from 'react-native';

// --- Types ---

interface UserProperties {
  userId: string;
  level: number;
  tier: string;
  dna: string;
  state: string;
  clan: string;
  streak: number;
  winRate: number;
  roi: number;
  balance: number;
  coins: number;
  rank: number;
  badgesUnlocked: number;
  following: number;
}

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

type EventName =
  // Onboarding
  | 'onboarding_started'
  | 'onboarding_step_viewed'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  // Engagement
  | 'session_started'
  | 'session_ended'
  | 'tab_switched'
  | 'feed_scrolled'
  | 'feed_refreshed'
  | 'feed_tab_changed'
  // Social
  | 'post_liked'
  | 'post_unliked'
  | 'post_double_tap_liked'
  | 'bet_copied'
  | 'tipster_followed'
  | 'tipster_unfollowed'
  // Betting
  | 'odds_selected'
  | 'odds_deselected'
  | 'betslip_opened'
  | 'betslip_cleared'
  | 'bet_placed'
  | 'bet_confirmed'
  | 'odds_changed'
  // Gamification
  | 'checkin_claimed'
  | 'checkin_viewed'
  | 'mission_viewed'
  | 'mission_completed'
  | 'mission_hidden_revealed'
  | 'xp_gained'
  | 'level_up'
  | 'badge_unlocked'
  | 'streak_extended'
  | 'streak_broken'
  // Ranking
  | 'leaderboard_viewed'
  | 'clan_viewed'
  | 'clan_joined'
  | 'season_progress_viewed'
  // Profile
  | 'profile_viewed'
  | 'stats_viewed'
  | 'achievements_viewed'
  | 'heatmap_viewed'
  | 'wallet_viewed'
  | 'deposit_tapped'
  // Retention
  | 'celebration_triggered'
  | 'user_state_changed'
  | 'responsible_gaming_triggered'
  // Performance
  | 'screen_load_time'
  | 'api_latency'
  | 'odds_update_received';

// --- Config ---

const AMPLITUDE_API_KEY = process.env.AMPLITUDE_API_KEY ?? '';
const AMPLITUDE_ENDPOINT = 'https://api2.amplitude.com/2/httpapi';
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 30000;

// --- Analytics Engine ---

class NexaAnalytics {
  private queue: Array<{
    event_type: string;
    user_id: string;
    device_id: string;
    time: number;
    event_properties: EventProperties;
    user_properties: Partial<UserProperties>;
    platform: string;
    app_version: string;
    session_id: number;
  }> = [];

  private userId: string = '';
  private deviceId: string = '';
  private sessionId: number = 0;
  private sessionStart: number = 0;
  private userProps: Partial<UserProperties> = {};
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private initialized: boolean = false;

  // Metricas de sessao
  private screenViews: Record<string, number> = {};
  private interactions: number = 0;
  private betsThisSession: number = 0;

  init(userId: string, deviceId: string): void {
    this.userId = userId;
    this.deviceId = deviceId;
    this.sessionId = Date.now();
    this.sessionStart = Date.now();
    this.initialized = true;

    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);

    this.track('session_started', {
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    });
  }

  identify(props: Partial<UserProperties>): void {
    this.userProps = { ...this.userProps, ...props };
  }

  track(event: EventName, properties: EventProperties = {}): void {
    if (!this.initialized) return;

    this.interactions++;

    const enriched = {
      ...properties,
      session_duration_s: Math.round((Date.now() - this.sessionStart) / 1000),
      interactions_count: this.interactions,
      bets_this_session: this.betsThisSession,
    };

    this.queue.push({
      event_type: event,
      user_id: this.userId,
      device_id: this.deviceId,
      time: Date.now(),
      event_properties: enriched,
      user_properties: this.userProps,
      platform: Platform.OS,
      app_version: '0.1.0',
      session_id: this.sessionId,
    });

    if (event === 'bet_placed') this.betsThisSession++;

    if (this.queue.length >= BATCH_SIZE) {
      this.flush();
    }
  }

  trackScreenView(screen: string): void {
    this.screenViews[screen] = (this.screenViews[screen] ?? 0) + 1;
    this.track('tab_switched', {
      screen,
      view_count: this.screenViews[screen],
    });
  }

  trackTiming(event: EventName, durationMs: number, properties: EventProperties = {}): void {
    this.track(event, { ...properties, duration_ms: durationMs });
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.queue.length);

    if (!AMPLITUDE_API_KEY) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log(`[NEXA Analytics] ${batch.length} eventos em fila:`,
          batch.map(e => `${e.event_type} ${JSON.stringify(e.event_properties)}`));
      }
      return;
    }

    try {
      await fetch(AMPLITUDE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        body: JSON.stringify({
          api_key: AMPLITUDE_API_KEY,
          events: batch,
        }),
      });
    } catch (error) {
      // Re-enqueue failed events
      this.queue.unshift(...batch);
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[NEXA Analytics] Flush falhou, eventos re-enfileirados:', error);
      }
    }
  }

  endSession(): void {
    this.track('session_ended', {
      total_duration_s: Math.round((Date.now() - this.sessionStart) / 1000),
      total_interactions: this.interactions,
      total_bets: this.betsThisSession,
      screens_visited: Object.keys(this.screenViews).length,
    });
    this.flush();

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // --- Computed Metrics ---

  getEngagementScore(): number {
    const sessionMinutes = (Date.now() - this.sessionStart) / 60000;
    const interactionRate = this.interactions / Math.max(sessionMinutes, 1);
    const betRate = this.betsThisSession / Math.max(sessionMinutes, 1);
    return Math.min(100, Math.round(
      (interactionRate * 15) + (betRate * 40) + (Object.keys(this.screenViews).length * 8)
    ));
  }

  getRetentionRisk(): 'low' | 'medium' | 'high' {
    const score = this.getEngagementScore();
    if (score >= 60) return 'low';
    if (score >= 30) return 'medium';
    return 'high';
  }
}

// Singleton
export const analytics = new NexaAnalytics();

// --- Convenience helpers ---

export function trackBet(matchId: string, side: string, odds: number, source: 'direct' | 'copy' | 'tipster'): void {
  analytics.track('bet_placed', { matchId, side, odds, source });
}

export function trackXPGain(amount: number, source: string): void {
  analytics.track('xp_gained', { amount, source });
}

export function trackOddsChange(matchId: string, field: string, oldVal: number, newVal: number): void {
  analytics.track('odds_changed', {
    matchId, field,
    old_value: oldVal,
    new_value: newVal,
    direction: newVal > oldVal ? 'up' : 'down',
    delta: Math.round((newVal - oldVal) * 100) / 100,
  });
}

export function trackUserState(oldState: string, newState: string, trigger: string): void {
  analytics.track('user_state_changed', {
    from: oldState,
    to: newState,
    trigger,
  });
}
