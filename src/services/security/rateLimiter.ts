/**
 * NEXA Security — Rate Limiter
 *
 * Modulo independente. Protege contra brute force e credential stuffing.
 * Opera em 2 camadas: por IP e por conta.
 * Camada de rede (Cloudflare) e externa.
 *
 * Consumido por: mfa.ts, sessionManager.ts, orchestrator.ts
 */

import { auditLog } from './auditLog';

// ─── Types ──────────────────────────────────────────────────

interface RateBucket {
  key: string;
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  blocked: boolean;
  blockedUntil: number | null;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number | null;
  requireCaptcha: boolean;
}

// ─── Config ─────────────────────────────────────────────────

const RULES = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,   // 15 min
    blockMs: 15 * 60 * 1000,    // 15 min lockout
    captchaAfter: 3,
    escalation: [
      { threshold: 15, blockMs: 60 * 60 * 1000 },    // 15 fails in 24h → 1h block
      { threshold: 50, blockMs: 24 * 60 * 60 * 1000 }, // 50 fails → 24h block
    ],
  },
  mfa: {
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000,
    blockMs: 30 * 60 * 1000,
    captchaAfter: 99, // no captcha for MFA
    escalation: [],
  },
  transaction: {
    maxAttempts: 10,
    windowMs: 60 * 1000,         // 1 min
    blockMs: 5 * 60 * 1000,
    captchaAfter: 99,
    escalation: [],
  },
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000,
    blockMs: 60 * 1000,
    captchaAfter: 99,
    escalation: [],
  },
} as const;

type RuleType = keyof typeof RULES;

// ─── Service ────────────────────────────────────────────────

class RateLimiterService {
  private buckets = new Map<string, RateBucket>();

  /** Check if action is allowed */
  check(type: RuleType, identifier: string): RateLimitResult {
    const rule = RULES[type];
    const key = `${type}:${identifier}`;
    const now = Date.now();

    let bucket = this.buckets.get(key);

    // No bucket → first attempt
    if (!bucket) {
      bucket = { key, attempts: 0, firstAttempt: now, lastAttempt: now, blocked: false, blockedUntil: null };
      this.buckets.set(key, bucket);
    }

    // Check if block expired
    if (bucket.blocked && bucket.blockedUntil && now >= bucket.blockedUntil) {
      bucket.blocked = false;
      bucket.blockedUntil = null;
      bucket.attempts = 0;
      bucket.firstAttempt = now;
    }

    // Currently blocked
    if (bucket.blocked) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: bucket.blockedUntil ? bucket.blockedUntil - now : rule.blockMs,
        requireCaptcha: false,
      };
    }

    // Window expired → reset
    if (now - bucket.firstAttempt > rule.windowMs) {
      bucket.attempts = 0;
      bucket.firstAttempt = now;
    }

    bucket.attempts++;
    bucket.lastAttempt = now;

    // Check escalation
    for (const esc of rule.escalation) {
      if (bucket.attempts >= esc.threshold) {
        bucket.blocked = true;
        bucket.blockedUntil = now + esc.blockMs;
        auditLog.log({ action: 'login_blocked', resource: 'rate_limiter', detail: { type, identifier: identifier.slice(0, 5) + '***', attempts: bucket.attempts, blockMs: esc.blockMs }, result: 'blocked' });
        return { allowed: false, remaining: 0, retryAfterMs: esc.blockMs, requireCaptcha: false };
      }
    }

    // Check basic limit
    if (bucket.attempts > rule.maxAttempts) {
      bucket.blocked = true;
      bucket.blockedUntil = now + rule.blockMs;
      auditLog.log({ action: 'login_blocked', resource: 'rate_limiter', detail: { type, identifier: identifier.slice(0, 5) + '***', attempts: bucket.attempts }, result: 'blocked' });
      return { allowed: false, remaining: 0, retryAfterMs: rule.blockMs, requireCaptcha: false };
    }

    return {
      allowed: true,
      remaining: rule.maxAttempts - bucket.attempts,
      retryAfterMs: null,
      requireCaptcha: bucket.attempts >= rule.captchaAfter,
    };
  }

  /** Record a successful action (resets failure count) */
  recordSuccess(type: RuleType, identifier: string): void {
    const key = `${type}:${identifier}`;
    this.buckets.delete(key);
  }

  /** Manually unblock */
  unblock(type: RuleType, identifier: string): void {
    this.buckets.delete(`${type}:${identifier}`);
  }

  /** Cleanup expired buckets (call periodically) */
  cleanup(): void {
    const now = Date.now();
    for (const [key, bucket] of this.buckets) {
      if (!bucket.blocked && now - bucket.lastAttempt > 3600_000) {
        this.buckets.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiterService();
