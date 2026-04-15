/**
 * FLUXO: Onboarding completo
 * Testa o caminho do usuario desde o primeiro acesso ate entrar no app
 */

jest.mock('react-native', () => ({ Platform: { OS: 'android', Version: 33 } }));

import { useNexaStore } from '../src/store/nexaStore';

beforeEach(() => {
  useNexaStore.setState(useNexaStore.getInitialState());
});

describe('Fluxo: Onboarding', () => {
  test('usuario comeca sem onboarding completo', () => {
    const state = useNexaStore.getState();
    expect(state.user.hasCompletedOnboarding).toBe(false);
  });

  test('completeOnboarding marca como concluido e da bonus', () => {
    const xpBefore = useNexaStore.getState().user.xp;
    const coinsBefore = useNexaStore.getState().user.coins;

    useNexaStore.getState().completeOnboarding();

    const state = useNexaStore.getState();
    expect(state.user.hasCompletedOnboarding).toBe(true);
    expect(state.user.xp).toBe(xpBefore + 100);
    expect(state.user.coins).toBe(coinsBefore + 200);
  });

  test('apos onboarding, addXP funciona', () => {
    useNexaStore.getState().completeOnboarding();
    const xpAfterOnboarding = useNexaStore.getState().user.xp;

    useNexaStore.getState().addXP(50);
    expect(useNexaStore.getState().user.xp).toBe(xpAfterOnboarding + 50);
  });
});
