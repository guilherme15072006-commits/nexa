/**
 * NEXA Coherence Engine — Fault Tolerance
 *
 * Assume que bugs SEMPRE existirao. Em vez de tentar prevenir tudo,
 * cria mecanismos de recuperacao:
 * - Rollback inteligente
 * - Quarentena de estados suspeitos
 * - Reconciliacao automatica
 *
 * Principio: "O sistema deve se curar sozinho."
 */

// ─── Types ──────────────────────────────────────────────────

export interface Checkpoint {
  id: string;
  userId: string;
  timestamp: number;
  state: Record<string, any>;  // snapshot of user state at this point
  reason: string;
}

export interface QuarantinedAction {
  id: string;
  action: { type: string; userId: string; amount?: number; metadata?: Record<string, any> };
  reason: string;
  quarantinedAt: number;
  expiresAt: number;           // auto-release if not reviewed
  status: 'quarantined' | 'released' | 'reversed' | 'expired';
}

export interface ReconciliationResult {
  consistent: boolean;
  corrections: Array<{ field: string; expected: any; actual: any; corrected: boolean }>;
}

// ─── Service ────────────────────────────────────────────────

class FaultToleranceService {
  private checkpoints: Checkpoint[] = [];
  private quarantine: QuarantinedAction[] = [];
  private maxCheckpoints = 100;

  // ── Checkpoints (save state before risky actions) ─────────

  /** Create a checkpoint before a risky action */
  createCheckpoint(userId: string, state: Record<string, any>, reason: string): Checkpoint {
    const cp: Checkpoint = {
      id: `cp_${Date.now()}`,
      userId,
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(state)), // deep clone
      reason,
    };
    this.checkpoints.push(cp);
    if (this.checkpoints.length > this.maxCheckpoints) {
      this.checkpoints = this.checkpoints.slice(-this.maxCheckpoints);
    }
    return cp;
  }

  /** Rollback to a checkpoint */
  rollback(checkpointId: string): Checkpoint | null {
    return this.checkpoints.find(cp => cp.id === checkpointId) ?? null;
  }

  /** Get latest checkpoint for user */
  getLatestCheckpoint(userId: string): Checkpoint | null {
    const userCps = this.checkpoints.filter(cp => cp.userId === userId);
    return userCps.length > 0 ? userCps[userCps.length - 1] : null;
  }

  // ── Quarantine (hold suspicious actions) ──────────────────

  /** Quarantine an action for review */
  quarantineAction(action: QuarantinedAction['action'], reason: string, holdMinutes = 60): QuarantinedAction {
    const q: QuarantinedAction = {
      id: `q_${Date.now()}`,
      action,
      reason,
      quarantinedAt: Date.now(),
      expiresAt: Date.now() + holdMinutes * 60_000,
      status: 'quarantined',
    };
    this.quarantine.push(q);
    return q;
  }

  /** Release a quarantined action (approve) */
  release(quarantineId: string): boolean {
    const q = this.quarantine.find(a => a.id === quarantineId);
    if (!q || q.status !== 'quarantined') return false;
    q.status = 'released';
    return true;
  }

  /** Reverse a quarantined action (reject + rollback) */
  reverse(quarantineId: string): boolean {
    const q = this.quarantine.find(a => a.id === quarantineId);
    if (!q || q.status !== 'quarantined') return false;
    q.status = 'reversed';
    return true;
  }

  /** Check and expire old quarantined actions */
  processExpired(): QuarantinedAction[] {
    const now = Date.now();
    const expired = this.quarantine.filter(q => q.status === 'quarantined' && now >= q.expiresAt);
    expired.forEach(q => { q.status = 'expired'; });
    return expired;
  }

  /** Get pending quarantined actions */
  getPending(): QuarantinedAction[] {
    return this.quarantine.filter(q => q.status === 'quarantined');
  }

  // ── Reconciliation (detect and fix inconsistencies) ───────

  /** Reconcile user state against expected values */
  reconcile(userId: string, actual: { balance: number; coins: number; level: number; xp: number }, expected: { balance: number; coins: number; level: number; xp: number }): ReconciliationResult {
    const corrections: ReconciliationResult['corrections'] = [];

    for (const field of ['balance', 'coins', 'level', 'xp'] as const) {
      const act = actual[field];
      const exp = expected[field];
      const tolerance = field === 'balance' ? 0.01 : field === 'coins' ? 1 : 0;

      if (Math.abs(act - exp) > tolerance) {
        corrections.push({ field, expected: exp, actual: act, corrected: false });
      }
    }

    return {
      consistent: corrections.length === 0,
      corrections,
    };
  }

  /** Auto-reconcile (apply corrections) */
  autoReconcile(corrections: ReconciliationResult['corrections']): ReconciliationResult['corrections'] {
    return corrections.map(c => {
      // Only auto-correct small discrepancies
      const diff = Math.abs((c.actual as number) - (c.expected as number));
      const canAutoCorrect = (c.field === 'balance' && diff < 1) || (c.field === 'coins' && diff < 10);
      return { ...c, corrected: canAutoCorrect };
    });
  }
}

export const faultTolerance = new FaultToleranceService();
