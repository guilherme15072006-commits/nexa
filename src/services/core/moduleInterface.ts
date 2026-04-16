/**
 * NEXA Core — Module Interface
 *
 * Contrato que TODOS os modulos devem implementar.
 * Permite ao Master Orchestrator gerenciar lifecycle,
 * coletar health e rotear eventos de forma uniforme.
 *
 * Cada modulo e autonomo mas responde ao master.
 */

// ─── Module Status ──────────────────────────────────────────

export type ModuleStatus = 'idle' | 'initializing' | 'running' | 'degraded' | 'stopped' | 'error';

export interface ModuleHealth {
  status: ModuleStatus;
  healthy: boolean;
  uptime: number;             // ms since init
  errors: number;             // error count since init
  lastError: string | null;
  metrics: Record<string, number>;  // module-specific metrics
}

export interface ModuleInfo {
  id: string;                 // unique module ID
  name: string;               // display name
  version: string;
  dependencies: string[];     // IDs of modules this depends on
}

// ─── Module Orchestrator Contract ───────────────────────────

export interface ModuleOrchestrator {
  /** Module identity */
  readonly info: ModuleInfo;

  /** Initialize module (called by master) */
  init(context: ModuleContext): Promise<void> | void;

  /** Shutdown module (called by master) */
  shutdown(): Promise<void> | void;

  /** Health check (called periodically by master) */
  getHealth(): ModuleHealth;

  /** Handle event from another module (via event bus) */
  onEvent?(event: ModuleEvent): void;
}

// ─── Context provided by Master ─────────────────────────────

export interface ModuleContext {
  userId: string;
  emit: (event: ModuleEvent) => void;  // send event to bus
  getModule: (id: string) => ModuleOrchestrator | null;
}

// ─── Event Bus ──────────────────────────────────────────────

export interface ModuleEvent {
  source: string;             // module ID that emitted
  type: string;               // event type
  payload: Record<string, any>;
  timestamp: number;
}
