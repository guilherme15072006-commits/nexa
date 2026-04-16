/**
 * NEXA Coherence Engine — Deep Observability
 *
 * Cria um "mapa vivo" do sistema. Permite visualizar:
 * - Fluxos de acoes em tempo real
 * - Zonas de risco
 * - Anomalias emergentes
 * - Saude da economia
 *
 * Principio: "O que nao se ve, nao se protege."
 */

import { globalState, type PlatformState } from './globalState';
import { economyGuardian, type EconomyHealth } from './economyGuardian';

// ─── Types ──────────────────────────────────────────────────

export interface SystemMap {
  timestamp: number;
  platform: PlatformState;
  economy: EconomyHealth;
  riskZones: RiskZone[];
  activeAnomalies: Anomaly[];
  healthScore: number;        // 0-100 (100 = perfeito)
}

export interface RiskZone {
  area: string;               // 'auth', 'betting', 'economy', 'social'
  riskLevel: number;          // 0-100
  activeIssues: number;
  description: string;
}

export interface Anomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUsers: number;
  detectedAt: number;
  resolved: boolean;
}

// ─── Service ────────────────────────────────────────────────

class ObservabilityService {
  private anomalies: Anomaly[] = [];
  private listeners: Array<(map: SystemMap) => void> = [];

  /** Subscribe to system map updates */
  onUpdate(listener: (map: SystemMap) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  /** Report an anomaly */
  reportAnomaly(type: string, severity: Anomaly['severity'], description: string, affectedUsers = 1): Anomaly {
    const anomaly: Anomaly = {
      id: `anom_${Date.now()}`,
      type, severity, description, affectedUsers,
      detectedAt: Date.now(),
      resolved: false,
    };
    this.anomalies.push(anomaly);
    return anomaly;
  }

  /** Resolve an anomaly */
  resolveAnomaly(anomalyId: string): void {
    const a = this.anomalies.find(x => x.id === anomalyId);
    if (a) a.resolved = true;
  }

  /** Generate full system map */
  getSystemMap(): SystemMap {
    const platform = globalState.getPlatformState();
    const economy = economyGuardian.checkHealth();
    const activeAnomalies = this.anomalies.filter(a => !a.resolved);

    // Calculate risk zones
    const riskZones: RiskZone[] = [
      {
        area: 'auth',
        riskLevel: platform.globalAnomalyScore > 50 ? 70 : 20,
        activeIssues: activeAnomalies.filter(a => a.type.startsWith('auth')).length,
        description: platform.globalAnomalyScore > 50 ? 'Atividade de login anomala' : 'Normal',
      },
      {
        area: 'economy',
        riskLevel: economy.healthy ? 10 : (Math.abs(economy.drift) > 100 ? 90 : 50),
        activeIssues: economy.alerts.length,
        description: economy.healthy ? 'Economia conservativa' : `Drift: R$${economy.drift.toFixed(2)}`,
      },
      {
        area: 'betting',
        riskLevel: activeAnomalies.filter(a => a.type.includes('bet') || a.type.includes('cheat')).length > 0 ? 60 : 10,
        activeIssues: activeAnomalies.filter(a => a.type.includes('bet')).length,
        description: 'Monitorando padroes de aposta',
      },
      {
        area: 'social',
        riskLevel: activeAnomalies.filter(a => a.type.includes('social') || a.type.includes('spam')).length > 0 ? 40 : 5,
        activeIssues: activeAnomalies.filter(a => a.type.includes('social')).length,
        description: 'Monitorando atividade social',
      },
    ];

    // Health score (inverse of overall risk)
    const avgRisk = riskZones.reduce((s, z) => s + z.riskLevel, 0) / riskZones.length;
    const anomalyPenalty = activeAnomalies.filter(a => a.severity === 'critical').length * 20;
    const healthScore = Math.max(0, Math.round(100 - avgRisk - anomalyPenalty));

    const map: SystemMap = {
      timestamp: Date.now(),
      platform,
      economy,
      riskZones,
      activeAnomalies,
      healthScore,
    };

    // Notify listeners
    this.listeners.forEach(l => l(map));

    // Update global state
    globalState.setGlobalAnomalyScore(100 - healthScore);

    return map;
  }

  /** Get health score (quick check) */
  getHealthScore(): number {
    return this.getSystemMap().healthScore;
  }

  /** Get active anomaly count */
  getActiveAnomalyCount(): number {
    return this.anomalies.filter(a => !a.resolved).length;
  }
}

export const observability = new ObservabilityService();
