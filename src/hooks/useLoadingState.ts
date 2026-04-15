/**
 * useLoadingState — Gerencia os 3 estados de qualquer tela:
 *
 * 1. LOADING: mostra skeleton (SkeletonLoader)
 * 2. EMPTY: mostra empty state (EmptyState)
 * 3. DATA: mostra conteudo real
 *
 * Uso:
 *   const { isLoading, isEmpty, showContent } = useLoadingState(data);
 *   if (isLoading) return <SkeletonList />;
 *   if (isEmpty) return <EmptyState {...EMPTY_STATES.feed} />;
 *   return <FeedContent />;
 */

import { useState, useEffect, useRef } from 'react';

interface LoadingStateOptions {
  /** Tempo minimo de loading em ms (evita flash de skeleton) */
  minLoadingMs?: number;
  /** Se true, considera array vazia como "ainda carregando" */
  treatEmptyAsLoading?: boolean;
}

interface LoadingState {
  isLoading: boolean;
  isEmpty: boolean;
  showContent: boolean;
}

export function useLoadingState<T>(
  data: T[] | null | undefined,
  options: LoadingStateOptions = {},
): LoadingState {
  const { minLoadingMs = 300, treatEmptyAsLoading = false } = options;
  const [isLoading, setIsLoading] = useState(true);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    const elapsed = Date.now() - mountTime.current;
    const remaining = Math.max(0, minLoadingMs - elapsed);

    // Se data chegou, espera o tempo minimo e depois para de carregar
    if (data !== null && data !== undefined) {
      if (treatEmptyAsLoading && data.length === 0) return;

      const timer = setTimeout(() => setIsLoading(false), remaining);
      return () => clearTimeout(timer);
    }
  }, [data, minLoadingMs, treatEmptyAsLoading]);

  const hasData = data !== null && data !== undefined && data.length > 0;
  const isEmpty = !isLoading && !hasData;
  const showContent = !isLoading && hasData;

  return { isLoading, isEmpty, showContent };
}

/**
 * useRefreshable — Adiciona pull-to-refresh a qualquer tela
 *
 * Uso:
 *   const { refreshing, onRefresh } = useRefreshable(async () => {
 *     await reloadData();
 *   });
 *   <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
 */

export function useRefreshable(reloadFn: () => Promise<void> | void) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await reloadFn();
    } finally {
      // Minimo 500ms de refresh para nao parecer instantaneo demais
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  return { refreshing, onRefresh };
}
