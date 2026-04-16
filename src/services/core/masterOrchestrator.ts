/**
 * NEXA — Master Orchestrator
 *
 * SOBERANO sobre todos os modulos. Gerencia:
 * - Lifecycle (init → running → shutdown) de cada modulo
 * - Event bus (roteia eventos entre modulos)
 * - Health monitoring (coleta saude de cada modulo)
 * - Dependency resolution (inicia modulos na ordem correta)
 *
 * ┌──────────────────────────────────────────────────────┐
 * │              MASTER ORCHESTRATOR                     │
 * │                                                      │
 * │  ┌──────────────────────────────────────────────┐    │
 * │  │              EVENT BUS                       │    │
 * │  │  (todos os eventos passam por aqui)          │    │
 * │  └──────────────────────────────────────────────┘    │
 * │                                                      │
 * │  ┌────────┐ ┌─────────┐ ┌────────┐ ┌────────────┐   │
 * │  │security│ │  auth   │ │betting │ │  social    │   │
 * │  │ orch.  │ │  orch.  │ │ orch.  │ │  orch.     │   │
 * │  └────────┘ └─────────┘ └────────┘ └────────────┘   │
 * │  ┌────────┐ ┌─────────┐ ┌────────┐ ┌────────────┐   │
 * │  │economy │ │ gamif.  │ │ notifs │ │ analytics  │   │
 * │  │ orch.  │ │  orch.  │ │ orch.  │ │  orch.     │   │
 * │  └────────┘ └─────────┘ └────────┘ └────────────┘   │
 * │  ┌────────┐ ┌─────────┐                              │
 * │  │ media  │ │  live   │                              │
 * │  │ orch.  │ │  orch.  │                              │
 * │  └────────┘ └─────────┘                              │
 * └──────────────────────────────────────────────────────┘
 *
 * Uso:
 *   import { masterOrchestrator } from './services/core/masterOrchestrator';
 *   await masterOrchestrator.init(userId);
 *   masterOrchestrator.getSystemHealth();
 *   masterOrchestrator.shutdown();
 */

import type { ModuleOrchestrator, ModuleContext, ModuleEvent, ModuleHealth } from './moduleInterface';
import { eventBus } from './eventBus';

// ─── Import all module orchestrators ────────────────────────

import { securityModule } from '../security/orchestratorModule';
import { authOrchestrator } from '../auth/orchestrator';
import { bettingOrchestrator } from '../betting/orchestrator';
import { socialOrchestrator } from '../social/orchestrator';
import { economyOrchestrator } from '../economy/orchestrator';
import { gamificationOrchestrator } from '../gamification/orchestrator';
import { notificationsOrchestrator } from '../notifications/orchestrator';
import { analyticsOrchestrator } from '../analytics/orchestrator';
import { mediaOrchestrator } from '../media/orchestrator';
import { liveOrchestrator } from '../live/orchestrator';

// ─── Types ──────────────────────────────────────────────────

export interface SystemHealth {
  timestamp: number;
  overall: 'healthy' | 'degraded' | 'critical';
  score: number;             // 0-100
  modules: Record<string, ModuleHealth>;
  eventBusStats: { totalEvents: number; eventsPerModule: Record<string, number> };
  uptime: number;
}

// ─── Master ─────────────────────────────────────────────────

