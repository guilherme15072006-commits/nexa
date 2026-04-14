// =====================================================
// NEXA API Client — Cloudflare Workers Edge Backend
// Client HTTP tipado para todas as chamadas de API
// Otimizado para Cloudflare Workers com edge caching
// =====================================================

import type { User, Match, FeedPost, Tipster, Mission, Clan } from './nexaStore';

// --- Config ---

const API_CONFIG = {
  baseUrl: process.env.NEXA_API_URL ?? 'https://api.nexa.bet',
  cdnUrl: process.env.NEXA_CDN_URL ?? 'https://cdn.nexa.bet',
  wsUrl: process.env.NEXA_WS_URL ?? 'wss://ws.nexa.bet',
  timeout: 10000,
  retries: 2,
  version: 'v1',
};

// --- Types ---

interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    total?: number;
    cached?: boolean;
    edge?: string;
  };
}

interface ApiError {
  code: string;
  message: string;
  status: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

interface FeedParams extends PaginationParams {
  tab: 'para-voce' | 'seguindo';
  userId: string;
}

interface BetPayload {
  matchId: string;
  side: 'home' | 'draw' | 'away';
  amount: number;
  currency: 'BRL' | 'NEXA_COINS';
  odds: number;
  source: 'direct' | 'copy' | 'tipster';
  sourceTipsterId?: string;
}

interface DepositPayload {
  amount: number;
  method: 'pix' | 'card' | 'crypto';
  pixKey?: string;
  cardToken?: string;
}

interface LeaderboardParams {
  period: 'weekly' | 'monthly' | 'season';
  limit?: number;
}

// --- HTTP Client ---

class NexaApiClient {
  private tokens: AuthTokens | null = null;
  private refreshPromise: Promise<void> | null = null;

