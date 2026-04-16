import type { ModuleOrchestrator, ModuleInfo, ModuleHealth, ModuleContext, ModuleEvent, ModuleStatus } from '../core/moduleInterface';
import { notificationSystem } from './index';

class NotificationsOrchestrator implements ModuleOrchestrator {
  readonly info: ModuleInfo = { id: 'notifications', name: 'Smart Notifications', version: '1.0.0', dependencies: ['security'] };
  private status: ModuleStatus = 'idle';
  private startTime = 0;
  private errors = 0;
  private lastError: string | null = null;
  private ctx: ModuleContext | null = null;
  private notifsSent = 0;
  private notifsBlocked = 0;

  init(context: ModuleContext): void {
    this.ctx = context;
    this.startTime = Date.now();
    this.status = 'running';
    this.ctx.emit({ source: 'notifications', type: 'module_ready', payload: {}, timestamp: Date.now() });
  }

  shutdown(): void {
    notificationSystem.shutdown();
    this.status = 'stopped';
  }

  getHealth(): ModuleHealth {
    return {
      status: this.status, healthy: this.status === 'running',
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
      errors: this.errors, lastError: this.lastError,
      metrics: { notifsSent: this.notifsSent, notifsBlocked: this.notifsBlocked },
    };
  }

  onEvent(event: ModuleEvent): void {
    // React to cross-module events with smart notifications
    if (event.type === 'big_win' && event.source === 'live') {
      notificationSystem.send('bet_result', 'critical', 'urgent', 'GREEN!', `Grande vitoria na live!`, 'LiveArena');
      this.notifsSent++;
    }
    if (event.type === 'level_up' && event.source === 'gamification') {
      notificationSystem.send('level_up', 'high', 'info', 'Level up!', `Voce subiu para o nivel ${event.payload.newLevel}`, 'perfil');
      this.notifsSent++;
    }
    if (event.type === 'mission_completed' && event.source === 'gamification') {
      notificationSystem.send('mission_expiring', 'medium', 'info', 'Missao completa!', 'Resgate sua recompensa', 'feed');
      this.notifsSent++;
    }
  }
}

export const notificationsOrchestrator = new NotificationsOrchestrator();
