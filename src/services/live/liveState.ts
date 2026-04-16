/**
 * NEXA Live — Arena State
 *
 * Estado em tempo real da Live Arena. Modelo vivo de:
 * - Stream ativo (video, tipster, match vinculado)
 * - Bet panel (odds atualizando, quick bets)
 * - Chat (mensagens, reactions, user identities)
 * - Engagement (XP, streaks, missions, momentum)
 * - Social proof (quem esta apostando, big wins)
 */

// ─── Core Types ─────────────────────────────────────────────

export type StreamQuality = '360p' | '480p' | '720p' | '1080p' | 'auto';
export type ArenaTab = 'chat' | 'bets' | 'stats' | 'polls';
export type MomentumState = 'cold' | 'warming' | 'hot' | 'on_fire';
export type BetUrgency = 'normal' | 'closing_soon' | 'last_chance' | 'locked';

export interface LiveArenaState {
  // Stream
  stream: LiveStreamFull | null;
  quality: StreamQuality;
  isBuffering: boolean;
  latencyMs: number;

  // Betting panel
  activeBets: LiveBetMarket[];
  quickBetAmounts: number[];
  selectedMarket: string | null;
  selectedSide: string | null;

  // Chat
  messages: LiveChatMessage[];
  pinnedMessage: LiveChatMessage | null;
  chatMode: 'all' | 'bets_only' | 'vip';

  // Engagement
  viewerCount: number;
  activeXPMultiplier: number;
  watchStreak: number;          // minutes watched continuously
  liveMissions: LiveMission[];
  momentum: MomentumState;

  // Social proof
  recentBets: LiveBetEvent[];
  bigWins: LiveBigWin[];
  copyBetQueue: LiveCopyBet[];

  // Polls
  activePoll: LivePoll | null;
}

// ─── Stream ─────────────────────────────────────────────────

export interface LiveStreamFull {
  id: string;
  streamUrl: string;
  // Tipster/Streamer
  streamer: {
    id: string;
    username: string;
    tier: string;
    avatar: string;
    roi: number;
    winRate: number;
    followers: number;
    isVerified: boolean;
    currentStreak: number;
  };
  // Linked match
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    minute: number;
    score: { home: number; away: number };
  } | null;
  title: string;
  category: string;
  startedAt: number;
  viewers: number;
  peakViewers: number;
  // Streamer picks (current analysis)
  currentPicks: StreamerPick[];
}

export interface StreamerPick {
  id: string;
  matchId: string;
  matchLabel: string;
  side: string;
  odds: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  copiedBy: number;
  timestamp: number;
}

// ─── Betting ────────────────────────────────────────────────

export interface LiveBetMarket {
  id: string;
  matchId: string;
  type: 'match_result' | 'next_goal' | 'total_goals' | 'both_score' | 'corners' | 'cards';
  label: string;
  options: LiveBetOption[];
  urgency: BetUrgency;
  closesAt: number | null;      // timestamp — null = open
  trending: boolean;
  bettorsCount: number;
}

export interface LiveBetOption {
  id: string;
  label: string;
  odds: number;
  movement: -1 | 0 | 1;        // odds going up/down/stable
  volume: number;               // % of bets on this option
}

export interface LiveBetEvent {
  id: string;
  userId: string;
  username: string;
  userLevel: number;
  userTier: string;
  side: string;
  odds: number;
  stake: number;
  matchLabel: string;
  timestamp: number;
  isCopy: boolean;
}

export interface LiveBigWin {
  id: string;
  username: string;
  userTier: string;
  amount: number;
  odds: number;
  matchLabel: string;
  timestamp: number;
}

export interface LiveCopyBet {
  id: string;
  pickId: string;
  streamerUsername: string;
  side: string;
  odds: number;
  copiedBy: number;
}

// ─── Chat ───────────────────────────────────────────────────

export interface LiveChatMessage {
  id: string;
  userId: string;
  username: string;
  userLevel: number;
  userTier: string;             // 'free' | 'pro' | 'elite'
  userRank: number | null;
  text: string;
  type: 'message' | 'bet_placed' | 'big_win' | 'system' | 'streamer';
  reaction?: string;            // single reaction icon (not emoji spam)
  timestamp: number;
  highlighted: boolean;         // premium message (costs coins)
}

// ─── Engagement ─────────────────────────────────────────────

export interface LiveMission {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  xpReward: number;
  coinsReward: number;
  expiresAt: number;            // mission only valid during this stream
}

export interface LivePoll {
  id: string;
  question: string;
  options: Array<{ label: string; votes: number; percentage: number }>;
  totalVotes: number;
  expiresAt: number;
  createdBy: string;            // streamer who created it
}

// ─── Default State ──────────────────────────────────────────

export function createDefaultArenaState(): LiveArenaState {
  return {
    stream: null,
    quality: 'auto',
    isBuffering: false,
    latencyMs: 0,
    activeBets: [],
    quickBetAmounts: [10, 25, 50, 100],
    selectedMarket: null,
    selectedSide: null,
    messages: [],
    pinnedMessage: null,
    chatMode: 'all',
    viewerCount: 0,
    activeXPMultiplier: 1,
    watchStreak: 0,
    liveMissions: [],
    momentum: 'cold',
    recentBets: [],
    bigWins: [],
    copyBetQueue: [],
    activePoll: null,
  };
}
