import { create } from 'zustand';
import { MOCK_CLANS, MOCK_FEED, MOCK_LEADERBOARD, MOCK_MATCHES, MOCK_MISSIONS, MOCK_NOTIFICATIONS, MOCK_POWER_UPS, MOCK_PREDICTIONS, MOCK_TIPSTERS } from './mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserState = 'motivated' | 'frustrated' | 'impulsive' | 'disengaged';
export type BadgeTier = 'common' | 'rare' | 'epic' | 'legendary';
export type MissionType = 'daily' | 'weekly' | 'hidden';
export type TipsterTier = 'bronze' | 'silver' | 'gold' | 'elite';
export type PostType = 'pick' | 'result' | 'analysis' | 'challenge';
export type Tab = 'feed' | 'apostas' | 'ranking' | 'perfil';

export interface Badge {
  id: string;
  title: string;
  icon: string;
  tier: BadgeTier;
  unlockedAt?: string;
}

export interface UserDNA {
  style: string;
  strengths: string[];
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

export interface Transaction {
  id: string;
  type: 'bet_win' | 'bet_loss' | 'deposit' | 'withdrawal' | 'bonus' | 'coins_earned';
  label: string;
  amount: number;
  currency: 'BRL' | 'coins';
  createdAt: string;
}

export interface SocialStats {
  followers: number;
  following: number;
  copiesReceived: number;
  totalPicks: number;
  greenPicks: number;
}

export interface BadgeProgress {
  id: string;
  title: string;
  icon: string;
  tier: BadgeTier;
  progress: number;
  target: number;
  description: string;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  balance: number;
  coins: number;
  rank: number;
  winRate: number;
  roi: number;
  clan: string | null;
  badges: Badge[];
  following: string[];
  dna: UserDNA;
  state: UserState;
  hasCompletedOnboarding: boolean;
}

export interface Match {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  status: 'pre' | 'live' | 'finished';
  minute?: number;
  score?: { home: number; away: number };
  odds: { home: number; draw: number; away: number };
  bettors: number;
  trending: boolean;
  scheduledDay?: 'today' | 'tomorrow';
  scheduledTime?: string; // e.g. "21:00"
  // 1 = odds rising ▲, -1 = odds falling ▼, 0 = stable
  oddsMovement?: { home: -1 | 0 | 1; draw: -1 | 0 | 1; away: -1 | 0 | 1 };
}

export interface Tipster {
  id: string;
  username: string;
  avatar: string;
  winRate: number;
  roi: number;
  followers: number;
  streak: number;
  tier: TipsterTier;
  isFollowing: boolean;
  recentPick?: {
    matchId: string;
    side: 'home' | 'draw' | 'away';
    odds: number;
  };
}

// FeedPost.match includes odds + bettors for self-contained display
export interface FeedPostMatch {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  status: 'pre' | 'live' | 'finished';
  minute?: number;
  score?: { home: number; away: number };
  odds: { home: number; draw: number; away: number };
  bettors: number;
}

export interface FeedPost {
  id: string;
  type: PostType;
  user: {
    id: string;
    username: string;
    avatar: string;
    tier?: TipsterTier;
  };
  content: string;
  match?: FeedPostMatch;
  pick?: { side: 'home' | 'draw' | 'away'; odds: number };
  likes: number;
  comments: number;
  copies: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinsReward: number;
  progress: number;
  target: number;
  type: MissionType;
  completed: boolean;
  revealed: boolean;
  // Hidden missions: real content shown on reveal
  hiddenTitle?: string;
  hiddenDescription?: string;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  members: number;
  rank: number;
  xp: number;
  weeklyXp: number;
  badge: string;
}

export interface LiveStats {
  usersOnline: number;
  gamesLive: number;
  recentCopies: number;
  recentBets: number;
  toastQueue: string[];
}

// System 1: Decision Engine
export interface InteractionHistory {
  postId: string;
  action: 'like' | 'copy' | 'view' | 'skip';
  timestamp: number;
}

// System 4: Narrative Engine
export interface NarrativeCard {
  id: string;
  content: string;
  icon: string;
  createdAt: number;
}

// System 6: Seasons
export interface Season {
  id: string;
  name: string;
  weekNumber: number;
  endsAt: number; // seconds remaining
  rewards: { rank: number; badge: string; title: string; coins: number }[];
}

// System 7: Creator Economy
export interface CreatorStats {
  weeklyEarnings: number;
  totalEarnings: number;
  totalCopies: number;
  weeklyReach: number;
  isTopTipster: boolean;
}

// System 9: Live Chat
export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

// System 11: Power-Ups
export type PowerUpType = 'xp_boost' | 'odds_shield' | 'lucky_streak';
export interface PowerUp {
  id: string;
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
  cost: number; // coins
  duration: number; // seconds
  active: boolean;
  expiresAt: number | null;
}

// System 12: Collective Predictions
export interface CollectivePrediction {
  matchId: string;
  home: number;
  draw: number;
  away: number;
}

// System 13: Notifications
export type NotificationType = 'bet_result' | 'social' | 'system' | 'season' | 'mission' | 'streak';
export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  read: boolean;
  createdAt: string;
}

// Referral System
export interface ReferralInfo {
  code: string;
  link: string;
  invitesSent: number;
  invitesAccepted: number;
  bonusEarned: number;
}

// Daily Login Calendar
export interface DailyLoginDay {
  day: number;
  reward: number; // coins
  claimed: boolean;
  isToday: boolean;
  isFuture: boolean;
}

// System 14: Dashboard
export interface DashboardStats {
  totalBets: number;
  wins: number;
  losses: number;
  avgOdds: number;
  bestStreak: number;
  profitByLeague: Record<string, number>;
}

// System 15: Anti-Collapse
export interface AntiCollapse {
  consecutiveLosses: number;
  isOnCooldown: boolean;
  cooldownEndsAt: number | null;
  showCooldownSuggestion: boolean;
  showBigWinProtection: boolean;
}

// Stories (Instagram/TikTok style)
export interface Story {
  id: string;
  user: { id: string; username: string; avatar: string; tier?: TipsterTier };
  slides: StorySlide[];
  createdAt: number;
  expiresAt: number;
  viewed: boolean;
}

export interface StorySlide {
  id: string;
  type: 'pick' | 'analysis' | 'reaction' | 'poll';
  content: string;
  matchId?: string;
  pollOptions?: { label: string; votes: number }[];
  backgroundColor: string;
}

// Events & Tournaments
export interface Tournament {
  id: string;
  name: string;
  icon: string;
  status: 'upcoming' | 'active' | 'finished';
  participants: number;
  maxParticipants: number;
  prizePool: number;
  entryFee: number;
  startsAt: string;
  endsAt: string;
  userRank: number | null;
  userScore: number;
  rounds: TournamentRound[];
}

