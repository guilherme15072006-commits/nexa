/**
 * NEXA — Product Analytics (Amplitude)
 *
 * Referencia: Amplitude product analytics, Mixpanel funnels
 *
 * Tracks:
 * - Funnels: onboarding, deposit, bet, subscription
 * - Retention: D1, D7, D30 cohorts via user properties
 * - Engagement: sessions/day, bets/session, social actions/session
 * - Revenue: deposits, subscriptions, marketplace (ARPU, LTV)
 * - Performance: screen load times, API latency
 */

import { Platform } from 'react-native';
import { ENV, isConfigured } from '../config/env';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface UserProperties {
  // Identity
  userId: string;
  platform: string;
  appVersion: string;
  // Level & progression
  level: number;
  tier: string;
  dna: string;
  seasonLevel: number;
  // Engagement
  streak: number;
  totalBets: number;
  winRate: number;
  roi: number;
  // Economy
  balance: number;
  coins: number;
  rank: number;
  badgesUnlocked: number;
  following: number;
  // Monetization
  subscriptionTier: string;
  isTrialing: boolean;
  lifetimeDeposits: number;
  lifetimeRevenue: number;
  // Retention
  firstSeenDate: string;
  lastSeenDate: string;
  totalSessions: number;
  daysSinceFirstSeen: number;
}

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

type EventName =
  // ─── Funnels ────────────────────────────────────────────
  // Onboarding funnel
  | 'onboarding_started'
  | 'onboarding_step_viewed'
  | 'onboarding_bet_placed'
  | 'onboarding_dna_revealed'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  // Deposit funnel
  | 'deposit_initiated'
  | 'deposit_amount_selected'
  | 'deposit_pix_generated'
  | 'deposit_pix_copied'
  | 'deposit_confirmed'
  | 'deposit_failed'
  // Bet funnel
  | 'bet_odds_viewed'
  | 'bet_odds_selected'
  | 'bet_placed'
  | 'bet_confirmed'
  | 'bet_result'
  // Subscription funnel
  | 'subscription_viewed'
  | 'subscription_trial_started'
  | 'subscription_purchased'
  | 'subscription_cancelled'
  | 'subscription_restored'
  // ─── Engagement ─────────────────────────────────────────
  | 'session_started'
  | 'session_ended'
  | 'screen_viewed'
  | 'tab_switched'
  | 'feed_scrolled'
  | 'feed_refreshed'
  // ─── Social ─────────────────────────────────────────────
  | 'post_liked'
  | 'post_unliked'
  | 'bet_copied'
  | 'tipster_followed'
  | 'tipster_unfollowed'
  | 'story_viewed'
  | 'story_reacted'
  | 'poll_voted'
  | 'chat_message_sent'
  | 'audio_room_joined'
  | 'pick_shared'
  | 'stats_shared'
  // ─── Gamification ───────────────────────────────────────
  | 'checkin_claimed'
  | 'mission_completed'
  | 'xp_gained'
  | 'level_up'
  | 'badge_unlocked'
  | 'streak_extended'
  | 'streak_broken'
  | 'season_tier_claimed'
  | 'power_up_purchased'
  | 'lootbox_opened'
  // ─── Revenue ────────────────────────────────────────────
  | 'revenue_deposit'
  | 'revenue_subscription'
  | 'revenue_marketplace'
  | 'revenue_commission'
  // ─── Responsible Gaming ─────────────────────────────────
  | 'responsible_limit_set'
  | 'responsible_exclusion_activated'
  | 'responsible_cooldown_triggered'
  | 'responsible_bet_blocked'
  // ─── Performance ────────────────────────────────────────
  | 'screen_load_time'
  | 'api_latency'
  | 'odds_update_received';

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const AMPLITUDE_ENDPOINT = 'https://api2.amplitude.com/2/httpapi';
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 30000;

// ═══════════════════════════════════════════════════════════════
// ANALYTICS ENGINE
// ═══════════════════════════════════════════════════════════════

