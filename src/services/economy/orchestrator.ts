import type { ModuleOrchestrator, ModuleInfo, ModuleHealth, ModuleContext, ModuleEvent, ModuleStatus } from '../core/moduleInterface';
import { economySystem, MARKETPLACE_COMMISSION_RATE } from './index';

class EconomyOrchestrator implements ModuleOrchestrator {
  readonly info: ModuleInfo = { id: 'economy', name: 'Economy & Payments', version: '1.0.0', dependencies: ['security'] };
  private status: ModuleStatus = 'idle';
  private startTime = 0;
  private errors = 0;
  private lastError: string | null = null;
  private ctx: ModuleContext | null = null;
  private totalDeposits = 0;
  private totalWithdraws = 0;
  private totalCommissions = 0;

  init(context: ModuleContext): void {
    this.ctx = context;
    this.startTime = Date.now();
    this.status = 'running';
    this.ctx.emit({ source: 'economy', type: 'module_ready', payload: {}, timestamp: Date.now() });
  }

  shutdown(): void { this.status = 'stopped'; }

  getHealth(): ModuleHealth {
    return {
      status: this.status, healthy: this.status === 'running',
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
      errors: this.errors, lastError: this.lastError,
      metrics: { totalDeposits: this.totalDeposits, totalWithdraws: this.totalWithdraws, totalCommissions: this.totalCommissions, commissionRate: MARKETPLACE_COMMISSION_RATE },
    };
  }

  onEvent(event: ModuleEvent): void {
    if (event.type === 'bet_placed' && event.source === 'betting') {
      // Could track betting volume for economy health
    }
  }

  recordDeposit(amount: number): void {
    this.totalDeposits += amount;
    this.ctx?.emit({ source: 'economy', type: 'deposit', payload: { amount }, timestamp: Date.now() });
  }

  recordWithdraw(amount: number): void {
    this.totalWithdraws += amount;
    this.ctx?.emit({ source: 'economy', type: 'withdraw', payload: { amount }, timestamp: Date.now() });
  }

  recordMarketplaceSale(price: number): void {
    const commission = Math.round(price * MARKETPLACE_COMMISSION_RATE);
    this.totalCommissions += commission;
    this.ctx?.emit({ source: 'economy', type: 'marketplace_sale', payload: { price, commission, sellerPayout: price - commission }, timestamp: Date.now() });
  }
}

export const economyOrchestrator = new EconomyOrchestrator();
