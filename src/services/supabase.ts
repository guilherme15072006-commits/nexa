// =====================================================
// NEXA Supabase — Camada de dados (Postgres)
// Substitui os mocks por dados reais do backend.
// Fase 1: matches + feed. Usa a chave publica (anon),
// protegida por RLS (apenas leitura publica liberada).
// =====================================================

import { createClient } from '@supabase/supabase-js';
import type { Match, FeedPost, Tipster, Mission, Clan, User } from '../store/nexaStore';

// --- Config (chaves anon/publishable: seguras no cliente) ---

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://ymuziccgrqjbugsdwgjo.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? 'sb_publishable_lqe_c_pFLJqKprdsRhnt0w_PNIPLjkg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// --- Linhas cruas do banco ---

interface MatchRow {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  status: string;
  minute: number | null;
  home_score: number | null;
  away_score: number | null;
  home_odds: number | string;
  draw_odds: number | string;
  away_odds: number | string;
  initial_home_odds: number | string | null;
  initial_draw_odds: number | string | null;
  initial_away_odds: number | string | null;
  bettors: number | null;
  trending: boolean | null;
  scheduled_time: string | null;
}

interface FeedRow {
  id: string;
  user_id: string;
  type: string;
  content: string;
  match_id: string | null;
  pick_side: string | null;
  pick_odds: number | string | null;
  likes: number | null;
  comments: number | null;
  copies: number | null;
  created_at: string;
  matches: MatchRow | null;
  users: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    tipsters: Array<{ tier: string | null }> | null;
  } | null;
}

// --- Helpers de mapeamento ---

const LEAGUE_ICONS: Record<string, string> = {
  Brasileirao: 'BR',
  'Champions League': 'CL',
  'La Liga': 'ES',
  'Premier League': 'EN',
  'Serie A': 'IT',
};

const TIER_MAP: Record<string, string> = {
  ouro: 'gold',
  prata: 'silver',
  bronze: 'bronze',
  elite: 'elite',
  gold: 'gold',
  silver: 'silver',
};

const STATUS_MAP: Record<string, Match['status']> = {
  pre: 'upcoming',
  upcoming: 'upcoming',
  live: 'live',
  finished: 'finished',
};

const TYPE_MAP: Record<string, FeedPost['type']> = {
  pick: 'tip',
  tip: 'tip',
  bet: 'bet',
  analysis: 'social',
  social: 'social',
  challenge: 'social',
  result: 'achievement',
  achievement: 'achievement',
};

function leagueIcon(league: string): string {
  return LEAGUE_ICONS[league] ?? league.slice(0, 2).toUpperCase();
}

function teamLogo(team: string): string {
  // Abreviacao de 3 letras a partir do nome do time
  const cleaned = team.replace(/[^A-Za-z ]/g, '').trim();
  return cleaned.slice(0, 3).toUpperCase();
}

function initials(username: string): string {
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

function num(v: number | string | null | undefined): number {
  return typeof v === 'string' ? parseFloat(v) : (v ?? 0);
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins}min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export function mapMatch(row: MatchRow): Match {
  const hasScore = row.home_score != null && row.away_score != null && row.status !== 'pre';
  const initial = row.initial_home_odds != null
    ? { home: num(row.initial_home_odds), draw: num(row.initial_draw_odds), away: num(row.initial_away_odds) }
    : undefined;
  return {
    id: row.id,
    league: row.league,
    leagueIcon: leagueIcon(row.league),
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    homeLogo: teamLogo(row.home_team),
    awayLogo: teamLogo(row.away_team),
    status: STATUS_MAP[row.status] ?? 'upcoming',
    minute: row.minute ?? undefined,
    score: hasScore ? { home: row.home_score as number, away: row.away_score as number } : undefined,
    startTime: row.scheduled_time ?? '',
    odds: { home: num(row.home_odds), draw: num(row.draw_odds), away: num(row.away_odds) },
    prevOdds: initial,
    bettors: row.bettors ?? 0,
    trending: row.trending ?? false,
  };
}

function pickLabel(side: string | null, match: MatchRow | null): string | undefined {
  if (!side) return undefined;
  if (side === 'draw') return 'Empate';
  if (!match) return side === 'home' ? 'Mandante vence' : 'Visitante vence';
  return side === 'home' ? `${match.home_team} vence` : `${match.away_team} vence`;
}

export function mapFeedPost(row: FeedRow): FeedPost {
  const tierRaw = row.users?.tipsters?.[0]?.tier ?? '';
  const username = row.users?.username ?? 'NEXA';
  const likes = row.likes ?? 0;
  return {
    id: row.id,
    type: TYPE_MAP[row.type] ?? 'social',
    user: {
      id: row.user_id,
      username,
      avatar: initials(username),
      tier: TIER_MAP[tierRaw] ?? 'silver',
    },
    content: row.content,
    match: row.matches ? mapMatch(row.matches) : undefined,
    pick: pickLabel(row.pick_side, row.matches),
    odds: row.pick_odds != null ? num(row.pick_odds) : undefined,
    likes,
    comments: row.comments ?? 0,
    copies: row.copies ?? 0,
    isLiked: false,
    timestamp: relativeTime(row.created_at),
    hot: likes >= 150,
  };
}

// --- Repositorio (Fase 1) ---

export async function fetchMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('status', { ascending: true })
    .order('bettors', { ascending: false });
  if (error) throw error;
  return (data as MatchRow[]).map(mapMatch);
}

