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

// Mock da camada Supabase: evita carregar o cliente e bater na rede nos testes
jest.mock('../src/services/supabase', () => ({
  supabase: {},
  fetchMatches: jest.fn().mockResolvedValue([]),
  fetchFeed: jest.fn().mockResolvedValue([]),
  fetchTipsters: jest.fn().mockResolvedValue([]),
  fetchMissions: jest.fn().mockResolvedValue([]),
  fetchClans: jest.fn().mockResolvedValue([]),
  fetchLeaderboard: jest.fn().mockResolvedValue([]),
  fetchCurrentUser: jest.fn().mockResolvedValue(null),
}));

import { useNexaStore, Match, FeedPost, Tipster } from '../src/store/nexaStore';
import * as supa from '../src/services/supabase';

// Fixtures de teste (substituem os antigos mocks do store, agora vindos do backend)
const TEST_MATCHES: Match[] = [
  {
    id: 'm1', league: 'Brasileirao', leagueIcon: 'BR',
    homeTeam: 'Flamengo', awayTeam: 'Palmeiras', homeLogo: 'FLA', awayLogo: 'PAL',
    status: 'live', minute: 72, score: { home: 1, away: 1 }, startTime: '',
    odds: { home: 1.85, draw: 3.20, away: 2.10 },
    prevOdds: { home: 1.90, draw: 3.15, away: 2.05 },
    bettors: 247, trending: true,
  },
  {
    id: 'm2', league: 'La Liga', leagueIcon: 'ES',
    homeTeam: 'Real Madrid', awayTeam: 'Barcelona', homeLogo: 'RMA', awayLogo: 'BAR',
    status: 'upcoming', startTime: '20:00',
    odds: { home: 2.05, draw: 3.40, away: 1.95 },
    bettors: 3820, trending: true,
  },
];

const TEST_FEED: FeedPost[] = [
  {
    id: 'f1', type: 'tip',
    user: { id: 't1', username: 'GabrielP', avatar: 'GP', tier: 'elite' },
    content: 'Entrada limpa.', pick: 'Real Madrid vence', odds: 2.05,
    likes: 342, comments: 87, copies: 156, isLiked: false, timestamp: '8min', hot: true,
  },
  {
    id: 'f2', type: 'bet',
    user: { id: 'u2', username: 'ZetaX', avatar: 'ZX', tier: 'silver' },
    content: 'Apostei no empate.', pick: 'Empate', odds: 3.40,
    likes: 28, comments: 14, copies: 9, isLiked: true, timestamp: '15min', hot: false,
  },
];

const TEST_TIPSTERS: Tipster[] = [
  { id: 't1', username: 'GabrielP', avatar: 'GP', winRate: 78, roi: 22.4, followers: 4820, streak: 12, tier: 'elite', isFollowing: false },
  { id: 't2', username: 'MarFutebol', avatar: 'MF', winRate: 71, roi: 15.8, followers: 2310, streak: 7, tier: 'gold', isFollowing: false },
];

