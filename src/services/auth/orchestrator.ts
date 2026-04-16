import type { ModuleOrchestrator, ModuleInfo, ModuleHealth, ModuleContext, ModuleEvent, ModuleStatus } from '../core/moduleInterface';
import { authSystem } from './index';

class AuthOrchestrator implements ModuleOrchestrator {
  readonly info: ModuleInfo = { id: 'auth', name: 'Authentication', version: '1.0.0', dependencies: ['security'] };
  private status: ModuleStatus = 'idle';
  private startTime = 0;
  private errors = 0;
  private lastError: string | null = null;
  private ctx: ModuleContext | null = null;
  private loginCount = 0;
  private failedLogins = 0;

  init(context: ModuleContext): void {
    this.ctx = context;
    this.startTime = Date.now();
    this.status = 'running';
    this.ctx.emit({ source: 'auth', type: 'module_ready', payload: {}, timestamp: Date.now() });
  }

  shutdown(): void {
    this.status = 'stopped';
  }

  getHealth(): ModuleHealth {
    return {
      status: this.status,
      healthy: this.status === 'running' && this.errors < 10,
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
      errors: this.errors,
      lastError: this.lastError,
      metrics: { loginCount: this.loginCount, failedLogins: this.failedLogins },
    };
  }

  onEvent(event: ModuleEvent): void {
    if (event.type === 'user_state_changed' && event.source === 'security') {
      // Security flagged user — could force re-auth
    }
  }

  /** Wrapped login that reports to event bus */
  async login(email: string, password: string) {
    const result = await authSystem.login(email, password);
    if (result.success) {
      this.loginCount++;
      this.ctx?.emit({ source: 'auth', type: 'login_success', payload: { userId: result.user?.uid, method: 'email' }, timestamp: Date.now() });
    } else {
      this.failedLogins++;
      this.ctx?.emit({ source: 'auth', type: 'login_failed', payload: { error: result.error }, timestamp: Date.now() });
    }
    return result;
  }

  async loginWithGoogle() {
    const result = await authSystem.loginWithGoogle();
    if (result.success) {
      this.loginCount++;
      this.ctx?.emit({ source: 'auth', type: 'login_success', payload: { userId: result.user?.uid, method: 'google' }, timestamp: Date.now() });
    }
    return result;
  }

  async logout() {
    await authSystem.logout();
    this.ctx?.emit({ source: 'auth', type: 'logout', payload: {}, timestamp: Date.now() });
  }
}

export const authOrchestrator = new AuthOrchestrator();
