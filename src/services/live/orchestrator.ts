import type { ModuleOrchestrator, ModuleInfo, ModuleHealth, ModuleContext, ModuleEvent, ModuleStatus } from '../core/moduleInterface';
import { liveArena } from './index';
import { liveBetting } from './liveBetting';
import { liveEngagement } from './liveEngagement';

class LiveOrchestrator implements ModuleOrchestrator {
  readonly info: ModuleInfo = { id: 'live', name: 'Live Arena', version: '1.0.0', dependencies: ['security', 'betting', 'social', 'gamification'] };
  private status: ModuleStatus = 'idle';
  private startTime = 0;
  private errors = 0;
  private lastError: string | null = null;
  private ctx: ModuleContext | null = null;
  private totalViewMinutes = 0;
  private totalLiveBets = 0;
  private totalCopyBets = 0;

  init(context: ModuleContext): void {
    this.ctx = context;
    this.startTime = Date.now();
    this.status = 'running';

    // Wire live events to event bus
    liveBetting.onBetPlaced((bet) => {
      this.totalLiveBets++;
      if (bet.isCopy) this.totalCopyBets++;
      this.ctx?.emit({ source: 'live', type: 'bet_placed', payload: { userId: bet.userId, side: bet.side, odds: bet.odds, stake: bet.stake, isCopy: bet.isCopy }, timestamp: Date.now() });
    });

    liveEngagement.onEvent((event) => {
      if (event.type === 'big_win') {
        this.ctx?.emit({ source: 'live', type: 'big_win', payload: { amount: event.win.amount }, timestamp: Date.now() });
      }
      if (event.type === 'mission_completed') {
        this.ctx?.emit({ source: 'live', type: 'mission_completed', payload: { missionId: event.mission.id }, timestamp: Date.now() });
      }
      if (event.type === 'xp_tick') {
        this.totalViewMinutes = event.minutesWatched;
      }
    });

    this.ctx.emit({ source: 'live', type: 'module_ready', payload: {}, timestamp: Date.now() });
  }

  shutdown(): void {
    if (liveArena.isActive()) liveArena.leaveStream();
    this.status = 'stopped';
  }

  getHealth(): ModuleHealth {
    return {
      status: this.status, healthy: this.status === 'running',
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
      errors: this.errors, lastError: this.lastError,
      metrics: { totalViewMinutes: this.totalViewMinutes, totalLiveBets: this.totalLiveBets, totalCopyBets: this.totalCopyBets, isStreamActive: liveArena.isActive() ? 1 : 0 },
    };
  }

  onEvent(event: ModuleEvent): void {
    if (event.type === 'odds_update' && event.source === 'betting') {
      // Forward odds to live betting panel
    }
  }
}

export const liveOrchestrator = new LiveOrchestrator();
