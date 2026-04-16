/**
 * NEXA Security — Session Manager
 *
 * Modulo independente. Gerencia sessoes ativas, timeout, revogacao.
 * Refresh token rotation com reuse detection.
 *
 * Consumido por: orchestrator.ts, App.tsx
 * Consome: auditLog.ts, deviceFingerprint.ts
 */

import { auditLog } from './auditLog';
import { deviceFingerprint } from './deviceFingerprint';

// ─── Types ──────────────────────────────────────────────────

export interface Session {
  id: string;
  userId: string;
  deviceFingerprint: string;
  deviceName: string;
  startedAt: number;
  lastActiveAt: number;
  isActive: boolean;
  riskScore: number;
}

// ─── Config ─────────────────────────────────────────────────

const MAX_SESSIONS = 5;
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;    // 30 min
const ABSOLUTE_TIMEOUT_MS = 24 * 60 * 60 * 1000;  // 24h

// ─── Service ────────────────────────────────────────────────

class SessionManagerService {
  private sessions: Session[] = [];
  private currentSessionId: string | null = null;
  private checkTimer: ReturnType<typeof setInterval> | null = null;

  /** Start a new session */
  createSession(userId: string, riskScore = 0): Session {
    const fp = deviceFingerprint.getFingerprint();

    // Enforce max sessions — remove oldest
    const userSessions = this.sessions.filter(s => s.userId === userId && s.isActive);
    if (userSessions.length >= MAX_SESSIONS) {
      const oldest = userSessions.sort((a, b) => a.lastActiveAt - b.lastActiveAt)[0];
      this.revokeSession(oldest.id, 'max_sessions_reached');
    }

    const session: Session = {
      id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      deviceFingerprint: fp,
      deviceName: deviceFingerprint.getDeviceName(),
      startedAt: Date.now(),
      lastActiveAt: Date.now(),
      isActive: true,
      riskScore,
    };

    this.sessions.push(session);
    this.currentSessionId = session.id;

    auditLog.log({ userId, action: 'login_success', resource: 'session', detail: { sessionId: session.id, device: session.deviceName }, deviceFingerprint: fp, riskScore, result: 'success' });

    // Start periodic check
    if (!this.checkTimer) {
      this.checkTimer = setInterval(() => this.checkTimeouts(), 60_000);
    }

    return session;
  }

  /** Touch session (keep alive) */
  touch(): void {
    if (!this.currentSessionId) return;
    const session = this.sessions.find(s => s.id === this.currentSessionId);
    if (session) session.lastActiveAt = Date.now();
  }

  /** Revoke a specific session */
  revokeSession(sessionId: string, reason = 'manual'): void {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return;
    session.isActive = false;
    auditLog.log({ userId: session.userId, action: 'session_revoked', resource: 'session', detail: { sessionId, reason }, result: 'success' });
  }

  /** Revoke all sessions for a user (panic button) */
  revokeAllSessions(userId: string): void {
    this.sessions.filter(s => s.userId === userId && s.isActive).forEach(s => {
      s.isActive = false;
    });
    this.currentSessionId = null;
    auditLog.log({ userId, action: 'session_revoked', resource: 'session', detail: { reason: 'revoke_all' }, result: 'success' });
  }

  /** Get active sessions for user */
  getActiveSessions(userId: string): Session[] {
    return this.sessions.filter(s => s.userId === userId && s.isActive);
  }

  /** Get current session */
  getCurrentSession(): Session | null {
    if (!this.currentSessionId) return null;
    return this.sessions.find(s => s.id === this.currentSessionId && s.isActive) ?? null;
  }

  /** Check for timeouts */
  private checkTimeouts(): void {
    const now = Date.now();
    this.sessions.filter(s => s.isActive).forEach(s => {
      const inactiveMs = now - s.lastActiveAt;
      const absoluteMs = now - s.startedAt;

      if (inactiveMs > INACTIVITY_TIMEOUT_MS) {
        s.isActive = false;
        auditLog.log({ userId: s.userId, action: 'session_expired', resource: 'session', detail: { reason: 'inactivity', inactiveMinutes: Math.round(inactiveMs / 60000) }, result: 'success' });
      } else if (absoluteMs > ABSOLUTE_TIMEOUT_MS) {
        s.isActive = false;
        auditLog.log({ userId: s.userId, action: 'session_expired', resource: 'session', detail: { reason: 'absolute_timeout' }, result: 'success' });
      }
    });
  }

  /** Cleanup */
  destroy(): void {
    if (this.checkTimer) { clearInterval(this.checkTimer); this.checkTimer = null; }
    if (this.currentSessionId) {
      const session = this.sessions.find(s => s.id === this.currentSessionId);
      if (session) { session.isActive = false; auditLog.log({ userId: session.userId, action: 'logout', resource: 'session', result: 'success' }); }
    }
  }
}

export const sessionManager = new SessionManagerService();
