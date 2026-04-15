/**
 * useOddsEngine — Motor de odds ao vivo
 *
 * O QUE FAZ (explicacao simples):
 * - A cada 10 segundos, busca as odds mais recentes
 * - Se tem API key do TheOddsAPI, busca odds reais da internet
 * - Se nao tem, simula mudancas nas odds (como o Bet365 faz ao vivo)
 * - Atualiza o store, que faz os numeros piscar verde/vermelho na tela
 * - Salva as odds no Supabase (banco de dados) se disponivel
 *
 * COMO FUNCIONA O FLASH (Bet365):
 * - Quando a odd sobe: o numero pisca VERDE por 1 segundo
 * - Quando a odd desce: o numero pisca VERMELHO por 1 segundo
 * - Isso ja esta implementado no componente OddsBtn do ui.tsx
 * - Aqui so precisamos garantir que prevOdds e salvo antes de atualizar
 */

import { useEffect, useRef } from 'react';
import { ENV, isConfigured } from '../config/env';
import { oddsApi, LiveOdds } from '../services/oddsApi';
// Lazy import pra evitar crash do URL polyfill
function getSupabaseService() {
  return require('../services/supabase').supabaseService;
}
import { useNexaStore } from '../store/nexaStore';
import type { Match } from '../store/nexaStore';

// Intervalo entre atualizacoes (10 segundos)
const POLL_INTERVAL = 10_000;

// Variacao maxima na simulacao (quando nao tem API real)
const MAX_VARIATION = 0.15;

export function useOddsEngine() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Funcao que roda a cada 10s
    async function tick() {
      const state = useNexaStore.getState();
      const liveMatches = state.matches.filter(m => m.status === 'live');
      if (liveMatches.length === 0) return;

      if (ENV.USE_REAL_ODDS && isConfigured('ODDS_API_KEY')) {
        // === MODO REAL: busca odds da TheOddsAPI ===
        await fetchRealOdds(liveMatches);
      } else {
        // === MODO SIMULACAO: varia odds aleatoriamente ===
        simulateOddsChange(liveMatches);
      }
    }

    // Primeira execucao imediata
    tick();

    // Repetir a cada 10 segundos
    intervalRef.current = setInterval(tick, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}

// === BUSCAR ODDS REAIS ===
async function fetchRealOdds(liveMatches: Match[]) {
  try {
    const oddsData = await oddsApi.getSoccerOdds();
    if (oddsData.length === 0) return;

    // Mapear odds por time (TheOddsAPI usa nomes de times, nao IDs)
    const oddsMap = new Map<string, LiveOdds>();
    for (const o of oddsData) {
      oddsMap.set(o.homeTeam.toLowerCase(), o);
      oddsMap.set(o.awayTeam.toLowerCase(), o);
    }

    useNexaStore.setState((state) => ({
      matches: state.matches.map(match => {
        if (match.status !== 'live') return match;

        // Tentar encontrar odds reais pelo nome do time
        const odds = oddsMap.get(match.homeTeam.toLowerCase())
          ?? oddsMap.get(match.awayTeam.toLowerCase());

        if (!odds) return match;

        // Salvar odds anteriores para o flash animation
        const prevOdds = { ...match.odds };

        return {
          ...match,
          oddsMovement: {
            home: odds.homeOdds > match.odds.home ? 1 : odds.homeOdds < match.odds.home ? -1 : 0,
            draw: odds.drawOdds > match.odds.draw ? 1 : odds.drawOdds < match.odds.draw ? -1 : 0,
            away: odds.awayOdds > match.odds.away ? 1 : odds.awayOdds < match.odds.away ? -1 : 0,
          } as { home: -1 | 0 | 1; draw: -1 | 0 | 1; away: -1 | 0 | 1 },
          odds: {
            home: odds.homeOdds,
            draw: odds.drawOdds,
            away: odds.awayOdds,
          },
          bettors: match.bettors + Math.floor(Math.random() * 5),
        };
      }),
    }));

    // Salvar no Supabase tambem
    if (ENV.USE_REAL_DATABASE) {
      for (const match of liveMatches) {
        const odds = oddsMap.get(match.homeTeam.toLowerCase());
        if (odds) {
          getSupabaseService().updateMatch?.(match.id, {
            home_odds: odds.homeOdds,
            draw_odds: odds.drawOdds,
            away_odds: odds.awayOdds,
          });
        }
      }
    }
  } catch (error) {
    // Se falhar, simula ao inves de quebrar
    simulateOddsChange(liveMatches);
  }
}

// === SIMULAR MUDANCAS DE ODDS ===
function simulateOddsChange(liveMatches: Match[]) {
  const vary = () => {
    const v = (Math.random() - 0.5) * 2 * MAX_VARIATION;
    return Math.round(v * 100) / 100;
  };

  useNexaStore.setState((state) => ({
    matches: state.matches.map(match => {
      if (match.status !== 'live') return match;

      const homeVar = vary();
      const drawVar = vary();
      const awayVar = vary();

      const newHome = Math.max(1.01, match.odds.home + homeVar);
      const newDraw = Math.max(1.01, match.odds.draw + drawVar);
      const newAway = Math.max(1.01, match.odds.away + awayVar);

      return {
        ...match,
        oddsMovement: {
          home: homeVar > 0.02 ? 1 : homeVar < -0.02 ? -1 : 0,
          draw: drawVar > 0.02 ? 1 : drawVar < -0.02 ? -1 : 0,
          away: awayVar > 0.02 ? 1 : awayVar < -0.02 ? -1 : 0,
        } as { home: -1 | 0 | 1; draw: -1 | 0 | 1; away: -1 | 0 | 1 },
        odds: {
          home: Math.round(newHome * 100) / 100,
          draw: Math.round(newDraw * 100) / 100,
          away: Math.round(newAway * 100) / 100,
        },
        bettors: match.bettors + Math.floor(Math.random() * 8),
        minute: (match.minute ?? 0) + 1,
      };
    }),
  }));
}
