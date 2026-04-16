/**
 * NEXA Analytics System
 *
 * Dominio independente. Product analytics, funnels, retention, revenue.
 *
 * Modulos internos:
 * - eventTracker   → Core event tracking + batching
 * - funnelTracker  → Onboarding, deposit, bet, subscription funnels
 * - retentionTracker → D1/D7/D30 cohort properties
 * - revenueTracker → ARPU, LTV, conversion tracking
 * - screenTracker  → Auto screen view tracking
 *
 * Uso: import { analyticsSystem } from './services/analytics';
 */

import { ENV, isConfigured } from '../../config/env';
import { Platform } from 'react-native';

// ─── Re-export existing analytics ───────────────────────────

export { analytics, trackBet, trackXPGain, trackOddsChange, trackScreenView } from '../analytics';
export { trackOnboardingStep, trackDepositFunnel, trackBetFunnel, trackSubscriptionFunnel } from '../analytics';
export { trackDeposit, trackSubscriptionRevenue, trackMarketplaceRevenue } from '../analytics';

// ─── Funnel Definitions ─────────────────────────────────────

export interface FunnelStep {
  name: string;
  index: number;
  timestamp: number;
}

export interface FunnelState {
  name: string;
  steps: FunnelStep[];
  startedAt: number;
  completedAt: number | null;
  dropped: boolean;
}

// ─── Retention Metrics ──────────────────────────────────────

export interface RetentionMetrics {
  firstSeen: string;
  lastSeen: string;
  daysSinceFirst: number;
  totalSessions: number;
  d1Retained: boolean;
  d7Retained: boolean;
  d30Retained: boolean;
}

// ─── Revenue Metrics ────────────────────────────────────────

export interface RevenueMetrics {
  lifetimeDeposits: number;
  lifetimeSubscriptions: number;
  lifetimeMarketplace: number;
  totalRevenue: number;
  arpu: number;              // average revenue per user (computed server-side)
}

// ─── Orchestrator ───────────────────────────────────────────

class AnalyticsSystem {
  private funnels = new Map<string, FunnelState>();
  private retention: RetentionMetrics | null = null;

  /** Start a funnel */
  startFunnel(name: string): void {
    this.funnels.set(name, {
      name,
      steps: [],
      startedAt: Date.now(),
      completedAt: null,
      dropped: false,
    });
  }

  /** Progress a funnel step */
  progressFunnel(name: string, stepName: string, stepIndex: number): void {
    const funnel = this.funnels.get(name);
    if (!funnel) return;
    funnel.steps.push({ name: stepName, index: stepIndex, timestamp: Date.now() });
  }

  /** Complete a funnel */
  completeFunnel(name: string): FunnelState | null {
    const funnel = this.funnels.get(name);
    if (!funnel) return null;
    funnel.completedAt = Date.now();
    return funnel;
  }

  /** Drop a funnel (user abandoned) */
  dropFunnel(name: string): void {
    const funnel = this.funnels.get(name);
    if (funnel) funnel.dropped = true;
  }

  /** Get funnel conversion rate */
  getFunnelConversion(name: string): { totalSteps: number; completedSteps: number; conversionRate: number } | null {
    const funnel = this.funnels.get(name);
    if (!funnel) return null;
    return {
      totalSteps: funnel.steps.length,
      completedSteps: funnel.steps.length,
      conversionRate: funnel.completedAt ? 1 : 0,
    };
  }

  /** Initialize retention tracking */
  initRetention(firstSeen: string, totalSessions: number): void {
    const today = new Date().toISOString().slice(0, 10);
    const firstDate = new Date(firstSeen);
    const daysSince = Math.floor((Date.now() - firstDate.getTime()) / (24 * 60 * 60 * 1000));

    this.retention = {
      firstSeen,
      lastSeen: today,
      daysSinceFirst: daysSince,
      totalSessions,
      d1Retained: daysSince >= 1 && totalSessions >= 2,
      d7Retained: daysSince >= 7 && totalSessions >= 3,
      d30Retained: daysSince >= 30 && totalSessions >= 5,
    };
  }

  /** Get retention metrics */
  getRetention(): RetentionMetrics | null {
    return this.retention;
  }
}

export const analyticsSystem = new AnalyticsSystem();
