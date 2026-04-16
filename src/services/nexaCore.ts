/**
 * NEXA Core — Master Orchestrator
 *
 * Ponto unico de entrada para todos os 9 dominios do sistema.
 * Cada dominio roda independente. O Core coordena lifecycle.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │                      nexaCore                           │
 * │                                                         │
 * │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
 * │  │   auth   │ │ security │ │ betting  │ │  social  │  │
 * │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
 * │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
 * │  │ economy  │ │gamificat.│ │  notifs  │ │analytics │  │
 * │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
 * │  ┌──────────┐                                          │
 * │  │  media   │                                          │
 * │  └──────────┘                                          │
 * └─────────────────────────────────────────────────────────┘
 *
 * Uso em App.tsx:
 *   import { nexaCore } from './src/services/nexaCore';
 *   nexaCore.init(userId);
 *   // ... app runs ...
 *   nexaCore.shutdown();
 */

// ─── Domain exports ─────────────────────────────────────────

export { authSystem } from './auth';
export { securityOrchestrator, auditLog, deviceFingerprint, rateLimiter, riskEngine, sessionManager, tradeGuard, antiCheat, penaltyEngine, reportSystem } from './security';
export { bettingSystem } from './betting';
export { socialSystem } from './social';
export { economySystem } from './economy';
export { gamificationSystem } from './gamification';
export { notificationSystem } from './notifications';
export { analyticsSystem } from './analytics/index';
export { mediaSystem } from './media/index';

// ─── Imports for orchestration ──────────────────────────────

import { securityOrchestrator } from './security';
import { bettingSystem } from './betting';
import { analyticsSystem } from './analytics/index';
import { analytics } from './analytics';
import { notificationSystem } from './notifications';
import { auditLog } from './security';

// ─── Master Orchestrator ────────────────────────────────────

class NexaCore {
  private initialized = false;

  /**
   * Initialize all systems.
   * Call once after user authenticates.
   */
  init(userId: string): void {
    if (this.initialized) return;
    this.initialized = true;

    // 1. Security first (audit log, sessions, risk)
    securityOrchestrator.init(userId);

    // 2. Betting engine (odds polling)
    bettingSystem.init();

    // 3. Analytics (session tracking)
    analytics.init(userId, `device_${Date.now()}`);

    // 4. Notifications deferred (after first render)
    // notificationSystem.init() is called separately in App.tsx
    // because it needs store references for triggers

    console.log(`[NexaCore] Initialized for user ${userId.slice(0, 8)}...`);
  }

  /**
   * Keep-alive tick.
   * Call on significant user interaction.
   */
  heartbeat(): void {
    securityOrchestrator.keepAlive();
  }

  /**
   * Shutdown all systems.
   * Call on logout or app close.
   */
  shutdown(): void {
    if (!this.initialized) return;

    notificationSystem.shutdown();
    bettingSystem.shutdown();
    analytics.endSession();
    securityOrchestrator.shutdown();

    this.initialized = false;
    console.log('[NexaCore] All systems shut down');
  }

  /** Check if initialized */
  isReady(): boolean {
    return this.initialized;
  }
}

export const nexaCore = new NexaCore();
