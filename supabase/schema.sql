-- NEXA Database Schema for Supabase
-- Run this in Supabase SQL editor to set up all tables

-- ── Clans (criada primeiro porque users referencia) ────────
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

-- (clans ja criada no topo)

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
create policy "Mark read" on public.notifications for update using (user_id::text = auth.uid()::text);

-- ── Tipsters ───────────────────────────────────────────────
create table if not exists public.tipsters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) unique not null,
  username text not null,
  avatar_url text,
  win_rate numeric(5,2) default 0,
  roi numeric(5,2) default 0,
  followers integer default 0,
  streak integer default 0,
  tier text default 'bronze' check (tier in ('bronze', 'silver', 'gold', 'elite')),
  created_at timestamptz default now()
);

-- ── Post Likes ─────────────────────────────────────────────
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null,
  post_id uuid references public.feed_posts(id) not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- ── Clan Members ───────────────────────────────────────────
create table if not exists public.clan_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) not null,
  clan_id uuid references public.clans(id) not null,
  joined_at timestamptz default now(),
  unique(user_id)
);

-- ── Chat Messages ──────────────────────────────────────────
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) not null,
  user_id uuid references public.users(id) not null,
  text text not null,
  created_at timestamptz default now()
);

-- ── RLS tabelas novas ──────────────────────────────────────
alter table public.clans enable row level security;
alter table public.feed_posts enable row level security;
alter table public.missions enable row level security;
alter table public.user_missions enable row level security;
alter table public.follows enable row level security;
alter table public.referrals enable row level security;
alter table public.tipsters enable row level security;
alter table public.post_likes enable row level security;
alter table public.clan_members enable row level security;
alter table public.chat_messages enable row level security;

create policy "Clas visiveis" on public.clans for select using (true);
create policy "Feed visivel" on public.feed_posts for select using (true);
create policy "Criar post" on public.feed_posts for insert with check (auth.uid()::text = user_id::text);
create policy "Missoes visiveis" on public.missions for select using (true);
create policy "Progresso proprio" on public.user_missions for select using (auth.uid()::text = user_id::text);
create policy "Atualizar progresso" on public.user_missions for update using (auth.uid()::text = user_id::text);
create policy "Iniciar missao" on public.user_missions for insert with check (auth.uid()::text = user_id::text);
create policy "Follows visiveis" on public.follows for select using (true);
create policy "Seguir" on public.follows for insert with check (auth.uid()::text = follower_id::text);
create policy "Deixar seguir" on public.follows for delete using (auth.uid()::text = follower_id::text);
create policy "Referrals proprios" on public.referrals for select using (auth.uid()::text = referrer_id::text);
create policy "Tipsters visiveis" on public.tipsters for select using (true);
create policy "Likes visiveis" on public.post_likes for select using (true);
create policy "Curtir" on public.post_likes for insert with check (auth.uid()::text = user_id::text);
create policy "Descurtir" on public.post_likes for delete using (auth.uid()::text = user_id::text);
create policy "Membros visiveis" on public.clan_members for select using (true);
create policy "Entrar cla" on public.clan_members for insert with check (auth.uid()::text = user_id::text);
create policy "Sair cla" on public.clan_members for delete using (auth.uid()::text = user_id::text);
create policy "Chat visivel" on public.chat_messages for select using (true);
create policy "Enviar msg" on public.chat_messages for insert with check (auth.uid()::text = user_id::text);
create policy "Users insert" on public.users for insert with check (auth.uid()::text = firebase_uid);

-- ── Creator Payouts ───────────────────────────────────────
create table if not exists public.creator_payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  amount_brl numeric(10,2) not null,
  amount_coins int not null,
  status text not null default 'pending' check (status in ('pending','processing','completed','failed')),
  pix_key text not null,
  requested_at timestamptz default now(),
  completed_at timestamptz
);

alter table public.creator_payouts enable row level security;
create policy "Payouts proprios" on public.creator_payouts for select using (auth.uid()::text = user_id::text);
create policy "Solicitar payout" on public.creator_payouts for insert with check (auth.uid()::text = user_id::text);

create index if not exists idx_creator_payouts_user on public.creator_payouts(user_id, requested_at desc);

-- ── Marketplace Items ─────────────────────────────────────
create table if not exists public.marketplace_items (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.users(id),
  type text not null check (type in ('strategy','analysis','vip_tips')),
  title text not null,
  description text,
  price int not null,
  rating numeric(2,1) default 0,
  reviews_count int default 0,
  sales_count int default 0,
  seller_earnings int default 0,
  is_bestseller boolean default false,
  created_at timestamptz default now()
);

alter table public.marketplace_items enable row level security;
create policy "Items visiveis" on public.marketplace_items for select using (true);
create policy "Criar item" on public.marketplace_items for insert with check (auth.uid()::text = seller_id::text);

-- ── Marketplace Reviews ───────────────────────────────────
create table if not exists public.marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.marketplace_items(id) on delete cascade,
  user_id uuid references public.users(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique(item_id, user_id)
);

alter table public.marketplace_reviews enable row level security;
create policy "Reviews visiveis" on public.marketplace_reviews for select using (true);
create policy "Criar review" on public.marketplace_reviews for insert with check (auth.uid()::text = user_id::text);

-- ── Marketplace Purchases ─────────────────────────────────
create table if not exists public.marketplace_purchases (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.marketplace_items(id),
  buyer_id uuid references public.users(id),
  seller_id uuid references public.users(id),
  price int not null,
  commission int not null,
  seller_payout int not null,
  created_at timestamptz default now(),
  unique(item_id, buyer_id)
);

