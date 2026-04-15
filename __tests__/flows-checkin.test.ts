/**
 * FLUXO: Check-in diario
 * Testa: streak aumenta, XP ganha, coins ganha, nao pode repetir
 */

jest.mock('react-native', () => ({ Platform: { OS: 'android', Version: 33 } }));

import { useNexaStore } from '../src/store/nexaStore';

beforeEach(() => {
  useNexaStore.setState(useNexaStore.getInitialState());
});

describe('Fluxo: Check-in diario', () => {
  test('checkin nao feito inicialmente', () => {
    expect(useNexaStore.getState().checkinClaimed).toBe(false);
  });

  test('claimCheckin incrementa streak', () => {
    const streakBefore = useNexaStore.getState().user.streak;
    useNexaStore.getState().claimCheckin();
    expect(useNexaStore.getState().user.streak).toBe(streakBefore + 1);
  });

  test('claimCheckin da +50 XP', () => {
    const xpBefore = useNexaStore.getState().user.xp;
    useNexaStore.getState().claimCheckin();
    expect(useNexaStore.getState().user.xp).toBe(xpBefore + 50);
  });

  test('claimCheckin da +100 coins', () => {
    const coinsBefore = useNexaStore.getState().user.coins;
    useNexaStore.getState().claimCheckin();
    expect(useNexaStore.getState().user.coins).toBe(coinsBefore + 100);
  });

  test('apos checkin, checkinClaimed = true', () => {
    useNexaStore.getState().claimCheckin();
    expect(useNexaStore.getState().checkinClaimed).toBe(true);
  });

  test('pendingStreak e setado apos checkin', () => {
    useNexaStore.getState().claimCheckin();
    expect(useNexaStore.getState().pendingStreak).not.toBeNull();
  });
});
