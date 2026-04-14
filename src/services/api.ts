// ─── Mock API Service Layer ──────────────────────────────────────────────────
// Simulates backend calls with delays. Data comes from the Zustand store.

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const api = {
  // Auth
  login: async (email: string, _password: string): Promise<{ token: string; userId: string }> => {
    await delay(300);
    return { token: 'mock_jwt_token_' + Date.now(), userId: 'u1' };
  },

  // Feed
  fetchFeed: async (page: number): Promise<{ posts: any[]; hasMore: boolean }> => {
    await delay(200);
    return { posts: [], hasMore: page < 5 };
  },

  // Matches
  fetchLiveOdds: async (_matchId: string): Promise<{ home: number; draw: number; away: number }> => {
    await delay(150);
    const base = { home: 1.5 + Math.random(), draw: 3 + Math.random(), away: 3 + Math.random() * 2 };
    return { home: +base.home.toFixed(2), draw: +base.draw.toFixed(2), away: +base.away.toFixed(2) };
  },

  // Bets
  placeBet: async (_matchId: string, _side: string, _stake: number): Promise<{ betId: string; confirmed: boolean }> => {
    await delay(400);
    return { betId: 'bet_' + Date.now(), confirmed: true };
  },

  // Social
  followUser: async (_userId: string): Promise<{ success: boolean }> => {
    await delay(200);
    return { success: true };
  },

  // Wallet
  processDeposit: async (amount: number): Promise<{ transactionId: string; pixCode: string }> => {
    await delay(500);
    return { transactionId: 'tx_' + Date.now(), pixCode: 'PIX_MOCK_' + amount };
  },

  processWithdraw: async (amount: number): Promise<{ transactionId: string; eta: string }> => {
    await delay(500);
    return { transactionId: 'tx_' + Date.now(), eta: '1-2 dias úteis' };
  },

  // Referral
  generateReferralCode: async (): Promise<{ code: string; link: string }> => {
    await delay(200);
    const code = 'NEXA' + Math.random().toString(36).substring(2, 7).toUpperCase();
    return { code, link: `https://nexa.app/ref/${code}` };
  },

  // Analytics
  trackEvent: async (_event: string, _props: Record<string, any>): Promise<void> => {
    await delay(50);
    // In production: send to analytics backend
  },
};
