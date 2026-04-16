/**
 * NEXA Live — Arena Chat
 *
 * Chat de alta performance para streams ao vivo.
 * NAO e um chat generico — integra identidade, rank, nivel.
 * Mensagens de aposta e big wins aparecem inline.
 *
 * Anti-spam: rate limit + reputation gate + slow mode
 * Referencia: Twitch chat (structure) + Discord (identity)
 */

import type { LiveChatMessage } from './liveState';
import { auditLog } from '../security/auditLog';
import { penaltyEngine } from '../security/penaltyEngine';

// ─── Config ─────────────────────────────────────────────────

const MAX_MESSAGES_BUFFER = 200;
const RATE_LIMIT_PER_SEC = 2;
const SLOW_MODE_INTERVAL_MS = 5_000;     // 1 msg per 5s in slow mode
const HIGHLIGHT_COST_COINS = 50;
const MIN_LEVEL_TO_CHAT = 1;

// ─── Service ────────────────────────────────────────────────

class LiveChatService {
  private messages: LiveChatMessage[] = [];
  private pinnedMessage: LiveChatMessage | null = null;
  private slowMode = false;
  private lastMessageTime = new Map<string, number>();
  private listeners: Array<(msg: LiveChatMessage) => void> = [];

  /** Subscribe to new messages */
  onMessage(listener: (msg: LiveChatMessage) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  /** Send a chat message */
  send(params: {
    userId: string;
    username: string;
    userLevel: number;
    userTier: string;
    userRank: number | null;
    text: string;
    highlighted?: boolean;
  }): { success: boolean; error: string | null } {
    // Level gate
    if (params.userLevel < MIN_LEVEL_TO_CHAT) {
      return { success: false, error: `Level minimo para chat: ${MIN_LEVEL_TO_CHAT}` };
    }

    // Penalty check
    const restrictions = penaltyEngine.getRestrictions(params.userId);
    if (!restrictions.canChat) {
      return { success: false, error: 'Chat restrito na sua conta' };
    }

    // Shadow ban: message is "sent" but not broadcast
    const isShadowed = penaltyEngine.isShadowBanned(params.userId);

    // Rate limit
    const now = Date.now();
    const lastTime = this.lastMessageTime.get(params.userId) ?? 0;
    const minInterval = this.slowMode ? SLOW_MODE_INTERVAL_MS : (1000 / RATE_LIMIT_PER_SEC);

    if (now - lastTime < minInterval) {
      const waitSec = Math.ceil((minInterval - (now - lastTime)) / 1000);
      return { success: false, error: `Aguarde ${waitSec}s para enviar outra mensagem` };
    }

    // Text validation
    const text = params.text.trim();
    if (!text || text.length > 300) {
      return { success: false, error: text ? 'Mensagem muito longa (max 300)' : 'Mensagem vazia' };
    }

    const message: LiveChatMessage = {
      id: `lc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: params.userId,
      username: params.username,
      userLevel: params.userLevel,
      userTier: params.userTier,
      userRank: params.userRank,
      text,
      type: 'message',
      highlighted: params.highlighted ?? false,
      timestamp: now,
    };

    this.messages.push(message);
    if (this.messages.length > MAX_MESSAGES_BUFFER) {
      this.messages = this.messages.slice(-MAX_MESSAGES_BUFFER);
    }
    this.lastMessageTime.set(params.userId, now);

    // Broadcast (skip if shadow banned)
    if (!isShadowed) {
      this.listeners.forEach(l => l(message));
    }

    return { success: true, error: null };
  }

  /** Inject system message (bet placed, big win, etc) */
  injectSystemMessage(text: string, type: LiveChatMessage['type'] = 'system'): void {
    const msg: LiveChatMessage = {
      id: `sys_${Date.now()}`,
      userId: 'system',
      username: 'NEXA',
      userLevel: 0,
      userTier: 'system',
      userRank: null,
      text,
      type,
      highlighted: true,
      timestamp: Date.now(),
    };
    this.messages.push(msg);
    this.listeners.forEach(l => l(msg));
  }

  /** Pin a message */
  pin(messageId: string): void {
    const msg = this.messages.find(m => m.id === messageId);
    if (msg) this.pinnedMessage = msg;
  }

  /** Unpin */
  unpin(): void {
    this.pinnedMessage = null;
  }

  /** Toggle slow mode */
  setSlowMode(enabled: boolean): void {
    this.slowMode = enabled;
    this.injectSystemMessage(enabled ? 'Modo lento ativado — 1 mensagem a cada 5 segundos' : 'Modo lento desativado');
  }

  /** Get messages */
  getMessages(): LiveChatMessage[] {
    return this.messages;
  }

  /** Get pinned */
  getPinned(): LiveChatMessage | null {
    return this.pinnedMessage;
  }

  /** Clear (on stream end) */
  clear(): void {
    this.messages = [];
    this.pinnedMessage = null;
    this.lastMessageTime.clear();
  }
}

export const liveChat = new LiveChatService();