export interface TournamentRound {
  id: string;
  name: string;
  matchId: string;
  status: 'pending' | 'active' | 'completed';
  userPick: string | null;
  result: 'correct' | 'wrong' | null;
}

// Explore
export interface ExploreCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

// Subscriptions
export type SubscriptionTier = 'free' | 'pro' | 'elite';
export interface Subscription {
  tier: SubscriptionTier;
  price: number;
  features: string[];
  isActive: boolean;
}

// Audio Rooms
export interface AudioRoom {
  id: string;
  title: string;
  host: { id: string; username: string; tier?: TipsterTier };
  speakers: { id: string; username: string }[];
  listeners: number;
  isLive: boolean;
  topic: string;
}

// Analytics Event (mock tracking)
export interface AnalyticsEvent {
  name: string;
  timestamp: number;
  properties: Record<string, string | number | boolean>;
}

// i18n
export type Language = 'pt' | 'en' | 'es';

// Bet History
export interface PlacedBet {
  id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  side: 'home' | 'draw' | 'away';
  odds: number;
  stake: number;
  result: 'pending' | 'won' | 'lost';
  profit: number;
  createdAt: string;
}

// Search
export interface SearchResult {
  type: 'match' | 'tipster' | 'user' | 'clan';
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

// Settings
export interface AppSettings {
  theme: 'dark' | 'darker';
  notificationsEnabled: boolean;
  notifyMissions: boolean;
  notifyRankChanges: boolean;
  notifySocialActions: boolean;
  notifyStreakRisk: boolean;
  profileVisibility: 'public' | 'private';
  responsibleGamblingLimit: number | null; // daily bet limit in BRL
  language: 'pt' | 'en' | 'es';
}

// Lives & Streaming
export interface LiveStream {
  id: string;
  tipster: { id: string; username: string; tier: TipsterTier };
  title: string;
  viewers: number;
  isLive: boolean;
  scheduledAt?: string;
  matchId?: string;
}

// Marketplace
export interface MarketplaceItem {
  id: string;
  type: 'strategy' | 'analysis' | 'vip_tips';
  title: string;
  seller: { id: string; username: string; tier: TipsterTier };
  price: number; // in NEXA coins
  rating: number; // 0-5
  reviews: number;
  description: string;
  isBestseller: boolean;
  purchased: boolean;
}

// Mini-Games
export interface MiniGame {
  id: string;
  name: string;
  icon: string;
  description: string;
  xpReward: number;
  coinsReward: number;
  unlockLevel: number;
  played: boolean;
  highScore: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const NARRATIVE_TEMPLATES = [
  '🔥 AcePredict acertou 7 seguidos — melhor semana dele',
  '⚡ Seu clã subiu para #3 no ranking semanal',
  '🏆 Você está a {xpGap} XP do nível {nextLevel}',
  '👥 {copies} pessoas copiaram apostas esta semana',
  '🎯 StatMaster atingiu 61% de acerto — nova marca',
  '💰 Top 3 tipsters lucraram R$ 4.200 essa semana',
  '📊 Brasileirão: 78% das apostas foram no mandante',
  '🔴 {online} usuários estão ao vivo agora',
];

const MOCK_CHAT_USERS = ['GabrielP', 'MarFutebol', 'BetKing22', 'LuckyStrike', 'anonimo'];

const MOCK_CHAT_MESSAGES = [
  'Golaço!!! 🔥',
  'Esse jogo tá bom demais',
  'Vai virar, confia',
  'Juiz ladrão!',
  'Quem apostou no mandante tá rindo',
  'Esse time não joga nada',
  'Bora!!!! 💪',
  'Odds mudaram, cuidado',
  'Tô all-in nesse jogo',
  'Alguém mais apostou no empate?',
  'Segundo tempo vai ser melhor',
  'Defesa tá um queijo',
];

// ─── Store interface ──────────────────────────────────────────────────────────

interface NexaStore {
  activeTab: Tab;
  user: User;
  checkinClaimed: boolean;
  betsPlaced: number;
  feed: FeedPost[];
  matches: Match[];
  tipsters: Tipster[];
  missions: Mission[];
  clans: Clan[];
  leaderboard: User[];
  selectedOdds: Record<string, 'home' | 'draw' | 'away'>;
  socialStats: SocialStats;
  transactions: Transaction[];
  badgeProgress: BadgeProgress[];
  roiHistory: number[];
  liveStats: LiveStats;
  pendingLevelUp: number | null;   // new level number, null = no pending
  pendingStreak: number | null;    // streak count, null = no pending

  // System 1: Decision Engine
  interactionHistory: InteractionHistory[];
  scoredFeed: FeedPost[];

  // System 4: Narrative Engine
  narrativeCards: NarrativeCard[];

  // System 5: Reactivation
  lastActiveAt: number;
  daysSinceLastVisit: number;
  streakAtRisk: boolean;

  // System 6: Seasons
  currentSeason: Season;

  // System 7: Creator Economy
  creatorStats: CreatorStats;

  // System 9: Live Chat
  matchChats: Record<string, ChatMessage[]>;
  expandedChat: string | null;

  // System 11: Power-Ups
  powerUps: PowerUp[];
  activePowerUps: PowerUp[];

  // System 12: Collective Predictions
  predictions: CollectivePrediction[];

  // System 13: Notifications
  notifications: AppNotification[];
  unreadCount: number;

  // System 14: Dashboard
  dashboardStats: DashboardStats;

  // System 15: Anti-Collapse
  antiCollapse: AntiCollapse;

  // Bet History, Search, Settings
  betHistory: PlacedBet[];
  searchQuery: string;
  searchResults: SearchResult[];
  trendingSearches: string[];
  settings: AppSettings;

  // Stories
  stories: Story[];
  activeStoryIndex: number | null;
  viewStory: (storyId: string) => void;

  // Events
  tournaments: Tournament[];
  joinTournament: (tournamentId: string) => void;
  submitPick: (tournamentId: string, roundId: string, pick: string) => void;

  // Explore
  exploreCategories: ExploreCategory[];

  // Subscriptions
  subscriptions: Subscription[];
  currentSubscription: SubscriptionTier;
  upgradeTier: (tier: SubscriptionTier) => void;

  // Audio Rooms
  audioRooms: AudioRoom[];

  // Referral & Daily Login
  referral: ReferralInfo;
  loginCalendar: DailyLoginDay[];
  claimDailyLogin: (day: number) => void;

  // Analytics
  analyticsEvents: AnalyticsEvent[];
  trackEvent: (name: string, props?: Record<string, string | number | boolean>) => void;

