import type { ModuleOrchestrator, ModuleInfo, ModuleHealth, ModuleContext, ModuleEvent, ModuleStatus } from '../core/moduleInterface';
import { mediaSystem } from './index';

class MediaOrchestrator implements ModuleOrchestrator {
  readonly info: ModuleInfo = { id: 'media', name: 'Media & Haptics', version: '1.0.0', dependencies: [] };
  private status: ModuleStatus = 'idle';
  private startTime = 0;
  private errors = 0;
  private lastError: string | null = null;
  private hapticsFired = 0;
  private soundsPlayed = 0;

  init(): void {
    this.startTime = Date.now();
    this.status = 'running';
  }

  shutdown(): void { this.status = 'stopped'; }

  getHealth(): ModuleHealth {
    return {
      status: this.status, healthy: this.status === 'running',
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
      errors: this.errors, lastError: this.lastError,
      metrics: { hapticsFired: this.hapticsFired, soundsPlayed: this.soundsPlayed },
    };
  }

  onEvent(event: ModuleEvent): void {
    // Auto-play sounds for key events
    if (event.type === 'level_up') { mediaSystem.sound('level_up'); mediaSystem.haptic('heavy'); this.soundsPlayed++; this.hapticsFired++; }
    if (event.type === 'bet_placed') { mediaSystem.haptic('medium'); this.hapticsFired++; }
    if (event.type === 'xp_awarded') { mediaSystem.haptic('light'); this.hapticsFired++; }
    if (event.type === 'mission_completed') { mediaSystem.sound('celebration'); mediaSystem.haptic('success'); this.soundsPlayed++; this.hapticsFired++; }
    if (event.type === 'big_win') { mediaSystem.sound('celebration_pop'); mediaSystem.haptic('heavy'); this.soundsPlayed++; this.hapticsFired++; }
  }
}

export const mediaOrchestrator = new MediaOrchestrator();
