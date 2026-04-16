/**
 * NEXA Core — Event Bus
 *
 * Canal central de comunicacao entre modulos.
 * Nenhum modulo conhece outro diretamente — todos
 * publicam/assinam eventos via este bus.
 *
 * O Master Orchestrator e o unico que gerencia o bus.
 */

import type { ModuleEvent } from './moduleInterface';

type EventListener = (event: ModuleEvent) => void;
type EventFilter = { source?: string; type?: string };

class EventBusService {
  private listeners: Array<{ filter: EventFilter; handler: EventListener }> = [];
  private history: ModuleEvent[] = [];
  private maxHistory = 500;

  /** Publish an event */
  emit(event: ModuleEvent): void {
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    for (const listener of this.listeners) {
      const f = listener.filter;
      if (f.source && f.source !== event.source) continue;
      if (f.type && f.type !== event.type) continue;
      try {
        listener.handler(event);
      } catch {
        // Listener error must not break the bus
      }
    }
  }

  /** Subscribe to events (with optional filter) */
  on(filter: EventFilter, handler: EventListener): () => void {
    const entry = { filter, handler };
    this.listeners.push(entry);
    return () => {
      this.listeners = this.listeners.filter(l => l !== entry);
    };
  }

  /** Subscribe to ALL events (master orchestrator) */
  onAll(handler: EventListener): () => void {
    return this.on({}, handler);
  }

  /** Get recent events (for observability) */
  getRecent(limit = 50): ModuleEvent[] {
    return this.history.slice(-limit);
  }

  /** Get events from specific module */
  getBySource(source: string, limit = 20): ModuleEvent[] {
    return this.history.filter(e => e.source === source).slice(-limit);
  }

  /** Get event count per module (for metrics) */
  getEventCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const e of this.history) {
      counts[e.source] = (counts[e.source] ?? 0) + 1;
    }
    return counts;
  }

  /** Clear all (on shutdown) */
  clear(): void {
    this.listeners = [];
    this.history = [];
  }
}

export const eventBus = new EventBusService();
