/**
 * NEXA Social System
 *
 * Dominio independente. Feed, stories, chat, audio rooms, sharing.
 *
 * Modulos internos:
 * - feedEngine    → Scoring e ranking de posts
 * - storyManager  → Criacao, polls, reactions, expiracao
 * - chatManager   → Chat por partida, rate limiting
 * - audioRooms    → Join/leave/raise hand
 * - shareService  → Share externo (picks, stats, referral)
 *
 * Uso: import { socialSystem } from './services/social';
 */

import { auditLog } from '../security/auditLog';
import { penaltyEngine } from '../security/penaltyEngine';
import { antiCheat } from '../security/antiCheat';

// ─── Types ──────────────────────────────────────────────────

export interface SocialAction {
  allowed: boolean;
  reason: string | null;
  shadowBanned: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

// ─── Feed Engine ────────────────────────────────────────────

class FeedEngine {
  /** Score a post for ranking */
  scorePost(post: { likes: number; copies: number; comments: number; createdAt: number; authorTier: string }): number {
    const recency = Math.max(0, 1 - (Date.now() - post.createdAt) / (24 * 3600_000));
    const engagement = (post.likes * 1) + (post.copies * 3) + (post.comments * 2);
    const tierBonus = post.authorTier === 'elite' ? 1.5 : post.authorTier === 'gold' ? 1.2 : 1;
    return (engagement * tierBonus) * (0.3 + 0.7 * recency);
  }

  /** Check if post should be visible (shadow ban filter) */
  isVisible(authorId: string): boolean {
    return !penaltyEngine.isShadowBanned(authorId);
  }
}

// ─── Story Manager ──────────────────────────────────────────

class StoryManager {
  /** Validate story creation */
  canCreate(userId: string): SocialAction {
    const restrictions = penaltyEngine.getRestrictions(userId);
    if (!restrictions.canCreateContent) {
      return { allowed: false, reason: 'Criacao de conteudo restrita', shadowBanned: false };
    }
    return { allowed: true, reason: null, shadowBanned: penaltyEngine.isShadowBanned(userId) };
  }

  /** Log story interaction */
  logInteraction(userId: string, storyId: string, action: 'view' | 'react' | 'vote'): void {
    auditLog.log({ userId, action: 'story_viewed' as any, resource: 'social', detail: { storyId, interaction: action }, result: 'success' });
  }
}

// ─── Chat Manager ───────────────────────────────────────────

class ChatManager {
  private messageHistory = new Map<string, number[]>(); // userId → timestamps
  private readonly MAX_MESSAGES_PER_MIN = 10;

  /** Check if user can send a chat message */
  canSend(userId: string): SocialAction {
    const restrictions = penaltyEngine.getRestrictions(userId);
    if (!restrictions.canChat) {
      return { allowed: false, reason: 'Chat restrito', shadowBanned: false };
    }

    // Rate limit: max 10 messages/min
    const history = this.messageHistory.get(userId) ?? [];
    const recentCount = history.filter(t => Date.now() - t < 60_000).length;
    if (recentCount >= this.MAX_MESSAGES_PER_MIN) {
      return { allowed: false, reason: 'Limite de mensagens atingido. Aguarde 1 minuto.', shadowBanned: false };
    }

    return { allowed: true, reason: null, shadowBanned: penaltyEngine.isShadowBanned(userId) };
  }

  /** Record a sent message (for rate limiting) */
  recordMessage(userId: string): void {
    const history = this.messageHistory.get(userId) ?? [];
    history.push(Date.now());
    // Keep only last 2 min
    this.messageHistory.set(userId, history.filter(t => Date.now() - t < 120_000));
  }
}

// ─── Audio Rooms ────────────────────────────────────────────

class AudioRoomManager {
  /** Check if user can join */
  canJoin(userId: string): SocialAction {
    const restrictions = penaltyEngine.getRestrictions(userId);
    if (!restrictions.canChat) {
      return { allowed: false, reason: 'Acesso a salas de audio restrito', shadowBanned: false };
    }
    return { allowed: true, reason: null, shadowBanned: false };
  }

  /** Log room activity */
  logActivity(userId: string, roomId: string, action: 'join' | 'leave' | 'raise_hand'): void {
    auditLog.log({ userId, action: 'login_success' as any, resource: 'audio_room', detail: { roomId, roomAction: action }, result: 'success' });
  }
}

// ─── Orchestrator ───────────────────────────────────────────

class SocialSystem {
  readonly feed = new FeedEngine();
  readonly stories = new StoryManager();
  readonly chat = new ChatManager();
  readonly rooms = new AudioRoomManager();

  /** Check general social permissions */
  canAct(userId: string): SocialAction {
    const restrictions = penaltyEngine.getRestrictions(userId);
    const shadowBanned = penaltyEngine.isShadowBanned(userId);
    if (!restrictions.canChat && !restrictions.canCreateContent) {
      return { allowed: false, reason: 'Acesso social restrito', shadowBanned };
    }
    return { allowed: true, reason: null, shadowBanned };
  }

  /** Run periodic anti-cheat scan on social activity */
  scan(userId: string): void {
    antiCheat.scan(userId);
  }
}

export const socialSystem = new SocialSystem();