class NexaAnalytics {
  private queue: Array<{
    event_type: string;
    user_id: string;
    device_id: string;
    time: number;
    event_properties: EventProperties;
    user_properties: Record<string, any>;
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

  // Session metrics
  private screenViews: Record<string, number> = {};
  private interactions: number = 0;
  private betsThisSession: number = 0;
  private socialActionsThisSession: number = 0;
  private revenueThisSession: number = 0;

  // Retention
  private firstSeenDate: string = '';
  private totalSessions: number = 0;

  // ── Init ─────────────────────────────────────────────────

  init(userId: string, deviceId: string): void {
    this.userId = userId;
    this.deviceId = deviceId;
    this.sessionId = Date.now();
    this.sessionStart = Date.now();
    this.initialized = true;
    this.totalSessions++;

    // Retention dates
    const today = new Date().toISOString().slice(0, 10);
    if (!this.firstSeenDate) this.firstSeenDate = today;

    this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);

    this.track('session_started', {
      platform: Platform.OS,
      session_number: this.totalSessions,
    });
  }

  // ── Identity ─────────────────────────────────────────────

  identify(props: Partial<UserProperties>): void {
    this.userProps = { ...this.userProps, ...props };

    // Enrich with computed retention props
    const today = new Date().toISOString().slice(0, 10);
    this.userProps.lastSeenDate = today;
    this.userProps.totalSessions = this.totalSessions;
    if (this.firstSeenDate) {
      const first = new Date(this.firstSeenDate).getTime();
      this.userProps.daysSinceFirstSeen = Math.floor((Date.now() - first) / (24 * 60 * 60 * 1000));
    }
  }

  /** Sync user properties from store state */
  identifyFromState(state: {
    user: { id: string; level: number; streak: number; winRate: number; roi: number; balance: number; coins: number; rank: number; badges: any[]; following: string[]; dna: { style: string } };
    currentSubscription: string;
    userSubscription: { isTrialing: boolean };
    currentSeason: { userSeasonLevel: number };
  }): void {
    this.identify({
      userId: state.user.id,
      level: state.user.level,
      tier: state.currentSubscription,
      dna: state.user.dna.style,
      seasonLevel: state.currentSeason.userSeasonLevel,
      streak: state.user.streak,
      winRate: state.user.winRate,
      roi: state.user.roi,
      balance: state.user.balance,
      coins: state.user.coins,
      rank: state.user.rank,
      badgesUnlocked: state.user.badges.length,
      following: state.user.following.length,
      subscriptionTier: state.currentSubscription,
      isTrialing: state.userSubscription.isTrialing,
      platform: Platform.OS,
      appVersion: ENV.APP_VERSION,
    });
  }

  // ── Core tracking ────────────────────────────────────────

  track(event: EventName, properties: EventProperties = {}): void {
    if (!this.initialized) return;

    this.interactions++;

    const enriched: EventProperties = {
      ...properties,
      session_duration_s: Math.round((Date.now() - this.sessionStart) / 1000),
      interactions_count: this.interactions,
      bets_this_session: this.betsThisSession,
      social_actions_this_session: this.socialActionsThisSession,
    };

    this.queue.push({
      event_type: event,
      user_id: this.userId,
      device_id: this.deviceId,
      time: Date.now(),
      event_properties: enriched,
      user_properties: { $set: this.userProps },
      platform: Platform.OS,
      app_version: ENV.APP_VERSION,
      session_id: this.sessionId,
    });

    // Increment counters
    if (event === 'bet_placed' || event === 'bet_confirmed') this.betsThisSession++;
    if (event.startsWith('post_') || event.startsWith('tipster_') || event === 'bet_copied' || event === 'chat_message_sent') {
      this.socialActionsThisSession++;
    }

    if (this.queue.length >= BATCH_SIZE) {
      this.flush();
    }
  }

  // ── Screen tracking ──────────────────────────────────────

  trackScreen(screen: string): void {
    this.screenViews[screen] = (this.screenViews[screen] ?? 0) + 1;
    this.track('screen_viewed', {
      screen,
      view_count: this.screenViews[screen],
    });
  }

  // ── Funnel helpers ───────────────────────────────────────

  trackFunnel(funnel: string, step: string, stepIndex: number, props?: EventProperties): void {
    this.track(`${funnel}_${step}` as EventName, {
      ...props,
      funnel_name: funnel,
      funnel_step: step,
      funnel_step_index: stepIndex,
    });
  }

  // ── Revenue tracking ─────────────────────────────────────

  trackRevenue(type: 'deposit' | 'subscription' | 'marketplace' | 'commission', amount: number, currency: string = 'BRL', props?: EventProperties): void {
    this.revenueThisSession += amount;
    this.track(`revenue_${type}` as EventName, {
      ...props,
      revenue_amount: amount,
      revenue_currency: currency,
      revenue_type: type,
      lifetime_revenue_session: this.revenueThisSession,
    });
  }

