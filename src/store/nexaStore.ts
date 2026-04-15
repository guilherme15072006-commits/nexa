import { create } from 'zustand';
import { analytics, trackBet, trackXPGain, trackOddsChange, trackUserState } from '../services/analytics';
import { linear } from '../services/linear';

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
  clan: string;
  badges: Badge[];
  following: string[];
  dna: 'aggressive' | 'conservative' | 'analytical';
  state: 'motivated' | 'frustrated' | 'impulsive' | 'disengaged';
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
}

export interface Match {
  id: string;
  league: string;
  leagueIcon: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  status: 'live' | 'upcoming' | 'finished';
  minute?: number;
  score?: { home: number; away: number };
  startTime: string;
  odds: { home: number; draw: number; away: number };
  prevOdds?: { home: number; draw: number; away: number };
  bettors: number;
  trending: boolean;
}

export interface Tipster {
  id: string;
  username: string;
  avatar: string;
  winRate: number;
  roi: number;
  followers: number;
  streak: number;
  tier: 'bronze' | 'silver' | 'gold' | 'elite';
  isFollowing: boolean;
  recentPick?: string;
  profit?: number;
}

export interface FeedPost {
  id: string;
  type: 'bet' | 'tip' | 'result' | 'achievement' | 'social';
  user: { id: string; username: string; avatar: string; tier: string };
  content: string;
  match?: any;
  pick?: string;
  odds?: number;
  likes: number;
  comments: number;
  copies: number;
  isLiked: boolean;
  timestamp: string;
  hot: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  type: 'daily' | 'weekly' | 'hidden';
  icon: string;
  completed: boolean;
  expiresIn?: string;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  members: number;
  rank: number;
  xp: number;
  weeklyXp: number;
  icon: string;
  color: string;
}

export interface BetslipItem {
  matchId: string;
  side: string;
  odds: number;
  match: string;
}

interface NexaStore {
  isOnboarded: boolean;
  user: User;
  feed: FeedPost[];
  matches: Match[];
  tipsters: Tipster[];
  missions: Mission[];
  clan: Clan;
  leaderboard: Array<{ rank: number; user: User; xp: number }>;

  activeTab: string;
  checkinAvailable: boolean;
  selectedOdds: Record<string, string>;

  // Bet365: betslip
  betslip: BetslipItem[];
  betslipVisible: boolean;

  // Duolingo: celebration state
  celebrating: boolean;
  lastXPGain: number;

  // Twitch: viewer counts that pulse
  liveViewers: Record<string, number>;

  setActiveTab: (tab: string) => void;
  likePost: (postId: string) => void;
  copyBet: (postId: string) => void;
  followTipster: (tipsterId: string) => void;
  selectOdd: (matchId: string, side: string) => void;
  claimCheckin: () => void;
  completeOnboarding: () => void;
  addXP: (amount: number) => void;
  detectUserState: () => void;
  clearBetslip: () => void;
  placeBet: () => void;
  simulateOddsChange: () => void;
  setCelebrating: (v: boolean) => void;
}

const MOCK_USER: User = {
  id: 'u1',
  username: 'RocketKing',
  avatar: 'RK',
  level: 12,
  xp: 2340,
  xpToNext: 3000,
  streak: 7,
  balance: 450.00,
  coins: 1820,
  rank: 14,
  winRate: 61,
  roi: 8.4,
  clan: 'Predators',
  dna: 'analytical',
  state: 'motivated',
  badges: [
    { id: 'b1', name: 'Tipster Iniciante', icon: 'T', rarity: 'common', unlocked: true },
    { id: 'b2', name: 'Semana Quente', icon: 'F', rarity: 'rare', unlocked: true },
    { id: 'b3', name: 'Sequencia 7d', icon: 'S', rarity: 'rare', unlocked: true },
    { id: 'b4', name: 'Cla Ativo', icon: 'C', rarity: 'common', unlocked: true },
    { id: 'b5', name: 'Predador Nato', icon: 'P', rarity: 'epic', unlocked: false },
    { id: 'b6', name: 'Lenda NEXA', icon: 'L', rarity: 'legendary', unlocked: false },
  ],
  following: ['t1', 't2'],
};

