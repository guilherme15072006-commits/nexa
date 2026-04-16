import type { ModuleOrchestrator, ModuleInfo, ModuleHealth, ModuleContext, ModuleEvent, ModuleStatus } from '../core/moduleInterface';
import { socialSystem } from './index';

class SocialOrchestrator implements ModuleOrchestrator {
  readonly info: ModuleInfo = { id: 'social', name: 'Social & Community', version: '1.0.0', dependencies: ['security'] };
  private status: ModuleStatus = 'idle';
  private startTime = 0;
  private errors = 0;
  private lastError: string | null = null;
  private ctx: ModuleContext | null = null;
  private chatMessages = 0;
  private socialActions = 0;

  init(context: ModuleContext): void {
    this.ctx = context;
    this.startTime = Date.now();
    this.status = 'running';
    this.ctx.emit({ source: 'social', type: 'module_ready', payload: {}, timestamp: Date.now() });
  }

  shutdown(): void { this.status = 'stopped'; }

  getHealth(): ModuleHealth {
    return {
      status: this.status, healthy: this.status === 'running',
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
      errors: this.errors, lastError: this.lastError,
      metrics: { chatMessages: this.chatMessages, socialActions: this.socialActions },
    };
  }

  onEvent(event: ModuleEvent): void {
    if (event.type === 'penalty_applied' && event.source === 'security') {
      // Could notify affected social features
    }
  }

  recordChatMessage(userId: string): void {
    const check = socialSystem.chat.canSend(userId);
    if (check.allowed) {
      this.chatMessages++;
      this.ctx?.emit({ source: 'social', type: 'chat_sent', payload: { userId }, timestamp: Date.now() });
    }
  }

  recordSocialAction(userId: string, action: string): void {
    this.socialActions++;
    this.ctx?.emit({ source: 'social', type: 'social_action', payload: { userId, action }, timestamp: Date.now() });
  }
}

export const socialOrchestrator = new SocialOrchestrator();
