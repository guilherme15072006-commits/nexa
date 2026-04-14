// =====================================================
// NEXA — Cloudflare Workers Edge API
// Endpoints de alta performance para o app
// =====================================================

export interface Env {
  ODDS_CACHE: KVNamespace;
  SESSION_STORE: KVNamespace;
  DB: D1Database;
  ASSETS: R2Bucket;
  ENVIRONMENT: string;
}

// --- CORS ---

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Version, X-Platform',
};

function corsResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...headers,
    },
  });
}

// --- Router ---

type Handler = (request: Request, env: Env, params: Record<string, string>) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
}

const routes: Route[] = [];

function route(method: string, path: string, handler: Handler): void {
  const paramNames: string[] = [];
  const pattern = path.replace(/:(\w+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });
  routes.push({ method, pattern: new RegExp(`^/v1${pattern}$`), paramNames, handler });
}

function matchRoute(method: string, path: string): { handler: Handler; params: Record<string, string> } | null {
  for (const r of routes) {
    if (r.method !== method) continue;
    const match = path.match(r.pattern);
    if (match) {
      const params: Record<string, string> = {};
      r.paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
      return { handler: r.handler, params };
    }
  }
  return null;
}

// --- Routes ---

// Health check
route('GET', '/health', async () => {
  return corsResponse({ status: 'ok', service: 'nexa-api', timestamp: Date.now() });
});

// Live matches com edge caching
route('GET', '/matches/live', async (_req, env) => {
  const cacheKey = 'matches:live';
  const cached = await env.ODDS_CACHE.get(cacheKey, 'json');

  if (cached) {
    return corsResponse({ data: cached, meta: { cached: true } }, 200, {
      'CF-Cache-Status': 'HIT',
      'Cache-Control': 'public, max-age=5',
    });
  }

  // Em producao: buscar do DB
  const matches: unknown[] = [];
  await env.ODDS_CACHE.put(cacheKey, JSON.stringify(matches), { expirationTtl: 5 });

  return corsResponse({ data: matches, meta: { cached: false } }, 200, {
    'Cache-Control': 'public, max-age=5',
  });
});

// Feed personalizado
route('GET', '/feed', async (req, env) => {
  const url = new URL(req.url);
  const tab = url.searchParams.get('tab') ?? 'para-voce';
  const userId = url.searchParams.get('userId') ?? '';
  const cursor = url.searchParams.get('cursor');
  const limit = parseInt(url.searchParams.get('limit') ?? '20', 10);

  // Em producao: Decision Engine alimentado por analytics
  // que rankeia posts por relevancia personalizada
  const feed: unknown[] = [];

  return corsResponse({
    data: feed,
    meta: { page: 1, total: 0, cursor: null },
  });
});

// Registrar aposta
route('POST', '/bets', async (req, env) => {
  const body = await req.json() as {
    matchId: string; side: string; amount: number;
    currency: string; odds: number; source: string;
  };

  // Validacoes
  if (!body.matchId || !body.side || !body.amount || !body.odds) {
    return corsResponse({ code: 'INVALID_BET', message: 'Dados incompletos' }, 400);
  }

  if (body.amount <= 0) {
    return corsResponse({ code: 'INVALID_AMOUNT', message: 'Valor deve ser positivo' }, 400);
  }

  // Em producao: verificar odds atuais, saldo, limites
  const betId = `bet_${Date.now()}`;

  return corsResponse({
    data: { betId, xpGained: 20, status: 'confirmed' },
  }, 201);
});

// Checkin diario
route('POST', '/missions/checkin', async (req, env) => {
  // Em producao: verificar se ja fez checkin hoje
  return corsResponse({
    data: { xp: 50, coins: 100, streak: 1 },
  });
});

// Leaderboard com cache de 60s
route('GET', '/leaderboard', async (req, env) => {
  const url = new URL(req.url);
  const period = url.searchParams.get('period') ?? 'weekly';
  const cacheKey = `leaderboard:${period}`;

  const cached = await env.ODDS_CACHE.get(cacheKey, 'json');
  if (cached) {
    return corsResponse({ data: cached, meta: { cached: true } }, 200, {
      'Cache-Control': 'public, max-age=60',
    });
  }

  const leaderboard: unknown[] = [];
  await env.ODDS_CACHE.put(cacheKey, JSON.stringify(leaderboard), { expirationTtl: 60 });

  return corsResponse({ data: leaderboard, meta: { cached: false } });
});

// Wallet operations
route('GET', '/wallet/balance', async (req, env) => {
  return corsResponse({ data: { brl: 0, coins: 0 } });
});

route('POST', '/wallet/deposit', async (req, env) => {
  const body = await req.json() as { amount: number; method: string };

  if (body.amount < 10) {
    return corsResponse({ code: 'MIN_DEPOSIT', message: 'Deposito minimo: R$ 10,00' }, 400);
  }

  return corsResponse({
    data: { transactionId: `tx_${Date.now()}`, status: 'pending' },
  }, 201);
});

// --- Main handler ---

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const matched = matchRoute(request.method, url.pathname);

    if (!matched) {
      return corsResponse({ code: 'NOT_FOUND', message: 'Endpoint nao encontrado' }, 404);
    }

    try {
      return await matched.handler(request, env, matched.params);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno';
      return corsResponse({ code: 'INTERNAL_ERROR', message }, 500);
    }
  },
};
