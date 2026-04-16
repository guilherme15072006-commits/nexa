/**
 * NEXA — Smart Push Notifications (FCM)
 *
 * Sistema inteligente inspirado em:
 * - Duolingo: streak reminders escalonados (18h, 20h, 21h)
 * - Bet365: cashout alerts em tempo real, resultado instantaneo
 * - Instagram: social proof ("KingBet postou", "3 tipsters que voce segue")
 *
 * Features:
 * - Priority queue (streak > bet_result > tipster > mission > system)
 * - Quiet hours (23h–8h) com excecao para urgentes
 * - Cooldown por tipo (nao repete mesmo tipo em < X minutos)
 * - Rate limit diario (max 8 pushes/dia)
 * - Timezone-aware scheduling
 * - Android notification channels (urgente, social, info)
 * - Local triggers (streak risk, missao expirando, inatividade)
 * - Deep links para todas as 19+ telas
 * - Templates variados para evitar repeticao
 */

import { Platform, PermissionsAndroid } from 'react-native';
import { AppNotification, NotificationType, useNexaStore } from '../store/nexaStore';
import { supabaseService } from './supabase';
import { supabaseAuth } from './supabaseAuth';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type PushType =
  | 'streak_risk'
  | 'bet_result'
  | 'tipster_post'
  | 'mission_expiring'
  | 'season'
  | 'level_up'
  | 'cashout_alert'
  | 'inactivity'
  | 'social_proof'
  | 'system';

type PushPriority = 'critical' | 'high' | 'medium' | 'low';

interface FCMMessage {
  notification?: { title?: string; body?: string };
  data?: Record<string, string>;
}

interface PushConfig {
  enabled: boolean;
  token: string | null;
}

interface QueuedNotification {
  type: PushType;
  priority: PushPriority;
  title: string;
  body: string;
  deepLink: string;
  channel: 'urgent' | 'social' | 'info';
  scheduledAt?: number;   // timestamp — if set, wait until this time
  bypassQuietHours?: boolean;
}

