/**
 * Testes do nexaStore — verifica que actions funcionam corretamente
 */

// Mock react-native modules
jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 33 },
}));

// Mock analytics (evita side effects)
jest.mock('../src/services/analytics', () => ({
  analytics: {
    track: jest.fn(),
    trackScreenView: jest.fn(),
    init: jest.fn(),
    identify: jest.fn(),
    flush: jest.fn(),
    endSession: jest.fn(),
  },
  trackBet: jest.fn(),
  trackXPGain: jest.fn(),
  trackOddsChange: jest.fn(),
  trackUserState: jest.fn(),
}));

jest.mock('../src/services/linear', () => ({
  linear: {
    reportResponsibleGaming: jest.fn(),
    reportBug: jest.fn(),
  },
}));

import { useNexaStore } from '../src/store/nexaStore';

describe('nexaStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useNexaStore.setState(useNexaStore.getInitialState());
  });

  test('estado inicial tem usuario valido', () => {
    const state = useNexaStore.getState();
    expect(state.user).toBeDefined();
    expect(state.user.id).toBe('u1');
    expect(state.user.username).toBe('RocketKing');
    expect(state.user.level).toBeGreaterThanOrEqual(1);
  });

  test('addXP incrementa XP do usuario', () => {
    const before = useNexaStore.getState().user.xp;
    useNexaStore.getState().addXP(100);
    const after = useNexaStore.getState().user.xp;
    expect(after).toBe(before + 100);
  });

  test('claimCheckin incrementa streak, xp e coins', () => {
    const before = useNexaStore.getState().user;
    useNexaStore.getState().claimCheckin();
    const after = useNexaStore.getState().user;
    expect(after.streak).toBe(before.streak + 1);
    expect(after.xp).toBe(before.xp + 50);
    expect(after.coins).toBe(before.coins + 100);
  });

  test('likePost alterna isLiked e likes count', () => {
    const feed = useNexaStore.getState().feed;
    const post = feed[0];
    const likesBefore = post.likes;

    useNexaStore.getState().likePost(post.id);
    const after = useNexaStore.getState().feed.find(p => p.id === post.id)!;
    expect(after.isLiked).toBe(!post.isLiked);
    expect(after.likes).toBe(post.isLiked ? likesBefore - 1 : likesBefore + 1);
  });

  test('copyBet incrementa copies e dá XP', () => {
    const feed = useNexaStore.getState().feed;
    const post = feed[0];
    const xpBefore = useNexaStore.getState().user.xp;

    useNexaStore.getState().copyBet(post.id);
    const after = useNexaStore.getState().feed.find(p => p.id === post.id)!;
    expect(after.copies).toBe(post.copies + 1);
    expect(useNexaStore.getState().user.xp).toBe(xpBefore + 10);
  });

  test('followTipster alterna isFollowing', () => {
    const tipster = useNexaStore.getState().tipsters[0];
    const wasFol = tipster.isFollowing;

    useNexaStore.getState().followTipster(tipster.id);
    const after = useNexaStore.getState().tipsters.find(t => t.id === tipster.id)!;
    expect(after.isFollowing).toBe(!wasFol);
  });

  test('selectOdd registra selecao e popula betslip', () => {
    const match = useNexaStore.getState().matches[0];
    useNexaStore.getState().selectOdd(match.id, 'home');

    const state = useNexaStore.getState();
    expect(state.selectedOdds[match.id]).toBe('home');
    expect(state.betslip.length).toBe(1);
    expect(state.betslipVisible).toBe(true);
  });

  test('placeBet limpa betslip e da XP', () => {
    const match = useNexaStore.getState().matches[0];
    useNexaStore.getState().selectOdd(match.id, 'home');
    const xpBefore = useNexaStore.getState().user.xp;

    useNexaStore.getState().placeBet();
    const state = useNexaStore.getState();
    expect(state.betslip.length).toBe(0);
    expect(state.betslipVisible).toBe(false);
    expect(state.user.xp).toBe(xpBefore + 20);
  });

  test('completeOnboarding seta isOnboarded', () => {
    expect(useNexaStore.getState().isOnboarded).toBe(false);
    useNexaStore.getState().completeOnboarding();
    expect(useNexaStore.getState().isOnboarded).toBe(true);
  });

  test('setActiveTab muda aba', () => {
    useNexaStore.getState().setActiveTab('apostas');
    expect(useNexaStore.getState().activeTab).toBe('apostas');
  });

  test('simulateOddsChange muda odds dos jogos ao vivo', () => {
    const before = useNexaStore.getState().matches.find(m => m.status === 'live');
    if (!before) return;
    const oddsBefore = { ...before.odds };

    useNexaStore.getState().simulateOddsChange();
    const after = useNexaStore.getState().matches.find(m => m.id === before.id)!;
    // prevOdds deve ser setado
    expect(after.prevOdds).toBeDefined();
  });
});
