/**
 * NEXA Coherence Engine — Sovereign Orchestrator
 *
 * Camada SOBERANA que recebe TODOS os eventos, correlaciona em tempo real,
 * e decide permitir, atrasar ou bloquear. Fica ACIMA de todos os outros sistemas.
 *
 * ┌──────────────────────────────────────────────────────────────┐
 * │                    COHERENCE ENGINE                          │
 * │                 (Soberano sobre tudo)                        │
 * │                                                              │
 * │  ┌─────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
 * │  │ globalState  │ │ consistency  │ │ behaviorIdentity     │  │
 * │  │ (modelo vivo)│ │ Validator    │ │ (assinatura unica)   │  │
 * │  └──────┬──────┘ └──────┬───────┘ └──────────┬───────────┘  │
 * │         │               │                    │               │
 * │  ┌──────▼──────┐ ┌──────▼───────┐ ┌─────────▼────────────┐  │
 * │  │ economy     │ │ fault        │ │ observability         │  │
 * │  │ Guardian    │ │ Tolerance    │ │ (mapa vivo)           │  │
 * │  └─────────────┘ └─────────────┘ └────────────────────────┘  │
 * │                                                              │
 * │  Abaixo: security/ (9 modulos), auth/, betting/, etc.       │
 * └──────────────────────────────────────────────────────────────┘
 *
 * Diferencial vs sistemas tradicionais:
 * Tradicional: "Esta acao e permitida?" → check local de regra
 * Coherence:   "O sistema continua consistente?" → validacao global
 *
 * Uso:
 *   import { coherenceEngine } from './services/security/coherence';
 *   const result = coherenceEngine.validateAction(action);
 */

// ─── Re-exports ─────────────────────────────────────────────

export { globalState, type UserStateSnapshot, type PlatformState, type EconomySnapshot } from './globalState';
export { behaviorIdentity, type BehaviorSignature, type DeviationResult } from './behaviorIdentity';
export { consistencyValidator, type Action, type ValidationResult, type Violation } from './consistencyValidator';
export { economyGuardian, type EconomyHealth, type EconomyAlert } from './economyGuardian';
export { faultTolerance, type Checkpoint, type QuarantinedAction, type ReconciliationResult } from './faultTolerance';
export { observability, type SystemMap, type RiskZone, type Anomaly } from './observability';

// ─── Imports ────────────────────────────────────────────────

import { globalState } from './globalState';
import { behaviorIdentity } from './behaviorIdentity';
import { consistencyValidator, type Action, type ValidationResult } from './consistencyValidator';
import { economyGuardian } from './economyGuardian';
import { faultTolerance } from './faultTolerance';
import { observability } from './observability';
import { auditLog } from '../auditLog';

// ─── Coherence Decision ─────────────────────────────────────

export interface CoherenceDecision {
  /** Can the action proceed? */
  allowed: boolean;
  /** Should be delayed for review? */
  delayed: boolean;
  /** Is the action quarantined? */
  quarantined: boolean;
  /** Consistency validation result */
  validation: ValidationResult;
  /** Behavior deviation (if available) */
  behaviorDeviation: number;
  /** Economy healthy? */
  economyHealthy: boolean;
  /** Overall system health score */
  systemHealth: number;
  /** Human-readable reason if blocked */
  reason: string | null;
}

// ─── Sovereign Orchestrator ─────────────────────────────────