export async function fetchFeed(): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from('feed_posts')
    .select('*, matches(*), users(id, username, avatar_url, tipsters(tier))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as FeedRow[]).map(mapFeedPost);
}

// =====================================================
// Fase 2: tipsters, missions, clans, leaderboard
// =====================================================

interface TipsterRow {
  id: string;
  username: string;
  avatar_url: string | null;
  win_rate: number | string;
  roi: number | string;
  followers: number | null;
  streak: number | null;
  tier: string;
  recent_pick_side: string | null;
  recent_pick_odds: number | string | null;
}

interface MissionRow {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  type: string;
  target: number | null;
  hidden_title: string | null;
}

interface ClanRow {
  id: string;
  name: string;
  tag: string;
  members: number | null;
  rank: number | null;
  xp: number | null;
  weekly_xp: number | null;
  badge: string | null;
}

interface LeaderboardUserRow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  level: number | null;
  xp: number | null;
  xp_to_next: number | null;
  streak: number | null;
  balance: number | string | null;
  coins: number | null;
  rank: number | null;
  win_rate: number | string | null;
  roi: number | string | null;
  clans: { name: string } | null;
}

// win_rate vem como fracao (0.71) na tabela users e como % (71) em tipsters
function asPercent(v: number | string | null | undefined): number {
  const n = num(v);
  return Math.round(n <= 1 ? n * 100 : n);
}

export function mapTipster(row: TipsterRow): Tipster {
  return {
    id: row.id,
    username: row.username,
    avatar: initials(row.username),
    winRate: asPercent(row.win_rate),
    roi: num(row.roi),
    followers: row.followers ?? 0,
    streak: row.streak ?? 0,
    tier: (TIER_MAP[row.tier] ?? 'silver') as Tipster['tier'],
    isFollowing: false,
  };
}

export function mapMission(row: MissionRow): Mission {
  const isHidden = row.type === 'hidden';
  return {
    id: row.id,
    title: isHidden ? (row.hidden_title ?? row.title) : row.title,
    description: row.description,
    xpReward: row.xp_reward,
    progress: 0,
    target: row.target ?? 1,
    type: (['daily', 'weekly', 'hidden'].includes(row.type) ? row.type : 'daily') as Mission['type'],
    icon: isHidden ? 'M' : (row.title?.[0] ?? 'M').toUpperCase(),
    completed: false,
  };
}

export function mapClan(row: ClanRow): Clan {
  return {
    id: row.id,
    name: row.name,
    tag: row.tag,
    members: row.members ?? 0,
    rank: row.rank ?? 0,
    xp: row.xp ?? 0,
    weeklyXp: row.weekly_xp ?? 0,
    icon: row.badge ?? row.tag.slice(0, 1).toUpperCase(),
    color: '#7C5CFC',
  };
}

export function mapLeaderboardUser(row: LeaderboardUserRow): User {
  return {
    id: row.id,
    username: row.username ?? 'NEXA',
    avatar: initials(row.username ?? 'NEXA'),
    level: row.level ?? 1,
    xp: row.xp ?? 0,
    xpToNext: row.xp_to_next ?? 1000,
    streak: row.streak ?? 0,
    balance: num(row.balance),
    coins: row.coins ?? 0,
    rank: row.rank ?? 0,
    winRate: asPercent(row.win_rate),
    roi: num(row.roi),
    clan: row.clans?.name ?? '',
    badges: [],
    following: [],
    dna: 'analytical',
    state: 'motivated',
  };
}

export async function fetchTipsters(): Promise<Tipster[]> {
  const { data, error } = await supabase
    .from('tipsters')
    .select('*')
    .order('followers', { ascending: false });
  if (error) throw error;
  return (data as TipsterRow[]).map(mapTipster);
}

export async function fetchMissions(): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as MissionRow[]).map(mapMission);
}

export async function fetchClans(): Promise<Clan[]> {
  const { data, error } = await supabase
    .from('clans')
    .select('*')
    .order('rank', { ascending: true });
  if (error) throw error;
  return (data as ClanRow[]).map(mapClan);
}

export async function fetchLeaderboard(): Promise<Array<{ rank: number; user: User; xp: number }>> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, avatar_url, level, xp, xp_to_next, streak, balance, coins, rank, win_rate, roi, clans(name)')
    .gt('rank', 0)
    .order('rank', { ascending: true })
    .limit(10);
  if (error) throw error;
  return (data as unknown as LeaderboardUserRow[]).map(row => {
    const user = mapLeaderboardUser(row);
    return { rank: user.rank, user, xp: user.xp };
  });
}
