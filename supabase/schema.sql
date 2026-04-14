-- NEXA Database Schema for Supabase
-- Run this in Supabase SQL editor to set up all tables

-- ── Users ───────────────────────────────────────────────────
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique,
  username text not null,
  email text,
  avatar_url text,
  level int default 1,
  xp int default 0,
  xp_to_next int default 500,
  streak int default 0,
  balance numeric(10,2) default 0,
  coins int default 200,
  rank int default 0,
  win_rate numeric(5,4) default 0,
  roi numeric(5,4) default 0,
  clan_id uuid references public.clans(id),
  risk_profile text default 'moderate',
  state text default 'motivated',
  subscription_tier text default 'free',
  referral_code text unique,
  created_at timestamptz default now()
);

-- ── Matches ─────────────────────────────────────────────────
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  league text not null,
  home_team text not null,
  away_team text not null,
  status text default 'pre',
  minute int,
  home_score int,
  away_score int,
  home_odds numeric(6,2),
  draw_odds numeric(6,2),
  away_odds numeric(6,2),
  bettors int default 0,
  trending boolean default false,
  starts_at timestamptz,
  created_at timestamptz default now()
);

-- ── Bets ────────────────────────────────────────────────────
create table if not exists public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null,
  match_id uuid references public.matches(id) not null,
  side text not null check (side in ('home', 'draw', 'away')),
  odds numeric(6,2) not null,
  stake numeric(10,2) not null,
  result text default 'pending' check (result in ('pending', 'won', 'lost')),
  profit numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- ── Feed Posts ──────────────────────────────────────────────
create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null,
  type text not null check (type in ('pick', 'result', 'analysis', 'challenge')),
  content text not null,
  match_id uuid references public.matches(id),
  pick_side text,
  pick_odds numeric(6,2),
  likes int default 0,
  comments int default 0,
  copies int default 0,
  created_at timestamptz default now()
);

-- ── Clans ───────────────────────────────────────────────────
create table if not exists public.clans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text not null,
  members int default 0,
  rank int default 0,
  xp int default 0,
  weekly_xp int default 0,
  badge text,
  created_at timestamptz default now()
);

-- ── Missions ────────────────────────────────────────────────
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  xp_reward int not null,
  coins_reward int default 0,
  type text default 'daily',
  target int default 1,
  created_at timestamptz default now()
);

-- ── User Missions ───────────────────────────────────────────
create table if not exists public.user_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  mission_id uuid references public.missions(id),
  progress int default 0,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- ── Transactions ────────────────────────────────────────────
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null,
  type text not null,
  label text not null,
  amount numeric(10,2) not null,
  currency text default 'BRL',
  created_at timestamptz default now()
);

-- ── Referrals ───────────────────────────────────────────────
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references public.users(id),
  referred_id uuid references public.users(id),
  code text not null,
  status text default 'pending',
  bonus_paid boolean default false,
  created_at timestamptz default now()
);

-- ── Notifications ───────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  type text not null,
  title text not null,
  message text not null,
  icon text,
  read boolean default false,
  created_at timestamptz default now()
);

-- ── Follows ─────────────────────────────────────────────────
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references public.users(id),
  following_id uuid references public.users(id),
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

-- ── Row Level Security ──────────────────────────────────────
alter table public.users enable row level security;
alter table public.bets enable row level security;
alter table public.transactions enable row level security;
alter table public.notifications enable row level security;

-- Users can read all profiles but only update their own
create policy "Public profiles readable" on public.users for select using (true);
create policy "Users update own profile" on public.users for update using (auth.uid()::text = firebase_uid);

-- Users can only see their own bets
create policy "Own bets only" on public.bets for select using (user_id::text = auth.uid()::text);
create policy "Place own bets" on public.bets for insert with check (user_id::text = auth.uid()::text);

-- Users can only see their own transactions
create policy "Own transactions" on public.transactions for select using (user_id::text = auth.uid()::text);

-- Users can only see their own notifications
create policy "Own notifications" on public.notifications for select using (user_id::text = auth.uid()::text);

-- ── Indexes ─────────────────────────────────────────────────
create index if not exists idx_matches_status on public.matches(status);
create index if not exists idx_bets_user on public.bets(user_id);
create index if not exists idx_feed_created on public.feed_posts(created_at desc);
create index if not exists idx_users_xp on public.users(xp desc);
create index if not exists idx_referrals_code on public.referrals(code);