interface CooldownEntry {
  type: PushType;
  lastSent: number;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

/** Priority order — lower index = higher priority */
const PRIORITY_MAP: Record<PushType, PushPriority> = {
  streak_risk:     'critical',
  bet_result:      'critical',
  cashout_alert:   'critical',
  level_up:        'high',
  tipster_post:    'high',
  mission_expiring:'medium',
  social_proof:    'medium',
  season:          'medium',
  inactivity:      'low',
  system:          'low',
};

const PRIORITY_ORDER: PushPriority[] = ['critical', 'high', 'medium', 'low'];

/** Channel mapping for Android */
const CHANNEL_MAP: Record<PushType, 'urgent' | 'social' | 'info'> = {
  streak_risk:     'urgent',
  bet_result:      'urgent',
  cashout_alert:   'urgent',
  level_up:        'info',
  tipster_post:    'social',
  mission_expiring:'info',
  social_proof:    'social',
  season:          'info',
  inactivity:      'social',
  system:          'info',
};

/** Minimum minutes between same notification type */
const COOLDOWN_MINUTES: Record<PushType, number> = {
  streak_risk:     120,   // 2h between streak reminders
  bet_result:      0,     // always send immediately
  cashout_alert:   5,     // max 1 per 5 min
  level_up:        0,     // always send
  tipster_post:    30,    // 30 min between tipster alerts
  mission_expiring:60,    // 1h between mission reminders
  social_proof:    45,    // 45 min between social proof
  season:          0,     // always send
  inactivity:      360,   // max 1 per 6h
  system:          60,    // 1h between system msgs
};

/** Quiet hours — no push except critical */
const QUIET_START = 23;   // 23:00
const QUIET_END = 8;      // 08:00

/** Max daily pushes per user */
const MAX_DAILY_PUSHES = 8;

// ═══════════════════════════════════════════════════════════════
// DEEP LINK MAP — all 19+ screens
// ═══════════════════════════════════════════════════════════════

const DEEP_LINK_MAP: Record<string, string> = {
  // Tab screens
  feed:            'feed',
  apostas:         'apostas',
  ranking:         'ranking',
  perfil:          'perfil',
  // Modal/stack screens
  wallet:          'Wallet',
  notifications:   'Notifications',
  bet_history:     'BetHistory',
  dashboard:       'Dashboard',
  search:          'Search',
  settings:        'Settings',
  explore:         'Explore',
  events:          'Events',
  lives:           'Lives',
  stories:         'Stories',
  marketplace:     'Marketplace',
  nexa_play:       'NexaPlay',
  creator_studio:  'CreatorStudio',
  audio_rooms:     'AudioRooms',
  subscription:    'Subscription',
  referral:        'Referral',
  kyc:             'KYC',
  admin:           'AdminDashboard',
  tipster_profile: 'TipsterProfile',
  clan_detail:     'ClanDetail',
};

// ═══════════════════════════════════════════════════════════════
// TEMPLATE VARIATIONS (anti-repetition)
// ═══════════════════════════════════════════════════════════════

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const SMART_TEMPLATES = {
  streakRisk: (streak: number) => {
    const templates = [
      { title: 'Sequencia em risco!', body: `Sua sequencia de ${streak} dias expira hoje. Faca check-in agora!` },
      { title: `${streak} dias na reta!`, body: 'Nao perca sua sequencia — um toque e esta feito.' },
      { title: 'Hey! Falta pouco', body: `Mantenha sua streak de ${streak} dias. So leva 5 segundos.` },
      { title: 'Streak alert', body: `${streak} dias consecutivos. Voce vai deixar isso morrer?` },
    ];
    return { ...pickRandom(templates), deepLink: 'feed', type: 'streak_risk' as PushType };
  },

  betResult: (match: string, result: 'won' | 'lost', profit?: number) => {
    if (result === 'won') {
      const templates = [
        { title: 'GREEN!', body: `Sua aposta em ${match} deu certo!${profit ? ` +R$${profit.toFixed(2)}` : ''} Confira.` },
        { title: 'Acertou!', body: `${match} — resultado positivo.${profit ? ` Lucro: R$${profit.toFixed(2)}` : ''} Veja o historico.` },
        { title: 'Deu bom!', body: `Aposta em ${match} fechou GREEN.${profit ? ` +R$${profit.toFixed(2)} na conta.` : ''}` },
      ];
      return { ...pickRandom(templates), deepLink: 'bet_history', type: 'bet_result' as PushType };
    }
    const templates = [
      { title: 'Resultado da aposta', body: `${match} nao foi dessa vez. Veja o historico.` },
      { title: 'Aposta encerrada', body: `${match} — resultado negativo. Analise e volte mais forte.` },
    ];
    return { ...pickRandom(templates), deepLink: 'bet_history', type: 'bet_result' as PushType };
  },

  tipsterPost: (tipsterName: string, pickOdds?: number) => {
    const templates = [
      { title: 'Nova analise disponivel', body: `${tipsterName} postou uma nova pick.${pickOdds ? ` Odd ${pickOdds.toFixed(2)}` : ''} Confira!` },
      { title: `${tipsterName} acabou de postar`, body: `Nova pick disponivel no feed.${pickOdds ? ` Odd: ${pickOdds.toFixed(2)}` : ''}` },
      { title: 'Pick fresca', body: `${tipsterName} publicou agora.${pickOdds ? ` ${pickOdds.toFixed(2)} de odd.` : ''} Vai copiar?` },
    ];
    return { ...pickRandom(templates), deepLink: 'feed', type: 'tipster_post' as PushType };
  },

  missionExpiring: (missionName: string, hoursLeft: number) => {
    const templates = [
      { title: 'Missao expirando', body: `"${missionName}" expira em ${hoursLeft}h. Complete agora e ganhe XP!` },
      { title: `${hoursLeft}h restantes`, body: `Missao "${missionName}" quase expirando. Nao perca o XP!` },
      { title: 'Ultima chance', body: `"${missionName}" acaba em ${hoursLeft}h. Corra!` },
    ];
    return { ...pickRandom(templates), deepLink: 'feed', type: 'mission_expiring' as PushType };
  },

  seasonStart: (seasonName: string) => ({
    title: 'Nova temporada!',
    body: `${seasonName} comecou. Ranking resetado — suba agora!`,
    deepLink: 'ranking',
    type: 'season' as PushType,
  }),

  levelUp: (newLevel: number) => {
    const templates = [
      { title: `Nivel ${newLevel}!`, body: 'Voce subiu de nivel! Confira suas novas recompensas.' },
      { title: 'Level up!', body: `Parabens! Voce alcancou o nivel ${newLevel}. Novos badges desbloqueados.` },
    ];
    return { ...pickRandom(templates), deepLink: 'perfil', type: 'level_up' as PushType };
  },

  cashoutAlert: (match: string, currentProfit: number) => ({
    title: 'Cashout disponivel',
    body: `${match} — voce pode garantir R$${currentProfit.toFixed(2)} agora. Quer encerrar?`,
    deepLink: 'apostas',
    type: 'cashout_alert' as PushType,
  }),

  inactivity: (daysSince: number) => {
    const templates = [
      { title: 'Sentimos sua falta', body: `Faz ${daysSince} dias que voce nao aparece. Suas missoes estao esperando.` },
      { title: 'Ola! Tudo bem?', body: `${daysSince} dias fora. Sua posicao no ranking caiu — volte e recupere.` },
      { title: 'NEXA te espera', body: 'Novos jogos e odds atualizadas. Volte e confira.' },
    ];
    return { ...pickRandom(templates), deepLink: 'feed', type: 'inactivity' as PushType };
  },

  socialProof: (count: number, action: string) => ({
    title: 'Comunidade ativa',
    body: `${count} pessoas ${action} agora. Confira!`,
    deepLink: 'feed',
    type: 'social_proof' as PushType,
  }),
};

// ═══════════════════════════════════════════════════════════════
// SMART SCHEDULER
// ═══════════════════════════════════════════════════════════════

class SmartPushScheduler {
  private cooldowns: CooldownEntry[] = [];
  private dailySentCount = 0;
  private dailyResetDate = '';
  private queue: QueuedNotification[] = [];
  private processTimer: ReturnType<typeof setInterval> | null = null;

