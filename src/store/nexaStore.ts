import { create } from 'zustand';
import { analytics, trackBet, trackXPGain, trackOddsChange, trackUserState } from '../services/analytics';
import { linear } from '../services/linear';
import { fetchMatches, fetchFeed, fetchTipsters, fetchMissions, fetchClans, fetchLeaderboard, fetchCurrentUser, rpcCheckin, rpcToggleLike, rpcToggleFollow, rpcAwardMissionProgress, rpcPlaceBet } from '../services/supabase';

// Stake fixo por seleção enquanto não há campo de valor na betslip (demo)
const DEMO_BET_STAKE = 5;

// Avança o progresso de missões no backend e recarrega para refletir na UI
function awardMission(action: string, reload: () => Promise<void>) {
  rpcAwardMissionProgress(action)
    .then(updated => { if (updated > 0) reload(); })
    .catch(err => {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[NEXA] awardMission falhou:', err);
    });
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
  userId: string;
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
  clans: Clan[];
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

  // Backend (Supabase) — Fase 1: matches + feed · Fase 2: tipsters, missoes, clas, leaderboard
  loadMatches: () => Promise<void>;
  loadFeed: () => Promise<void>;
  loadTipsters: () => Promise<void>;
  loadMissions: () => Promise<void>;
  loadClans: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  loadUser: () => Promise<void>;
  hydrate: () => Promise<void>;
}

// Estado inicial neutro do usuario — substituido por dados reais do Supabase no hydrate()
const EMPTY_USER: User = {
  id: '', username: 'NEXA', avatar: 'NX',
  level: 1, xp: 0, xpToNext: 1000, streak: 0,
  balance: 0, coins: 0, rank: 0, winRate: 0, roi: 0,
  clan: '', dna: 'analytical', state: 'motivated',
  badges: [], following: [],
};

const EMPTY_CLAN: Clan = {
  id: '', name: '', tag: '', members: 0, rank: 0, xp: 0, weeklyXp: 0, icon: '', color: '#7C5CFC',
};

export const useNexaStore = create<NexaStore>((set, get) => ({
  isOnboarded: false,
  user: EMPTY_USER,
  feed: [],
  matches: [],
  tipsters: [],
  missions: [],
  clan: EMPTY_CLAN,
  clans: [],
  leaderboard: [],
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
    // Persiste no backend (Supabase) sem bloquear a UI
    rpcToggleLike(postId).catch(err => {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[NEXA] rpcToggleLike falhou:', err);
    });
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
    if (!tipster) return;
    const willFollow = !tipster.isFollowing;
    analytics.track(willFollow ? 'tipster_followed' : 'tipster_unfollowed', {
      tipsterId, tipsterTier: tipster.tier, tipsterWinRate: tipster.winRate,
    });
    // Otimista: alterna follow, ajusta contagem e a lista de "seguindo" do usuario
    set((s) => ({
      tipsters: s.tipsters.map(t => t.id === tipsterId
        ? { ...t, isFollowing: willFollow, followers: Math.max(0, t.followers + (willFollow ? 1 : -1)) }
        : t),
      user: {
        ...s.user,
        following: willFollow
          ? Array.from(new Set([...s.user.following, tipster.userId]))
          : s.user.following.filter(id => id !== tipster.userId),
      },
    }));
    // Persiste no backend (tabela follows)
    if (tipster.userId) {
      rpcToggleFollow(tipster.userId).catch(err => {
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[NEXA] rpcToggleFollow falhou:', err);
      });
      if (willFollow) awardMission('tipster_follow', () => get().loadMissions());
    }
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
    // Persiste no backend e reconcilia com os valores autoritativos
    rpcCheckin()
      .then(res => set((s) => ({ user: { ...s.user, xp: res.newXp, coins: res.newCoins, streak: res.streak } })))
      .catch(err => {
        if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[NEXA] rpcCheckin falhou:', err);
      });
    awardMission('daily_checkin', () => get().loadMissions());
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
    const legs = [...state.betslip];
    const totalOdds = legs.reduce((acc, b) => acc * b.odds, 1);
    analytics.track('bet_confirmed', {
      selections: legs.length,
      totalOdds,
      matches: legs.map(b => b.match).join(', '),
    });
    legs.forEach(b => trackBet(b.matchId, b.side, b.odds, 'direct'));
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

    // Persiste cada seleção como aposta real (saldo, KYC e limites validados no backend)
    (async () => {
      let placed = 0;
      let lastBalance: number | undefined;
      for (const leg of legs) {
        try {
          const res = await rpcPlaceBet(leg.matchId, leg.side, DEMO_BET_STAKE);
          lastBalance = res.newBalance;
          placed += 1;
        } catch (err) {
          if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[NEXA] rpcPlaceBet falhou:', err);
        }
      }
      if (lastBalance !== undefined) set((s) => ({ user: { ...s.user, balance: lastBalance! } }));
      if (placed > 0) {
        rpcAwardMissionProgress('bet_placed', placed)
          .then(updated => { if (updated > 0) get().loadMissions(); })
          .catch(() => {});
      }
    })();
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

  loadMatches: async () => {
    try {
      const matches = await fetchMatches();
      set({ matches });
    } catch (err) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[NEXA] loadMatches falhou:', err);
    }
  },

  loadFeed: async () => {
    try {
      const feed = await fetchFeed();
      set({ feed });
    } catch (err) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[NEXA] loadFeed falhou:', err);
    }
  },

  loadTipsters: async () => {
    try {
      const tipsters = await fetchTipsters();
      const following = get().user.following;
      set({ tipsters: tipsters.map(t => ({ ...t, isFollowing: following.includes(t.userId) })) });
    } catch (err) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[NEXA] loadTipsters falhou:', err);
    }
  },

  loadMissions: async () => {
    try {
      const missions = await fetchMissions();
      set({ missions });
    } catch (err) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[NEXA] loadMissions falhou:', err);
    }
  },

  loadClans: async () => {
    try {
      const clans = await fetchClans();
      const clan = clans.find(c => c.name === get().user.clan) ?? clans[0] ?? get().clan;
      set({ clans, clan });
    } catch (err) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[NEXA] loadClans falhou:', err);
    }
  },

  loadLeaderboard: async () => {
    try {
      const leaderboard = await fetchLeaderboard();
      set({ leaderboard });
    } catch (err) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[NEXA] loadLeaderboard falhou:', err);
    }
  },

  loadUser: async () => {
    try {
      const user = await fetchCurrentUser();
      if (user) set({ user });
    } catch (err) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('[NEXA] loadUser falhou:', err);
    }
  },

  hydrate: async () => {
    // Usuario primeiro: loadClans usa user.clan para selecionar o cla atual
    await get().loadUser();
    await Promise.all([
      get().loadMatches(),
      get().loadFeed(),
      get().loadTipsters(),
      get().loadMissions(),
      get().loadClans(),
      get().loadLeaderboard(),
    ]);
  },
}));
