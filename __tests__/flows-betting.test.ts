/**
 * FLUXO: Apostar completo
 * Testa: selecionar odd > betslip abre > confirmar > XP ganho > missao progride
 */

jest.mock('react-native', () => ({ Platform: { OS: 'android', Version: 33 } }));

import { useNexaStore } from '../src/store/nexaStore';

beforeEach(() => {
  useNexaStore.setState(useNexaStore.getInitialState());
});

describe('Fluxo: Apostar', () => {
  test('selecionar odd registra no selectedOdds', () => {
    const matches = useNexaStore.getState().matches;
    const liveMatch = matches.find(m => m.status === 'live');
    if (!liveMatch) return;

    useNexaStore.getState().selectOdd(liveMatch.id, 'home');
    expect(useNexaStore.getState().selectedOdds[liveMatch.id]).toBe('home');
  });

  test('trocar selecao de odd funciona', () => {
    const matches = useNexaStore.getState().matches;
    const match = matches[0];

    useNexaStore.getState().selectOdd(match.id, 'home');
    expect(useNexaStore.getState().selectedOdds[match.id]).toBe('home');

    useNexaStore.getState().selectOdd(match.id, 'draw');
    expect(useNexaStore.getState().selectedOdds[match.id]).toBe('draw');
  });

  test('placeBet incrementa betsPlaced', () => {
    const before = useNexaStore.getState().betsPlaced;
    useNexaStore.getState().placeBet();
    expect(useNexaStore.getState().betsPlaced).toBe(before + 1);
  });

  test('placeBet da +20 XP', () => {
    const xpBefore = useNexaStore.getState().user.xp;
    useNexaStore.getState().placeBet();
    expect(useNexaStore.getState().user.xp).toBe(xpBefore + 20);
  });

  test('3 apostas revelam missao oculta', () => {
    useNexaStore.getState().placeBet();
    useNexaStore.getState().placeBet();
    useNexaStore.getState().placeBet();

    const missions = useNexaStore.getState().missions;
    const hidden = missions.find(m => m.type === 'hidden');
    if (hidden) {
      expect(hidden.revealed).toBe(true);
      expect(hidden.completed).toBe(true);
    }
  });

  test('apostar multiplas vezes acumula XP', () => {
    const xpStart = useNexaStore.getState().user.xp;
    useNexaStore.getState().placeBet();
    useNexaStore.getState().placeBet();
    useNexaStore.getState().placeBet();
    // 3 bets * 20 XP = 60 XP
    expect(useNexaStore.getState().user.xp).toBe(xpStart + 60);
  });
});
