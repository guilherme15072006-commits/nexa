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

export interface KYCData {
  fullName: string;
  cpf: string;       // digits only (11)
  birthDate: string;  // ISO string
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
  kycCompleted: boolean;
  kycData: KYCData | null;
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

// System 6: Seasons (Fortnite battle pass + Clash Royale season)
export type SeasonStatus = 'active' | 'ended' | 'upcoming';

export interface SeasonTier {
  level: number;
  xpRequired: number;
  reward: SeasonReward;
  claimed: boolean;
}

export interface SeasonReward {
  type: 'coins' | 'badge' | 'title' | 'lootbox' | 'powerup' | 'avatar_frame';
  label: string;
  value: number;       // coins amount or quantity
  badge?: string;      // icon
  title?: string;      // display title
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface SeasonRankReward {
  rankMin: number;
  rankMax: number;
  tier: string;        // "Challenger", "Diamond", "Gold", etc.
  badge: string;
  title: string;
  coins: number;
  exclusiveBadge?: { id: string; title: string; icon: string; tier: BadgeTier };
}

export interface Season {
  id: string;
  name: string;
  number: number;       // season number (1, 2, 3...)
  weekNumber: number;
  totalWeeks: number;
  endsAt: number;       // seconds remaining
  startsAt: string;     // ISO date
  status: SeasonStatus;
  // Battle pass tiers
  battlePass: SeasonTier[];
  userSeasonXP: number;
  userSeasonLevel: number;
  // Rank rewards (end of season)
  rankRewards: SeasonRankReward[];
  // Legacy fields
  rewards: { rank: number; badge: string; title: string; coins: number }[];
}

export interface PastSeason {
  id: string;
  name: string;
  number: number;
  finalRank: number;
  finalXP: number;
  finalLevel: number;
  tierReached: string;  // "Challenger", "Diamond", etc.
  rewardsClaimed: SeasonReward[];
  startDate: string;
  endDate: string;
}

// System 7: Creator Economy (TikTok Creator Fund / YouTube Partner)
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CreatorEarningsBreakdown {
  fromCopies: number;      // coins earned from bet copies
  fromMarketplace: number; // coins earned from marketplace sales
  fromAffiliates: number;  // coins from referral program
  fromTips: number;        // direct tips from followers
}

export interface CreatorPayout {
  id: string;
  amount: number;          // in BRL
  status: PayoutStatus;
  requestedAt: string;
  completedAt: string | null;
  pixKey: string;
}

export interface CreatorStats {
  weeklyEarnings: number;
  totalEarnings: number;
  totalCopies: number;
  weeklyReach: number;
  isTopTipster: boolean;
  // Monetization
  availableBalance: number;    // coins ready to withdraw
  pendingBalance: number;      // coins being processed
  lifetimePayouts: number;     // total BRL paid out
  earningsBreakdown: CreatorEarningsBreakdown;
  payoutHistory: CreatorPayout[];
  // Rates
  coinsPerCopy: number;        // coins earned per copy bet (default: 5)
  coinsPerTip: number;         // coins per direct tip
}

// Affiliate program tiers
export type AffiliateTier = 'starter' | 'partner' | 'ambassador';

export interface AffiliateProgram {
  tier: AffiliateTier;
  commissionRate: number;    // % of referee's first deposit
  bonusPerReferral: number;  // flat coins per accepted referral
  totalReferrals: number;
  activeReferrals: number;   // still active after 30 days
  totalCommission: number;   // total coins earned
  nextTierAt: number;        // referrals needed for next tier
}

export const AFFILIATE_TIERS: Record<AffiliateTier, { label: string; color: string; commissionRate: number; bonusPerReferral: number; minReferrals: number }> = {
  starter:    { label: 'Starter',    color: '#9B95B8', commissionRate: 0.05, bonusPerReferral: 50,  minReferrals: 0 },
  partner:    { label: 'Partner',    color: '#7C5CFC', commissionRate: 0.10, bonusPerReferral: 100, minReferrals: 10 },
  ambassador: { label: 'Ambassador', color: '#F5C842', commissionRate: 0.15, bonusPerReferral: 200, minReferrals: 50 },
};

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
  deepLink?: string;
}

// Referral System
export interface ReferralInfo {
  code: string;
  link: string;
  invitesSent: number;
  invitesAccepted: number;
  bonusEarned: number;
  affiliate: AffiliateProgram;
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

// Responsible Gaming (UK Gambling Commission / Bet365 reference)
export type ExclusionPeriod = '24h' | '7d' | '30d';

export interface DepositLimits {
  daily: number | null;     // max BRL per day
  weekly: number | null;    // max BRL per week
  monthly: number | null;   // max BRL per month
}

export interface DepositTracking {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  lastResetDay: string;     // YYYY-MM-DD
  lastResetWeek: string;    // YYYY-WW
  lastResetMonth: string;   // YYYY-MM
}

export interface SelfExclusion {
  active: boolean;
  expiresAt: number | null; // timestamp
  period: ExclusionPeriod | null;
  activatedAt: number | null;
}

export interface ComplianceLogEntry {
  id: string;
  timestamp: number;
  action: 'deposit_blocked' | 'bet_blocked' | 'cooldown_triggered' | 'cooldown_acknowledged'
    | 'self_exclusion_activated' | 'self_exclusion_expired' | 'deposit_limit_set'
    | 'deposit_limit_removed' | 'state_change' | 'deposit_allowed' | 'bet_allowed';
  detail: string;
  userState?: UserState;
  amount?: number;
}

export interface ResponsibleGaming {
  depositLimits: DepositLimits;
  depositTracking: DepositTracking;
  selfExclusion: SelfExclusion;
  complianceLog: ComplianceLogEntry[];
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

// Subscriptions (YouTube Premium / Spotify reference)
export type SubscriptionTier = 'free' | 'pro' | 'elite';

export interface Subscription {
  tier: SubscriptionTier;
  price: number;
  features: string[];
  isActive: boolean;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  productId: string | null;       // Google Play / App Store product ID
  subscribedAt: string | null;    // ISO date
  expiresAt: string | null;       // ISO date — null if free
  trialEndsAt: string | null;     // ISO date — 7-day trial
  isTrialing: boolean;
  autoRenew: boolean;
  platform: 'google' | 'apple' | 'web' | null;
}

// Feature gating per tier
export const TIER_FEATURES: Record<string, SubscriptionTier> = {
  unlimited_bets: 'pro',
  power_ups: 'pro',
  lives_vip: 'pro',
  creator_studio: 'pro',
  audio_rooms: 'pro',
  priority_support: 'pro',
  elite_tipsters: 'pro',
  tournaments_exclusive: 'elite',
  cashback: 'elite',
  unlimited_power_ups: 'elite',
  vip_support: 'elite',
  elite_badge: 'elite',
};

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
export interface MarketplaceReview {
  id: string;
  userId: string;
  username: string;
  rating: number;       // 1-5
  comment: string;
  createdAt: string;
}

export interface MarketplaceItem {
  id: string;
  type: 'strategy' | 'analysis' | 'vip_tips';
  title: string;
  seller: { id: string; username: string; tier: TipsterTier };
  price: number;        // in NEXA coins
  rating: number;       // 0-5 average
  reviews: number;      // count
  reviewList: MarketplaceReview[];
  description: string;
  isBestseller: boolean;
  purchased: boolean;
  salesCount: number;
  sellerEarnings: number; // total coins earned by seller (after 20% commission)
  createdAt: string;
}

export const MARKETPLACE_COMMISSION = 0.20; // 20% platform fee

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
  isLoading: boolean;
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
  pastSeasons: PastSeason[];

