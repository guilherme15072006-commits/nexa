/**
 * NEXA Coherence Engine — Behavioral Identity
 *
 * Cada usuario NAO e uma conta fixa. E um padrao de comportamento.
 * Cria uma "assinatura comportamental" unica que evolui com o tempo.
 * Detecta desvios profundos — mesmo com login correto.
 *
 * Principio: "Voce nao e sua senha. Voce e como voce age."
 */

import { globalState, type UserStateSnapshot } from './globalState';

// ─── Types ──────────────────────────────────────────────────

export interface BehaviorSignature {
  // 10-dimensional vector normalizado (0-1)
  dimensions: {
    loginTimePreference: number;   // [0] 0=noturno, 1=diurno
    sessionDuration: number;       // [1] 0=curtas, 1=longas
    betFrequency: number;          // [2] 0=raro, 1=frequente
    betSize: number;               // [3] 0=pequeno, 1=grande
    socialActivity: number;        // [4] 0=passivo, 1=ativo
    riskAppetite: number;          // [5] 0=conservador, 1=agressivo
    deviceConsistency: number;     // [6] 0=muitos devices, 1=sempre mesmo
    transactionPattern: number;    // [7] 0=irregular, 1=regular
    responseTime: number;          // [8] 0=lento, 1=rapido
    navigationDepth: number;       // [9] 0=superficial, 1=profundo
  };
  vector: number[];
  confidence: number;              // 0-1 (quantos dados foram coletados)
  lastUpdated: number;
}

export interface DeviationResult {
  deviation: number;               // 0-1 (0=identico, 1=completamente diferente)
  isAnomaly: boolean;
  suspectedReason: 'account_takeover' | 'bot_replacement' | 'shared_account' | 'behavior_shift' | 'none';
  changedDimensions: string[];
}

// ─── Config ─────────────────────────────────────────────────

const ANOMALY_THRESHOLD = 0.45;    // deviation > 0.45 = anomaly
const LEARNING_RATE = 0.05;        // how fast signature adapts
const MIN_EVENTS_FOR_BASELINE = 20;

// ─── Service ────────────────────────────────────────────────

class BehaviorIdentityService {
  private baselines = new Map<string, BehaviorSignature>();

  /** Build initial signature from historical behavior */
  buildBaseline(userId: string, history: {
    avgLoginHour: number;          // 0-23
    avgSessionMinutes: number;     // typical session
    betsPerSession: number;
    avgBetSize: number;
    socialActionsPerSession: number;
    avgOddsSelected: number;       // risk appetite proxy
    uniqueDevices: number;
    depositFrequency: number;      // deposits per week
    avgResponseTimeMs: number;
    avgScreensPerSession: number;
  }): BehaviorSignature {
    const sig: BehaviorSignature = {
      dimensions: {
        loginTimePreference: this.normalize(history.avgLoginHour, 0, 23),
        sessionDuration: this.normalize(history.avgSessionMinutes, 1, 120),
        betFrequency: this.normalize(history.betsPerSession, 0, 20),
        betSize: this.normalize(history.avgBetSize, 0, 1000),
        socialActivity: this.normalize(history.socialActionsPerSession, 0, 30),
        riskAppetite: this.normalize(history.avgOddsSelected, 1, 10),
        deviceConsistency: this.normalize(1 / Math.max(history.uniqueDevices, 1), 0, 1),
        transactionPattern: this.normalize(history.depositFrequency, 0, 7),
        responseTime: this.normalize(1000 / Math.max(history.avgResponseTimeMs, 100), 0, 10),
        navigationDepth: this.normalize(history.avgScreensPerSession, 1, 20),
      },
      vector: [],
      confidence: Math.min(1, history.betsPerSession / MIN_EVENTS_FOR_BASELINE),
      lastUpdated: Date.now(),
    };

    sig.vector = Object.values(sig.dimensions);
    this.baselines.set(userId, sig);
    return sig;
  }

  /** Compare current behavior against baseline */
  compareToBaseline(userId: string, current: {
    loginHour: number;
    sessionMinutes: number;
    betsThisSession: number;
    avgBetSize: number;
    socialActions: number;
    avgOdds: number;
    isNewDevice: boolean;
    depositsThisWeek: number;
    avgResponseMs: number;
    screensVisited: number;
  }): DeviationResult {
    const baseline = this.baselines.get(userId);
    if (!baseline || baseline.confidence < 0.3) {
      return { deviation: 0, isAnomaly: false, suspectedReason: 'none', changedDimensions: [] };
    }

    const currentVector = [
      this.normalize(current.loginHour, 0, 23),
      this.normalize(current.sessionMinutes, 1, 120),
      this.normalize(current.betsThisSession, 0, 20),
      this.normalize(current.avgBetSize, 0, 1000),
      this.normalize(current.socialActions, 0, 30),
      this.normalize(current.avgOdds, 1, 10),
      current.isNewDevice ? 0 : 1,
      this.normalize(current.depositsThisWeek, 0, 7),
      this.normalize(1000 / Math.max(current.avgResponseMs, 100), 0, 10),
      this.normalize(current.screensVisited, 1, 20),
    ];

    // Euclidean distance normalized to 0-1
    const dimNames = Object.keys(baseline.dimensions);
    const changedDimensions: string[] = [];
    let sumSqDiff = 0;

    for (let i = 0; i < baseline.vector.length; i++) {
      const diff = Math.abs(currentVector[i] - baseline.vector[i]);
      sumSqDiff += diff * diff;
      if (diff > 0.4) changedDimensions.push(dimNames[i]);
    }

    const deviation = Math.sqrt(sumSqDiff / baseline.vector.length);
    const isAnomaly = deviation > ANOMALY_THRESHOLD;

    // Infer reason
    let suspectedReason: DeviationResult['suspectedReason'] = 'none';
    if (isAnomaly) {
      if (changedDimensions.includes('deviceConsistency') && changedDimensions.includes('responseTime')) {
        suspectedReason = 'account_takeover';
      } else if (changedDimensions.includes('responseTime') && changedDimensions.includes('betFrequency')) {
        suspectedReason = 'bot_replacement';
      } else if (changedDimensions.includes('loginTimePreference') && changedDimensions.includes('navigationDepth')) {
        suspectedReason = 'shared_account';
      } else {
        suspectedReason = 'behavior_shift';
      }
    }

    // Update global state
    const userState = globalState.getUser(userId);
    if (userState) {
      globalState.updateUser(userId, { signatureDeviation: deviation, behaviorSignature: currentVector });
    }

    return { deviation, isAnomaly, suspectedReason, changedDimensions };
  }

  /** Gradually adapt baseline (learning) */
  adaptBaseline(userId: string, currentVector: number[]): void {
    const baseline = this.baselines.get(userId);
    if (!baseline) return;

    // Exponential moving average
    for (let i = 0; i < baseline.vector.length; i++) {
      baseline.vector[i] = baseline.vector[i] * (1 - LEARNING_RATE) + currentVector[i] * LEARNING_RATE;
    }
    baseline.confidence = Math.min(1, baseline.confidence + 0.01);
    baseline.lastUpdated = Date.now();
  }

  /** Get baseline for a user */
  getBaseline(userId: string): BehaviorSignature | null {
    return this.baselines.get(userId) ?? null;
  }

  private normalize(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }
}

export const behaviorIdentity = new BehaviorIdentityService();