  // Lives, Marketplace, Mini-Games
  liveStreams: LiveStream[];
  marketplaceItems: MarketplaceItem[];
  miniGames: MiniGame[];
  purchaseItem: (itemId: string) => void;
  playMiniGame: (gameId: string) => void;
  tickViewers: () => void;

  // ─── Actions ─────────────────────────────────────────────────────────────────

  setActiveTab: (tab: Tab) => void;
  dismissLevelUp: () => void;
  dismissStreak: () => void;
  tickLiveStats: () => void;
  pushToast: (msg: string) => void;
  popToast: () => void;
  likePost: (postId: string) => void;
  copyBet: (postId: string) => void;
  followTipster: (tipsterId: string) => void;
  selectOdd: (matchId: string, side: 'home' | 'draw' | 'away') => void;
  claimCheckin: () => void;
  placeBet: () => void;
  completeOnboarding: () => void;
  addXP: (amount: number) => void;
  detectUserState: () => void;
  challengeUser: (targetId: string) => void;

  // System 1
  recordInteraction: (postId: string, action: InteractionHistory['action']) => void;
  scoreFeed: () => void;

  // System 4
  injectNarrative: () => void;
  dismissNarrative: (id: string) => void;

  // System 6
  tickSeason: () => void;

  // System 9
  toggleChat: (matchId: string) => void;
  injectChatMessage: (matchId: string) => void;

  // System 11
  purchasePowerUp: (type: PowerUpType) => void;
  tickPowerUps: () => void;

  // System 12
  tickPredictions: () => void;

  // System 13
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  // System 15
  checkAntiCollapse: () => void;
  acknowledgeCooldown: () => void;
  dismissBigWinProtection: () => void;

  // System 8: Wallet
  deposit: (amount: number) => void;
  withdraw: (amount: number) => void;
  convertXPToCoins: (xpAmount: number) => void;