  // System 7: Creator Economy
  creatorStats: CreatorStats;
  requestCreatorPayout: (amount: number, pixKey: string) => void;
  addCreatorEarning: (source: keyof CreatorEarningsBreakdown, amount: number) => void;

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

  // System 16: Responsible Gaming
  responsibleGaming: ResponsibleGaming;

  // Cashout Suggestion
  showCashoutSuggestion: boolean;
  dismissCashoutSuggestion: () => void;

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
  createStory: (slides: StorySlide[]) => void;
  votePoll: (storyId: string, slideId: string, optionIndex: number) => void;
  reactStory: (storyId: string, reaction: string) => void;

  // Events
  tournaments: Tournament[];
  joinTournament: (tournamentId: string) => void;
  submitPick: (tournamentId: string, roundId: string, pick: string) => void;

  // Explore
  exploreCategories: ExploreCategory[];

  // Subscriptions
  subscriptions: Subscription[];
  currentSubscription: SubscriptionTier;
  userSubscription: UserSubscription;
  upgradeTier: (tier: SubscriptionTier) => void;
  startTrial: () => void;
  cancelSubscription: () => void;
  restorePurchase: (tier: SubscriptionTier, expiresAt: string, productId: string, platform: 'google' | 'apple') => void;
  isFeatureLocked: (feature: string) => boolean;

  // Audio Rooms
  audioRooms: AudioRoom[];
  joinedRoomId: string | null;
  isHandRaised: boolean;
  joinAudioRoom: (roomId: string) => void;
  leaveAudioRoom: () => void;
  raiseHand: () => void;

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
  submitReview: (itemId: string, rating: number, comment: string) => void;
  createListing: (item: { type: MarketplaceItem['type']; title: string; description: string; price: number }) => void;
  playMiniGame: (gameId: string) => void;
  tickViewers: () => void;

  // ─── Actions ─────────────────────────────────────────────────────────────────

  setLoading: (v: boolean) => void;
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
  completeKYC: (data: KYCData) => void;
  addXP: (amount: number) => void;
  detectUserState: () => void;
  challengeUser: (targetId: string) => void;

  // System 1
  recordInteraction: (postId: string, action: InteractionHistory['action']) => void;
  scoreFeed: () => void;

  // System 4
  injectNarrative: () => void;
  dismissNarrative: (id: string) => void;

  // System 6: Seasons
  tickSeason: () => void;
  addSeasonXP: (amount: number) => void;
  claimSeasonTier: (level: number) => void;
  endSeason: () => void;
  getSeasonRankTier: () => SeasonRankReward | null;

  // System 9: Live Chat
  toggleChat: (matchId: string) => void;
  injectChatMessage: (matchId: string) => void;
  sendChatMessage: (matchId: string, text: string) => void;

  // System 11
  purchasePowerUp: (type: PowerUpType) => void;
  tickPowerUps: () => void;

  // System 12
  tickPredictions: () => void;

  // Live Odds
  tickLiveOdds: () => void;

  // System 13
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  // System 15
  checkAntiCollapse: () => void;
  acknowledgeCooldown: () => void;
  dismissBigWinProtection: () => void;

