import type { ModuleOrchestrator, ModuleInfo, ModuleHealth, ModuleContext, ModuleEvent, ModuleStatus } from '../core/moduleInterface';
import { bettingSystem } from './index';

class BettingOrchestrator implements ModuleOrchestrator {
  readonly info: ModuleInfo = { id: 'betting', name: 'Betting Engine', version: '1.0.0', dependencies: ['security', 'economy'] };
  private status: ModuleStatus = 'idle';
  private startTime = 0;
  private errors = 0;
  private lastError: string | null = null;
  private ctx: ModuleContext | null = null;
  private totalBets = 0;
  private totalVolume = 0;

  init(context: ModuleContext): void {
    this.ctx = context;
    this.startTime = Date.now();
    bettingSystem.init();
    this.status = 'running';
    this.ctx.emit({ source: 'betting', type: 'module_ready', payload: {}, timestamp: Date.now() });
  }

  shutdown(): void {
    bettingSystem.shutdown();
    this.status = 'stopped';
  }

  getHealth(): ModuleHealth {
    return {
      status: this.status,
      healthy: this.status === 'running',
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
      errors: this.errors,
      lastError: this.lastError,
      metrics: { totalBets: this.totalBets, totalVolume: this.totalVolume },
    };
  }

  onEvent(event: ModuleEvent): void {
    if (event.type === 'odds_update' && event.source === 'live') {
      // Live arena sending odds updates
    }
  }

  /** Place bet with event emission */
  placeBet(userId: string, matchId: string, side: string, odds: number, stake: number, balance: number) {
    const result = bettingSystem.placeBet(userId, matchId, side, odds, stake, balance);
    if (result.allowed) {
      this.totalBets++;
      this.totalVolume += stake;
      this.ctx?.emit({ source: 'betting', type: 'bet_placed', payload: { userId, matchId, side, odds, stake }, timestamp: Date.now() });
    }
    return result;
  }
}

export const bettingOrchestrator = new BettingOrchestrator();
