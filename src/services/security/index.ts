/**
 * NEXA Security — Orchestrator
 *
 * Ponto central que conecta todos os 8 modulos de seguranca.
 * Cada modulo roda independente, o orquestrador coordena:
 *
 * ┌─────────────┐   ┌──────────────┐   ┌─────────────┐
 * │ auditLog    │◄──┤ orchestrator │──►│ riskEngine  │
 * └─────────────┘   └──────┬───────┘   └─────────────┘
 *                          │
 *   ┌──────────────────────┼──────────────────────┐
 *   │          │           │          │            │
 *   ▼          ▼           ▼          ▼            ▼
 * rateLimiter  device   session   tradeGuard   antiCheat
 *              FP       Manager                    │
 *                                          ┌───────▼───────┐
 *                                          │ penaltyEngine  │
 *                                          │ reportSystem   │
 *                                          └────────────────┘
 *
 * Init: securityOrchestrator.init(userId) em App.tsx
 * Shutdown: securityOrchestrator.shutdown() no unmount
 */

// ─── Re-export all modules ──────────────────────────────────

export { auditLog, type AuditEntry, type AuditAction } from './auditLog';
export { deviceFingerprint, type TrustedDevice, type DeviceInfo } from './deviceFingerprint';
export { rateLimiter } from './rateLimiter';
export { riskEngine, type RiskAssessment, type RiskLevel } from './riskEngine';
export { sessionManager, type Session } from './sessionManager';
export { tradeGuard, type TradeCheck, type HeldTrade } from './tradeGuard';
export { antiCheat, type CheatAlert, type CheatType } from './antiCheat';
export { penaltyEngine, type Penalty, type UserRestrictions, type PenaltyLevel } from './penaltyEngine';
export { reportSystem, type Report, type ReportCategory } from './reportSystem';

// ─── Coherence Engine (sovereign layer above all modules) ───
export { coherenceEngine, type CoherenceDecision } from './coherence';
export { globalState, type PlatformState, type SystemMap } from './coherence';
export { behaviorIdentity, type BehaviorSignature } from './coherence';
export { consistencyValidator } from './coherence';
export { economyGuardian, type EconomyHealth } from './coherence';
export { faultTolerance } from './coherence';
export { observability } from './coherence';

// ─── Imports for orchestration ──────────────────────────────

import { auditLog } from './auditLog';
import { deviceFingerprint } from './deviceFingerprint';
import { rateLimiter } from './rateLimiter';
import { riskEngine } from './riskEngine';
import { sessionManager } from './sessionManager';
import { antiCheat } from './antiCheat';
import { penaltyEngine } from './penaltyEngine';

// ─── Orchestrator ───────────────────────────────────────────

class SecurityOrchestrator {
  private scanInterval: ReturnType<typeof setInterval> | null = null;
  private userId: string | null = null;

  /** Initialize all security modules */
  init(userId: string): void {
    this.userId = userId;

    // Start audit log buffer
    auditLog.start();

    // Create session
    const risk = riskEngine.assessLogin(userId, false, 30, penaltyEngine.getPenaltyCount(userId));
    sessionManager.createSession(userId, risk.score);

    // Trust device if risk is low
    if (risk.score < 20) {
      deviceFingerprint.trustDevice();
    }

    // Wire anti-cheat to run periodic scans
    this.scanInterval = setInterval(() => {
      if (this.userId) {
        antiCheat.scan(this.userId);
        penaltyEngine.checkExpired();
        rateLimiter.cleanup();
      }
    }, 5 * 60 * 1000); // every 5 min

    // Wire anti-cheat alerts to penalty engine
    antiCheat.onAlert((alert) => {
      if (alert.severity === 'critical' && alert.confidence >= 0.85) {
        penaltyEngine.shadowBan(alert.userId, `Anti-cheat: ${alert.type} (confidence: ${alert.confidence})`);
      }
    });
  }

  /** Check login (called before auth) */
  checkLogin(identifier: string): { allowed: boolean; requireCaptcha: boolean; reason?: string } {
    const rateCheck = rateLimiter.check('login', identifier);
    if (!rateCheck.allowed) {
      return { allowed: false, requireCaptcha: false, reason: `Muitas tentativas. Tente novamente em ${Math.ceil((rateCheck.retryAfterMs ?? 0) / 60000)} minutos.` };
    }
    return { allowed: true, requireCaptcha: rateCheck.requireCaptcha };
  }

  /** After successful login */
  onLoginSuccess(userId: string): void {
    rateLimiter.recordSuccess('login', userId);
    this.userId = userId;
  }

  /** After failed login */
  onLoginFailed(identifier: string): void {
    auditLog.log({ action: 'login_failed', resource: 'auth', detail: { identifier: identifier.slice(0, 3) + '***' }, result: 'failed' });
  }

  /** Check if user can perform action */
  canAct(userId: string): { allowed: boolean; reason?: string } {
    const restrictions = penaltyEngine.getRestrictions(userId);
    if (!restrictions.canBet && !restrictions.canDeposit && !restrictions.canChat) {
      return { allowed: false, reason: 'Conta suspensa. Saques ainda disponiveis.' };
    }
    return { allowed: true };
  }

  /** Touch session (call on user interaction) */
  keepAlive(): void {
    sessionManager.touch();
  }

  /** Shutdown all modules */
  shutdown(): void {
    if (this.scanInterval) { clearInterval(this.scanInterval); this.scanInterval = null; }
    sessionManager.destroy();
    auditLog.stop();
    this.userId = null;
  }
}

export const securityOrchestrator = new SecurityOrchestrator();
