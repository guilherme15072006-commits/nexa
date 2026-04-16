/**
 * NEXA Coherence Engine — Global State Model
 *
 * Mantem um modelo VIVO do estado total da plataforma.
 * Nao e um banco de dados — e uma representacao em memoria
 * que permite validar qualquer acao contra o estado global.
 *
 * Principio: "O sistema e um organismo. Cada acao deve ser
 * coerente com o estado do organismo inteiro."
 */

// ─── Types ──────────────────────────────────────────────────

export interface UserStateSnapshot {
  userId: string;
  // Temporal
  lastSeen: number;
  sessionStart: number;
  actionsLast5Min: number;
  actionsLast1h: number;
  // Economic
  balance: number;
  coins: number;
  pendingDeposits: number;
  pendingWithdraws: number;
  totalValueInSystem: number;  // balance + coins/100 + pending
  // Behavioral
  behaviorSignature: number[]; // 10-dimensional vector
  signatureDeviation: number;  // 0-1 distance from baseline
  // Risk
  riskScore: number;
  anomalyCount: number;
  // Relations
  frequentCounterparties: string[]; // top 5 trade partners
  clanId: string | null;
}

export interface EconomySnapshot {
  totalBRL: number;            // sum of all user balances
  totalCoins: number;          // sum of all coins
  totalPendingDeposits: number;
  totalPendingWithdraws: number;
  theoreticalTotal: number;    // what the total SHOULD be (conservation)
  actualTotal: number;         // what it actually is
  drift: number;               // actualTotal - theoreticalTotal (should be ~0)
  topFlows: Array<{ from: string; to: string; amount: number; count: number }>;
}

export interface PlatformState {
  timestamp: number;
  activeUsers: number;
  activeSessions: number;
  // Economy conservation
  economy: EconomySnapshot;
  // Global anomalies
  globalAnomalyScore: number;  // 0-100
  activeAlerts: number;
  // Temporal
  eventsPerSecond: number;
  peakEventsPerSecond: number;
}

// ─── Global State Store ─────────────────────────────���───────

class GlobalStateModel {
  private users = new Map<string, UserStateSnapshot>();
  private platform: PlatformState;
  private economyLedger: number = 0; // running total of all value created/destroyed
  private eventCounter = 0;
  private eventWindow: number[] = []; // timestamps of recent events

  constructor() {
    this.platform = {
      timestamp: Date.now(),
      activeUsers: 0,
      activeSessions: 0,
      economy: {
        totalBRL: 0, totalCoins: 0,
        totalPendingDeposits: 0, totalPendingWithdraws: 0,
        theoreticalTotal: 0, actualTotal: 0, drift: 0,
        topFlows: [],
      },
      globalAnomalyScore: 0,
      activeAlerts: 0,
      eventsPerSecond: 0,
      peakEventsPerSecond: 0,
    };
  }

  // ── User State ────────────────────────────────────────────

  /** Update or create user snapshot */
  updateUser(userId: string, partial: Partial<UserStateSnapshot>): void {
    const existing = this.users.get(userId) ?? this.createDefaultUser(userId);
    this.users.set(userId, { ...existing, ...partial, lastSeen: Date.now() });
    this.platform.activeUsers = this.users.size;
  }

  /** Get user snapshot */
  getUser(userId: string): UserStateSnapshot | null {
    return this.users.get(userId) ?? null;
  }

  /** Get all user snapshots (for economy validation) */
  getAllUsers(): UserStateSnapshot[] {
    return Array.from(this.users.values());
  }

  private createDefaultUser(userId: string): UserStateSnapshot {
    return {
      userId,
      lastSeen: Date.now(), sessionStart: Date.now(),
      actionsLast5Min: 0, actionsLast1h: 0,
      balance: 0, coins: 0, pendingDeposits: 0, pendingWithdraws: 0, totalValueInSystem: 0,
      behaviorSignature: new Array(10).fill(0.5),
      signatureDeviation: 0,
      riskScore: 0, anomalyCount: 0,
      frequentCounterparties: [],
      clanId: null,
    };
  }

  // ── Economy ───────────────────────────────────────────────

  /** Record value entering the system (deposit) */
  recordValueIn(amount: number): void {
    this.economyLedger += amount;
    this.recalculateEconomy();
  }

  /** Record value leaving the system (withdraw) */
  recordValueOut(amount: number): void {
    this.economyLedger -= amount;
    this.recalculateEconomy();
  }

  /** Recalculate economy totals from all users */
  recalculateEconomy(): void {
    let totalBRL = 0, totalCoins = 0;
    for (const user of this.users.values()) {
      totalBRL += user.balance;
      totalCoins += user.coins;
    }
    const actualTotal = totalBRL + (totalCoins / 100);
    this.platform.economy = {
      ...this.platform.economy,
      totalBRL,
      totalCoins,
      actualTotal,
      theoreticalTotal: this.economyLedger,
      drift: actualTotal - this.economyLedger,
    };
  }

  /** Get economy drift (should be ~0 in a consistent system) */
  getEconomyDrift(): number {
    return this.platform.economy.drift;
  }

  // ── Event Tracking ────────────────────────────────────────

  /** Record an event (for rate calculation) */
  recordEvent(): void {
    const now = Date.now();
    this.eventCounter++;
    this.eventWindow.push(now);
    // Keep only last 10 seconds
    this.eventWindow = this.eventWindow.filter(t => now - t < 10_000);
    this.platform.eventsPerSecond = this.eventWindow.length / 10;
    this.platform.peakEventsPerSecond = Math.max(this.platform.peakEventsPerSecond, this.platform.eventsPerSecond);
  }

  // ── Platform State ────────────────────────────────────────

  /** Get full platform state */
  getPlatformState(): PlatformState {
    this.platform.timestamp = Date.now();
    return { ...this.platform };
  }

  /** Update global anomaly score */
  setGlobalAnomalyScore(score: number): void {
    this.platform.globalAnomalyScore = score;
  }
}

export const globalState = new GlobalStateModel();