  // Bet History, Search, Settings
  recordBet: (bet: Omit<PlacedBet, 'id' | 'createdAt'>) => void;
  search: (query: string) => void;
  clearSearch: () => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialUser: User = {
  id: 'u1',
  username: 'você',
  avatar: '',
  level: 1,
  xp: 100,
  xpToNext: 500,
  streak: 2,
  balance: 0,
  coins: 200,
  rank: 1847,
  winRate: 0,
  roi: 0,
  clan: null,
  badges: [
    { id: 'b1', title: 'Primeiro Passo', icon: '👣', tier: 'common' as BadgeTier, unlockedAt: '2026-04-10' },
    { id: 'b2', title: 'Streak Iniciante', icon: '🔥', tier: 'common' as BadgeTier, unlockedAt: '2026-04-11' },
    { id: 'b3', title: 'Copy Master', icon: '📋', tier: 'rare' as BadgeTier, unlockedAt: '2026-04-12' },
    { id: 'b4', title: 'Olho de Águia', icon: '🦅', tier: 'epic' as BadgeTier, unlockedAt: '2026-04-13' },
  ],
  following: ['t2', 't5'],
  dna: {
    style: 'Apostador Analítico',
    strengths: ['Análise de odds', 'Gestão de banca', 'Paciência'],
    riskProfile: 'moderate',
  },
  state: 'motivated',
  hasCompletedOnboarding: false,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNexaStore = create<NexaStore>((set, get) => ({
  activeTab: 'feed',
  user: initialUser,
  checkinClaimed: false,
  betsPlaced: 0,
  feed: MOCK_FEED,
  matches: MOCK_MATCHES,
  tipsters: MOCK_TIPSTERS,
  missions: MOCK_MISSIONS,
  clans: MOCK_CLANS,
  leaderboard: MOCK_LEADERBOARD,
  selectedOdds: {},

  socialStats: {
    followers: 42,
    following: 2,
    copiesReceived: 18,
    totalPicks: 14,
    greenPicks: 9,
  },

  transactions: [
    { id: 'tx1', type: 'bonus', label: 'Bônus de boas-vindas', amount: 200, currency: 'coins', createdAt: '10 abr' },
    { id: 'tx2', type: 'coins_earned', label: 'Check-in diário', amount: 100, currency: 'coins', createdAt: '11 abr' },
    { id: 'tx3', type: 'bet_win', label: 'Barcelona 2×1 Atlético', amount: 34.40, currency: 'BRL', createdAt: '12 abr' },
    { id: 'tx4', type: 'bet_loss', label: 'Napoli × Roma', amount: -20.00, currency: 'BRL', createdAt: '12 abr' },
    { id: 'tx5', type: 'coins_earned', label: 'Missão: Primeira aposta', amount: 50, currency: 'coins', createdAt: '13 abr' },
    { id: 'tx6', type: 'bonus', label: 'Bônus onboarding', amount: 200, currency: 'coins', createdAt: '13 abr' },
  ],

  badgeProgress: [
    { id: 'bp1', title: 'Streak Master', icon: '🔥', tier: 'epic', progress: 2, target: 5, description: 'Mantenha uma sequência de 5 dias' },
    { id: 'bp2', title: 'Social King', icon: '👥', tier: 'rare', progress: 2, target: 5, description: 'Siga 5 tipsters' },
    { id: 'bp3', title: 'Lenda Viva', icon: '🏆', tier: 'legendary', progress: 4, target: 50, description: 'Faça 50 picks certeiros' },
    { id: 'bp4', title: 'Apostador Noturno', icon: '🌙', tier: 'rare', progress: 1, target: 3, description: 'Aposte em 3 jogos após 22h' },
    { id: 'bp5', title: 'Clã Warrior', icon: '⚔️', tier: 'epic', progress: 0, target: 1, description: 'Entre em um clã' },
  ],

  // Mock ROI history (last 14 days, percentage values)
  roiHistory: [0, 0, 2, -1, 3, 5, 4, 8, 6, 12, 10, 15, 11, 14],

  pendingLevelUp: null,
  pendingStreak: null,

  liveStats: {
    usersOnline: 247,
    gamesLive: 3,
    recentCopies: 34,
    recentBets: 128,
    toastQueue: [],
  },

  // System 1: Decision Engine
  interactionHistory: [],
  scoredFeed: [],

  // System 4: Narrative Engine
  narrativeCards: [],

  // System 5: Reactivation
  lastActiveAt: Date.now(),
  daysSinceLastVisit: 0,
  streakAtRisk: false,

  // System 6: Seasons
  currentSeason: {
    id: 's1',
    name: 'Temporada Alpha',
    weekNumber: 3,
    endsAt: 3 * 24 * 3600 + 14 * 3600 + 32 * 60,
    rewards: [
      { rank: 1, badge: '👑', title: 'Campeão Alpha', coins: 5000 },
      { rank: 2, badge: '🥈', title: 'Vice Alpha', coins: 3000 },
      { rank: 3, badge: '🥉', title: 'Bronze Alpha', coins: 1500 },
    ],
  },

  // System 7: Creator Economy
  creatorStats: {
    weeklyEarnings: 127.50,
    totalEarnings: 842.30,
    totalCopies: 521,
    weeklyReach: 3400,
    isTopTipster: false,
  },

  // System 9: Live Chat
  matchChats: {},
  expandedChat: null,

  // System 11: Power-Ups
  powerUps: MOCK_POWER_UPS,
  activePowerUps: [],

  // System 12: Collective Predictions
  predictions: MOCK_PREDICTIONS,

  // System 13: Notifications
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.read).length,

  // System 14: Dashboard
  dashboardStats: {
    totalBets: 47,
    wins: 28,
    losses: 19,
    avgOdds: 1.92,
    bestStreak: 7,
    profitByLeague: {
      'Brasileirão': 45.20,
      'Premier League': 22.10,
      'La Liga': -8.50,
      'Champions League': 31.00,
    },
  },

  // System 15: Anti-Collapse
  antiCollapse: {
    consecutiveLosses: 0,
    isOnCooldown: false,
    cooldownEndsAt: null,
    showCooldownSuggestion: false,
    showBigWinProtection: false,
  },

  // Bet History
  betHistory: [
    { id: 'bh1', matchId: 'match4', homeTeam: 'Barcelona', awayTeam: 'Atlético Madrid', league: 'La Liga', side: 'home', odds: 1.72, stake: 20, result: 'won', profit: 14.40, createdAt: '2026-04-12T22:30:00' },
    { id: 'bh2', matchId: 'match1', homeTeam: 'Flamengo', awayTeam: 'Corinthians', league: 'Brasileirão Série A', side: 'home', odds: 1.45, stake: 30, result: 'pending', profit: 0, createdAt: '2026-04-13T14:00:00' },
    { id: 'bh3', matchId: 'match5', homeTeam: 'Napoli', awayTeam: 'Roma', league: 'Serie A', side: 'draw', odds: 3.30, stake: 10, result: 'lost', profit: -10, createdAt: '2026-04-12T18:00:00' },
    { id: 'bh4', matchId: 'match2', homeTeam: 'Arsenal', awayTeam: 'Liverpool', league: 'Premier League', side: 'away', odds: 1.85, stake: 25, result: 'pending', profit: 0, createdAt: '2026-04-13T15:30:00' },
    { id: 'bh5', matchId: 'match6', homeTeam: 'PSG', awayTeam: 'Lyon', league: 'Ligue 1', side: 'home', odds: 1.28, stake: 50, result: 'won', profit: 14.00, createdAt: '2026-04-12T20:00:00' },
  ],

  // Search
  searchQuery: '',
  searchResults: [],
  trendingSearches: ['Flamengo', 'Champions League', 'AcePredict', 'Sharks Elite', 'Brasileirão'],

  // Settings
  settings: {
    theme: 'dark',
    notificationsEnabled: true,
    notifyMissions: true,
    notifyRankChanges: true,
    notifySocialActions: true,
    notifyStreakRisk: true,
    profileVisibility: 'public',
    responsibleGamblingLimit: null,
    language: 'pt',
  },

  // Stories
  stories: [
    { id: 'st1', user: { id: 't5', username: 'AcePredict', avatar: '', tier: 'elite' as TipsterTier }, slides: [
      { id: 'sl1', type: 'pick', content: 'Real Madrid ganha hoje, confia! ⚽', matchId: 'match3', backgroundColor: '#7C5CFC' },
      { id: 'sl2', type: 'analysis', content: 'Odds caindo rápido, valor no mandante', backgroundColor: '#16131F' },
    ], createdAt: Date.now() - 3600000, expiresAt: Date.now() + 82800000, viewed: false },
    { id: 'st2', user: { id: 't1', username: 'KingBet', avatar: '', tier: 'elite' as TipsterTier }, slides: [
      { id: 'sl3', type: 'reaction', content: 'GOOOOL! Flamengo abre o placar! 🔥🔥', matchId: 'match1', backgroundColor: '#FF4D6A' },
      { id: 'sl4', type: 'poll', content: 'Quem ganha a Champions?', pollOptions: [{ label: 'Real Madrid', votes: 342 }, { label: 'Bayern', votes: 218 }, { label: 'Man City', votes: 289 }], backgroundColor: '#1E1A2E' },
    ], createdAt: Date.now() - 7200000, expiresAt: Date.now() + 79200000, viewed: false },
    { id: 'st3', user: { id: 't2', username: 'StatMaster', avatar: '', tier: 'gold' as TipsterTier }, slides: [
      { id: 'sl5', type: 'analysis', content: 'Brasileirão: mandante ganha 78% das vezes esta rodada 📊', backgroundColor: '#00C896' },
    ], createdAt: Date.now() - 1800000, expiresAt: Date.now() + 84600000, viewed: true },
    { id: 'st4', user: { id: 't3', username: 'ValueHunt', avatar: '', tier: 'gold' as TipsterTier }, slides: [
      { id: 'sl6', type: 'pick', content: 'Under 2.5 no Napoli × Roma. Jogo travado.', matchId: 'match5', backgroundColor: '#F5C842' },
    ], createdAt: Date.now() - 5400000, expiresAt: Date.now() + 81000000, viewed: false },
    { id: 'st5', user: { id: 't8', username: 'ProSniper', avatar: '', tier: 'elite' as TipsterTier }, slides: [
      { id: 'sl7', type: 'reaction', content: 'PSG destruindo! 2×1 com 80 min! 💪', matchId: 'match6', backgroundColor: '#FF8C42' },
      { id: 'sl8', type: 'pick', content: 'Próxima: Palmeiras × SP, pick no Palmeiras', matchId: 'match7', backgroundColor: '#7C5CFC' },
    ], createdAt: Date.now() - 900000, expiresAt: Date.now() + 85500000, viewed: false },
    { id: 'st6', user: { id: 'u1', username: 'você', avatar: '' }, slides: [
      { id: 'sl9', type: 'analysis', content: 'Minha análise do dia: foco no Brasileirão!', backgroundColor: '#16131F' },
    ], createdAt: Date.now() - 10800000, expiresAt: Date.now() + 75600000, viewed: true },
  ],
  activeStoryIndex: null,

  // Tournaments
  tournaments: [
    { id: 'ev1', name: 'Torneio Champions League', icon: '🏆', status: 'active', participants: 1247, maxParticipants: 2000, prizePool: 50000, entryFee: 100, startsAt: '14 abr', endsAt: '16 abr', userRank: 42, userScore: 850, rounds: [
      { id: 'r1', name: 'Oitavas', matchId: 'match3', status: 'completed', userPick: 'home', result: 'correct' },
      { id: 'r2', name: 'Quartas', matchId: 'match9', status: 'active', userPick: null, result: null },
      { id: 'r3', name: 'Semi', matchId: '', status: 'pending', userPick: null, result: null },
    ]},
    { id: 'ev2', name: 'Brasileirão Prediction', icon: '⚽', status: 'active', participants: 3420, maxParticipants: 5000, prizePool: 25000, entryFee: 50, startsAt: '13 abr', endsAt: '14 abr', userRank: 128, userScore: 620, rounds: [
      { id: 'r4', name: 'Rodada 12', matchId: 'match1', status: 'active', userPick: 'home', result: null },
    ]},
    { id: 'ev3', name: 'Weekend Blitz', icon: '⚡', status: 'upcoming', participants: 890, maxParticipants: 1000, prizePool: 15000, entryFee: 75, startsAt: '19 abr', endsAt: '20 abr', userRank: null, userScore: 0, rounds: [] },
    { id: 'ev4', name: 'Copa Tipsters Elite', icon: '👑', status: 'finished', participants: 500, maxParticipants: 500, prizePool: 100000, entryFee: 200, startsAt: '7 abr', endsAt: '13 abr', userRank: 15, userScore: 2100, rounds: [] },
  ],

  // Explore Categories
  exploreCategories: [
    { id: 'ec1', name: 'Futebol', icon: '⚽', color: '#00C896', count: 124 },
    { id: 'ec2', name: 'Ao Vivo', icon: '🔴', color: '#FF4D6A', count: 7 },
    { id: 'ec3', name: 'Top Tipsters', icon: '🏅', color: '#F5C842', count: 31 },
    { id: 'ec4', name: 'Champions', icon: '🏆', color: '#7C5CFC', count: 18 },
    { id: 'ec5', name: 'Brasileirão', icon: '🇧🇷', color: '#00C896', count: 42 },
    { id: 'ec6', name: 'Clãs', icon: '⚔️', color: '#FF8C42', count: 6 },
    { id: 'ec7', name: 'Missões', icon: '🎯', color: '#B44DFF', count: 12 },
    { id: 'ec8', name: 'Power-Ups', icon: '💎', color: '#4DA6FF', count: 3 },
  ],

  // Subscriptions
  subscriptions: [
    { tier: 'free', price: 0, features: ['Feed básico', 'Apostas limitadas', '3 follows gratuitos', 'Missões diárias'], isActive: true },
    { tier: 'pro', price: 29.90, features: ['Feed personalizado', 'Apostas ilimitadas', 'Follows ilimitados', 'Power-ups grátis/semana', 'Sem anúncios', 'Badge Pro exclusivo'], isActive: false },
    { tier: 'elite', price: 79.90, features: ['Tudo do Pro', 'Acesso VIP a lives', 'Creator Studio completo', 'Torneios exclusivos', 'Cashback 2%', 'Suporte prioritário', 'Badge Elite animado'], isActive: false },
  ],
  currentSubscription: 'free' as SubscriptionTier,

  // Audio Rooms
  audioRooms: [
    { id: 'ar1', title: 'Análise pré-jogo: Flamengo × Corinthians', host: { id: 't5', username: 'AcePredict', tier: 'elite' as TipsterTier }, speakers: [{ id: 't1', username: 'KingBet' }, { id: 't2', username: 'StatMaster' }], listeners: 342, isLive: true, topic: 'Brasileirão' },
    { id: 'ar2', title: 'Champions League — Quem avança?', host: { id: 't1', username: 'KingBet', tier: 'elite' as TipsterTier }, speakers: [{ id: 't3', username: 'ValueHunt' }], listeners: 567, isLive: true, topic: 'Champions League' },
    { id: 'ar3', title: 'Dicas de gestão de banca', host: { id: 't2', username: 'StatMaster', tier: 'gold' as TipsterTier }, speakers: [], listeners: 0, isLive: false, topic: 'Educacional' },
  ],

  // Referral
  referral: {
    code: 'NEXAVOC3X',
    link: 'https://nexa.app/ref/NEXAVOC3X',
    invitesSent: 3,
    invitesAccepted: 1,
    bonusEarned: 200,
  },

  // Daily Login Calendar (30 days)
  loginCalendar: Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const isSpecial7 = day % 7 === 0;
    const isDay30 = day === 30;
    const reward = isDay30 ? 200 : isSpecial7 ? 50 : 10;
    return {
      day,
      reward,
      claimed: day <= 12,
      isToday: day === 13,
      isFuture: day > 13,
    };
  }),

  // Analytics
  analyticsEvents: [],

  // Lives & Streaming
  liveStreams: [
    { id: 'ls1', tipster: { id: 't5', username: 'AcePredict', tier: 'elite' }, title: 'Análise ao vivo: Champions League', viewers: 1247, isLive: true, matchId: 'match3' },
    { id: 'ls2', tipster: { id: 't1', username: 'KingBet', tier: 'elite' }, title: 'Picks da noite — Brasileirão', viewers: 892, isLive: true, matchId: 'match1' },
    { id: 'ls3', tipster: { id: 't2', username: 'StatMaster', tier: 'gold' }, title: 'Review semanal + melhores odds', viewers: 0, isLive: false, scheduledAt: 'Amanhã 20:00' },
    { id: 'ls4', tipster: { id: 't3', username: 'ValueHunt', tier: 'gold' }, title: 'Estratégia de value betting', viewers: 0, isLive: false, scheduledAt: 'Amanhã 14:00' },
  ],

  // Marketplace
  marketplaceItems: [
    { id: 'mk1', type: 'strategy', title: 'Método Fibonacci para Futebol', seller: { id: 't5', username: 'AcePredict', tier: 'elite' }, price: 500, rating: 4.8, reviews: 127, description: 'Estratégia comprovada com 72% de acerto', isBestseller: true, purchased: false },
    { id: 'mk2', type: 'analysis', title: 'Análise Completa Brasileirão 2026', seller: { id: 't2', username: 'StatMaster', tier: 'gold' }, price: 300, rating: 4.5, reviews: 84, description: 'Estatísticas detalhadas de todos os times', isBestseller: false, purchased: false },
    { id: 'mk3', type: 'vip_tips', title: 'VIP Picks Premium — Semana 12', seller: { id: 't1', username: 'KingBet', tier: 'elite' }, price: 200, rating: 4.3, reviews: 56, description: '5 picks exclusivos com análise profunda', isBestseller: false, purchased: true },
    { id: 'mk4', type: 'strategy', title: 'Over/Under Masterclass', seller: { id: 't3', username: 'ValueHunt', tier: 'gold' }, price: 400, rating: 4.6, reviews: 93, description: 'Dominando o mercado de gols', isBestseller: true, purchased: false },
    { id: 'mk5', type: 'analysis', title: 'Champions League Special Report', seller: { id: 't5', username: 'AcePredict', tier: 'elite' }, price: 350, rating: 4.9, reviews: 201, description: 'Relatório completo das oitavas', isBestseller: true, purchased: false },
  ],

  // Mini-Games
  miniGames: [
    { id: 'g1', name: 'Prediction Battle', icon: '⚔️', description: 'Adivinhe o placar e ganhe XP', xpReward: 100, coinsReward: 50, unlockLevel: 1, played: false, highScore: 0 },
    { id: 'g2', name: 'Sports Trivia', icon: '🧠', description: 'Quiz sobre futebol mundial', xpReward: 75, coinsReward: 30, unlockLevel: 1, played: true, highScore: 850 },
    { id: 'g3', name: 'Odds Master', icon: '🎯', description: 'Acerte a odd correta', xpReward: 120, coinsReward: 60, unlockLevel: 2, played: false, highScore: 0 },
    { id: 'g4', name: 'Streak Challenge', icon: '🔥', description: 'Quantos acertos em sequência?', xpReward: 150, coinsReward: 80, unlockLevel: 3, played: false, highScore: 0 },
    { id: 'g5', name: 'Fantasy Draft', icon: '👥', description: 'Monte seu time dos sonhos', xpReward: 200, coinsReward: 100, unlockLevel: 5, played: false, highScore: 0 },
  ],

  // ─── Existing Actions ──────────────────────────────────────────────────────

  setActiveTab: (tab) => set({ activeTab: tab }),

  dismissLevelUp: () => set({ pendingLevelUp: null }),
  dismissStreak: () => set({ pendingStreak: null }),

  tickLiveStats: () =>
    set((s) => ({
      liveStats: {
        ...s.liveStats,
        usersOnline: s.liveStats.usersOnline + Math.floor(Math.random() * 11) - 4,
        recentCopies: s.liveStats.recentCopies + Math.floor(Math.random() * 3),
        recentBets: s.liveStats.recentBets + Math.floor(Math.random() * 5) + 1,
      },
    })),

  pushToast: (msg) =>
    set((s) => ({
      liveStats: { ...s.liveStats, toastQueue: [...s.liveStats.toastQueue, msg] },
    })),

  popToast: () =>
    set((s) => ({
      liveStats: { ...s.liveStats, toastQueue: s.liveStats.toastQueue.slice(1) },
    })),

  likePost: (postId) =>
    set((s) => ({
      feed: s.feed.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    })),

  copyBet: (postId) => {
    set((s) => ({
      feed: s.feed.map((p) =>
        p.id === postId ? { ...p, copies: p.copies + 1 } : p,
      ),
    }));
    get().addXP(10);
  },

  followTipster: (tipsterId) =>
    set((s) => ({
      tipsters: s.tipsters.map((t) =>
        t.id === tipsterId
          ? {
              ...t,
              isFollowing: !t.isFollowing,
              followers: t.isFollowing ? t.followers - 1 : t.followers + 1,
            }
          : t,
      ),
      user: {
        ...s.user,
        following: s.user.following.includes(tipsterId)
          ? s.user.following.filter((id) => id !== tipsterId)
          : [...s.user.following, tipsterId],
      },
    })),

  selectOdd: (matchId, side) =>
    set((s) => ({
      selectedOdds: { ...s.selectedOdds, [matchId]: side },
    })),

  claimCheckin: () => {
    set((s) => {
      const newStreak = s.user.streak + 1;
      return {
        checkinClaimed: true,
        pendingStreak: newStreak,
        user: {
          ...s.user,
          xp: s.user.xp + 50,
          coins: s.user.coins + 100,
          streak: newStreak,
        },
      };
    });
    get().detectUserState();
  },

  placeBet: () => {
    set((s) => {
      const next = s.betsPlaced + 1;
      const shouldReveal = next >= 3;
      return {
        betsPlaced: next,
        missions: s.missions.map((m) => {
          if (m.id !== 'm4') return m;
          return {
            ...m,
            progress: Math.min(next, m.target),
            revealed: shouldReveal || m.revealed,
            completed: shouldReveal,
            title: shouldReveal && m.hiddenTitle ? m.hiddenTitle : m.title,
            description:
              shouldReveal && m.hiddenDescription ? m.hiddenDescription : m.description,
          };
        }),
      };
    });
    get().addXP(20);
    get().checkAntiCollapse();
  },

  completeOnboarding: () =>
    set((s) => ({
      user: {
        ...s.user,
        hasCompletedOnboarding: true,
        xp: s.user.xp + 100,
        coins: s.user.coins + 200,
      },
    })),

  addXP: (amount) =>
    set((s) => {
      const newXP = s.user.xp + amount;
      const leveledUp = newXP >= s.user.xpToNext;
      const newLevel = leveledUp ? s.user.level + 1 : s.user.level;
      return {
        pendingLevelUp: leveledUp ? newLevel : s.pendingLevelUp,
        user: {
          ...s.user,
          xp: leveledUp ? newXP - s.user.xpToNext : newXP,
          level: newLevel,
          xpToNext: leveledUp ? Math.round(s.user.xpToNext * 1.4) : s.user.xpToNext,
        },
      };
    }),

  detectUserState: () =>
    set((s) => {
      const { winRate, streak, roi } = s.user;
      let state: UserState = 'motivated';
      if (roi < -0.2 && winRate < 0.4) state = 'frustrated';
      else if (streak > 3 && roi > 0.1) state = 'impulsive';
      else if (streak === 0 && winRate === 0) state = 'disengaged';
      return { user: { ...s.user, state } };
    }),

  challengeUser: (_targetId) => {
    // In real app: create challenge, notify target, deduct entry fee
    // For now: award XP for engagement
    get().addXP(15);
  },

  // ─── System 1: Decision Engine ─────────────────────────────────────────────

  recordInteraction: (postId, action) =>
    set((s) => ({
      interactionHistory: [
        ...s.interactionHistory,
        { postId, action, timestamp: Date.now() },
      ],
    })),

  scoreFeed: () =>
    set((s) => {
      const tierWeight: Record<string, number> = { elite: 4, gold: 3, silver: 2, bronze: 1 };
      const now = Date.now();

      const scored = [...s.feed].map((post) => {
        let score = 0;

        // Recency: newer posts score higher (based on createdAt string parsing)
        const minutesMatch = post.createdAt.match(/(\d+)min/);
        const hoursMatch = post.createdAt.match(/(\d+)h/);
        if (minutesMatch) {
          score += Math.max(0, 100 - parseInt(minutesMatch[1], 10));
        } else if (hoursMatch) {
          score += Math.max(0, 60 - parseInt(hoursMatch[1], 10) * 10);
        }

        // Social proof: copies
        score += Math.min(post.copies * 0.1, 50);

        // User tier weight
        const tier = post.user.tier || 'bronze';
        score += (tierWeight[tier] || 1) * 10;

        // isLiked boost
        if (post.isLiked) score += 15;

        // Match trending boost
        if (post.match) {
          const matchData = s.matches.find((m) => m.id === post.match!.id);
          if (matchData?.trending) score += 20;
        }

        return { post, score };
      });

      scored.sort((a, b) => b.score - a.score);

      return { scoredFeed: scored.map((s) => s.post) };
    }),

  // ─── System 4: Narrative Engine ────────────────────────────────────────────

  injectNarrative: () =>
    set((s) => {
      const template = NARRATIVE_TEMPLATES[Math.floor(Math.random() * NARRATIVE_TEMPLATES.length)];
      const xpGap = s.user.xpToNext - s.user.xp;
      const nextLevel = s.user.level + 1;
      const totalCopies = s.feed.reduce((sum, p) => sum + p.copies, 0);

      const content = template
        .replace('{xpGap}', String(xpGap))
        .replace('{nextLevel}', String(nextLevel))
        .replace('{copies}', String(totalCopies))
        .replace('{online}', String(s.liveStats.usersOnline));

      const icon = content.charAt(0) === ' ' ? '📢' : content.substring(0, 2);

      const card: NarrativeCard = {
        id: `nar_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        content,
        icon,
        createdAt: Date.now(),
      };

      return { narrativeCards: [...s.narrativeCards, card] };
    }),

  dismissNarrative: (id) =>
    set((s) => ({
      narrativeCards: s.narrativeCards.filter((c) => c.id !== id),
    })),

  // ─── System 6: Seasons ─────────────────────────────────────────────────────

  tickSeason: () =>
    set((s) => ({
      currentSeason: {
        ...s.currentSeason,
        endsAt: Math.max(0, s.currentSeason.endsAt - 1),
      },
    })),

  // ─── System 9: Live Chat ───────────────────────────────────────────────────

  toggleChat: (matchId) =>
    set((s) => ({
      expandedChat: s.expandedChat === matchId ? null : matchId,
    })),

  injectChatMessage: (matchId) =>
    set((s) => {
      const user = MOCK_CHAT_USERS[Math.floor(Math.random() * MOCK_CHAT_USERS.length)];
      const text = MOCK_CHAT_MESSAGES[Math.floor(Math.random() * MOCK_CHAT_MESSAGES.length)];
      const message: ChatMessage = {
        id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        user,
        text,
        timestamp: Date.now(),
      };
      const existing = s.matchChats[matchId] || [];
      return {
        matchChats: {
          ...s.matchChats,
          [matchId]: [...existing, message],
        },
      };
    }),

  // ─── System 11: Power-Ups ─────────────────────────────────────────────────

  purchasePowerUp: (type) =>
    set((s) => {
      const powerUp = s.powerUps.find((p) => p.type === type);
      if (!powerUp || s.user.coins < powerUp.cost) return {};

      const now = Date.now();
      const activatedPowerUp: PowerUp = {
        ...powerUp,
        active: true,
        expiresAt: now + powerUp.duration * 1000,
      };

      return {
        user: {
          ...s.user,
          coins: s.user.coins - powerUp.cost,
        },
        activePowerUps: [...s.activePowerUps, activatedPowerUp],
        powerUps: s.powerUps.map((p) =>
          p.type === type ? { ...p, active: true, expiresAt: now + p.duration * 1000 } : p,
        ),
      };
    }),

  tickPowerUps: () =>
    set((s) => {
      const now = Date.now();
      const stillActive = s.activePowerUps.filter(
        (p) => p.expiresAt !== null && p.expiresAt > now,
      );
      const expiredTypes = s.activePowerUps
        .filter((p) => p.expiresAt !== null && p.expiresAt <= now)
        .map((p) => p.type);

      return {
        activePowerUps: stillActive,
        powerUps: s.powerUps.map((p) =>
          expiredTypes.includes(p.type) ? { ...p, active: false, expiresAt: null } : p,
        ),
      };
    }),

  // ─── System 12: Collective Predictions ────────────────────────────────────

  tickPredictions: () =>
    set((s) => ({
      predictions: s.predictions.map((pred) => {
        const dHome = Math.floor(Math.random() * 5) - 2;
        const dDraw = Math.floor(Math.random() * 5) - 2;
        const dAway = Math.floor(Math.random() * 5) - 2;
        const rawHome = Math.max(1, pred.home + dHome);
        const rawDraw = Math.max(1, pred.draw + dDraw);
        const rawAway = Math.max(1, pred.away + dAway);
        const total = rawHome + rawDraw + rawAway;
        return {
          ...pred,
          home: Math.round((rawHome / total) * 100),
          draw: Math.round((rawDraw / total) * 100),
          away: Math.round((rawAway / total) * 100),
        };
      }),
    })),

  // ─── System 13: Notifications ─────────────────────────────────────────────

  markNotificationRead: (id) =>
    set((s) => {
      const wasUnread = s.notifications.find((n) => n.id === id && !n.read);
      return {
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
        unreadCount: wasUnread ? s.unreadCount - 1 : s.unreadCount,
      };
    }),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  // ─── System 15: Anti-Collapse ─────────────────────────────────────────────

  checkAntiCollapse: () =>
    set((s) => {
      if (s.antiCollapse.consecutiveLosses >= 3) {
        return {
          antiCollapse: {
            ...s.antiCollapse,
            showCooldownSuggestion: true,
          },
        };
      }
      return {};
    }),

  acknowledgeCooldown: () =>
    set((s) => ({
      antiCollapse: {
        ...s.antiCollapse,
        isOnCooldown: true,
        cooldownEndsAt: Date.now() + 30 * 60 * 1000,
        showCooldownSuggestion: false,
      },
    })),

  dismissBigWinProtection: () =>
    set((s) => ({
      antiCollapse: {
        ...s.antiCollapse,
        showBigWinProtection: false,
      },
    })),

  // ─── System 8: Wallet ─────────────────────────────────────────────────────

  deposit: (amount) =>
    set((s) => ({
      user: {
        ...s.user,
        balance: s.user.balance + amount,
      },
      transactions: [
        {
          id: `tx_${Date.now()}`,
          type: 'deposit' as const,
          label: `Depósito de R$ ${amount.toFixed(2)}`,
          amount,
          currency: 'BRL' as const,
          createdAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        },
        ...s.transactions,
      ],
    })),

  withdraw: (amount) =>
    set((s) => {
      if (s.user.balance < amount) return {};
      return {
        user: {
          ...s.user,
          balance: s.user.balance - amount,
        },
        transactions: [
          {
            id: `tx_${Date.now()}`,
            type: 'withdrawal' as const,
            label: `Saque de R$ ${amount.toFixed(2)}`,
            amount: -amount,
            currency: 'BRL' as const,
            createdAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          },
          ...s.transactions,
        ],
      };
    }),

  convertXPToCoins: (xpAmount) =>
    set((s) => {
      const usable = Math.min(xpAmount, s.user.xp);
      const coinsGained = Math.floor(usable / 100) * 50;
      const xpUsed = Math.floor(usable / 100) * 100;
      if (xpUsed <= 0) return {};
      return {
        user: {
          ...s.user,
          xp: s.user.xp - xpUsed,
          coins: s.user.coins + coinsGained,
        },
      };
    }),

  // ─── Bet History, Search, Settings ────────────────────────────────────────

  recordBet: (bet) =>
    set((s) => ({
      betHistory: [
        {
          ...bet,
          id: `bh_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
        },
        ...s.betHistory,
      ],
    })),