  // System 16: Responsible Gaming
  setDepositLimit: (period: 'daily' | 'weekly' | 'monthly', amount: number | null) => void;
  activateSelfExclusion: (period: ExclusionPeriod) => void;
  checkSelfExclusion: () => boolean;
  canDeposit: (amount: number) => { allowed: boolean; reason?: string };
  canPlaceBet: () => { allowed: boolean; reason?: string };
  logCompliance: (entry: Omit<ComplianceLogEntry, 'id' | 'timestamp'>) => void;

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
  kycCompleted: false,
  kycData: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNexaStore = create<NexaStore>((set, get) => ({
  isLoading: true,
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
    number: 1,
    weekNumber: 3,
    totalWeeks: 4,
    endsAt: 3 * 24 * 3600 + 14 * 3600 + 32 * 60,
    startsAt: '2026-03-25T00:00:00Z',
    status: 'active' as SeasonStatus,
    userSeasonXP: 1850,
    userSeasonLevel: 5,
    battlePass: [
      { level: 1, xpRequired: 0,    reward: { type: 'coins', label: '100 Coins', value: 100, badge: '🪙' }, claimed: true },
      { level: 2, xpRequired: 200,  reward: { type: 'coins', label: '200 Coins', value: 200, badge: '🪙' }, claimed: true },
      { level: 3, xpRequired: 500,  reward: { type: 'badge', label: 'Badge Season Alpha', value: 1, badge: '⚡', title: 'Iniciante Alpha', rarity: 'common' }, claimed: true },
      { level: 4, xpRequired: 900,  reward: { type: 'title', label: 'Titulo: Veterano', value: 1, title: 'Veterano Alpha' }, claimed: true },
      { level: 5, xpRequired: 1400, reward: { type: 'lootbox', label: 'Loot Box Rara', value: 1, badge: '📦', rarity: 'rare' }, claimed: true },
      { level: 6, xpRequired: 2000, reward: { type: 'coins', label: '500 Coins', value: 500, badge: '🪙' }, claimed: false },
      { level: 7, xpRequired: 2800, reward: { type: 'powerup', label: 'XP Boost 2x', value: 1, badge: '🚀' }, claimed: false },
      { level: 8, xpRequired: 3800, reward: { type: 'badge', label: 'Badge Exclusiva', value: 1, badge: '🔥', title: 'Alpha Fire', rarity: 'epic' }, claimed: false },
      { level: 9, xpRequired: 5000, reward: { type: 'coins', label: '1000 Coins', value: 1000, badge: '🪙' }, claimed: false },
      { level: 10, xpRequired: 7000, reward: { type: 'avatar_frame', label: 'Moldura Lendaria', value: 1, badge: '👑', title: 'Moldura Alpha', rarity: 'legendary' }, claimed: false },
    ],
    rankRewards: [
      { rankMin: 1, rankMax: 1, tier: 'Challenger', badge: '👑', title: 'Campeao Alpha', coins: 5000, exclusiveBadge: { id: 'bs1_champ', title: 'Campeao S1', icon: '👑', tier: 'legendary' as BadgeTier } },
      { rankMin: 2, rankMax: 3, tier: 'Diamond', badge: '💎', title: 'Diamante Alpha', coins: 3000, exclusiveBadge: { id: 'bs1_diamond', title: 'Diamante S1', icon: '💎', tier: 'epic' as BadgeTier } },
      { rankMin: 4, rankMax: 10, tier: 'Gold', badge: '🥇', title: 'Ouro Alpha', coins: 1500, exclusiveBadge: { id: 'bs1_gold', title: 'Ouro S1', icon: '🥇', tier: 'rare' as BadgeTier } },
      { rankMin: 11, rankMax: 50, tier: 'Silver', badge: '🥈', title: 'Prata Alpha', coins: 800 },
      { rankMin: 51, rankMax: 100, tier: 'Bronze', badge: '🥉', title: 'Bronze Alpha', coins: 400 },
      { rankMin: 101, rankMax: 9999, tier: 'Participante', badge: '🎖️', title: 'Participante', coins: 100 },
    ],
    rewards: [
      { rank: 1, badge: '👑', title: 'Campeão Alpha', coins: 5000 },
      { rank: 2, badge: '🥈', title: 'Vice Alpha', coins: 3000 },
      { rank: 3, badge: '🥉', title: 'Bronze Alpha', coins: 1500 },
    ],
  },
  pastSeasons: [
    {
      id: 's0',
      name: 'Pre-Season',
      number: 0,
      finalRank: 42,
      finalXP: 3200,
      finalLevel: 7,
      tierReached: 'Silver',
      rewardsClaimed: [
        { type: 'coins', label: '800 Coins', value: 800, badge: '🪙' },
        { type: 'badge', label: 'Badge Pre-Season', value: 1, badge: '🌟', title: 'Pioneer', rarity: 'rare' },
      ],
      startDate: '2026-03-01',
      endDate: '2026-03-24',
    },
  ],

  // System 7: Creator Economy
  creatorStats: {
    weeklyEarnings: 127.50,
    totalEarnings: 842.30,
    totalCopies: 521,
    weeklyReach: 3400,
    isTopTipster: false,
    availableBalance: 4250,
    pendingBalance: 800,
    lifetimePayouts: 320.00,
    earningsBreakdown: {
      fromCopies: 2605,
      fromMarketplace: 1200,
      fromAffiliates: 350,
      fromTips: 95,
    },
    payoutHistory: [
      { id: 'po1', amount: 200.00, status: 'completed' as PayoutStatus, requestedAt: '2026-04-01', completedAt: '2026-04-02', pixKey: '***@email.com' },
      { id: 'po2', amount: 120.00, status: 'completed' as PayoutStatus, requestedAt: '2026-03-15', completedAt: '2026-03-16', pixKey: '***@email.com' },
    ],
    coinsPerCopy: 5,
    coinsPerTip: 10,
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

  // System 16: Responsible Gaming
  responsibleGaming: {
    depositLimits: { daily: null, weekly: null, monthly: null },
    depositTracking: {
      todayTotal: 0,
      weekTotal: 0,
      monthTotal: 0,
      lastResetDay: new Date().toISOString().slice(0, 10),
      lastResetWeek: `${new Date().getFullYear()}-W${String(Math.ceil((new Date().getDate()) / 7)).padStart(2, '0')}`,
      lastResetMonth: new Date().toISOString().slice(0, 7),
    },
    selfExclusion: { active: false, expiresAt: null, period: null, activatedAt: null },
    complianceLog: [],
  },

  // Cashout Suggestion
  showCashoutSuggestion: false,

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
  userSubscription: {
    tier: 'free' as SubscriptionTier,
    productId: null,
    subscribedAt: null,
    expiresAt: null,
    trialEndsAt: null,
    isTrialing: false,
    autoRenew: false,
    platform: null,
  },

  // Audio Rooms
  audioRooms: [
    { id: 'ar1', title: 'Análise pré-jogo: Flamengo × Corinthians', host: { id: 't5', username: 'AcePredict', tier: 'elite' as TipsterTier }, speakers: [{ id: 't1', username: 'KingBet' }, { id: 't2', username: 'StatMaster' }], listeners: 342, isLive: true, topic: 'Brasileirão' },
    { id: 'ar2', title: 'Champions League — Quem avança?', host: { id: 't1', username: 'KingBet', tier: 'elite' as TipsterTier }, speakers: [{ id: 't3', username: 'ValueHunt' }], listeners: 567, isLive: true, topic: 'Champions League' },
    { id: 'ar3', title: 'Dicas de gestão de banca', host: { id: 't2', username: 'StatMaster', tier: 'gold' as TipsterTier }, speakers: [], listeners: 0, isLive: false, topic: 'Educacional' },
  ],
  joinedRoomId: null,
  isHandRaised: false,

  // Referral
  referral: {
    code: 'NEXAVOC3X',
    link: 'https://nexa.app/ref/NEXAVOC3X',
    invitesSent: 3,
    invitesAccepted: 1,
    bonusEarned: 200,
    affiliate: {
      tier: 'starter' as AffiliateTier,
      commissionRate: 0.05,
      bonusPerReferral: 50,
      totalReferrals: 1,
      activeReferrals: 1,
      totalCommission: 200,
      nextTierAt: 10,
    },
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
    { id: 'mk1', type: 'strategy', title: 'Método Fibonacci para Futebol', seller: { id: 't5', username: 'AcePredict', tier: 'elite' as TipsterTier }, price: 500, rating: 4.8, reviews: 127, reviewList: [
      { id: 'rv1', userId: 'u10', username: 'BetPro99', rating: 5, comment: 'Melhor estrategia que ja comprei. ROI subiu 15% no primeiro mes.', createdAt: '2026-04-10' },
      { id: 'rv2', userId: 'u11', username: 'GolDeOuro', rating: 4, comment: 'Muito bom, mas precisa de paciencia. Resultados vem com o tempo.', createdAt: '2026-04-08' },
      { id: 'rv3', userId: 'u12', username: 'Striker77', rating: 5, comment: 'Fibonacci adaptado pro futebol e genial. Recomendo demais.', createdAt: '2026-04-05' },
    ], description: 'Estratégia comprovada com 72% de acerto', isBestseller: true, purchased: false, salesCount: 127, sellerEarnings: 50800, createdAt: '2026-03-15' },
    { id: 'mk2', type: 'analysis', title: 'Análise Completa Brasileirão 2026', seller: { id: 't2', username: 'StatMaster', tier: 'gold' as TipsterTier }, price: 300, rating: 4.5, reviews: 84, reviewList: [
      { id: 'rv4', userId: 'u13', username: 'Analista01', rating: 5, comment: 'Dados incriveis, muito detalhado.', createdAt: '2026-04-09' },
      { id: 'rv5', userId: 'u14', username: 'ChuteCerto', rating: 4, comment: 'Vale cada coin. Boa analise.', createdAt: '2026-04-07' },
    ], description: 'Estatísticas detalhadas de todos os times', isBestseller: false, purchased: false, salesCount: 84, sellerEarnings: 20160, createdAt: '2026-03-20' },
    { id: 'mk3', type: 'vip_tips', title: 'VIP Picks Premium — Semana 12', seller: { id: 't1', username: 'KingBet', tier: 'elite' as TipsterTier }, price: 200, rating: 4.3, reviews: 56, reviewList: [
      { id: 'rv6', userId: 'u15', username: 'LuckyShot', rating: 4, comment: '3 de 5 picks deram green. Bom!', createdAt: '2026-04-11' },
    ], description: '5 picks exclusivos com análise profunda', isBestseller: false, purchased: true, salesCount: 56, sellerEarnings: 8960, createdAt: '2026-04-06' },
    { id: 'mk4', type: 'strategy', title: 'Over/Under Masterclass', seller: { id: 't3', username: 'ValueHunt', tier: 'gold' as TipsterTier }, price: 400, rating: 4.6, reviews: 93, reviewList: [
      { id: 'rv7', userId: 'u16', username: 'GoalMachine', rating: 5, comment: 'Mudou minha forma de analisar gols. Excelente.', createdAt: '2026-04-10' },
    ], description: 'Dominando o mercado de gols', isBestseller: true, purchased: false, salesCount: 93, sellerEarnings: 29760, createdAt: '2026-03-25' },
    { id: 'mk5', type: 'analysis', title: 'Champions League Special Report', seller: { id: 't5', username: 'AcePredict', tier: 'elite' as TipsterTier }, price: 350, rating: 4.9, reviews: 201, reviewList: [
      { id: 'rv8', userId: 'u17', username: 'EuroFan', rating: 5, comment: 'Relatorio mais completo que ja vi. Previ todas as classificacoes.', createdAt: '2026-04-12' },
      { id: 'rv9', userId: 'u18', username: 'UCLKing', rating: 5, comment: 'Impecavel. Paguei 350 e fiz 2000 nas apostas.', createdAt: '2026-04-11' },
    ], description: 'Relatório completo das oitavas', isBestseller: true, purchased: false, salesCount: 201, sellerEarnings: 56280, createdAt: '2026-04-01' },
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

  setLoading: (v) => set({ isLoading: v }),
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
    // Tipster earns coins from the copy
    get().addCreatorEarning('fromCopies', get().creatorStats.coinsPerCopy);
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
    // Enforce responsible gaming
    const betCheck = get().canPlaceBet();
    if (!betCheck.allowed) {
      get().logCompliance({ action: 'bet_blocked', detail: betCheck.reason ?? 'Bet blocked' });
      get().pushToast(betCheck.reason ?? 'Aposta bloqueada');
      return;
    }
    if (betCheck.reason) {
      // Warning but not blocked (e.g. frustrated state)
      get().pushToast(betCheck.reason);
    }
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
    get().logCompliance({ action: 'bet_allowed', detail: 'Bet placed successfully' });
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

  completeKYC: (data) =>
    set((s) => ({
      user: {
        ...s.user,
        kycCompleted: true,
        kycData: data,
      },
    })),

  addXP: (amount) => {
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
    });
    // Also feed season XP
    get().addSeasonXP(amount);
  },

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
    set((s) => {
      const newEndsAt = Math.max(0, s.currentSeason.endsAt - 1);
      // Auto-end season when countdown reaches 0
      if (newEndsAt === 0 && s.currentSeason.endsAt > 0) {
        get().endSeason();
      }
      return {
        currentSeason: { ...s.currentSeason, endsAt: newEndsAt },
      };
    }),

  addSeasonXP: (amount) =>
    set((s) => {
      const newXP = s.currentSeason.userSeasonXP + amount;
      // Calculate new level based on battle pass tiers
      let newLevel = s.currentSeason.userSeasonLevel;
      for (const tier of s.currentSeason.battlePass) {
        if (newXP >= tier.xpRequired) {
          newLevel = tier.level;
        }
      }
      return {
        currentSeason: {
          ...s.currentSeason,
          userSeasonXP: newXP,
          userSeasonLevel: newLevel,
        },
      };
    }),

  claimSeasonTier: (level) =>
    set((s) => {
      const tier = s.currentSeason.battlePass.find(t => t.level === level);
      if (!tier || tier.claimed) return {};
      if (s.currentSeason.userSeasonXP < tier.xpRequired) return {};

      const reward = tier.reward;
      let coinsDelta = 0;
      let newBadges = [...s.user.badges];

      if (reward.type === 'coins') coinsDelta = reward.value;
      if (reward.type === 'badge' && reward.title) {
        newBadges.push({
          id: `season_${s.currentSeason.id}_${level}`,
          title: reward.title,
          icon: reward.badge ?? '⭐',
          tier: (reward.rarity ?? 'common') as BadgeTier,
          unlockedAt: new Date().toISOString().slice(0, 10),
        });
      }

      return {
        currentSeason: {
          ...s.currentSeason,
          battlePass: s.currentSeason.battlePass.map(t =>
            t.level === level ? { ...t, claimed: true } : t,
          ),
        },
        user: {
          ...s.user,
          coins: s.user.coins + coinsDelta,
          badges: newBadges,
        },
      };
    }),

  endSeason: () =>
    set((s) => {
      const season = s.currentSeason;
      const rankReward = s.currentSeason.rankRewards.find(
        r => s.user.rank >= r.rankMin && s.user.rank <= r.rankMax,
      );

      // Archive current season
      const archived: PastSeason = {
        id: season.id,
        name: season.name,
        number: season.number,
        finalRank: s.user.rank,
        finalXP: season.userSeasonXP,
        finalLevel: season.userSeasonLevel,
        tierReached: rankReward?.tier ?? 'Participante',
        rewardsClaimed: season.battlePass.filter(t => t.claimed).map(t => t.reward),
        startDate: season.startsAt.slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
      };

      // Grant rank rewards
      let coinsDelta = rankReward?.coins ?? 0;
      let newBadges = [...s.user.badges];
      if (rankReward?.exclusiveBadge) {
        newBadges.push({
          ...rankReward.exclusiveBadge,
          unlockedAt: new Date().toISOString().slice(0, 10),
        });
      }

      // Generate next season
      const nextNumber = season.number + 1;
      const SEASON_NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
      const nextName = `Temporada ${SEASON_NAMES[nextNumber % SEASON_NAMES.length]}`;
      const WEEK_DURATION = 7 * 24 * 3600; // 7 days in seconds

      const nextSeason: Season = {
        id: `s${nextNumber}`,
        name: nextName,
        number: nextNumber,
        weekNumber: 1,
        totalWeeks: 4,
        endsAt: 4 * WEEK_DURATION,
        startsAt: new Date().toISOString(),
        status: 'active',
        userSeasonXP: 0,
        userSeasonLevel: 0,
        battlePass: [
          { level: 1, xpRequired: 0,    reward: { type: 'coins', label: '100 Coins', value: 100, badge: '🪙' }, claimed: false },
          { level: 2, xpRequired: 200,  reward: { type: 'coins', label: '200 Coins', value: 200, badge: '🪙' }, claimed: false },
          { level: 3, xpRequired: 500,  reward: { type: 'badge', label: `Badge ${nextName}`, value: 1, badge: '⚡', title: `Iniciante ${SEASON_NAMES[nextNumber % SEASON_NAMES.length]}`, rarity: 'common' }, claimed: false },
          { level: 4, xpRequired: 900,  reward: { type: 'title', label: 'Titulo Exclusivo', value: 1, title: `Veterano ${SEASON_NAMES[nextNumber % SEASON_NAMES.length]}` }, claimed: false },
          { level: 5, xpRequired: 1400, reward: { type: 'lootbox', label: 'Loot Box Rara', value: 1, badge: '📦', rarity: 'rare' }, claimed: false },
          { level: 6, xpRequired: 2000, reward: { type: 'coins', label: '500 Coins', value: 500, badge: '🪙' }, claimed: false },
          { level: 7, xpRequired: 2800, reward: { type: 'powerup', label: 'XP Boost 2x', value: 1, badge: '🚀' }, claimed: false },
          { level: 8, xpRequired: 3800, reward: { type: 'badge', label: 'Badge Exclusiva', value: 1, badge: '🔥', title: `${SEASON_NAMES[nextNumber % SEASON_NAMES.length]} Fire`, rarity: 'epic' }, claimed: false },
          { level: 9, xpRequired: 5000, reward: { type: 'coins', label: '1000 Coins', value: 1000, badge: '🪙' }, claimed: false },
          { level: 10, xpRequired: 7000, reward: { type: 'avatar_frame', label: 'Moldura Lendaria', value: 1, badge: '👑', title: `Moldura ${SEASON_NAMES[nextNumber % SEASON_NAMES.length]}`, rarity: 'legendary' }, claimed: false },
        ],
        rankRewards: [
          { rankMin: 1, rankMax: 1, tier: 'Challenger', badge: '👑', title: `Campeao ${nextName}`, coins: 5000, exclusiveBadge: { id: `bs${nextNumber}_champ`, title: `Campeao S${nextNumber}`, icon: '👑', tier: 'legendary' as BadgeTier } },
          { rankMin: 2, rankMax: 3, tier: 'Diamond', badge: '💎', title: `Diamante ${nextName}`, coins: 3000, exclusiveBadge: { id: `bs${nextNumber}_diamond`, title: `Diamante S${nextNumber}`, icon: '💎', tier: 'epic' as BadgeTier } },
          { rankMin: 4, rankMax: 10, tier: 'Gold', badge: '🥇', title: `Ouro ${nextName}`, coins: 1500, exclusiveBadge: { id: `bs${nextNumber}_gold`, title: `Ouro S${nextNumber}`, icon: '🥇', tier: 'rare' as BadgeTier } },
          { rankMin: 11, rankMax: 50, tier: 'Silver', badge: '🥈', title: `Prata ${nextName}`, coins: 800 },
          { rankMin: 51, rankMax: 100, tier: 'Bronze', badge: '🥉', title: `Bronze ${nextName}`, coins: 400 },
          { rankMin: 101, rankMax: 9999, tier: 'Participante', badge: '🎖️', title: 'Participante', coins: 100 },
        ],
        rewards: [
          { rank: 1, badge: '👑', title: `Campeao ${nextName}`, coins: 5000 },
          { rank: 2, badge: '💎', title: `Vice ${nextName}`, coins: 3000 },
          { rank: 3, badge: '🥉', title: `Bronze ${nextName}`, coins: 1500 },
        ],
      };

      return {
        currentSeason: nextSeason,
        pastSeasons: [archived, ...s.pastSeasons],
        user: {
          ...s.user,
          coins: s.user.coins + coinsDelta,
          badges: newBadges,
        },
      };
    }),

  getSeasonRankTier: () => {
    const s = get();
    return s.currentSeason.rankRewards.find(
      r => s.user.rank >= r.rankMin && s.user.rank <= r.rankMax,
    ) ?? null;
  },

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

  sendChatMessage: (matchId, text) =>
    set((s) => {
      const message: ChatMessage = {
        id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        user: s.user.username,
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

  // ─── Live Odds ──────────────────────────────────────────────────────────

  tickLiveOdds: () =>
    set((s) => ({
      matches: s.matches.map((m) => {
        if (m.status !== 'live') return m;
        const fluctuate = (odd: number) => {
          const delta = (Math.random() - 0.5) * 0.1;
          return Math.max(1.01, +(odd + delta).toFixed(2));
        };
        return {
          ...m,
          odds: {
            home: fluctuate(m.odds.home),
            draw: fluctuate(m.odds.draw),
            away: fluctuate(m.odds.away),
          },
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

  acknowledgeCooldown: () => {
    set((s) => ({
      antiCollapse: {
        ...s.antiCollapse,
        isOnCooldown: true,
        cooldownEndsAt: Date.now() + 30 * 60 * 1000,
        showCooldownSuggestion: false,
      },
    }));
    get().logCompliance({ action: 'cooldown_acknowledged', detail: 'User accepted 30min cooldown after 3 consecutive losses', userState: get().user.state });
  },

  dismissBigWinProtection: () =>
    set((s) => ({
      antiCollapse: {
        ...s.antiCollapse,
        showBigWinProtection: false,
      },
    })),

  // ─── System 16: Responsible Gaming ──────────────────────────────────────────

  logCompliance: (entry) =>
    set((s) => ({
      responsibleGaming: {
        ...s.responsibleGaming,
        complianceLog: [
          { ...entry, id: `cl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: Date.now() },
          ...s.responsibleGaming.complianceLog,
        ].slice(0, 500), // keep last 500 entries
      },
    })),

  setDepositLimit: (period, amount) => {
    set((s) => ({
      responsibleGaming: {
        ...s.responsibleGaming,
        depositLimits: { ...s.responsibleGaming.depositLimits, [period]: amount },
      },
    }));
    get().logCompliance({
      action: amount !== null ? 'deposit_limit_set' : 'deposit_limit_removed',
      detail: `${period} limit ${amount !== null ? `set to R$${amount}` : 'removed'}`,
    });
  },

  activateSelfExclusion: (period) => {
    const durations: Record<ExclusionPeriod, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    const expiresAt = Date.now() + durations[period];
    set((s) => ({
      responsibleGaming: {
        ...s.responsibleGaming,
        selfExclusion: { active: true, expiresAt, period, activatedAt: Date.now() },
      },
    }));
    get().logCompliance({
      action: 'self_exclusion_activated',
      detail: `Self-exclusion activated for ${period}. Expires at ${new Date(expiresAt).toISOString()}`,
      userState: get().user.state,
    });
  },

  checkSelfExclusion: () => {
    const s = get();
    const excl = s.responsibleGaming.selfExclusion;
    if (!excl.active) return false;
    if (excl.expiresAt && Date.now() >= excl.expiresAt) {
      // Expired — deactivate
      set((prev) => ({
        responsibleGaming: {
          ...prev.responsibleGaming,
          selfExclusion: { active: false, expiresAt: null, period: null, activatedAt: null },
        },
      }));
      get().logCompliance({ action: 'self_exclusion_expired', detail: `Self-exclusion period (${excl.period}) expired` });
      return false;
    }
    return true;
  },

  canDeposit: (amount) => {
    const s = get();
    // Check self-exclusion
    if (s.checkSelfExclusion()) {
      return { allowed: false, reason: 'Auto-exclusao ativa. Voce nao pode depositar durante este periodo.' };
    }
    // Reset tracking periods if needed
    const today = new Date().toISOString().slice(0, 10);
    const month = new Date().toISOString().slice(0, 7);
    const weekNum = `${new Date().getFullYear()}-W${String(Math.ceil((new Date().getDate()) / 7)).padStart(2, '0')}`;
    let tracking = { ...s.responsibleGaming.depositTracking };
    if (tracking.lastResetDay !== today) { tracking.todayTotal = 0; tracking.lastResetDay = today; }
    if (tracking.lastResetWeek !== weekNum) { tracking.weekTotal = 0; tracking.lastResetWeek = weekNum; }
    if (tracking.lastResetMonth !== month) { tracking.monthTotal = 0; tracking.lastResetMonth = month; }

    const limits = s.responsibleGaming.depositLimits;
    if (limits.daily !== null && tracking.todayTotal + amount > limits.daily) {
      return { allowed: false, reason: `Limite diario de R$${limits.daily} atingido. Depositado hoje: R$${tracking.todayTotal.toFixed(2)}` };
    }
    if (limits.weekly !== null && tracking.weekTotal + amount > limits.weekly) {
      return { allowed: false, reason: `Limite semanal de R$${limits.weekly} atingido.` };
    }
    if (limits.monthly !== null && tracking.monthTotal + amount > limits.monthly) {
      return { allowed: false, reason: `Limite mensal de R$${limits.monthly} atingido.` };
    }
    return { allowed: true };
  },

  canPlaceBet: () => {
    const s = get();
    // Check self-exclusion
    if (s.checkSelfExclusion()) {
      return { allowed: false, reason: 'Auto-exclusao ativa. Apostas bloqueadas durante este periodo.' };
    }
    // Check cooldown
    if (s.antiCollapse.isOnCooldown) {
      if (s.antiCollapse.cooldownEndsAt && Date.now() < s.antiCollapse.cooldownEndsAt) {
        const minLeft = Math.ceil((s.antiCollapse.cooldownEndsAt - Date.now()) / 60000);
        return { allowed: false, reason: `Cooldown ativo. Aguarde ${minLeft} minutos.` };
      }
      // Cooldown expired
      set((prev) => ({ antiCollapse: { ...prev.antiCollapse, isOnCooldown: false, cooldownEndsAt: null } }));
    }
    // Check frustrated state
    if (s.user.state === 'frustrated') {
      return { allowed: true, reason: 'Cuidado: voce pode estar em uma ma fase. Considere pausar.' };
    }
    return { allowed: true };
  },

  // ─── Cashout Suggestion ────────────────────────────────────────────────────

  dismissCashoutSuggestion: () => set({ showCashoutSuggestion: false }),

  // ─── System 8: Wallet ─────────────────────────────────────────────────────

  deposit: (amount) => {
    // Enforce responsible gaming limits
    const check = get().canDeposit(amount);
    if (!check.allowed) {
      get().logCompliance({ action: 'deposit_blocked', detail: check.reason ?? 'Deposit blocked', amount });
      get().pushToast(check.reason ?? 'Deposito bloqueado');
      return;
    }
    set((s) => {
      const tracking = { ...s.responsibleGaming.depositTracking };
      tracking.todayTotal += amount;
      tracking.weekTotal += amount;
      tracking.monthTotal += amount;
      return {
        user: { ...s.user, balance: s.user.balance + amount },
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
        responsibleGaming: { ...s.responsibleGaming, depositTracking: tracking },
      };
    });
    get().logCompliance({ action: 'deposit_allowed', detail: `Deposit R$${amount.toFixed(2)} approved`, amount });
  },

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

    const commission = Math.round(item.price * MARKETPLACE_COMMISSION);
    const sellerPayout = item.price - commission;

    set({
      user: { ...s.user, coins: s.user.coins - item.price },
      marketplaceItems: s.marketplaceItems.map((i) =>
        i.id === itemId
          ? { ...i, purchased: true, salesCount: i.salesCount + 1, sellerEarnings: i.sellerEarnings + sellerPayout }
          : i,
      ),
      transactions: [
        {
          id: `tx_${Date.now()}`,
          type: 'coins_earned' as const,
          label: `Compra: ${item.title}`,
          amount: -item.price,
          currency: 'coins' as const,
          createdAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        },
        ...s.transactions,
      ],
    });
  },

  submitReview: (itemId, rating, comment) =>
    set((s) => {
      const item = s.marketplaceItems.find((i) => i.id === itemId);
      if (!item || !item.purchased) return {};
      // Prevent duplicate review
      if (item.reviewList.some((r) => r.userId === s.user.id)) return {};

      const newReview: MarketplaceReview = {
        id: `rv_${Date.now()}`,
        userId: s.user.id,
        username: s.user.username,
        rating,
        comment,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      const updatedReviews = [newReview, ...item.reviewList];
      const newAvg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;

      return {
        marketplaceItems: s.marketplaceItems.map((i) =>
          i.id === itemId
            ? { ...i, reviewList: updatedReviews, reviews: updatedReviews.length, rating: Math.round(newAvg * 10) / 10 }
            : i,
        ),
      };
    }),

  createListing: (input) =>
    set((s) => ({
      marketplaceItems: [
        ...s.marketplaceItems,
        {
          id: `mk_${Date.now()}`,
          type: input.type,
          title: input.title,
          description: input.description,
          price: input.price,
          seller: { id: s.user.id, username: s.user.username, tier: 'bronze' as TipsterTier },
          rating: 0,
          reviews: 0,
          reviewList: [],
          isBestseller: false,
          purchased: false,
          salesCount: 0,
          sellerEarnings: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ],
    })),

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

  createStory: (slides) =>
    set((s) => ({
      stories: [
        {
          id: `st_${Date.now()}`,
          user: { id: s.user.id, username: s.user.username, avatar: s.user.avatar },
          slides,
          createdAt: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
          viewed: true,
        },
        ...s.stories,
      ],
    })),

  votePoll: (storyId, slideId, optionIndex) =>
    set((s) => ({
      stories: s.stories.map((st) =>
        st.id !== storyId ? st : {
          ...st,
          slides: st.slides.map((sl) =>
            sl.id !== slideId || !sl.pollOptions ? sl : {
              ...sl,
              pollOptions: sl.pollOptions.map((opt, i) =>
                i === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt,
              ),
            },
          ),
        },
      ),
    })),

  reactStory: (storyId, reaction) =>
    set((s) => ({
      stories: s.stories.map((st) =>
        st.id !== storyId ? st : {
          ...st,
          reactions: {
            ...(st as any).reactions,
            [reaction]: ((st as any).reactions?.[reaction] ?? 0) + 1,
          },
        },
      ),
    })),

  // ─── Audio Rooms ──────────────────────────────────────────────────────────

  joinAudioRoom: (roomId) =>
    set((s) => ({
      joinedRoomId: roomId,
      isHandRaised: false,
      audioRooms: s.audioRooms.map((r) =>
        r.id !== roomId ? r : { ...r, listeners: r.listeners + 1 },
      ),
    })),

  leaveAudioRoom: () =>
    set((s) => {
      if (!s.joinedRoomId) return {};
      const roomId = s.joinedRoomId;
      return {
        joinedRoomId: null,
        isHandRaised: false,
        audioRooms: s.audioRooms.map((r) =>
          r.id !== roomId ? r : { ...r, listeners: Math.max(0, r.listeners - 1) },
        ),
      };
    }),

  raiseHand: () =>
    set((s) => ({ isHandRaised: !s.isHandRaised })),

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

  // ─── Creator Economy ─────────────────────────────────────────────────────

  requestCreatorPayout: (amount, pixKey) =>
    set((s) => {
      if (amount <= 0 || amount > s.creatorStats.availableBalance) return {};
      // Convert coins to BRL (100 coins = R$1.00)
      const brlAmount = amount / 100;
      const payout: CreatorPayout = {
        id: `po_${Date.now()}`,
        amount: brlAmount,
        status: 'pending',
        requestedAt: new Date().toISOString().slice(0, 10),
        completedAt: null,
        pixKey,
      };
      return {
        creatorStats: {
          ...s.creatorStats,
          availableBalance: s.creatorStats.availableBalance - amount,
          pendingBalance: s.creatorStats.pendingBalance + amount,
          payoutHistory: [payout, ...s.creatorStats.payoutHistory],
        },
      };
    }),

  addCreatorEarning: (source, amount) =>
    set((s) => ({
      creatorStats: {
        ...s.creatorStats,
        availableBalance: s.creatorStats.availableBalance + amount,
        totalEarnings: s.creatorStats.totalEarnings + (amount / 100),
        weeklyEarnings: s.creatorStats.weeklyEarnings + (amount / 100),
        earningsBreakdown: {
          ...s.creatorStats.earningsBreakdown,
          [source]: s.creatorStats.earningsBreakdown[source] + amount,
        },
      },
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
        userSubscription: {
          ...s.userSubscription,
          tier,
          subscribedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          autoRenew: true,
        },
      };
    }),

  startTrial: () =>
    set((s) => {
      if (s.userSubscription.trialEndsAt) return {}; // already trialed
      const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      return {
        currentSubscription: 'pro' as SubscriptionTier,
        subscriptions: s.subscriptions.map((sub) => ({
          ...sub,
          isActive: sub.tier === 'pro',
        })),
        userSubscription: {
          ...s.userSubscription,
          tier: 'pro' as SubscriptionTier,
          subscribedAt: new Date().toISOString(),
          expiresAt: trialEnd,
          trialEndsAt: trialEnd,
          isTrialing: true,
          autoRenew: false,
        },
      };
    }),

  cancelSubscription: () =>
    set((s) => ({
      userSubscription: {
        ...s.userSubscription,
        autoRenew: false,
      },
    })),

  restorePurchase: (tier, expiresAt, productId, platform) =>
    set((s) => ({
      currentSubscription: tier,
      subscriptions: s.subscriptions.map((sub) => ({
        ...sub,
        isActive: sub.tier === tier,
      })),
      userSubscription: {
        ...s.userSubscription,
        tier,
        productId,
        platform,
        expiresAt,
        subscribedAt: new Date().toISOString(),
        autoRenew: true,
        isTrialing: false,
      },
    })),

  isFeatureLocked: (feature) => {
    const s = get();
    const requiredTier = TIER_FEATURES[feature];
    if (!requiredTier) return false; // unknown feature = unlocked
    const tierOrder: SubscriptionTier[] = ['free', 'pro', 'elite'];
    return tierOrder.indexOf(s.currentSubscription) < tierOrder.indexOf(requiredTier);
  },

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