const MOCK_MATCHES: Match[] = [
  {
    id: 'm1', league: 'Brasileirao', leagueIcon: 'BR',
    homeTeam: 'Flamengo', awayTeam: 'Palmeiras',
    homeLogo: 'FLA', awayLogo: 'PAL',
    status: 'live', minute: 72,
    score: { home: 1, away: 1 },
    startTime: '', odds: { home: 1.85, draw: 3.20, away: 2.10 },
    prevOdds: { home: 1.90, draw: 3.15, away: 2.05 },
    bettors: 247, trending: true,
  },
  {
    id: 'm2', league: 'Champions League', leagueIcon: 'CL',
    homeTeam: 'Man City', awayTeam: 'Bayern',
    homeLogo: 'MCI', awayLogo: 'BAY',
    status: 'live', minute: 55,
    score: { home: 2, away: 1 },
    startTime: '', odds: { home: 1.45, draw: 4.20, away: 3.80 },
    prevOdds: { home: 2.10, draw: 3.40, away: 1.90 },
    bettors: 1240, trending: true,
  },
  {
    id: 'm3', league: 'La Liga', leagueIcon: 'ES',
    homeTeam: 'Real Madrid', awayTeam: 'Barcelona',
    homeLogo: 'RMA', awayLogo: 'BAR',
    status: 'upcoming', startTime: '20:00',
    odds: { home: 2.05, draw: 3.40, away: 1.95 },
    bettors: 3820, trending: true,
  },
  {
    id: 'm4', league: 'Brasileirao', leagueIcon: 'BR',
    homeTeam: 'Sao Paulo', awayTeam: 'Corinthians',
    homeLogo: 'SAO', awayLogo: 'COR',
    status: 'upcoming', startTime: '19:00',
    odds: { home: 2.20, draw: 3.10, away: 2.00 },
    bettors: 892, trending: false,
  },
];

const MOCK_TIPSTERS: Tipster[] = [
  { id: 't1', username: 'GabrielP', avatar: 'GP', winRate: 78, roi: 22.4, followers: 4820, streak: 12, tier: 'elite', isFollowing: true, recentPick: 'Real Madrid vence', profit: 14200 },
  { id: 't2', username: 'MarFutebol', avatar: 'MF', winRate: 71, roi: 15.8, followers: 2310, streak: 7, tier: 'gold', isFollowing: true, recentPick: 'Mais de 2.5 gols', profit: 8900 },
  { id: 't3', username: 'BetKing', avatar: 'BK', winRate: 69, roi: 12.1, followers: 1890, streak: 5, tier: 'gold', isFollowing: false, profit: 6200 },
  { id: 't4', username: 'TipZone', avatar: 'TZ', winRate: 65, roi: 9.3, followers: 1120, streak: 3, tier: 'silver', isFollowing: false, profit: 3800 },
  { id: 't5', username: 'AceTrader', avatar: 'AT', winRate: 73, roi: 18.2, followers: 3200, streak: 9, tier: 'elite', isFollowing: false, profit: 11500 },
];

const MOCK_FEED: FeedPost[] = [
  {
    id: 'f1', type: 'tip',
    user: { id: 't1', username: 'GabrielP', avatar: 'GP', tier: 'elite' },
    content: 'Real Madrid favorito em casa. Defesa solida, Mbappe em boa fase. Entrada limpa.',
    match: MOCK_MATCHES[2], pick: 'Real Madrid vence', odds: 2.05,
    likes: 342, comments: 87, copies: 156, isLiked: false,
    timestamp: '8min', hot: true,
  },
  {
    id: 'f2', type: 'bet',
    user: { id: 'u2', username: 'ZetaX', avatar: 'ZX', tier: 'silver' },
    content: 'Classico sempre imprevisivel. Apostei no empate -- odds otimas.',
    match: MOCK_MATCHES[2], pick: 'Empate', odds: 3.40,
    likes: 28, comments: 14, copies: 9, isLiked: true,
    timestamp: '15min', hot: false,
  },
  {
    id: 'f3', type: 'achievement',
    user: { id: 't2', username: 'MarFutebol', avatar: 'MF', tier: 'gold' },
    content: 'Completou 7 acertos seguidos! Sequencia incrivel -- melhor semana do mes.',
    likes: 189, comments: 42, copies: 0, isLiked: false,
    timestamp: '32min', hot: true,
  },
  {
    id: 'f4', type: 'tip',
    user: { id: 't3', username: 'BetKing', avatar: 'BK', tier: 'gold' },
    content: 'Flamengo pressiona no segundo tempo. Com 1x1 e time atacando, minha leitura e virada.',
    match: MOCK_MATCHES[0], pick: 'Flamengo vence', odds: 1.85,
    likes: 94, comments: 31, copies: 67, isLiked: false,
    timestamp: '1h', hot: false,
  },
];