  search: (query) =>
    set((s) => {
      if (!query.trim()) return { searchQuery: '', searchResults: [] };
      const q = query.toLowerCase();
      const results: SearchResult[] = [];

      // Search matches
      s.matches.forEach((m) => {
        if (m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q) || m.league.toLowerCase().includes(q)) {
          results.push({
            type: 'match',
            id: m.id,
            title: `${m.homeTeam} vs ${m.awayTeam}`,
            subtitle: m.league,
            icon: '⚽',
          });
        }
      });

      // Search tipsters
      s.tipsters.forEach((t) => {
        if (t.username.toLowerCase().includes(q)) {
          results.push({
            type: 'tipster',
            id: t.id,
            title: t.username,
            subtitle: `${(t.winRate * 100).toFixed(0)}% WR · ${t.followers.toLocaleString()} seguidores`,
            icon: '👤',
          });
        }
      });

      // Search clans
      s.clans.forEach((c) => {
        if (c.name.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q)) {
          results.push({
            type: 'clan',
            id: c.id,
            title: c.name,
            subtitle: `${c.members} membros · Rank #${c.rank}`,
            icon: c.badge,
          });
        }
      });

      return { searchQuery: query, searchResults: results };
    }),

  clearSearch: () => set({ searchQuery: '', searchResults: [] }),

  updateSettings: (partial) =>
    set((s) => ({
      settings: { ...s.settings, ...partial },
    })),

  // ─── Lives, Marketplace, Mini-Games ──────────────────────────────────────

  purchaseItem: (itemId) => {
    const s = get();
    const item = s.marketplaceItems.find((i) => i.id === itemId);
    if (!item || item.purchased || s.user.coins < item.price) return;
    set({
      user: { ...s.user, coins: s.user.coins - item.price },
      marketplaceItems: s.marketplaceItems.map((i) =>
        i.id === itemId ? { ...i, purchased: true } : i,
      ),
    });
  },

  playMiniGame: (gameId) => {
    const s = get();
    const game = s.miniGames.find((g) => g.id === gameId);
    if (!game) return;
    set({
      miniGames: s.miniGames.map((g) =>
        g.id === gameId ? { ...g, played: true } : g,
      ),
      user: { ...s.user, coins: s.user.coins + game.coinsReward },
    });
    get().addXP(game.xpReward);
  },

  tickViewers: () =>
    set((s) => ({
      liveStreams: s.liveStreams.map((ls) =>
        ls.isLive
          ? { ...ls, viewers: Math.max(0, ls.viewers + Math.floor(Math.random() * 21) - 5) }
          : ls,
      ),
    })),

  // ─── Stories ──────────────────────────────────────────────────────────────

  viewStory: (storyId) =>
    set((s) => {
      const storyIndex = s.stories.findIndex((st) => st.id === storyId);
      return {
        stories: s.stories.map((st) =>
          st.id === storyId ? { ...st, viewed: true } : st,
        ),
        activeStoryIndex: storyIndex >= 0 ? storyIndex : null,
      };
    }),

  // ─── Events / Tournaments ────────────────────────────────────────────────

  joinTournament: (tournamentId) => {
    const s = get();
    const tournament = s.tournaments.find((t) => t.id === tournamentId);
    if (!tournament || s.user.coins < tournament.entryFee) return;
    if (tournament.participants >= tournament.maxParticipants) return;
    set({
      user: { ...s.user, coins: s.user.coins - tournament.entryFee },
      tournaments: s.tournaments.map((t) =>
        t.id === tournamentId
          ? { ...t, participants: t.participants + 1, userRank: t.participants + 1, userScore: 0 }
          : t,
      ),
    });
    get().trackEvent('join_tournament', { tournamentId });
  },

  submitPick: (tournamentId, roundId, pick) =>
    set((s) => ({
      tournaments: s.tournaments.map((t) =>
        t.id === tournamentId
          ? {
              ...t,
              rounds: t.rounds.map((r) =>
                r.id === roundId ? { ...r, userPick: pick } : r,
              ),
            }
          : t,
      ),
    })),

  // ─── Subscriptions ───────────────────────────────────────────────────────

  upgradeTier: (tier) =>
    set((s) => {
      const sub = s.subscriptions.find((sub) => sub.tier === tier);
      if (!sub) return {};
      return {
        currentSubscription: tier,
        subscriptions: s.subscriptions.map((sub) => ({
          ...sub,
          isActive: sub.tier === tier,
        })),
      };
    }),

  // ─── Referral & Daily Login ────────────────────────────────────────────

  claimDailyLogin: (day) =>
    set((s) => {
      const target = s.loginCalendar.find((d) => d.day === day);
      if (!target || target.claimed || !target.isToday) return {};
      return {
        loginCalendar: s.loginCalendar.map((d) =>
          d.day === day ? { ...d, claimed: true } : d,
        ),
        user: {
          ...s.user,
          coins: s.user.coins + target.reward,
        },
      };
    }),

  // ─── Analytics ───────────────────────────────────────────────────────────

  trackEvent: (name, props = {}) =>
    set((s) => ({
      analyticsEvents: [
        ...s.analyticsEvents,
        { name, timestamp: Date.now(), properties: props },
      ],
    })),
}));
