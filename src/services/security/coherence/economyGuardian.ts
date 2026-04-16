/**
 * NEXA Coherence Engine — Economy Guardian
 *
 * Modela a economia como um sistema FECHADO e CONSERVATIVO.
 * Detecta criacao indevida de valor, duplicacao, e fluxos anormais.
 *
 * Lei da conservacao: valor total entrando = valor total saindo + valor no sistema.
 * Qualquer desvio = anomalia.
 */

import { globalState } from './globalState';

// ─── Types ──────────────────────────────────────────────────

export interface EconomyHealth {
  healthy: boolean;
  drift: number;               // divergencia do total teorico
  driftPercent: number;
  alerts: EconomyAlert[];
}

export interface EconomyAlert {
  type: 'value_creation' | 'value_destruction' | 'unusual_flow' | 'concentration' | 'velocity_spike';
  severity: 'info' | 'warning' | 'critical';
  description: string;
  evidence: Record<string, any>;
}

interface FlowRecord {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  type: string;
}

// ─── Service ────────────────────────────────────────────────

class EconomyGuardianService {
  private flows: FlowRecord[] = [];
  private totalDeposited = 0;
  private totalWithdrawn = 0;
  private totalCommissions = 0;

  /** Record a value flow between entities */
  recordFlow(from: string, to: string, amount: number, type: string): void {
    this.flows.push({ from, to, amount, timestamp: Date.now(), type });
    // Keep last 10k flows
    if (this.flows.length > 10_000) this.flows = this.flows.slice(-10_000);

    if (type === 'deposit') { this.totalDeposited += amount; globalState.recordValueIn(amount); }
    if (type === 'withdraw') { this.totalWithdrawn += amount; globalState.recordValueOut(amount); }
    if (type === 'commission') this.totalCommissions += amount;
  }

  /** Full economy health check */
  checkHealth(): EconomyHealth {
    const alerts: EconomyAlert[] = [];
    const drift = globalState.getEconomyDrift();
    const driftPercent = this.totalDeposited > 0 ? (drift / this.totalDeposited) * 100 : 0;

    // 1. Conservation violation
    if (Math.abs(drift) > 10) { // R$10 tolerance
      alerts.push({
        type: Math.abs(drift) > 0 ? 'value_creation' : 'value_destruction',
        severity: Math.abs(drift) > 100 ? 'critical' : 'warning',
        description: `Drift economico: R$${drift.toFixed(2)} (${driftPercent.toFixed(2)}%)`,
        evidence: { drift, deposited: this.totalDeposited, withdrawn: this.totalWithdrawn },
      });
    }

    // 2. Concentration check — any single user holding >30% of total
    const users = globalState.getAllUsers();
    const totalInSystem = users.reduce((s, u) => s + u.totalValueInSystem, 0);
    if (totalInSystem > 0) {
      for (const user of users) {
        const pct = user.totalValueInSystem / totalInSystem;
        if (pct > 0.3 && users.length > 10) {
          alerts.push({
            type: 'concentration',
            severity: 'warning',
            description: `User ${user.userId.slice(0, 8)} detém ${(pct * 100).toFixed(0)}% do valor total`,
            evidence: { userId: user.userId, value: user.totalValueInSystem, total: totalInSystem, percent: pct },
          });
        }
      }
    }

    // 3. Velocity spike — too many flows in short window
    const last5min = this.flows.filter(f => Date.now() - f.timestamp < 300_000);
    if (last5min.length > 500) {
      alerts.push({
        type: 'velocity_spike',
        severity: 'warning',
        description: `${last5min.length} fluxos economicos em 5 minutos`,
        evidence: { count: last5min.length, window: '5min' },
      });
    }

    // 4. Unusual flow — same pair trading back and forth
    const pairCounts = new Map<string, number>();
    for (const flow of last5min) {
      const key = [flow.from, flow.to].sort().join(':');
      pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
    }
    for (const [pair, count] of pairCounts) {
      if (count > 10) {
        alerts.push({
          type: 'unusual_flow',
          severity: 'warning',
          description: `${count} transacoes entre o mesmo par em 5min`,
          evidence: { pair, count, window: '5min' },
        });
      }
    }

    return {
      healthy: alerts.filter(a => a.severity === 'critical').length === 0,
      drift,
      driftPercent,
      alerts,
    };
  }

  /** Get flow summary for observability */
  getFlowSummary(minutes = 60): { totalVolume: number; uniquePairs: number; topFlows: FlowRecord[] } {
    const cutoff = Date.now() - minutes * 60_000;
    const recent = this.flows.filter(f => f.timestamp > cutoff);
    const totalVolume = recent.reduce((s, f) => s + f.amount, 0);
    const pairs = new Set(recent.map(f => `${f.from}:${f.to}`));
    const sorted = [...recent].sort((a, b) => b.amount - a.amount);
    return { totalVolume, uniquePairs: pairs.size, topFlows: sorted.slice(0, 10) };
  }
}

export const economyGuardian = new EconomyGuardianService();