const MOCK_MISSIONS: Mission[] = [
  { id: 'ms1', title: 'Aposte em 3 jogos hoje', description: 'Faca 3 apostas em partidas diferentes', xpReward: 150, progress: 2, target: 3, type: 'daily', icon: 'T', completed: false, expiresIn: '6h' },
  { id: 'ms2', title: 'Siga 1 novo tipster', description: 'Expanda sua rede de tipsters', xpReward: 80, progress: 0, target: 1, type: 'daily', icon: 'U', completed: false, expiresIn: '6h' },
  { id: 'ms3', title: 'Top 10 do ranking semanal', description: 'Chegue ao top 10 esta semana', xpReward: 500, progress: 14, target: 10, type: 'weekly', icon: 'R', completed: false },
  { id: 'ms4', title: '??? Missao oculta', description: 'Complete para descobrir', xpReward: 300, progress: 0, target: 1, type: 'hidden', icon: 'M', completed: false },
];

const MOCK_CLAN: Clan = {
  id: 'c1', name: 'Predators', tag: 'PRD',
  members: 28, rank: 5, xp: 48200, weeklyXp: 8400,
  icon: 'A', color: '#7C5CFC',
};

export const useNexaStore = create<NexaStore>((set, get) => ({
  isOnboarded: false,
  user: MOCK_USER,
  feed: MOCK_FEED,
  matches: MOCK_MATCHES,
  tipsters: MOCK_TIPSTERS,
  missions: MOCK_MISSIONS,
  clan: MOCK_CLAN,
  leaderboard: [
    { rank: 1, user: { ...MOCK_USER, id: 't1', username: 'GabrielP', avatar: 'GP', xp: 4820, winRate: 78, clan: 'Wolves' }, xp: 4820 },
    { rank: 2, user: { ...MOCK_USER, id: 't2', username: 'MarFutebol', avatar: 'MF', xp: 3610, winRate: 71, clan: 'Sharks' }, xp: 3610 },
    { rank: 3, user: { ...MOCK_USER, id: 't3', username: 'BetKing', avatar: 'BK', xp: 3100, winRate: 69, clan: 'Predators' }, xp: 3100 },
    { rank: 4, user: { ...MOCK_USER, id: 't4', username: 'TipZone', avatar: 'TZ', xp: 2890, winRate: 65, clan: 'Elite FC' }, xp: 2890 },
    { rank: 5, user: { ...MOCK_USER, id: 't5', username: 'AceTrader', avatar: 'AT', xp: 2720, winRate: 73, clan: 'Wolves' }, xp: 2720 },
    { rank: 14, user: MOCK_USER, xp: 2340 },
  ],
  activeTab: 'feed',
  checkinAvailable: true,
  selectedOdds: {},

  betslip: [],
  betslipVisible: false,
  celebrating: false,
  lastXPGain: 0,
  liveViewers: { m1: 247, m2: 1240 },

  setActiveTab: (tab) => {
    analytics.trackScreenView(tab);
    set({ activeTab: tab });
  },

  likePost: (postId) => {
    const state = get();
    const post = state.feed.find(p => p.id === postId);
    const willLike = post && !post.isLiked;
    analytics.track(willLike ? 'post_liked' : 'post_unliked', { postId, postType: post?.type });
    set((s) => ({
      feed: s.feed.map(p => p.id === postId
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p)
    }));
  },

  copyBet: (postId) => {
    const state = get();
    const post = state.feed.find(p => p.id === postId);
    analytics.track('bet_copied', { postId, tipster: post?.user.username, odds: post?.odds });
    trackXPGain(10, 'copy_bet');
    set((s) => ({
      feed: s.feed.map(p => p.id === postId ? { ...p, copies: p.copies + 1 } : p),
      user: { ...s.user, xp: s.user.xp + 10 },
      lastXPGain: 10,
    }));
  },

  followTipster: (tipsterId) => {
    const state = get();
    const tipster = state.tipsters.find(t => t.id === tipsterId);
    const willFollow = tipster && !tipster.isFollowing;
    analytics.track(willFollow ? 'tipster_followed' : 'tipster_unfollowed', {
      tipsterId, tipsterTier: tipster?.tier, tipsterWinRate: tipster?.winRate,
    });
    set((s) => ({
      tipsters: s.tipsters.map(t => t.id === tipsterId ? { ...t, isFollowing: !t.isFollowing } : t),
    }));
  },

  selectOdd: (matchId, side) => {
    const state = get();
    const match = state.matches.find(m => m.id === matchId);
    if (!match) return;

    const existing = state.betslip.findIndex(b => b.matchId === matchId);
    const newSlip = [...state.betslip];
    const oddsVal = match.odds[side as keyof typeof match.odds];
    const matchLabel = `${match.homeTeam} vs ${match.awayTeam}`;

    if (existing >= 0) {
      if (newSlip[existing].side === side) {
        newSlip.splice(existing, 1);
      } else {
        newSlip[existing] = { matchId, side, odds: oddsVal, match: matchLabel };
      }
    } else {
      newSlip.push({ matchId, side, odds: oddsVal, match: matchLabel });
    }

    set({
      selectedOdds: { ...state.selectedOdds, [matchId]: newSlip.find(b => b.matchId === matchId)?.side ?? '' },
      betslip: newSlip,
      betslipVisible: newSlip.length > 0,
    });
  },

  claimCheckin: () => {
    const state = get();
    analytics.track('checkin_claimed', {
      streak: state.user.streak + 1,
      xpBefore: state.user.xp,
      coinsBefore: state.user.coins,
    });
    trackXPGain(50, 'daily_checkin');
    set((s) => ({
      checkinAvailable: false,
      user: { ...s.user, xp: s.user.xp + 50, streak: s.user.streak + 1, coins: s.user.coins + 100 },
      celebrating: true,
      lastXPGain: 50,
    }));
  },

  completeOnboarding: () => {
    analytics.track('onboarding_completed', {});
    set({ isOnboarded: true });
  },

  addXP: (amount) => {
    trackXPGain(amount, 'generic');
    const state = get();
    const newXP = state.user.xp + amount;
    // Check level up
    if (newXP >= state.user.xpToNext) {
      analytics.track('level_up', { newLevel: state.user.level + 1, totalXP: newXP });
    }
    set((s) => ({
      user: { ...s.user, xp: s.user.xp + amount },
      lastXPGain: amount,
    }));
  },

  detectUserState: () => {
    const { user } = get();
    const oldState = user.state;
    let newState: User['state'] = 'motivated';
    if (user.streak === 0) newState = 'disengaged';
    else if (user.winRate < 40) newState = 'frustrated';
    else if (user.xp > 5000) newState = 'impulsive';

    if (oldState !== newState) {
      trackUserState(oldState, newState, 'auto_detection');
      // Jogo responsavel: alerta Linear se frustrado
      if (newState === 'frustrated') {
        analytics.track('responsible_gaming_triggered', { userId: user.id, state: newState });
        linear.reportResponsibleGaming(user.id, 'winRate < 40%', newState);
      }
    }
    set((s) => ({ user: { ...s.user, state: newState } }));
  },

  clearBetslip: () => set({ betslip: [], betslipVisible: false, selectedOdds: {} }),

  placeBet: () => {
    const state = get();
    if (state.betslip.length === 0) return;
    const totalOdds = state.betslip.reduce((acc, b) => acc * b.odds, 1);
    analytics.track('bet_confirmed', {
      selections: state.betslip.length,
      totalOdds,
      matches: state.betslip.map(b => b.match).join(', '),
    });
    state.betslip.forEach(b => trackBet(b.matchId, b.side, b.odds, 'direct'));
    trackXPGain(20, 'bet_placed');
    set({
      betslip: [],
      betslipVisible: false,
      selectedOdds: {},
      user: { ...state.user, xp: state.user.xp + 20 },
      lastXPGain: 20,
      celebrating: true,
    });
    setTimeout(() => set({ celebrating: false }), 1200);
  },

  simulateOddsChange: () => set((s) => ({
    matches: s.matches.map(m => {
      if (m.status !== 'live') return m;
      const vary = () => Math.round((Math.random() * 0.2 - 0.1) * 100) / 100;
      return {
        ...m,
        prevOdds: { ...m.odds },
        odds: {
          home: Math.max(1.01, m.odds.home + vary()),
          draw: Math.max(1.01, m.odds.draw + vary()),
          away: Math.max(1.01, m.odds.away + vary()),
        },
        bettors: m.bettors + Math.floor(Math.random() * 8),
        minute: (m.minute ?? 0) + 1,
      };
    }),
  })),

  setCelebrating: (v) => set({ celebrating: v }),
}));