class MasterOrchestrator {
  private modules = new Map<string, ModuleOrchestrator>();
  private initialized = false;
  private startTime = 0;
  private monitorTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Register all modules
    this.register(securityModule);
    this.register(authOrchestrator);
    this.register(bettingOrchestrator);
    this.register(socialOrchestrator);
    this.register(economyOrchestrator);
    this.register(gamificationOrchestrator);
    this.register(notificationsOrchestrator);
    this.register(analyticsOrchestrator);
    this.register(mediaOrchestrator);
    this.register(liveOrchestrator);
  }

  private register(module: ModuleOrchestrator): void {
    this.modules.set(module.info.id, module);
  }

  // ── Lifecycle ─────────────────────────────────────────────

  /** Initialize all modules in dependency order */
  async init(userId: string): Promise<void> {
    if (this.initialized) return;
    this.startTime = Date.now();

    // Create context for modules
    const context: ModuleContext = {
      userId,
      emit: (event) => eventBus.emit(event),
      getModule: (id) => this.modules.get(id) ?? null,
    };

    // Wire event bus to route events to all modules
    eventBus.onAll((event) => {
      for (const [id, mod] of this.modules) {
        if (id !== event.source && mod.onEvent) {
          mod.onEvent(event);
        }
      }
    });

    // Resolve dependency order (topological sort)
    const order = this.resolveDependencies();

    // Init each module in order
    for (const moduleId of order) {
      const mod = this.modules.get(moduleId);
      if (!mod) continue;
      try {
        await mod.init(context);
        console.log(`[Master] ✓ ${mod.info.name} initialized`);
      } catch (err: any) {
        console.warn(`[Master] ✗ ${mod.info.name} failed: ${err.message}`);
      }
    }

    // Start health monitoring every 30s
    this.monitorTimer = setInterval(() => this.monitor(), 30_000);

    this.initialized = true;
    eventBus.emit({ source: 'master', type: 'system_ready', payload: { modules: order.length }, timestamp: Date.now() });
    console.log(`[Master] All ${order.length} modules initialized`);
  }

  /** Shutdown all modules in reverse order */
  async shutdown(): Promise<void> {
    if (!this.initialized) return;

    if (this.monitorTimer) { clearInterval(this.monitorTimer); this.monitorTimer = null; }

    const order = this.resolveDependencies().reverse();
    for (const moduleId of order) {
      const mod = this.modules.get(moduleId);
      if (!mod) continue;
      try {
        await mod.shutdown();
      } catch { /* silent */ }
    }

    eventBus.clear();
    this.initialized = false;
    console.log('[Master] All modules shut down');
  }

  // ── Dependency Resolution ─────────────────────────────────

  private resolveDependencies(): string[] {
    const resolved: string[] = [];
    const seen = new Set<string>();

    const visit = (id: string) => {
      if (seen.has(id)) return;
      seen.add(id);
      const mod = this.modules.get(id);
      if (!mod) return;
      for (const dep of mod.info.dependencies) {
        visit(dep);
      }
      resolved.push(id);
    };

    for (const id of this.modules.keys()) {
      visit(id);
    }

    return resolved;
  }

  // ── Health Monitoring ─────────────────────────────────────

  /** Get full system health */
  getSystemHealth(): SystemHealth {
    const moduleHealths: Record<string, ModuleHealth> = {};
    let healthyCount = 0;
    let totalModules = 0;

    for (const [id, mod] of this.modules) {
      const health = mod.getHealth();
      moduleHealths[id] = health;
      totalModules++;
      if (health.healthy) healthyCount++;
    }

    const score = totalModules > 0 ? Math.round((healthyCount / totalModules) * 100) : 0;
    const overall = score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'critical';

    return {
      timestamp: Date.now(),
      overall,
      score,
      modules: moduleHealths,
      eventBusStats: {
        totalEvents: eventBus.getRecent(9999).length,
        eventsPerModule: eventBus.getEventCounts(),
      },
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
    };
  }

  /** Periodic monitoring */
  private monitor(): void {
    const health = this.getSystemHealth();
    if (health.overall === 'critical') {
      eventBus.emit({ source: 'master', type: 'system_critical', payload: { score: health.score }, timestamp: Date.now() });
    }
  }

  // ── Module Access ─────────────────────────────────────────

  /** Get a specific module */
  getModule<T extends ModuleOrchestrator>(id: string): T | null {
    return (this.modules.get(id) as T) ?? null;
  }

  /** Get all module IDs */
  getModuleIds(): string[] {
    return Array.from(this.modules.keys());
  }

  /** Is system ready? */
  isReady(): boolean {
    return this.initialized;
  }
}

export const masterOrchestrator = new MasterOrchestrator();
