import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV, isConfigured } from '../config/env';

// ── Client ─────────────────────────────────────────────────────

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!ENV.USE_REAL_DATABASE || !isConfigured('SUPABASE_URL')) return null;
  if (!client) {
    client = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
  }
  return client;
}

// ── Database Types ─────────────────────────────────────────────

export interface DBUser {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  xp_to_next: number;
  streak: number;
  balance: number;
  coins: number;
  rank: number;
  win_rate: number;
  roi: number;
  clan_id: string | null;
  risk_profile: string;
  state: string;
  created_at: string;
}

export interface DBMatch {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  status: string;
  minute: number | null;
  home_score: number | null;
  away_score: number | null;
  home_odds: number;
  draw_odds: number;
  away_odds: number;
  bettors: number;
  trending: boolean;
  scheduled_at: string | null;
  starts_at: string | null;
}

export interface DBBet {
  id: string;
  user_id: string;
  match_id: string;
  side: string;
  odds: number;
  stake: number;
  result: string;
  profit: number;
  created_at: string;
}

// ── Service Layer ──────────────────────────────────────────────

export const supabaseService = {
  /** Fetch user profile */
  getUser: async (userId: string): Promise<DBUser | null> => {
    const db = getClient();
    if (!db) return null;
    const { data } = await db.from('users').select('*').eq('id', userId).single();
    return data;
  },

  /** Update user profile */
  updateUser: async (userId: string, updates: Partial<DBUser>): Promise<void> => {
    const db = getClient();
    if (!db) return;
    await db.from('users').update(updates).eq('id', userId);
  },

  /** Fetch live matches */
  getLiveMatches: async (): Promise<DBMatch[]> => {
    const db = getClient();
    if (!db) return [];
    const { data } = await db.from('matches').select('*').eq('status', 'live').order('bettors', { ascending: false });
    return data ?? [];
  },

  /** Fetch all matches */
  getMatches: async (status?: string): Promise<DBMatch[]> => {
    const db = getClient();
    if (!db) return [];
    let query = db.from('matches').select('*').order('starts_at', { ascending: true });
    if (status) query = query.eq('status', status);
    const { data } = await query;
    return data ?? [];
  },

  /** Place a bet */
  placeBet: async (bet: Omit<DBBet, 'id' | 'created_at'>): Promise<string | null> => {
    const db = getClient();
    if (!db) return null;
    const { data } = await db.from('bets').insert(bet).select('id').single();
    return data?.id ?? null;
  },

  /** Fetch leaderboard */
  getLeaderboard: async (limit = 20): Promise<DBUser[]> => {
    const db = getClient();
    if (!db) return [];
    const { data } = await db.from('users').select('*').order('xp', { ascending: false }).limit(limit);
    return data ?? [];
  },

  /** Fetch feed posts */
  getFeed: async (page = 0, limit = 20): Promise<any[]> => {
    const db = getClient();
    if (!db) return [];
    const from = page * limit;
    const { data } = await db.from('feed_posts').select('*').order('created_at', { ascending: false }).range(from, from + limit - 1);
    return data ?? [];
  },

  /** Save referral */
  saveReferral: async (referrerId: string, referredId: string, code: string): Promise<void> => {
    const db = getClient();
    if (!db) return;
    await db.from('referrals').insert({ referrer_id: referrerId, referred_id: referredId, code, status: 'accepted' });
  },

  /** Update match odds (chamado pelo odds engine) */
  updateMatch: async (matchId: string, updates: Partial<DBMatch>): Promise<void> => {
    const db = getClient();
    if (!db) return;
    await db.from('matches').update(updates).eq('id', matchId);
  },

  /** Subscribe to realtime changes */
  subscribeToMatches: (callback: (match: DBMatch) => void): (() => void) => {
    const db = getClient();
    if (!db) return () => {};
    const channel = db
      .channel('live-matches')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, (payload) => {
        callback(payload.new as DBMatch);
      })
      .subscribe();
    return () => { db.removeChannel(channel); };
  },

  /** Subscribe to feed */
  subscribeToFeed: (callback: (post: any) => void): (() => void) => {
    const db = getClient();
    if (!db) return () => {};
    const channel = db
      .channel('feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_posts' }, (payload) => {
        callback(payload.new);
      })
      .subscribe();
    return () => { db.removeChannel(channel); };
  },
};
