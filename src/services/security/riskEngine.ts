/**
 * NEXA Security — Risk Engine
 *
 * Modulo independente. Calcula score de risco por usuario em tempo real.
 * Combina sinais de login, transacao, comportamento e historico.
 *
 * Consumido por: orchestrator.ts, sessionManager.ts, tradeGuard.ts
 * Consome: auditLog.ts, deviceFingerprint.ts
 */

import { auditLog, type AuditEntry } from './auditLog';
import { deviceFingerprint } from './deviceFingerprint';

// ─── Types ──────────────────────────────────────────────────

export type RiskLevel = 'normal' | 'elevated' | 'high' | 'critical' | 'extreme';

export interface RiskAssessment {
  score: number;           // 0-100
  level: RiskLevel;
  factors: RiskFactor[];
  suggestedAction: 'allow' | 'challenge' | 'restrict' | 'block';
  timestamp: number;
}

interface RiskFactor {
  name: string;
  weight: number;
  triggered: boolean;
  detail: string;
}

interface UserRiskProfile {
  userId: string;
  baseScore: number;
  recentEvents: AuditEntry[];
  lastAssessment: RiskAssessment | null;
  updatedAt: number;
}

// ─── Config ─────────────────────────────────────────────────

const RISK_FACTORS: Array<{
  name: string;
  weight: number;
  evaluate: (ctx: RiskContext) => { triggered: boolean; detail: string };
}> = [
  {
    name: 'new_device',
    weight: 30,
    evaluate: (ctx) => ({
      triggered: !ctx.isDeviceTrusted,
      detail: ctx.isDeviceTrusted ? 'Device conhecido' : 'Device nao reconhecido',
    }),
  },
  {
    name: 'unusual_hour',
    weight: 15,
    evaluate: (ctx) => {
      const hour = new Date().getHours();
      const unusual = hour >= 1 && hour <= 5;
      return { triggered: unusual, detail: unusual ? `Login as ${hour}h (fora do padrao)` : 'Horario normal' };
    },
  },
  {
    name: 'recent_failures',
    weight: 20,
    evaluate: (ctx) => {
      const failures = ctx.recentEvents.filter(e => e.action === 'login_failed').length;
      return { triggered: failures >= 3, detail: `${failures} tentativas falhas recentes` };
    },
  },
  {
    name: 'rapid_transactions',
    weight: 25,
    evaluate: (ctx) => {
      const txns = ctx.recentEvents.filter(e => ['deposit', 'withdraw', 'trade'].includes(e.action));
      const inLast5Min = txns.filter(e => Date.now() - e.timestamp < 300_000).length;
      return { triggered: inLast5Min >= 5, detail: `${inLast5Min} transacoes em 5min` };
    },
  },
  {
    name: 'high_value_action',
    weight: 15,
    evaluate: (ctx) => {
      const triggered = (ctx.actionAmount ?? 0) > 5000;
      return { triggered, detail: triggered ? `Valor alto: ${ctx.actionAmount}` : 'Valor normal' };
    },
  },
  {
    name: 'account_age',
    weight: 10,
    evaluate: (ctx) => {
      const triggered = ctx.accountAgeDays < 7;
      return { triggered, detail: triggered ? `Conta nova (${ctx.accountAgeDays} dias)` : 'Conta estabelecida' };
    },
  },
  {
    name: 'no_mfa',
    weight: 10,
    evaluate: (ctx) => ({
      triggered: !ctx.mfaEnabled,
      detail: ctx.mfaEnabled ? 'MFA ativo' : 'MFA desabilitado',
    }),
  },
  {
    name: 'previous_penalties',
    weight: 20,
    evaluate: (ctx) => ({
      triggered: ctx.penaltyCount > 0,
      detail: `${ctx.penaltyCount} penalidade(s) anteriores`,
    }),
  },
];

interface RiskContext {
  userId: string;
  isDeviceTrusted: boolean;
  recentEvents: AuditEntry[];
  actionAmount?: number;
  accountAgeDays: number;
  mfaEnabled: boolean;
  penaltyCount: number;
}

// ─── Service ────────────────────────────────────────────────

class RiskEngineService {
  private profiles = new Map<string, UserRiskProfile>();

  /** Assess risk for a user action */
  assess(ctx: RiskContext): RiskAssessment {
    const factors: RiskFactor[] = RISK_FACTORS.map(f => {
      const result = f.evaluate(ctx);
      return { name: f.name, weight: f.weight, triggered: result.triggered, detail: result.detail };
    });

    const score = Math.min(100, factors.reduce((sum, f) => sum + (f.triggered ? f.weight : 0), 0));

    const level: RiskLevel =
      score >= 91 ? 'extreme' :
      score >= 76 ? 'critical' :
      score >= 51 ? 'high' :
      score >= 21 ? 'elevated' : 'normal';

    const suggestedAction =
      score >= 76 ? 'block' :
      score >= 51 ? 'restrict' :
      score >= 21 ? 'challenge' : 'allow';

    const assessment: RiskAssessment = { score, level, factors, suggestedAction, timestamp: Date.now() };

    // Cache profile
    this.profiles.set(ctx.userId, {
      userId: ctx.userId,
      baseScore: score,
      recentEvents: ctx.recentEvents,
      lastAssessment: assessment,
      updatedAt: Date.now(),
    });

    // Log significant risk
    if (score >= 50) {
      auditLog.log({
        userId: ctx.userId,
        action: 'risk_score_changed',
        resource: 'risk_engine',
        detail: { score, level, topFactors: factors.filter(f => f.triggered).map(f => f.name) },
        result: score >= 76 ? 'blocked' : 'success',
      });
    }

    return assessment;
  }

  /** Quick risk check for login */
  assessLogin(userId: string, mfaEnabled: boolean, accountAgeDays: number, penaltyCount: number): RiskAssessment {
    return this.assess({
      userId,
      isDeviceTrusted: deviceFingerprint.isDeviceTrusted(),
      recentEvents: auditLog.getRecent(userId, 50),
      accountAgeDays,
      mfaEnabled,
      penaltyCount,
    });
  }

  /** Quick risk check for transaction */
  assessTransaction(userId: string, amount: number, mfaEnabled: boolean): RiskAssessment {
    return this.assess({
      userId,
      isDeviceTrusted: deviceFingerprint.isDeviceTrusted(),
      recentEvents: auditLog.getRecent(userId, 50),
      actionAmount: amount,
      accountAgeDays: 30, // simplified
      mfaEnabled,
      penaltyCount: 0,
    });
  }

  /** Get cached assessment */
  getLastAssessment(userId: string): RiskAssessment | null {
    return this.profiles.get(userId)?.lastAssessment ?? null;
  }

  /** Get risk level label */
  static getLevelLabel(level: RiskLevel): string {
    const labels: Record<RiskLevel, string> = {
      normal: 'Normal', elevated: 'Elevado', high: 'Alto', critical: 'Critico', extreme: 'Extremo',
    };
    return labels[level];
  }
}

export const riskEngine = new RiskEngineService();
