/**
 * NEXA Security — Audit Log System
 *
 * Modulo independente. Registra TODA acao relevante em log imutavel.
 * Append-only — sem update/delete. Retencao: 2 anos.
 *
 * Consumido por: todos os outros modulos de seguranca.
 */

// ─── Types ──────────────────────────────────────────────────

export type AuditAction =
  | 'login_success' | 'login_failed' | 'login_blocked'
  | 'logout' | 'session_revoked' | 'session_expired'
  | 'mfa_enabled' | 'mfa_disabled' | 'mfa_challenged' | 'mfa_passed' | 'mfa_failed'
  | 'device_trusted' | 'device_revoked' | 'device_new'
  | 'password_changed' | 'password_reset' | 'email_changed'
  | 'deposit' | 'withdraw' | 'trade' | 'trade_held' | 'trade_cancelled'
  | 'bet_placed' | 'bet_blocked'
  | 'penalty_applied' | 'penalty_expired' | 'penalty_appealed'
  | 'report_submitted' | 'report_resolved'
  | 'risk_score_changed' | 'anomaly_detected'
  | 'self_exclusion_activated' | 'deposit_limit_set';

export interface AuditEntry {
  id: string;
  timestamp: number;
  userId: string | null;
  action: AuditAction;
  resource: string;
  detail: Record<string, any>;
  ipHash: string | null;
  deviceFingerprint: string | null;
  riskScore: number | null;
  result: 'success' | 'blocked' | 'failed' | 'pending';
}

// ─── In-memory buffer (flushes to Supabase) ─────────────────

const BUFFER_SIZE = 20;
const FLUSH_INTERVAL = 15_000;

class AuditLogService {
  private buffer: AuditEntry[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners: Array<(entry: AuditEntry) => void> = [];

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.flush(), FLUSH_INTERVAL);
  }

  stop(): void {
    this.flush();
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  /** Subscribe to real-time audit events (for risk engine, penalty engine, etc.) */
  onEntry(listener: (entry: AuditEntry) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  /** Log an action — the only public write method */
  log(params: {
    userId?: string | null;
    action: AuditAction;
    resource?: string;
    detail?: Record<string, any>;
    ipHash?: string | null;
    deviceFingerprint?: string | null;
    riskScore?: number | null;
    result: AuditEntry['result'];
  }): AuditEntry {
    const entry: AuditEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      userId: params.userId ?? null,
      action: params.action,
      resource: params.resource ?? '',
      detail: params.detail ?? {},
      ipHash: params.ipHash ?? null,
      deviceFingerprint: params.deviceFingerprint ?? null,
      riskScore: params.riskScore ?? null,
      result: params.result,
    };

    this.buffer.push(entry);
    this.listeners.forEach(l => l(entry));

    if (this.buffer.length >= BUFFER_SIZE) this.flush();
    return entry;
  }

  /** Flush buffer to persistent storage */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0);

    try {
      const { createClient } = require('@supabase/supabase-js');
      const { ENV, isConfigured } = require('../../config/env');
      if (!isConfigured('SUPABASE_URL')) return;
      const db = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
      await db.from('audit_log').insert(batch.map(e => ({
        user_id: e.userId,
        action: e.action,
        resource: e.resource,
        detail: e.detail,
        ip_hash: e.ipHash,
        device_fingerprint: e.deviceFingerprint,
        risk_score: e.riskScore,
        result: e.result,
      })));
    } catch {
      // Re-enqueue on failure
      this.buffer.unshift(...batch);
    }
  }

  /** Query recent entries (for settings screen) */
  getRecent(userId: string, limit = 20): AuditEntry[] {
    return this.buffer.filter(e => e.userId === userId).slice(-limit);
  }
}

export const auditLog = new AuditLogService();
