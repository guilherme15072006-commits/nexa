/**
 * NEXA — Real-time Service (Socket.IO)
 *
 * WebSocket para comunicação em tempo real.
 * Substitui polling para: chat, odds, viewer count, live events.
 * Latência < 100ms vs 5-10s com polling.
 *
 * Fallback: Supabase Realtime se WebSocket não disponível.
 */

import { io, type Socket } from 'socket.io-client';

// ─── Types ──────────────────────────────────────────────────

type EventHandler = (data: any) => void;

interface RealtimeConfig {
  url: string;
  autoConnect: boolean;
}

// ─── Service ────────────────────────────────────────────────

class RealtimeService {
  private socket: Socket | null = null;
  private handlers = new Map<string, Set<EventHandler>>();
  private connected = false;

  /** Connect to WebSocket server */
  connect(config: RealtimeConfig): void {
    if (this.socket) return;

    this.socket = io(config.url, {
      autoConnect: config.autoConnect,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('[Realtime] Connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.log('[Realtime] Disconnected:', reason);
    });

    // Route incoming events to handlers
    this.socket.onAny((event: string, data: any) => {
      const eventHandlers = this.handlers.get(event);
      if (eventHandlers) {
        eventHandlers.forEach((handler) => handler(data));
      }
    });
  }

  /** Disconnect */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /** Subscribe to an event */
  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  /** Emit an event to server */
  emit(event: string, data?: any): void {
    if (this.socket && this.connected) {
      this.socket.emit(event, data);
    }
  }

  /** Join a room (match chat, live stream) */
  joinRoom(roomId: string): void {
    this.emit('join_room', { roomId });
  }

  /** Leave a room */
  leaveRoom(roomId: string): void {
    this.emit('leave_room', { roomId });
  }

  /** Check connection status */
  isConnected(): boolean {
    return this.connected;
  }
}

export const realtime = new RealtimeService();
