import type { ModuleOrchestrator, ModuleInfo, ModuleHealth, ModuleContext, ModuleEvent, ModuleStatus } from '../core/moduleInterface';
import { securityOrchestrator } from './index';
import { auditLog } from './auditLog';
import { penaltyEngine } from './penaltyEngine';
import { riskEngine } from './riskEngine';

class SecurityOrchestratorModule implements ModuleOrchestrator {
  readonly info: ModuleInfo = { id: 'security', name: 'Security & Coherence', version: '1.0.0', dependencies: [] };
  private status: ModuleStatus = 'idle';
  private startTime = 0;
  private errors = 0;
  private lastError: string | null = null;
  private ctx: ModuleContext | null = null;

  init(context: ModuleContext): void {
    this.ctx = context;
    this.startTime = Date.now();
    securityOrchestrator.init(context.userId);
    auditLog.start();
    this.status = 'running';

    // Forward audit events to event bus
    auditLog.onEntry((entry) => {
      this.ctx?.emit({ source: 'security', type: `audit:${entry.action}`, payload: { userId: entry.userId, result: entry.result }, timestamp: Date.now() });
    });

    this.ctx.emit({ source: 'security', type: 'module_ready', payload: {}, timestamp: Date.now() });
  }

  shutdown(): void {
    securityOrchestrator.shutdown();
    auditLog.stop();
    this.status = 'stopped';
  }

  getHealth(): ModuleHealth {
    const penalties = penaltyEngine.getHistory('').length;
    return {
      status: this.status,
      healthy: this.status === 'running',
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
      errors: this.errors,
      lastError: this.lastError,
      metrics: { auditEntries: auditLog.getRecent('', 0).length, activePenalties: penalties },
    };
  }

  onEvent(event: ModuleEvent): void {
    if (event.type === 'login_failed' && event.source === 'auth') {
      securityOrchestrator.onLoginFailed(event.payload.identifier ?? '');
    }
    if (event.type === 'login_success' && event.source === 'auth') {
      securityOrchestrator.onLoginSuccess(event.payload.userId ?? '');
    }
    if (event.type === 'bet_placed' && event.source === 'betting') {
      // Run anti-cheat scan periodically
    }
  }
}

export const securityModule = new SecurityOrchestratorModule();
