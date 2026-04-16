/**
 * NEXA Security — Anti-Cheat System
 *
 * Modulo independente. Detecta comportamento anormal em apostas,
 * marketplace e social. Pattern matching + velocity checks.
 *
 * Consumido por: orchestrator.ts, penaltyEngine.ts
 * Consome: auditLog.ts
 */

import { auditLog, type AuditEntry } from './auditLog';

// ─── Types ─────────────��────────────────────────────────────

export type CheatType = 'bot_betting' | 'copy_abuse' | 'wash_trading' | 'collusion' | 'win_rate_anomaly' | 'velocity_abuse';

export interface CheatAlert {
  id: string;
  userId: string;
  type: CheatType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;        // 0-1
  evidence: string;
  dataPoints: number;
  timestamp: number;
}

interface BetPattern {
  userId: string;
  betsLast1h: number;
  betsLast24h: number;
  avgTimeBetweenBets: number;
  winRate: number;
  totalBets: number;
}

// ─── Detectors ──────────────────────────────────────────────

const DETECTORS: Array<{
  type: CheatType;
  detect: (events: AuditEntry[], userId: string) => { triggered: boolean; confidence: number; evidence: string; dataPoints: number } | null;
}> = [
  {
    type: 'bot_betting',
    detect: (events, userId) => {
      const bets = events.filter(e => e.userId === userId && e.action === 'bet_placed');
      const last1h = bets.filter(e => Date.now() - e.timestamp < 3600_000);
      if (last1h.length < 20) return null;

      // Check timing regularity (bots have very consistent intervals)
      const intervals = last1h.slice(1).map((e, i) => e.timestamp - last1h[i].timestamp);
      const avgInterval = intervals.reduce((s, v) => s + v, 0) / intervals.length;
      const variance = intervals.reduce((s, v) => s + Math.pow(v - avgInterval, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);
      const coeffOfVariation = stdDev / avgInterval;

      // Humans have CoV > 0.5, bots < 0.2
      if (coeffOfVariation < 0.2) {
        return { triggered: true, confidence: 0.85, evidence: `${last1h.length} apostas/hora com timing regular (CoV: ${coeffOfVariation.toFixed(2)})`, dataPoints: last1h.length };
      }
      return null;
    },
  },
  {
    type: 'win_rate_anomaly',
    detect: (events, userId) => {
      const results = events.filter(e => e.userId === userId && e.action === 'bet_placed' && e.detail?.result);
      if (results.length < 30) return null;

      const wins = results.filter(e => e.detail.result === 'won').length;
      const winRate = wins / results.length;

      // Statistically impossible for random outcomes
      if (winRate > 0.85) {
        return { triggered: true, confidence: 0.90, evidence: `Win rate ${(winRate * 100).toFixed(0)}% em ${results.length} apostas`, dataPoints: results.length };
      }
      return null;
    },
  },
  {
    type: 'velocity_abuse',
    detect: (events, userId) => {
      const actions = events.filter(e => e.userId === userId);
      const last5min = actions.filter(e => Date.now() - e.timestamp < 300_000);

      if (last5min.length > 50) {
        return { triggered: true, confidence: 0.75, evidence: `${last5min.length} acoes em 5 minutos (humanamente improvavel)`, dataPoints: last5min.length };
      }
      return null;
    },
  },
  {
    type: 'wash_trading',
    detect: (events, userId) => {
      // Detect buy-sell loops between same users
      const trades = events.filter(e => e.userId === userId && ['trade', 'marketplace_buy'].includes(e.action));
      const counterparties = trades.map(t => t.detail?.sellerId ?? t.detail?.buyerId).filter(Boolean);

      // Same counterparty in >60% of trades
      if (counterparties.length >= 5) {
        const counts = counterparties.reduce((acc: Record<string, number>, id: string) => { acc[id] = (acc[id] ?? 0) + 1; return acc; }, {});
        const maxCount = Math.max(...(Object.values(counts) as number[]));
        const ratio = maxCount / counterparties.length;

        if (ratio > 0.6) {
          return { triggered: true, confidence: 0.80, evidence: `${(ratio * 100).toFixed(0)}% das trades com o mesmo contraparte`, dataPoints: counterparties.length };
        }
      }
      return null;
    },
  },
];

// ─── Service ────────────────────────────────────────────────

class AntiCheatService {
  private alerts: CheatAlert[] = [];
  private listeners: Array<(alert: CheatAlert) => void> = [];

  /** Subscribe to cheat alerts */
  onAlert(listener: (alert: CheatAlert) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  /** Run all detectors against a user */
  scan(userId: string): CheatAlert[] {
    const events = auditLog.getRecent(userId, 200);
    const newAlerts: CheatAlert[] = [];

    for (const detector of DETECTORS) {
      const result = detector.detect(events, userId);
      if (result && result.triggered) {
        const severity = result.confidence >= 0.9 ? 'critical' : result.confidence >= 0.75 ? 'high' : result.confidence >= 0.5 ? 'medium' : 'low';
        const alert: CheatAlert = {
          id: `cheat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          userId,
          type: detector.type,
          severity,
          confidence: result.confidence,
          evidence: result.evidence,
          dataPoints: result.dataPoints,
          timestamp: Date.now(),
        };
        newAlerts.push(alert);
        this.alerts.push(alert);
        this.listeners.forEach(l => l(alert));

        auditLog.log({ userId, action: 'anomaly_detected', resource: 'anti_cheat', detail: { type: detector.type, severity, confidence: result.confidence, evidence: result.evidence }, result: severity === 'critical' ? 'blocked' : 'success' });
      }
    }

    return newAlerts;
  }

  /** Get alerts for user */
  getAlerts(userId: string): CheatAlert[] {
    return this.alerts.filter(a => a.userId === userId);
  }

  /** Get all unreviewed alerts */
  getPendingAlerts(): CheatAlert[] {
    return [...this.alerts];
  }
}

export const antiCheat = new AntiCheatService();
