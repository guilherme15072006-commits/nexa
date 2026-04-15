/**
 * FLUXO: Social (like, copy bet, follow)
 * Testa interacoes sociais do feed
 */

jest.mock('react-native', () => ({ Platform: { OS: 'android', Version: 33 } }));

import { useNexaStore } from '../src/store/nexaStore';

beforeEach(() => {
  useNexaStore.setState(useNexaStore.getInitialState());
});

describe('Fluxo: Like post', () => {
  test('curtir post incrementa likes e marca isLiked', () => {
    const feed = useNexaStore.getState().feed;
    const post = feed.find(p => !p.isLiked);
    if (!post) return;

    const likesBefore = post.likes;
    useNexaStore.getState().likePost(post.id);

    const after = useNexaStore.getState().feed.find(p => p.id === post.id)!;
    expect(after.isLiked).toBe(true);
    expect(after.likes).toBe(likesBefore + 1);
  });

  test('descurtir post decrementa likes', () => {
    const feed = useNexaStore.getState().feed;
    const post = feed.find(p => p.isLiked);
    if (!post) return;

    const likesBefore = post.likes;
    useNexaStore.getState().likePost(post.id);

    const after = useNexaStore.getState().feed.find(p => p.id === post.id)!;
    expect(after.isLiked).toBe(false);
    expect(after.likes).toBe(likesBefore - 1);
  });
});

describe('Fluxo: Copy bet', () => {
  test('copiar aposta incrementa copies e da +10 XP', () => {
    const feed = useNexaStore.getState().feed;
    const post = feed[0];
    const copiesBefore = post.copies;
    const xpBefore = useNexaStore.getState().user.xp;

    useNexaStore.getState().copyBet(post.id);

    const after = useNexaStore.getState().feed.find(p => p.id === post.id)!;
    expect(after.copies).toBe(copiesBefore + 1);
    expect(useNexaStore.getState().user.xp).toBe(xpBefore + 10);
  });
});

describe('Fluxo: Follow tipster', () => {
  test('seguir tipster que nao seguia', () => {
    const tipster = useNexaStore.getState().tipsters.find(t => !t.isFollowing);
    if (!tipster) return;

    useNexaStore.getState().followTipster(tipster.id);

    const after = useNexaStore.getState().tipsters.find(t => t.id === tipster.id)!;
    expect(after.isFollowing).toBe(true);
    expect(after.followers).toBe(tipster.followers + 1);
  });

  test('deixar de seguir tipster', () => {
    const tipster = useNexaStore.getState().tipsters.find(t => t.isFollowing);
    if (!tipster) return;

    useNexaStore.getState().followTipster(tipster.id);

    const after = useNexaStore.getState().tipsters.find(t => t.id === tipster.id)!;
    expect(after.isFollowing).toBe(false);
    expect(after.followers).toBe(tipster.followers - 1);
  });

  test('seguir adiciona ao following do usuario', () => {
    const tipster = useNexaStore.getState().tipsters.find(t => !t.isFollowing);
    if (!tipster) return;

    useNexaStore.getState().followTipster(tipster.id);
    expect(useNexaStore.getState().user.following).toContain(tipster.id);
  });
});

describe('Fluxo: Level up', () => {
  test('XP suficiente causa level up', () => {
    const state = useNexaStore.getState();
    const xpNeeded = state.user.xpToNext - state.user.xp;

    useNexaStore.getState().addXP(xpNeeded);

    const after = useNexaStore.getState();
    expect(after.user.level).toBe(state.user.level + 1);
    expect(after.pendingLevelUp).toBe(state.user.level + 1);
  });
});
