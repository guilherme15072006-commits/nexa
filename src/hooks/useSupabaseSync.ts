/**
 * useSupabaseSync — Carrega dados reais do Supabase e injeta no store
 *
 * O QUE FAZ (explicacao simples):
 * - Quando o app abre, busca jogos, missoes e clas do banco de dados real
 * - Substitui os dados falsos (mock) pelos dados reais
 * - Escuta mudancas em tempo real (odds, chat, novos posts)
 * - Se a flag USE_REAL_DATABASE estiver desligada, nao faz nada
 */

import { useEffect } from 'react';
import { ENV } from '../config/env';
import { useNexaStore } from '../store/nexaStore';
import type { Match } from '../store/nexaStore';

// Lazy import pra evitar crash do URL polyfill quando USE_REAL_DATABASE=false
function getSupabaseService() {
  return require('../services/supabase').supabaseService;
}
type DBMatch = import('../services/supabase').DBMatch;

// Converte formato do banco (snake_case) para formato do app (camelCase)
function dbMatchToApp(db: DBMatch): Match {
  return {
    id: db.id,
    league: db.league,
    homeTeam: db.home_team,
    awayTeam: db.away_team,
    status: db.status as 'pre' | 'live' | 'finished',
    minute: db.minute ?? undefined,
    score: db.home_score != null && db.away_score != null
      ? { home: db.home_score, away: db.away_score }
      : undefined,
    odds: {
      home: Number(db.home_odds),
      draw: Number(db.draw_odds),
      away: Number(db.away_odds),
    },
    bettors: db.bettors,
    trending: db.trending,
    scheduledDay: undefined,
    scheduledTime: db.starts_at ?? undefined,
  };
}

export function useSupabaseSync() {
  useEffect(() => {
    // Se nao esta usando banco real, nao faz nada
    if (!ENV.USE_REAL_DATABASE) return;

    let unsubMatches: (() => void) | null = null;
    let unsubFeed: (() => void) | null = null;

    async function loadInitialData() {
      try {
        // Buscar jogos
        const dbMatches = await getSupabaseService().getMatches();
        if (dbMatches.length > 0) {
          const matches = dbMatches.map(dbMatchToApp);
          useNexaStore.setState({ matches });
        }

        // Buscar jogos ao vivo separado (para garantir)
        const dbLive = await getSupabaseService().getLiveMatches();
        if (dbLive.length > 0) {
          // Atualizar apenas os jogos ao vivo no estado
          const currentMatches = useNexaStore.getState().matches;
          const liveIds = dbLive.map(m => m.id);
          const updated = currentMatches.map(m => {
            const live = dbLive.find(l => l.id === m.id);
            return live ? dbMatchToApp(live) : m;
          });
          useNexaStore.setState({ matches: updated });
        }
      } catch (error) {
        // Se falhar, continua com mock data (nao quebra o app)
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.warn('[SupabaseSync] Falha ao carregar dados:', error);
        }
      }
    }

    function subscribeToRealtime() {
      // Escutar mudancas nos jogos (odds ao vivo)
      unsubMatches = getSupabaseService().subscribeToMatches((updatedMatch) => {
        const match = dbMatchToApp(updatedMatch);
        useNexaStore.setState((state) => ({
          matches: state.matches.map(m => m.id === match.id ? match : m),
        }));
      });

      // Escutar novos posts no feed
      unsubFeed = getSupabaseService().subscribeToFeed((newPost) => {
        useNexaStore.setState((state) => ({
          feed: [newPost, ...state.feed],
        }));
      });
    }

    loadInitialData();
    subscribeToRealtime();

    // Cleanup quando o app fechar
    return () => {
      if (unsubMatches) unsubMatches();
      if (unsubFeed) unsubFeed();
    };
  }, []);
}