  // ── Timezone helpers ─────────────────────────────────────────

  private getUserHour(): number {
    return new Date().getHours();
  }

  private isQuietHours(): boolean {
    const hour = this.getUserHour();
    // 23:00 – 07:59 is quiet
    return hour >= QUIET_START || hour < QUIET_END;
  }

  private getTodayKey(): string {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  // ── Rate limiting ────────────────────────────────────────────

  private checkDailyLimit(): boolean {
    const today = this.getTodayKey();
    if (this.dailyResetDate !== today) {
      this.dailyResetDate = today;
      this.dailySentCount = 0;
    }
    return this.dailySentCount < MAX_DAILY_PUSHES;
  }

  private checkCooldown(type: PushType): boolean {
    const minMs = COOLDOWN_MINUTES[type] * 60 * 1000;
    if (minMs === 0) return true; // no cooldown
    const entry = this.cooldowns.find(c => c.type === type);
    if (!entry) return true;
    return Date.now() - entry.lastSent >= minMs;
  }

  private recordSent(type: PushType): void {
    this.dailySentCount++;
    const idx = this.cooldowns.findIndex(c => c.type === type);
    if (idx >= 0) {
      this.cooldowns[idx].lastSent = Date.now();
    } else {
      this.cooldowns.push({ type, lastSent: Date.now() });
    }
  }

  // ── Queue management ─────────────────────────────────────────

  enqueue(notif: QueuedNotification): void {
    // Dedup — don't queue same type if one is already pending
    if (this.queue.some(q => q.type === notif.type)) return;

    this.queue.push(notif);

    // Sort by priority
    this.queue.sort((a, b) => {
      const ai = PRIORITY_ORDER.indexOf(a.priority);
      const bi = PRIORITY_ORDER.indexOf(b.priority);
      return ai - bi;
    });
  }

  /** Process queue — called every 30s */
  processQueue(): void {
    if (this.queue.length === 0) return;
    if (!this.checkDailyLimit()) return;

    const now = Date.now();
    const quiet = this.isQuietHours();

    for (let i = 0; i < this.queue.length; i++) {
      const notif = this.queue[i];

      // Scheduled for later?
      if (notif.scheduledAt && notif.scheduledAt > now) continue;

      // Quiet hours — only critical bypasses
      if (quiet && !notif.bypassQuietHours && notif.priority !== 'critical') continue;

      // Cooldown check
      if (!this.checkCooldown(notif.type)) continue;

      // Daily limit
      if (!this.checkDailyLimit()) break;

      // Send it
      this.queue.splice(i, 1);
      i--;
      this.deliverLocal(notif);
      this.recordSent(notif.type);
    }
  }

  /** Deliver notification locally (inject into store + toast) */
  private deliverLocal(notif: QueuedNotification): void {
    const appNotif: AppNotification = {
      id: `smart_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: pushTypeToNotifType(notif.type),
      title: notif.title,
      message: notif.body,
      icon: '',
      read: false,
      createdAt: 'agora',
      deepLink: notif.deepLink,
    };

    useNexaStore.setState((state) => ({
      notifications: [appNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    useNexaStore.getState().pushToast(notif.title);
  }

  // ── Public API ───────────────────────────────────────────────

  /** Schedule a smart notification */
  schedule(template: { title: string; body: string; deepLink: string; type: PushType }): void {
    const type = template.type;
    this.enqueue({
      type,
      priority: PRIORITY_MAP[type],
      title: template.title,
      body: template.body,
      deepLink: template.deepLink,
      channel: CHANNEL_MAP[type],
      bypassQuietHours: PRIORITY_MAP[type] === 'critical',
    });
  }

  /** Schedule with delay (ms from now) */
  scheduleDelayed(
    template: { title: string; body: string; deepLink: string; type: PushType },
    delayMs: number,
  ): void {
    const type = template.type;
    this.enqueue({
      type,
      priority: PRIORITY_MAP[type],
      title: template.title,
      body: template.body,
      deepLink: template.deepLink,
      channel: CHANNEL_MAP[type],
      scheduledAt: Date.now() + delayMs,
      bypassQuietHours: PRIORITY_MAP[type] === 'critical',
    });
  }

  /** Start processing loop */
  start(): void {
    if (this.processTimer) return;
    this.processTimer = setInterval(() => this.processQueue(), 30_000);
  }

  /** Stop processing */
  stop(): void {
    if (this.processTimer) {
      clearInterval(this.processTimer);
      this.processTimer = null;
    }
  }

  /** Get current queue length (for debug) */
  getQueueLength(): number {
    return this.queue.length;
  }

  /** Get daily sent count (for debug/settings) */
  getDailySentCount(): number {
    return this.dailySentCount;
  }
}

// Singleton
export const smartPush = new SmartPushScheduler();

// ═══════════════════════════════════════════════════════════════
// LOCAL TRIGGER ENGINE
// ═══════════════════════════════════════════════════════════════

let triggerTimer: ReturnType<typeof setInterval> | null = null;

/** Check store state and schedule smart notifications */
function checkLocalTriggers(): void {
  const state = useNexaStore.getState();
  const user = state.user;

  // ── Streak risk: if user has streak > 0 and hasn't checked in today
  if (user.streak > 0 && !state.checkinClaimed) {
    const hour = new Date().getHours();
    // Duolingo pattern: escalate urgency at 18h, 20h, 21h
    if (hour >= 18 && hour < 20) {
      smartPush.schedule(SMART_TEMPLATES.streakRisk(user.streak));
    } else if (hour >= 20 && hour < 21) {
      const tpl = SMART_TEMPLATES.streakRisk(user.streak);
      tpl.title = `Faltam ${24 - hour}h!`;
      smartPush.schedule(tpl);
    } else if (hour >= 21 && hour < 23) {
      const tpl = SMART_TEMPLATES.streakRisk(user.streak);
      tpl.title = 'ULTIMA CHANCE';
      tpl.body = `Sua streak de ${user.streak} dias acaba a meia-noite!`;
      smartPush.schedule(tpl);
    }
  }

  // ── Mission expiring: check missions close to expiry
  const missions = state.missions ?? [];
  missions.forEach((m) => {
    if (m.completed) return;
    if (m.type === 'daily') {
      const hour = new Date().getHours();
      // Daily missions expire at midnight — alert at 20h and 22h
      if (hour === 20 || hour === 22) {
        smartPush.schedule(SMART_TEMPLATES.missionExpiring(m.title, 24 - hour));
      }
    }
  });

  // ── Anti-collapse: if user state is 'frustrated', suggest a break (system push)
  if (user.state === 'frustrated') {
    smartPush.schedule({
      title: 'Hora de uma pausa?',
      body: 'Detectamos que voce pode estar em uma ma fase. Descanse um pouco.',
      deepLink: 'settings',
      type: 'system',
    });
  }
}

/** Start local trigger engine — runs every 5 minutes */
export function startLocalTriggers(): void {
  if (triggerTimer) return;
  // Initial check after 60s (let app settle)
  setTimeout(() => {
    checkLocalTriggers();
    triggerTimer = setInterval(checkLocalTriggers, 5 * 60 * 1000);
  }, 60_000);
}

/** Stop local triggers */
export function stopLocalTriggers(): void {
  if (triggerTimer) {
    clearInterval(triggerTimer);
    triggerTimer = null;
  }
}

// ═══════════════════════════════════════════════════════════════
// ANDROID NOTIFICATION CHANNELS
// ═══════════════════════════════════════════════════════════════

async function createAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  const messaging = getMessaging();
  if (!messaging) return;

  try {
    const notifee = require('@notifee/react-native').default;

    await notifee.createChannel({
      id: 'urgent',
      name: 'Urgente',
      description: 'Streak em risco, resultados de apostas, cashout alerts',
      importance: 4, // HIGH
      sound: 'default',
      vibration: true,
      lights: true,
    });

    await notifee.createChannel({
      id: 'social',
      name: 'Social',
      description: 'Tipsters, copias, atividade da comunidade',
      importance: 3, // DEFAULT
      sound: 'default',
    });

    await notifee.createChannel({
      id: 'info',
      name: 'Informacoes',
      description: 'Missoes, temporadas, nivel, sistema',
      importance: 2, // LOW
    });
  } catch {
    // notifee not installed — channels via Firebase default
  }
}

// ═══════════════════════════════════════════════════════════════
// FCM CORE (unchanged logic, enhanced)
// ═══════════════════════════════════════════════════════════════

let messagingInstance: any = null;
let pushConfig: PushConfig = { enabled: false, token: null };

function getMessaging() {
  if (messagingInstance) return messagingInstance;
  try {
    const messaging = require('@react-native-firebase/messaging').default;
    messagingInstance = messaging();
    return messagingInstance;
  } catch {
    return null;
  }
}

/** Request notification permission (Android 13+ / iOS) */
export async function requestPermission(): Promise<boolean> {
  const messaging = getMessaging();
  if (!messaging) return false;

  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;
    }

    const authStatus = await messaging.requestPermission();
    const enabled = authStatus === 1 || authStatus === 2;
    pushConfig.enabled = enabled;
    return enabled;
  } catch {
    return false;
  }
}

/** Get FCM token */
export async function getToken(): Promise<string | null> {
  const messaging = getMessaging();
  if (!messaging) return null;

  try {
    const token = await messaging.getToken();
    pushConfig.token = token;
    return token;
  } catch {
    return null;
  }
}

// ─── Type mapping ───────────────────────────────────────────────

function pushTypeToNotifType(type: PushType): NotificationType {
  switch (type) {
    case 'bet_result':
    case 'cashout_alert':
      return 'bet_result';
    case 'tipster_post':
    case 'social_proof':
      return 'social';
    case 'mission_expiring':
      return 'mission';
    case 'streak_risk':
    case 'inactivity':
      return 'streak';
    case 'season':
      return 'season';
    default:
      return 'system';
  }
}

function parseType(data?: Record<string, string>): NotificationType {
  const type = data?.type;
  if (type === 'bet_result' || type === 'cashout_alert') return 'bet_result';
  if (type === 'social' || type === 'tipster_post' || type === 'social_proof') return 'social';
  if (type === 'mission' || type === 'mission_expiring') return 'mission';
  if (type === 'streak' || type === 'streak_risk' || type === 'inactivity') return 'streak';
  if (type === 'season') return 'season';
  return 'system';
}

function resolveDeepLink(rawLink?: string): string | null {
  if (!rawLink) return null;
  return DEEP_LINK_MAP[rawLink] ?? rawLink;
}

function fcmToNotification(message: FCMMessage): AppNotification {
  const type = parseType(message.data);
  const deepLink = message.data?.deepLink ?? message.data?.screen;
  return {
    id: `push_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    title: message.notification?.title ?? message.data?.title ?? 'NEXA',
    message: message.notification?.body ?? message.data?.body ?? '',
    icon: '',
    read: false,
    createdAt: 'agora',
    deepLink: resolveDeepLink(deepLink) ?? undefined,
  };
}

// ─── FCM Handlers ───────────────────────────────────────────────

function handleForegroundMessage(message: FCMMessage) {
  const notif = fcmToNotification(message);

  useNexaStore.setState((state) => ({
    notifications: [notif, ...state.notifications],
    unreadCount: state.unreadCount + 1,
  }));

  useNexaStore.getState().pushToast(notif.title);
}

function handleNotificationTap(message: FCMMessage, navigation?: any) {
  const notif = fcmToNotification(message);

  useNexaStore.setState((state) => {
    const exists = state.notifications.some(n => n.title === notif.title && n.message === notif.message);
    if (exists) return {};
    return {
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    };
  });

  // Deep link navigation
  const rawLink = message.data?.deepLink ?? message.data?.screen;
  const screen = resolveDeepLink(rawLink);
  if (navigation && screen) {
    setTimeout(() => navigation.navigate(screen as never), 300);
  }
}

// ═══════════════════════════════════════════════════════════════
// SETUP (call once in App.tsx)
// ═══════════════════════════════════════════════════════════════

export async function setupPushNotifications(navigation?: any): Promise<void> {
  const messaging = getMessaging();
  if (!messaging) return;

  // Request permission
  const granted = await requestPermission();
  if (!granted) return;

  // Android channels
  await createAndroidChannels();

  // Get token and persist to Supabase
  const token = await getToken();
  if (token) {
    if (__DEV__) {
      console.log('[Push] FCM Token:', token.slice(0, 20) + '...');
    }
    const user = supabaseAuth.getCurrentUser();
    if (user) {
      supabaseService.saveFcmToken(user.uid, token, Platform.OS as 'android' | 'ios').catch(() => {});
    }
  }

  // Foreground handler
  messaging.onMessage((message: FCMMessage) => {
    handleForegroundMessage(message);
  });

  // Background tap handler
  messaging.onNotificationOpenedApp((message: FCMMessage) => {
    handleNotificationTap(message, navigation);
  });

  // App was killed, opened via notification
  const initialMessage = await messaging.getInitialNotification();
  if (initialMessage) {
    handleNotificationTap(initialMessage, navigation);
  }

  // Token refresh
  messaging.onTokenRefresh((newToken: string) => {
    pushConfig.token = newToken;
    const user = supabaseAuth.getCurrentUser();
    if (user) {
      supabaseService.saveFcmToken(user.uid, newToken, Platform.OS as 'android' | 'ios').catch(() => {});
    }
  });

  // Start smart scheduler + local triggers
  smartPush.start();
  startLocalTriggers();
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export function getPushConfig(): PushConfig {
  return { ...pushConfig };
}

/** Cleanup — call on logout or app close */
export function teardownPushNotifications(): void {
  smartPush.stop();
  stopLocalTriggers();
}
