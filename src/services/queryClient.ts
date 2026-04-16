/**
 * NEXA — React Query Client
 *
 * Server state management com cache inteligente.
 * Substitui fetch manual por: retry, refetch, stale-while-revalidate.
 *
 * Uso: import { queryClient } from './services/queryClient';
 *      <QueryClientProvider client={queryClient}>
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30s antes de considerar stale
      gcTime: 5 * 60_000, // 5min no cache antes de garbage collect
      retry: 2, // 2 retries em falha
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

/** Query keys centralizados */
export const QUERY_KEYS = {
  matches: ['matches'] as const,
  liveMatches: ['matches', 'live'] as const,
  feed: (page: number) => ['feed', page] as const,
  leaderboard: (period: string) => ['leaderboard', period] as const,
  tipster: (id: string) => ['tipster', id] as const,
  betHistory: ['betHistory'] as const,
  paymentHistory: ['paymentHistory'] as const,
  notifications: ['notifications'] as const,
  userProfile: (id: string) => ['user', id] as const,
} as const;
