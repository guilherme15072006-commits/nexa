import type { ModuleOrchestrator, ModuleInfo, ModuleHealth, ModuleContext, ModuleEvent, ModuleStatus } from '../core/moduleInterface';
import { gamificationSystem } from './index';

class GamificationOrchestrator implements ModuleOrchestrator {
  readonly info: ModuleInfo = { id: 'gamification', name: 'Gamification & Progression', version: '1.0.0', dependencies: [] };
  private status: ModuleStatus = 'idle';
  private startTime = 0;
  private errors = 0;
  private lastError: string | null = null;
  private ctx: ModuleContext | null = null;
  private totalXPAwarded = 0;
  private levelUps = 0;
  private missionsCompleted = 0;

  init(context: ModuleContext): void {
    this.ctx = context;
    this.startTime = Date.now();
    this.status = 'running';
    this.ctx.emit({ source: 'gamification', type: 'module_ready', payload: {}, timestamp: Date.now() });
  }

  shutdown(): void { this.status = 'stopped'; }

  getHealth(): ModuleHealth {
    return {
      status: this.status, healthy: this.status === 'running',
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
      errors: this.errors, lastError: this.lastError,
      metrics: { totalXPAwarded: this.totalXPAwarded, levelUps: this.levelUps, missionsCompleted: this.missionsCompleted },
    };
  }

  onEvent(event: ModuleEvent): void {
    // Auto-award XP for cross-module actions
    if (event.type === 'bet_placed') this.awardXP(event.payload.userId, 20, 'bet');
    if (event.type === 'social_action') this.awardXP(event.payload.userId, 10, 'social');
    if (event.type === 'chat_sent') this.awardXP(event.payload.userId, 5, 'chat');
    if (event.type === 'login_success') this.awardXP(event.payload.userId, 15, 'login');
  }

  awardXP(userId: string, amount: number, source: string): void {
    this.totalXPAwarded += amount;
    this.ctx?.emit({ source: 'gamification', type: 'xp_awarded', payload: { userId, amount, source }, timestamp: Date.now() });
  }

  recordLevelUp(userId: string, newLevel: number): void {
    this.levelUps++;
    this.ctx?.emit({ source: 'gamification', type: 'level_up', payload: { userId, newLevel }, timestamp: Date.now() });
  }

  recordMissionComplete(userId: string, missionId: string): void {
    this.missionsCompleted++;
    this.ctx?.emit({ source: 'gamification', type: 'mission_completed', payload: { userId, missionId }, timestamp: Date.now() });
  }
}

export const gamificationOrchestrator = new GamificationOrchestrator();
