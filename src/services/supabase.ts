// =====================================================
// NEXA Supabase — Camada de dados (Postgres)
// Substitui os mocks por dados reais do backend.
// Fase 1: matches + feed. Usa a chave publica (anon),
// protegida por RLS (apenas leitura publica liberada).
// =====================================================

import { createClient } from '@supabase/supabase-js';
import type { Match, FeedPost, Tipster, Mission, Clan, User, Badge } from '../store/nexaStore';

// --- Config (chaves anon/publishable: seguras no cliente) ---

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://ymuziccgrqjbugsdwgjo.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? 'sb_publishable_lqe_c_pFLJqKprdsRhnt0w_PNIPLjkg';

// Usuario demo (fallback sem login). Aponta para uma linha real em `users`.
export const CURRENT_USER_ID = process.env.SUPABASE_DEMO_USER_ID ?? '11111111-1111-1111-1111-111111111111';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false },
});

// --- Identidade efetiva (demo ou usuario autenticado) ---

let effectiveUserId: string = CURRENT_USER_ID;

export function getEffectiveUserId(): string {
  return effectiveUserId;
}

// Mantem o id efetivo em sincronia com a sessao de auth
supabase.auth.onAuthStateChange((_event, session) => {
  effectiveUserId = session?.user?.id ?? CURRENT_USER_ID;
});

export interface AuthResult {
  userId: string;
  needsConfirmation: boolean;
}

export async function signUpWithEmail(email: string, password: string, username?: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: username ? { data: { full_name: username } } : undefined,
  });
  if (error) throw error;
  if (data.session?.user) effectiveUserId = data.session.user.id;
  return { userId: data.user?.id ?? '', needsConfirmation: !data.session };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  effectiveUserId = data.user.id;
  return { userId: data.user.id, needsConfirmation: false };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  effectiveUserId = CURRENT_USER_ID;
}

// Fallback: usa o usuario demo (sem login)
export function useDemoUser(): void {
  effectiveUserId = CURRENT_USER_ID;
}

export async function getActiveAuthUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

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

export function mapFeedPost(row: FeedRow, likedIds?: Set<string>): FeedPost {
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
    isLiked: likedIds?.has(row.id) ?? false,
    timestamp: relativeTime(row.created_at),
    hot: likes >= 150,
  };
}

async function fetchLikedPostIds(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', getEffectiveUserId());
  if (error) return new Set();
  return new Set((data as Array<{ post_id: string }>).map(r => r.post_id));
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
  const [res, likedIds] = await Promise.all([
    supabase
      .from('feed_posts')
      .select('*, matches(*), users(id, username, avatar_url, tipsters(tier))')
      .order('created_at', { ascending: false }),
    fetchLikedPostIds(),
  ]);
  if (res.error) throw res.error;
  return (res.data as FeedRow[]).map(row => mapFeedPost(row, likedIds));
}

// =====================================================
// Fase 2: tipsters, missions, clans, leaderboard
// =====================================================

interface TipsterRow {
  id: string;
  user_id: string | null;
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
    userId: row.user_id ?? '',
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

interface UserMissionRow {
  mission_id: string;
  progress: number | null;
  completed: boolean | null;
  revealed: boolean | null;
}

export function mapMission(row: MissionRow, um?: UserMissionRow): Mission {
  const isHidden = row.type === 'hidden';
  return {
    id: row.id,
    title: isHidden ? (row.hidden_title ?? row.title) : row.title,
    description: row.description,
    xpReward: row.xp_reward,
    progress: um?.progress ?? 0,
    target: row.target ?? 1,
    type: (['daily', 'weekly', 'hidden'].includes(row.type) ? row.type : 'daily') as Mission['type'],
    icon: isHidden ? 'M' : (row.title?.[0] ?? 'M').toUpperCase(),
    completed: um?.completed ?? false,
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
  const [missionsRes, umRes] = await Promise.all([
    supabase.from('missions').select('*').order('created_at', { ascending: true }),
    supabase.from('user_missions').select('mission_id, progress, completed, revealed').eq('user_id', getEffectiveUserId()),
  ]);
  if (missionsRes.error) throw missionsRes.error;
  const progressByMission = new Map<string, UserMissionRow>(
    (umRes.data as UserMissionRow[] | null ?? []).map(um => [um.mission_id, um]),
  );
  return (missionsRes.data as MissionRow[]).map(row => mapMission(row, progressByMission.get(row.id)));
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

// =====================================================
// Fase 3: usuario logado (fixo, sem auth)
// =====================================================

interface CurrentUserRow extends LeaderboardUserRow {
  badges: unknown;
  following_ids: string[] | null;
  dna: unknown;
  state: string | null;
}

export function mapCurrentUser(row: CurrentUserRow): User {
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
    badges: Array.isArray(row.badges) ? (row.badges as Badge[]) : [],
    following: row.following_ids ?? [],
    dna: (typeof row.dna === 'string' ? row.dna : 'analytical') as User['dna'],
    state: ((row.state ?? 'motivated') as User['state']),
  };
}

export async function fetchFollowingIds(userId: string = getEffectiveUserId()): Promise<string[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);
  if (error) return [];
  return (data as Array<{ following_id: string }>).map(r => r.following_id);
}

export async function fetchCurrentUser(id: string = getEffectiveUserId()): Promise<User | null> {
  const [res, following] = await Promise.all([
    supabase.from('users').select('*, clans(name)').eq('id', id).maybeSingle(),
    fetchFollowingIds(id),
  ]);
  if (res.error) throw res.error;
  if (!res.data) return null;
  const user = mapCurrentUser(res.data as unknown as CurrentUserRow);
  // Fonte de verdade do "seguindo" é a tabela follows
  user.following = following;
  return user;
}

// =====================================================
// Fase 4: escritas persistidas (RPCs SECURITY DEFINER)
// =====================================================

export async function rpcCheckin(): Promise<{ streak: number; newXp: number; newCoins: number; already: boolean }> {
  const { data, error } = await supabase.rpc('app_demo_checkin', { p_user_id: getEffectiveUserId() });
  if (error) throw error;
  const d = data as { streak: number; new_xp: number; new_coins: number; already: boolean };
  return { streak: d.streak, newXp: d.new_xp, newCoins: d.new_coins, already: d.already };
}

export async function rpcToggleLike(postId: string): Promise<{ liked: boolean; likes: number }> {
  const { data, error } = await supabase.rpc('app_demo_toggle_like', { p_user_id: getEffectiveUserId(), p_post_id: postId });
  if (error) throw error;
  return data as { liked: boolean; likes: number };
}

export async function rpcToggleFollow(targetUserId: string): Promise<{ following: boolean; followers: number }> {
  const { data, error } = await supabase.rpc('app_demo_follow_toggle', { p_user_id: getEffectiveUserId(), p_target_user_id: targetUserId });
  if (error) throw error;
  return data as { following: boolean; followers: number };
}

export async function rpcAwardMissionProgress(actionKey: string, count = 1): Promise<number> {
  const { data, error } = await supabase.rpc('app_demo_award_progress', { p_user_id: getEffectiveUserId(), p_action_key: actionKey, p_count: count });
  if (error) throw error;
  return (data as number) ?? 0;
}

export async function rpcPlaceBet(matchId: string, side: string, stake: number): Promise<{ betId: string; newBalance: number }> {
  const { data, error } = await supabase.rpc('app_demo_place_bet', { p_user_id: getEffectiveUserId(), p_match_id: matchId, p_side: side, p_stake: stake });
  if (error) throw error;
  const d = data as { bet_id: string; new_balance: number };
  return { betId: d.bet_id, newBalance: d.new_balance };
}
