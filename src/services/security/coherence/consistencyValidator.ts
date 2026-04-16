/**
 * NEXA Coherence Engine — Consistency Validator
 *
 * Valida TODA acao contra o estado global do sistema.
 * Detecta estados impossiveis, sequencias invalidas,
 * e combinacoes de acoes validas que geram resultados invalidos.
 *
 * Principio: "O objetivo nao e impedir acoes isoladas.
 * O objetivo e impedir que o sistema entre em estados invalidos."
 *
 * Diferencial vs sistemas tradicionais:
 * - Tradicional: "Esta acao e permitida?" (regra local)
 * - Coherence:   "O sistema continua consistente apos esta acao?" (validacao global)
 */

import { globalState, type UserStateSnapshot } from './globalState';

// ─── Types ──────────────────────────────────────────────────

export type ActionType = 'deposit' | 'withdraw' | 'bet' | 'trade' | 'transfer' | 'claim_reward' | 'level_up' | 'create_listing';

export interface Action {
  type: ActionType;
  userId: string;
  amount?: number;
  targetUserId?: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface ValidationResult {
  valid: boolean;
  coherent: boolean;          // passes global consistency check
  violations: Violation[];
  decision: 'allow' | 'delay' | 'block' | 'quarantine';
  quarantineReason?: string;
}

export interface Violation {
  rule: string;
  severity: 'warning' | 'error' | 'critical';
  description: string;
  evidence: Record<string, any>;
}

// ─── Consistency Rules (declarative, not imperative) ────────

type ConsistencyRule = {
  id: string;
  name: string;
  severity: Violation['severity'];
  check: (action: Action, user: UserStateSnapshot | null) => Violation | null;
};

const CONSISTENCY_RULES: ConsistencyRule[] = [
  // ── Economic Conservation ─────────────────────────────────
  {
    id: 'ECON_001',
    name: 'negative_balance',
    severity: 'critical',
    check: (action, user) => {
      if (!user) return null;
      if (action.type === 'withdraw' || action.type === 'bet' || action.type === 'trade') {
        const afterBalance = user.balance - (action.amount ?? 0);
        if (afterBalance < -0.01) { // float tolerance
          return { rule: 'ECON_001', severity: 'critical', description: 'Acao resultaria em saldo negativo', evidence: { currentBalance: user.balance, actionAmount: action.amount, wouldBe: afterBalance } };
        }
      }
      return null;
    },
  },
  {
    id: 'ECON_002',
    name: 'economy_drift',
    severity: 'critical',
    check: () => {
      const drift = globalState.getEconomyDrift();
      if (Math.abs(drift) > 100) { // R$100 tolerance
        return { rule: 'ECON_002', severity: 'critical', description: 'Drift economico detectado — valor criado/destruido sem explicacao', evidence: { drift, threshold: 100 } };
      }
      return null;
    },
  },
  {
    id: 'ECON_003',
    name: 'value_duplication',
    severity: 'critical',
    check: (action, user) => {
      if (!user || action.type !== 'claim_reward') return null;
      // Same reward claimed twice in rapid succession
      if (user.actionsLast5Min > 10 && action.metadata?.rewardId) {
        return { rule: 'ECON_003', severity: 'critical', description: 'Possivel duplicacao de reward', evidence: { rewardId: action.metadata.rewardId, actionsLast5Min: user.actionsLast5Min } };
      }
      return null;
    },
  },

  // ── Temporal Consistency ──────────────────────────────────
  {
    id: 'TEMP_001',
    name: 'impossible_speed',
    severity: 'error',
    check: (action, user) => {
      if (!user) return null;
      // More than 100 actions in 5 minutes = impossible for human
      if (user.actionsLast5Min > 100) {
        return { rule: 'TEMP_001', severity: 'error', description: 'Velocidade de acoes sobre-humana', evidence: { actionsLast5Min: user.actionsLast5Min, threshold: 100 } };
      }
      return null;
    },
  },
  {
    id: 'TEMP_002',
    name: 'time_travel',
    severity: 'critical',
    check: (action, user) => {
      if (!user) return null;
      // Action timestamp before session start
      if (action.timestamp < user.sessionStart - 60_000) { // 1min tolerance
        return { rule: 'TEMP_002', severity: 'critical', description: 'Acao com timestamp antes da sessao', evidence: { actionTime: action.timestamp, sessionStart: user.sessionStart } };
      }
      return null;
    },
  },

  // ── Identity Consistency ──────────────────────────────────
  {
    id: 'IDENT_001',
    name: 'behavior_deviation',
    severity: 'warning',
    check: (action, user) => {
      if (!user) return null;
      if (user.signatureDeviation > 0.6) {
        return { rule: 'IDENT_001', severity: 'warning', description: 'Desvio comportamental significativo', evidence: { deviation: user.signatureDeviation, threshold: 0.6 } };
      }
      return null;
    },
  },

  // ── Relational Consistency ────────────────────────────────
  {
    id: 'REL_001',
    name: 'circular_flow',
    severity: 'error',
    check: (action, user) => {
      if (!user || action.type !== 'trade' || !action.targetUserId) return null;
      // A→B→A circular trades
      if (user.frequentCounterparties.length > 0) {
        const targetUser = globalState.getUser(action.targetUserId);
        if (targetUser?.frequentCounterparties.includes(user.userId)) {
          return { rule: 'REL_001', severity: 'error', description: 'Fluxo circular de valor detectado', evidence: { from: user.userId, to: action.targetUserId, mutualTrades: true } };
        }
      }
      return null;
    },
  },

  // ── Platform Consistency ──────────────────────────────────
  {
    id: 'PLAT_001',
    name: 'system_overload',
    severity: 'warning',
    check: () => {
      const state = globalState.getPlatformState();
      if (state.eventsPerSecond > 1000) {
        return { rule: 'PLAT_001', severity: 'warning', description: 'Sistema sob carga elevada', evidence: { eventsPerSecond: state.eventsPerSecond, peak: state.peakEventsPerSecond } };
      }
      return null;
    },
  },
];

// ─── Service ────────────────────────────────────────────────

class ConsistencyValidatorService {
  /** Validate an action against ALL consistency rules */
  validate(action: Action): ValidationResult {
    const user = globalState.getUser(action.userId);
    const violations: Violation[] = [];

    // Run all rules
    for (const rule of CONSISTENCY_RULES) {
      const violation = rule.check(action, user);
      if (violation) violations.push(violation);
    }

    // Determine decision based on worst violation
    const hasCritical = violations.some(v => v.severity === 'critical');
    const hasError = violations.some(v => v.severity === 'error');

    let decision: ValidationResult['decision'] = 'allow';
    let quarantineReason: string | undefined;

    if (hasCritical) {
      decision = 'quarantine';
      quarantineReason = violations.find(v => v.severity === 'critical')?.description;
    } else if (hasError) {
      decision = 'block';
    } else if (violations.length > 0) {
      decision = 'delay';
    }

    // Record event in global state
    globalState.recordEvent();
    if (user) {
      globalState.updateUser(action.userId, {
        actionsLast5Min: (user.actionsLast5Min ?? 0) + 1,
        actionsLast1h: (user.actionsLast1h ?? 0) + 1,
      });
    }

    return {
      valid: violations.length === 0,
      coherent: !hasCritical,
      violations,
      decision,
      quarantineReason,
    };
  }

  /** Get all active rules */
  getRules(): Array<{ id: string; name: string; severity: string }> {
    return CONSISTENCY_RULES.map(r => ({ id: r.id, name: r.name, severity: r.severity }));
  }
}

export const consistencyValidator = new ConsistencyValidatorService();
