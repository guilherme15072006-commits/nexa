import type { ModuleOrchestrator, ModuleInfo, ModuleHealth, ModuleContext, ModuleEvent, ModuleStatus } from '../core/moduleInterface';
import { analytics } from '../analytics';

class AnalyticsOrchestrator implements ModuleOrchestrator {
  readonly info: ModuleInfo = { id: 'analytics', name: 'Product Analytics', version: '1.0.0', dependencies: [] };
  private status: ModuleStatus = 'idle';
  private startTime = 0;
  private errors = 0;
  private lastError: string | null = null;
  private eventsTracked = 0;

  init(context: ModuleContext): void {
    this.startTime = Date.now();
    analytics.init(context.userId, `device_${Date.now()}`);
    this.status = 'running';
  }

  shutdown(): void {
    analytics.endSession();
    this.status = 'stopped';
  }

  getHealth(): ModuleHealth {
    return {
      status: this.status, healthy: this.status === 'running',
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
      errors: this.errors, lastError: this.lastError,
      metrics: { eventsTracked: this.eventsTracked, engagementScore: analytics.getEngagementScore() },
    };
  }

  onEvent(event: ModuleEvent): void {
    // Track ALL cross-module events as analytics events
    this.eventsTracked++;
    analytics.track(`${event.source}_${event.type}` as any, event.payload);
  }
}

export const analyticsOrchestrator = new AnalyticsOrchestrator();