  // ── Timing ───────────────────────────────────────────────

  trackTiming(event: EventName, durationMs: number, properties: EventProperties = {}): void {
    this.track(event, { ...properties, duration_ms: durationMs });
  }

  // ── Flush ────────────────────────────────────────────────

  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.queue.length);
    const apiKey = isConfigured('AMPLITUDE_API_KEY') ? ENV.AMPLITUDE_API_KEY : '';

    if (!apiKey) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log(`[Analytics] ${batch.length} events queued:`,
          batch.map(e => e.event_type).join(', '));
      }
      return;
    }

    try {
      await fetch(AMPLITUDE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': '*/*' },
        body: JSON.stringify({ api_key: apiKey, events: batch }),
      });
    } catch {
      // Re-enqueue on failure
      this.queue.unshift(...batch);
    }
  }

  // ── Session end ──────────────────────────────────────────

  endSession(): void {
    this.track('session_ended', {
      total_duration_s: Math.round((Date.now() - this.sessionStart) / 1000),
      total_interactions: this.interactions,
      total_bets: this.betsThisSession,
      total_social_actions: this.socialActionsThisSession,
      total_revenue: this.revenueThisSession,
      screens_visited: Object.keys(this.screenViews).length,
      engagement_score: this.getEngagementScore(),
      retention_risk: this.getRetentionRisk(),
    });
    this.flush();

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // ── Computed metrics ─────────────────────────────────────

  getEngagementScore(): number {
    const sessionMinutes = (Date.now() - this.sessionStart) / 60000;
    const interactionRate = this.interactions / Math.max(sessionMinutes, 1);
    const betRate = this.betsThisSession / Math.max(sessionMinutes, 1);
    const socialRate = this.socialActionsThisSession / Math.max(sessionMinutes, 1);
    return Math.min(100, Math.round(
      (interactionRate * 10) + (betRate * 30) + (socialRate * 20) + (Object.keys(this.screenViews).length * 5)
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

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE HELPERS
// ═══════════════════════════════════════════════════════════════

// Funnels
export function trackOnboardingStep(step: number, stepName: string): void {
  analytics.trackFunnel('onboarding', `step_${step}`, step, { step_name: stepName });
}

export function trackDepositFunnel(step: string, stepIndex: number, amount?: number): void {
  analytics.trackFunnel('deposit', step, stepIndex, amount != null ? { amount } : undefined);
}

export function trackBetFunnel(step: string, stepIndex: number, props?: EventProperties): void {
  analytics.trackFunnel('bet', step, stepIndex, props);
}

export function trackSubscriptionFunnel(step: string, stepIndex: number, tier?: string): void {
  analytics.trackFunnel('subscription', step, stepIndex, tier ? { tier } : undefined);
}

// Revenue
export function trackDeposit(amount: number): void {
  analytics.trackRevenue('deposit', amount);
}

export function trackSubscriptionRevenue(amount: number, tier: string): void {
  analytics.trackRevenue('subscription', amount, 'BRL', { tier });
}

export function trackMarketplaceRevenue(amount: number, commission: number): void {
  analytics.trackRevenue('marketplace', amount, 'coins', { commission });
  analytics.trackRevenue('commission', commission, 'coins');
}

// Social
export function trackSocialAction(action: string, targetId?: string): void {
  analytics.track(action as EventName, targetId ? { target_id: targetId } : {});
}

// Engagement
export function trackBet(matchId: string, side: string, odds: number, source: 'direct' | 'copy' | 'tipster'): void {
  analytics.track('bet_placed', { matchId, side, odds, source });
}

export function trackXPGain(amount: number, source: string): void {
  analytics.track('xp_gained', { amount, source });
}

export function trackOddsChange(matchId: string, field: string, oldVal: number, newVal: number): void {
  analytics.track('odds_update_received', {
    matchId, field,
    old_value: oldVal,
    new_value: newVal,
    direction: newVal > oldVal ? 'up' : 'down',
  });
}

// ═══════════════════════════════════════════════════════════════
// SCREEN TRACKING HOOK
// ═══════════════════════════════════════════════════════════════

/** Call in each screen's useEffect or via navigation listener */
export function trackScreenView(screenName: string): void {
  analytics.trackScreen(screenName);
}