alter table public.marketplace_purchases enable row level security;
create policy "Compras proprias" on public.marketplace_purchases for select using (auth.uid()::text = buyer_id::text or auth.uid()::text = seller_id::text);
create policy "Registrar compra" on public.marketplace_purchases for insert with check (auth.uid()::text = buyer_id::text);

create index if not exists idx_marketplace_items_seller on public.marketplace_items(seller_id);
create index if not exists idx_marketplace_reviews_item on public.marketplace_reviews(item_id);
create index if not exists idx_marketplace_purchases_buyer on public.marketplace_purchases(buyer_id);

-- ── Payments (deposits via Pix/card) ─────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  external_id text,
  method text not null check (method in ('pix', 'credit_card')),
  amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','confirmed','received','failed','refunded','expired')),
  pix_copy_paste text,
  pix_qr_code text,
  card_last4 text,
  card_brand text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  confirmed_at timestamptz
);

alter table public.payments enable row level security;
create policy "Pagamentos proprios" on public.payments for select using (auth.uid()::text = user_id::text);
create policy "Criar pagamento" on public.payments for insert with check (auth.uid()::text = user_id::text);

-- ── Withdrawals (saques via Pix) ─────────────────────────
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  external_id text,
  amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','processing','completed','failed')),
  pix_key text not null,
  pix_key_type text not null check (pix_key_type in ('cpf','email','phone','random')),
  estimated_at timestamptz,
  created_at timestamptz default now(),
  completed_at timestamptz
);

alter table public.withdrawals enable row level security;
create policy "Saques proprios" on public.withdrawals for select using (auth.uid()::text = user_id::text);
create policy "Solicitar saque" on public.withdrawals for insert with check (auth.uid()::text = user_id::text);

create index if not exists idx_payments_user on public.payments(user_id, created_at desc);
create index if not exists idx_payments_status on public.payments(status) where status = 'pending';
create index if not exists idx_withdrawals_user on public.withdrawals(user_id, created_at desc);
create index if not exists idx_withdrawals_status on public.withdrawals(status) where status = 'pending';

-- ── Device Tokens (FCM push) ──────────────────────────────
create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('android', 'ios')),
  updated_at timestamptz default now(),
  unique(user_id, token)
);

alter table public.device_tokens enable row level security;
create policy "Tokens proprios select" on public.device_tokens for select using (auth.uid()::text = user_id::text);
create policy "Tokens proprios insert" on public.device_tokens for insert with check (auth.uid()::text = user_id::text);
create policy "Tokens proprios update" on public.device_tokens for update using (auth.uid()::text = user_id::text);
create policy "Tokens proprios delete" on public.device_tokens for delete using (auth.uid()::text = user_id::text);

-- ── Realtime ───────────────────────────────────────────────
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.feed_posts;
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.bets;

-- ── Indexes ─────────────────────────────────────────────────
create index if not exists idx_matches_status on public.matches(status);
create index if not exists idx_bets_user on public.bets(user_id);
create index if not exists idx_feed_created on public.feed_posts(created_at desc);
create index if not exists idx_users_xp on public.users(xp desc);
create index if not exists idx_referrals_code on public.referrals(code);
create index if not exists idx_chat_match on public.chat_messages(match_id, created_at desc);
create index if not exists idx_follows_follower on public.follows(follower_id);
create index if not exists idx_tipsters_tier on public.tipsters(tier);

-- ═══════════════════════════════════════════════════════════
-- DADOS INICIAIS (seed)
-- ═══════════════════════════════════════════════════════════

insert into public.clans (name, tag, members, rank, xp, weekly_xp, badge) values
  ('Predators', 'PRD', 28, 5, 48200, 8400, '🦅'),
  ('Sharks FC', 'SHK', 34, 3, 52000, 9200, '🦈'),
  ('Wolves', 'WLF', 21, 8, 38000, 6100, '🐺');

insert into public.matches (league, home_team, away_team, status, minute, home_score, away_score, home_odds, draw_odds, away_odds, bettors, trending) values
  ('Brasileirao', 'Flamengo', 'Palmeiras', 'live', 72, 1, 1, 1.85, 3.20, 2.10, 247, true),
  ('Champions League', 'Man City', 'Bayern', 'live', 55, 2, 1, 1.45, 4.20, 3.80, 1240, true),
  ('La Liga', 'Real Madrid', 'Barcelona', 'pre', null, 0, 0, 2.05, 3.40, 1.95, 3820, true),
  ('Brasileirao', 'Sao Paulo', 'Corinthians', 'pre', null, 0, 0, 2.20, 3.10, 2.00, 892, false),
  ('Premier League', 'Arsenal', 'Liverpool', 'pre', null, 0, 0, 2.40, 3.30, 2.85, 1560, true),
  ('Serie A', 'Napoli', 'Roma', 'pre', null, 0, 0, 1.75, 3.60, 4.50, 680, false);

insert into public.missions (title, description, xp_reward, coins_reward, target, type) values
  ('Aposte em 3 jogos hoje', 'Faca 3 apostas em partidas diferentes', 150, 50, 3, 'daily'),
  ('Siga 1 novo tipster', 'Expanda sua rede de tipsters', 80, 30, 1, 'daily'),
  ('Top 10 do ranking semanal', 'Chegue ao top 10 esta semana', 500, 200, 1, 'weekly'),
  ('Missao secreta', 'Complete para descobrir', 300, 100, 3, 'hidden');
