/**
 * NEXA Notifications System
 *
 * Dominio independente. Push inteligente, scheduling, local triggers.
 *
 * Modulos internos:
 * - scheduler    → Priority queue, cooldown, quiet hours
 * - triggers     → Local detection (streak risk, mission expiring)
 * - templates    → Message variations (anti-repetition)
 * - channels     → Android notification channels (urgent/social/info)
 *
 * Uso: import { notificationSystem } from './services/notifications';
 */

import { auditLog } from '../security/auditLog';

// ─── Types ──────────────────────────────────────────────────

export type NotifPriority = 'critical' | 'high' | 'medium' | 'low';
export type NotifChannel = 'urgent' | 'social' | 'info';

export interface SmartNotification {
  type: string;
  priority: NotifPriority;
  channel: NotifChannel;
  title: string;
  body: string;
  deepLink: string;
  bypassQuietHours: boolean;
}

interface CooldownEntry { type: string; lastSent: number; }

// ─── Config ─────────────────────────────────────────────────

const QUIET_START = 23;
const QUIET_END = 8;
const MAX_DAILY = 8;

const COOLDOWN_MAP: Record<string, number> = {
  streak_risk: 120, bet_result: 0, cashout_alert: 5, tipster_post: 30,
  mission_expiring: 60, social_proof: 45, season: 0, inactivity: 360, system: 60,
};

// ─── Scheduler ──────────────────────────────────────────────

class NotificationScheduler {
  private queue: SmartNotification[] = [];
  private cooldowns: CooldownEntry[] = [];
  private dailySent = 0;
  private dailyDate = '';
  private timer: ReturnType<typeof setInterval> | null = null;
  private deliverFn: ((notif: SmartNotification) => void) | null = null;

  /** Set delivery function (called when notification fires) */
  setDeliveryHandler(fn: (notif: SmartNotification) => void): void {
    this.deliverFn = fn;
  }

  /** Schedule a notification */
  schedule(notif: SmartNotification): void {
    if (this.queue.some(q => q.type === notif.type)) return; // dedup
    this.queue.push(notif);
    this.queue.sort((a, b) => {
      const order: NotifPriority[] = ['critical', 'high', 'medium', 'low'];
      return order.indexOf(a.priority) - order.indexOf(b.priority);
    });
  }

  /** Start processing queue */
  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.process(), 30_000);
  }

  stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  private process(): void {
    const now = Date.now();
    const hour = new Date().getHours();
    const isQuiet = hour >= QUIET_START || hour < QUIET_END;
    const today = new Date().toISOString().slice(0, 10);
    if (this.dailyDate !== today) { this.dailySent = 0; this.dailyDate = today; }

    for (let i = 0; i < this.queue.length; i++) {
      if (this.dailySent >= MAX_DAILY) break;
      const notif = this.queue[i];
      if (isQuiet && !notif.bypassQuietHours && notif.priority !== 'critical') continue;

      const cooldownMin = COOLDOWN_MAP[notif.type] ?? 60;
      const entry = this.cooldowns.find(c => c.type === notif.type);
      if (entry && cooldownMin > 0 && now - entry.lastSent < cooldownMin * 60_000) continue;

      // Deliver
      this.queue.splice(i, 1); i--;
      this.dailySent++;
      const cdIdx = this.cooldowns.findIndex(c => c.type === notif.type);
      if (cdIdx >= 0) this.cooldowns[cdIdx].lastSent = now;
      else this.cooldowns.push({ type: notif.type, lastSent: now });

      if (this.deliverFn) this.deliverFn(notif);
    }
  }
}

// ─── Local Triggers ─────────────────────────────────────────

class LocalTriggers {
  private timer: ReturnType<typeof setInterval> | null = null;
  private checkFn: (() => void) | null = null;

  setCheckFunction(fn: () => void): void { this.checkFn = fn; }

  start(): void {
    if (this.timer) return;
    setTimeout(() => {
      this.checkFn?.();
      this.timer = setInterval(() => this.checkFn?.(), 5 * 60_000);
    }, 60_000);
  }

  stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }
}

// ─── Orchestrator ───────────────────────────────────────────

class NotificationSystem {
  readonly scheduler = new NotificationScheduler();
  readonly triggers = new LocalTriggers();

  init(deliverFn: (notif: SmartNotification) => void, checkFn: () => void): void {
    this.scheduler.setDeliveryHandler(deliverFn);
    this.triggers.setCheckFunction(checkFn);
    this.scheduler.start();
    this.triggers.start();
  }

  shutdown(): void {
    this.scheduler.stop();
    this.triggers.stop();
  }

  /** Quick schedule */
  send(type: string, priority: NotifPriority, channel: NotifChannel, title: string, body: string, deepLink: string): void {
    this.scheduler.schedule({ type, priority, channel, title, body, deepLink, bypassQuietHours: priority === 'critical' });
  }
}

export const notificationSystem = new NotificationSystem();