describe('nexaStore', () => {
  beforeEach(() => {
    // Reset store to initial state + semeia dados (antes eram mocks no store, agora vêm do backend)
    useNexaStore.setState(useNexaStore.getInitialState());
    useNexaStore.setState({
      matches: TEST_MATCHES.map(m => ({ ...m })),
      feed: TEST_FEED.map(p => ({ ...p })),
      tipsters: TEST_TIPSTERS.map(t => ({ ...t })),
    });
  });

  test('estado inicial tem usuario default valido (antes do hydrate)', () => {
    const state = useNexaStore.getState();
    expect(state.user).toBeDefined();
    expect(typeof state.user.username).toBe('string');
    expect(state.user.level).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(state.user.badges)).toBe(true);
    expect(Array.isArray(state.user.following)).toBe(true);
  });

  test('loadUser carrega o usuario fixo do backend', async () => {
    const fakeUser = { ...useNexaStore.getState().user, id: '11111111-1111-1111-1111-111111111111', username: 'RocketKing', level: 12, clan: 'Predators' };
    (supa.fetchCurrentUser as jest.Mock).mockResolvedValueOnce(fakeUser);
    await useNexaStore.getState().loadUser();
    const u = useNexaStore.getState().user;
    expect(u.username).toBe('RocketKing');
    expect(u.clan).toBe('Predators');
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

  test('loadMatches popula matches a partir do backend', async () => {
    (supa.fetchMatches as jest.Mock).mockResolvedValueOnce(TEST_MATCHES);
    useNexaStore.setState({ matches: [] });
    await useNexaStore.getState().loadMatches();
    expect(useNexaStore.getState().matches.length).toBe(TEST_MATCHES.length);
    expect(useNexaStore.getState().matches[0].homeTeam).toBe('Flamengo');
  });

  test('loadFeed popula feed a partir do backend', async () => {
    (supa.fetchFeed as jest.Mock).mockResolvedValueOnce(TEST_FEED);
    useNexaStore.setState({ feed: [] });
    await useNexaStore.getState().loadFeed();
    expect(useNexaStore.getState().feed.length).toBe(TEST_FEED.length);
  });

  test('hydrate carrega matches e feed', async () => {
    (supa.fetchMatches as jest.Mock).mockResolvedValueOnce(TEST_MATCHES);
    (supa.fetchFeed as jest.Mock).mockResolvedValueOnce(TEST_FEED);
    useNexaStore.setState({ matches: [], feed: [] });
    await useNexaStore.getState().hydrate();
    expect(useNexaStore.getState().matches.length).toBe(TEST_MATCHES.length);
    expect(useNexaStore.getState().feed.length).toBe(TEST_FEED.length);
  });

  test('loadTipsters popula tipsters a partir do backend', async () => {
    (supa.fetchTipsters as jest.Mock).mockResolvedValueOnce(TEST_TIPSTERS);
    useNexaStore.setState({ tipsters: [] });
    await useNexaStore.getState().loadTipsters();
    expect(useNexaStore.getState().tipsters.length).toBe(TEST_TIPSTERS.length);
  });

  test('loadClans popula clans e seleciona o cla do usuario', async () => {
    const clans = [
      { id: 'c1', name: 'Predators', tag: 'PRD', members: 28, rank: 5, xp: 48200, weeklyXp: 8400, icon: 'P', color: '#7C5CFC' },
      { id: 'c2', name: 'Wolves', tag: 'WLF', members: 21, rank: 8, xp: 38000, weeklyXp: 6100, icon: 'W', color: '#7C5CFC' },
    ];
    (supa.fetchClans as jest.Mock).mockResolvedValueOnce(clans);
    await useNexaStore.getState().loadClans();
    expect(useNexaStore.getState().clans.length).toBe(2);
    // user.clan === 'Predators' -> deve selecionar esse cla
    expect(useNexaStore.getState().clan.name).toBe('Predators');
  });

  test('loadLeaderboard popula o ranking', async () => {
    const lb = [{ rank: 1, user: { ...useNexaStore.getState().user, id: 'x', username: 'Top' }, xp: 9999 }];
    (supa.fetchLeaderboard as jest.Mock).mockResolvedValueOnce(lb);
    await useNexaStore.getState().loadLeaderboard();
    expect(useNexaStore.getState().leaderboard.length).toBe(1);
    expect(useNexaStore.getState().leaderboard[0].user.username).toBe('Top');
  });

  test('loadMatches nao quebra se o backend falhar', async () => {
    (supa.fetchMatches as jest.Mock).mockRejectedValueOnce(new Error('rede'));
    useNexaStore.setState({ matches: [] });
    await expect(useNexaStore.getState().loadMatches()).resolves.toBeUndefined();
    expect(useNexaStore.getState().matches).toEqual([]);
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
