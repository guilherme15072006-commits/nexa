import { ENV, isConfigured } from '../config/env';

// ── Types from TheOddsAPI ──────────────────────────────────────

interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: {
    key: string;
    title: string;
    markets: {
      key: string;
      outcomes: { name: string; price: number }[];
    }[];
  }[];
}

// ── Our Match type ─────────────────────────────────────────────

export interface LiveOdds {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  commenceTime: string;
}

// ── API Service ────────────────────────────────────────────────

export const oddsApi = {
  /** Fetch live odds for soccer */
  getSoccerOdds: async (): Promise<LiveOdds[]> => {
    if (!ENV.USE_REAL_ODDS || !isConfigured('ODDS_API_KEY')) {
      return []; // Fall back to mock data in store
    }

    try {
      const url = `${ENV.ODDS_API_BASE}/sports/soccer/odds/?apiKey=${ENV.ODDS_API_KEY}&regions=us,eu&markets=h2h&oddsFormat=decimal`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn('OddsAPI error:', response.status);
        return [];
      }

      const events: OddsApiEvent[] = await response.json();

      return events.map(event => {
        const bookmaker = event.bookmakers[0];
        const market = bookmaker?.markets.find(m => m.key === 'h2h');
        const outcomes = market?.outcomes ?? [];

        const homeOutcome = outcomes.find(o => o.name === event.home_team);
        const awayOutcome = outcomes.find(o => o.name === event.away_team);
        const drawOutcome = outcomes.find(o => o.name === 'Draw');

        return {
          matchId: event.id,
          homeTeam: event.home_team,
          awayTeam: event.away_team,
          league: event.sport_title,
          homeOdds: homeOutcome?.price ?? 2.0,
          drawOdds: drawOutcome?.price ?? 3.5,
          awayOdds: awayOutcome?.price ?? 3.0,
          commenceTime: event.commence_time,
        };
      });
    } catch (error) {
      console.warn('OddsAPI fetch failed:', error);
      return [];
    }
  },

  /** Fetch odds for a specific sport */
  getOddsBySport: async (sportKey: string): Promise<LiveOdds[]> => {
    if (!ENV.USE_REAL_ODDS || !isConfigured('ODDS_API_KEY')) return [];

    try {
      const url = `${ENV.ODDS_API_BASE}/sports/${sportKey}/odds/?apiKey=${ENV.ODDS_API_KEY}&regions=us,eu&markets=h2h&oddsFormat=decimal`;
      const response = await fetch(url);
      if (!response.ok) return [];

      const events: OddsApiEvent[] = await response.json();
      return events.map(event => {
        const bk = event.bookmakers[0];
        const mkt = bk?.markets.find(m => m.key === 'h2h');
        const oc = mkt?.outcomes ?? [];
        return {
          matchId: event.id,
          homeTeam: event.home_team,
          awayTeam: event.away_team,
          league: event.sport_title,
          homeOdds: oc.find(o => o.name === event.home_team)?.price ?? 2.0,
          drawOdds: oc.find(o => o.name === 'Draw')?.price ?? 3.5,
          awayOdds: oc.find(o => o.name === event.away_team)?.price ?? 3.0,
          commenceTime: event.commence_time,
        };
      });
    } catch {
      return [];
    }
  },

  /** Check remaining API quota */
  checkQuota: async (): Promise<{ remaining: number; used: number } | null> => {
    if (!isConfigured('ODDS_API_KEY')) return null;
    try {
      const url = `${ENV.ODDS_API_BASE}/sports/?apiKey=${ENV.ODDS_API_KEY}`;
      const response = await fetch(url);
      const remaining = parseInt(response.headers.get('x-requests-remaining') ?? '0', 10);
      const used = parseInt(response.headers.get('x-requests-used') ?? '0', 10);
      return { remaining, used };
    } catch {
      return null;
    }
  },
};