  private get headers(): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Version': '0.1.0',
      'X-Platform': 'react-native',
    };
    if (this.tokens?.accessToken) {
      h['Authorization'] = `Bearer ${this.tokens.accessToken}`;
    }
    return h;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: { cache?: boolean; retries?: number },
  ): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.baseUrl}/${API_CONFIG.version}${path}`;
    const maxRetries = options?.retries ?? API_CONFIG.retries;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Auto-refresh token if expired
        if (this.tokens && this.tokens.expiresAt < Date.now()) {
          await this.refreshAuth();
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_CONFIG.timeout);

        const cacheHeaders: Record<string, string> = {};
        if (options?.cache) {
          cacheHeaders['CF-Cache-Tag'] = 'nexa-app';
        }

        const response = await fetch(url, {
          method,
          headers: { ...this.headers, ...cacheHeaders },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.status === 401 && this.tokens) {
          await this.refreshAuth();
          continue;
        }

        if (!response.ok) {
          const error: ApiError = await response.json();
          throw new NexaApiError(error.code, error.message, error.status);
        }

        const data = await response.json();
        return {
          data: data.data ?? data,
          meta: {
            ...data.meta,
            cached: response.headers.get('CF-Cache-Status') === 'HIT',
            edge: response.headers.get('CF-Ray') ?? undefined,
          },
        };
      } catch (err) {
        if (attempt === maxRetries) throw err;
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
      }
    }

    throw new NexaApiError('UNREACHABLE', 'Todas as tentativas falharam', 0);
  }

  // --- Auth ---

  async login(email: string, password: string): Promise<User> {
    const res = await this.request<{ user: User; tokens: AuthTokens }>('POST', '/auth/login', { email, password });
    this.tokens = res.data.tokens;
    return res.data.user;
  }

  async loginWithGoogle(idToken: string): Promise<User> {
    const res = await this.request<{ user: User; tokens: AuthTokens }>('POST', '/auth/google', { idToken });
    this.tokens = res.data.tokens;
    return res.data.user;
  }

  async register(payload: { email: string; username: string; password: string }): Promise<User> {
    const res = await this.request<{ user: User; tokens: AuthTokens }>('POST', '/auth/register', payload);
    this.tokens = res.data.tokens;
    return res.data.user;
  }

  async submitKYC(payload: { cpf: string; birthDate: string; selfieUrl: string }): Promise<{ status: string }> {
    return (await this.request<{ status: string }>('POST', '/auth/kyc', payload)).data;
  }

  private async refreshAuth(): Promise<void> {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = (async () => {
      try {
        const res = await this.request<AuthTokens>('POST', '/auth/refresh', {
          refreshToken: this.tokens?.refreshToken,
        }, { retries: 0 });
        this.tokens = res.data;
      } finally {
        this.refreshPromise = null;
      }
    })();
    return this.refreshPromise;
  }

  // --- Feed ---

  async getFeed(params: FeedParams): Promise<ApiResponse<FeedPost[]>> {
    const query = new URLSearchParams({
      tab: params.tab,
      userId: params.userId,
      ...(params.cursor ? { cursor: params.cursor } : {}),
      limit: String(params.limit ?? 20),
    });
    return this.request<FeedPost[]>('GET', `/feed?${query}`, undefined, { cache: true });
  }

  async likePost(postId: string): Promise<void> {
    await this.request('POST', `/feed/${postId}/like`);
  }

  async copyBet(postId: string): Promise<{ xpGained: number }> {
    return (await this.request<{ xpGained: number }>('POST', `/feed/${postId}/copy`)).data;
  }

  // --- Matches ---

  async getLiveMatches(): Promise<Match[]> {
    return (await this.request<Match[]>('GET', '/matches/live', undefined, { cache: true })).data;
  }

  async getUpcomingMatches(date: string): Promise<Match[]> {
    return (await this.request<Match[]>('GET', `/matches/upcoming?date=${date}`, undefined, { cache: true })).data;
  }

  async getMatchOddsHistory(matchId: string): Promise<Array<{ time: number; odds: Match['odds'] }>> {
    return (await this.request<Array<{ time: number; odds: Match['odds'] }>>('GET', `/matches/${matchId}/odds-history`)).data;
  }

  // --- Bets ---

  async placeBet(payload: BetPayload): Promise<{ betId: string; xpGained: number }> {
    return (await this.request<{ betId: string; xpGained: number }>('POST', '/bets', payload)).data;
  }

  async getBetHistory(params: PaginationParams): Promise<ApiResponse<Array<{ id: string; match: string; side: string; odds: number; result: string; profit: number }>>> {
    return this.request('GET', `/bets?page=${params.page ?? 1}&limit=${params.limit ?? 20}`);
  }

  async cashoutBet(betId: string): Promise<{ amount: number }> {
    return (await this.request<{ amount: number }>('POST', `/bets/${betId}/cashout`)).data;
  }

  // --- Tipsters ---

  async getTipsters(params?: { tier?: string; sort?: string }): Promise<Tipster[]> {
    const query = new URLSearchParams(params as Record<string, string>);
    return (await this.request<Tipster[]>('GET', `/tipsters?${query}`, undefined, { cache: true })).data;
  }

  async getTipsterProfile(tipsterId: string): Promise<Tipster & { history: any[]; stats: any }> {
    return (await this.request<Tipster & { history: any[]; stats: any }>('GET', `/tipsters/${tipsterId}`)).data;
  }

  async followTipster(tipsterId: string): Promise<void> {
    await this.request('POST', `/tipsters/${tipsterId}/follow`);
  }

  // --- Leaderboard ---

  async getLeaderboard(params: LeaderboardParams): Promise<Array<{ rank: number; user: User; xp: number }>> {
    return (await this.request<Array<{ rank: number; user: User; xp: number }>>(
      'GET', `/leaderboard?period=${params.period}&limit=${params.limit ?? 50}`,
      undefined, { cache: true }
    )).data;
  }

  // --- Missions ---

  async getMissions(): Promise<Mission[]> {
    return (await this.request<Mission[]>('GET', '/missions')).data;
  }

  async claimCheckin(): Promise<{ xp: number; coins: number; streak: number }> {
    return (await this.request<{ xp: number; coins: number; streak: number }>('POST', '/missions/checkin')).data;
  }

  // --- Clans ---

  async getClanDetails(clanId: string): Promise<Clan & { members: User[] }> {
    return (await this.request<Clan & { members: User[] }>('GET', `/clans/${clanId}`)).data;
  }

  async getClanRanking(): Promise<Clan[]> {
    return (await this.request<Clan[]>('GET', '/clans/ranking', undefined, { cache: true })).data;
  }

  // --- Wallet ---

  async getBalance(): Promise<{ brl: number; coins: number }> {
    return (await this.request<{ brl: number; coins: number }>('GET', '/wallet/balance')).data;
  }

  async deposit(payload: DepositPayload): Promise<{ transactionId: string; status: string }> {
    return (await this.request<{ transactionId: string; status: string }>('POST', '/wallet/deposit', payload)).data;
  }

  async withdraw(amount: number, pixKey: string): Promise<{ transactionId: string }> {
    return (await this.request<{ transactionId: string }>('POST', '/wallet/withdraw', { amount, pixKey })).data;
  }

  async getTransactionHistory(params: PaginationParams): Promise<ApiResponse<any[]>> {
    return this.request('GET', `/wallet/transactions?page=${params.page ?? 1}`);
  }

  // --- User ---

  async getProfile(userId: string): Promise<User> {
    return (await this.request<User>('GET', `/users/${userId}`)).data;
  }

  async updateProfile(updates: Partial<Pick<User, 'username' | 'avatar'>>): Promise<User> {
    return (await this.request<User>('PATCH', '/users/me', updates)).data;
  }

  // --- WebSocket for live odds ---

  connectLiveOdds(onUpdate: (matchId: string, odds: Match['odds']) => void): () => void {
    const ws = new WebSocket(`${API_CONFIG.wsUrl}/odds`);

    ws.onopen = () => {
      if (this.tokens) {
        ws.send(JSON.stringify({ type: 'auth', token: this.tokens.accessToken }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'odds_update') {
          onUpdate(msg.matchId, msg.odds);
        }
      } catch {}
    };

    ws.onerror = () => {
      setTimeout(() => this.connectLiveOdds(onUpdate), 3000);
    };

    return () => ws.close();
  }

  // --- Logout ---

  logout(): void {
    this.tokens = null;
  }
}

// --- Error class ---

class NexaApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'NexaApiError';
  }
}

// Singleton
export const api = new NexaApiClient();
