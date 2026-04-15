/**
 * Testes de Loading States, Empty States e Skeleton
 */

jest.mock('react-native', () => ({ Platform: { OS: 'android', Version: 33 } }));

import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '..', 'src');

describe('SkeletonLoader', () => {
  test('componente existe', () => {
    expect(fs.existsSync(path.join(SRC, 'components/SkeletonLoader.tsx'))).toBe(true);
  });

  test('exporta SkeletonPulse, SkeletonCard, SkeletonMatchCard, SkeletonList', () => {
    const content = fs.readFileSync(path.join(SRC, 'components/SkeletonLoader.tsx'), 'utf-8');
    expect(content).toContain('export function SkeletonPulse');
    expect(content).toContain('export function SkeletonCard');
    expect(content).toContain('export function SkeletonMatchCard');
    expect(content).toContain('export function SkeletonList');
  });
});

describe('EmptyState', () => {
  test('componente existe', () => {
    expect(fs.existsSync(path.join(SRC, 'components/EmptyState.tsx'))).toBe(true);
  });

  test('exporta EmptyState e EMPTY_STATES presets', () => {
    const content = fs.readFileSync(path.join(SRC, 'components/EmptyState.tsx'), 'utf-8');
    expect(content).toContain('export function EmptyState');
    expect(content).toContain('export const EMPTY_STATES');
  });

  test('tem preset para cada tela principal', () => {
    const content = fs.readFileSync(path.join(SRC, 'components/EmptyState.tsx'), 'utf-8');
    const requiredPresets = ['feed:', 'bets:', 'betHistory:', 'notifications:', 'search:', 'clan:', 'marketplace:', 'lives:', 'wallet:'];
    for (const preset of requiredPresets) {
      expect(content).toContain(preset);
    }
  });

  test('usa typeScale para tipografia (nao hardcoded)', () => {
    const content = fs.readFileSync(path.join(SRC, 'components/EmptyState.tsx'), 'utf-8');
    expect(content).toContain('typeScale');
  });

  test('usa spacing tokens', () => {
    const content = fs.readFileSync(path.join(SRC, 'components/EmptyState.tsx'), 'utf-8');
    expect(content).toContain('spacing.');
  });
});

describe('useLoadingState hook', () => {
  test('hook existe', () => {
    expect(fs.existsSync(path.join(SRC, 'hooks/useLoadingState.ts'))).toBe(true);
  });

  test('exporta useLoadingState e useRefreshable', () => {
    const content = fs.readFileSync(path.join(SRC, 'hooks/useLoadingState.ts'), 'utf-8');
    expect(content).toContain('export function useLoadingState');
    expect(content).toContain('export function useRefreshable');
  });
});

describe('Pull-to-refresh nas telas principais', () => {
  const mainScreens = ['FeedScreen', 'ApostasScreen', 'RankingScreen'];

  test.each(mainScreens)('%s tem RefreshControl', (screen) => {
    const content = fs.readFileSync(path.join(SRC, `screens/${screen}.tsx`), 'utf-8');
    expect(content).toContain('RefreshControl');
  });
});