class CoherenceEngine {
  private monitorTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * CORE METHOD — Validate ANY action against the entire system state.
   * This is the single entry point for all action validation.
   */
  validateAction(action: Action): CoherenceDecision {
    // 1. Run consistency validator (rules against global state)
    const validation = consistencyValidator.validate(action);

    // 2. Check behavior identity
    const user = globalState.getUser(action.userId);
    const behaviorDeviation = user?.signatureDeviation ?? 0;

    // 3. Check economy health
    const economyHealth = economyGuardian.checkHealth();

    // 4. System health
    const systemHealth = observability.getHealthScore();

    // 5. Make sovereign decision
    let allowed = validation.decision === 'allow' || validation.decision === 'delay';
    let delayed = validation.decision === 'delay';
    let quarantined = validation.decision === 'quarantine';
    let reason: string | null = null;

    // Override: if behavior deviation is extreme, escalate
    if (behaviorDeviation > 0.7 && (action.type === 'withdraw' || action.type === 'transfer')) {
      allowed = false;
      quarantined = true;
      reason = 'Desvio comportamental extremo detectado durante acao financeira';
    }

    // Override: if economy is critical, block large transactions
    if (!economyHealth.healthy && (action.amount ?? 0) > 1000) {
      allowed = false;
      delayed = true;
      reason = 'Sistema em estado de inconsistencia economica — transacoes grandes bloqueadas temporariamente';
    }

    // Override: if system health is critical, restrict everything
    if (systemHealth < 20) {
      if (action.type !== 'withdraw') { // never block withdraws
        delayed = true;
        reason = 'Sistema em modo de protecao — acoes atrasadas para verificacao';
      }
    }

    // Quarantine: create checkpoint + quarantine entry
    if (quarantined) {
      const cp = faultTolerance.createCheckpoint(action.userId, user ?? {}, `Pre-quarantine: ${action.type}`);
      faultTolerance.quarantineAction(action, reason ?? validation.quarantineReason ?? 'Inconsistencia detectada');
      reason = reason ?? validation.quarantineReason ?? 'Acao em quarentena para verificacao';
    }

    // Log to audit
    auditLog.log({
      userId: action.userId,
      action: quarantined ? 'anomaly_detected' : allowed ? 'bet_placed' as any : 'login_blocked' as any,
      resource: 'coherence_engine',
      detail: {
        actionType: action.type,
        decision: quarantined ? 'quarantine' : delayed ? 'delay' : allowed ? 'allow' : 'block',
        validationViolations: validation.violations.length,
        behaviorDeviation,
        economyHealthy: economyHealth.healthy,
        systemHealth,
      },
      result: allowed ? 'success' : 'blocked',
    });

    // Report anomaly if quarantined
    if (quarantined) {
      observability.reportAnomaly(
        `action_quarantined:${action.type}`,
        'high',
        reason ?? 'Acao quarantenada pelo motor de coerencia',
      );
    }

    return { allowed, delayed, quarantined, validation, behaviorDeviation, economyHealthy: economyHealth.healthy, systemHealth, reason };
  }

  /**
   * Record an economic flow (wraps economyGuardian)
   */
  recordEconomicFlow(from: string, to: string, amount: number, type: string): void {
    economyGuardian.recordFlow(from, to, amount, type);
  }

  /**
   * Update user behavior (wraps behaviorIdentity)
   */
  updateBehavior(userId: string, current: Parameters<typeof behaviorIdentity.compareToBaseline>[1]): void {
    const result = behaviorIdentity.compareToBaseline(userId, current);
    if (!result.isAnomaly) {
      // Normal behavior — adapt baseline
      const baseline = behaviorIdentity.getBaseline(userId);
      if (baseline) {
        const currentVector = [
          current.loginHour / 23, current.sessionMinutes / 120,
          current.betsThisSession / 20, current.avgBetSize / 1000,
          current.socialActions / 30, current.avgOdds / 10,
          current.isNewDevice ? 0 : 1, current.depositsThisWeek / 7,
          1000 / Math.max(current.avgResponseMs, 100) / 10,
          current.screensVisited / 20,
        ];
        behaviorIdentity.adaptBaseline(userId, currentVector);
      }
    }
  }

  /**
   * Start periodic monitoring
   */
  startMonitoring(): void {
    if (this.monitorTimer) return;
    this.monitorTimer = setInterval(() => {
      // Generate system map every 30s
      observability.getSystemMap();
      // Process expired quarantine
      faultTolerance.processExpired();
      // Recalculate economy
      globalState.recalculateEconomy();
    }, 30_000);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitorTimer) { clearInterval(this.monitorTimer); this.monitorTimer = null; }
  }

  /**
   * Get full system map (observability)
   */
  getSystemMap() {
    return observability.getSystemMap();
  }

  /**
   * Get economy health
   */
  getEconomyHealth() {
    return economyGuardian.checkHealth();
  }
}

export const coherenceEngine = new CoherenceEngine();
