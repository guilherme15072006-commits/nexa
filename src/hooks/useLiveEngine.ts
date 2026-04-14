import { useEffect, useRef } from 'react';
import { useNexaStore } from '../store/nexaStore';

const SOCIAL_EVENTS = [
  'AcePredict acabou de copiar uma aposta',
  'KingBet fez 3 picks verdes seguidos',
  'StatMaster subiu para o top 5',
  '12 apostadores entraram no jogo Flamengo × Corinthians',
  'ValueHunt acabou de seguir você',
  'SharkBets completou a missão Streak Master',
  '47 pessoas apostaram no Real Madrid nos últimos 2min',
];

export function useLiveEngine() {
  const tickLiveStats = useNexaStore((s) => s.tickLiveStats);
  const pushToast = useNexaStore((s) => s.pushToast);
  const injectNarrative = useNexaStore((s) => s.injectNarrative);
  const tickPredictions = useNexaStore((s) => s.tickPredictions);
  const tickSeason = useNexaStore((s) => s.tickSeason);
  const tickPowerUps = useNexaStore((s) => s.tickPowerUps);
  const scoreFeed = useNexaStore((s) => s.scoreFeed);
  const tickViewers = useNexaStore((s) => s.tickViewers);
  const injectChatMessage = useNexaStore((s) => s.injectChatMessage);
  const matches = useNexaStore((s) => s.matches);

  const timersRef = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => {
    // ── Existing intervals ───────────────────────────────────────────────

    // Tick live stats every 4s
    const statsTick = setInterval(tickLiveStats, 4000);

    // Push social toast every 8-15s
    const toastTick = setInterval(() => {
      const msg = SOCIAL_EVENTS[Math.floor(Math.random() * SOCIAL_EVENTS.length)];
      pushToast(msg);
    }, 8000 + Math.random() * 7000);

    // ── New Phase 3 intervals ────────────────────────────────────────────

    // Inject narrative card every 30s
    const narrativeTick = setInterval(injectNarrative, 30000);

    // Fluctuate collective predictions every 5s
    const predictionsTick = setInterval(tickPredictions, 5000);

    // Season countdown every 1s
    const seasonTick = setInterval(tickSeason, 1000);

    // Remove expired power-ups every 10s
    const powerUpsTick = setInterval(tickPowerUps, 10000);

    // Re-rank feed every 15s
    const feedTick = setInterval(scoreFeed, 15000);

    // Tick live stream viewers every 6s
    const viewersTick = setInterval(tickViewers, 6000);

    // Inject chat messages for live matches every 4s
    const liveMatchIds = matches
      .filter((m) => m.status === 'live')
      .map((m) => m.id);

    const chatTicks = liveMatchIds.map((matchId) =>
      setInterval(() => injectChatMessage(matchId), 4000),
    );

    // ── Store all timers for cleanup ─────────────────────────────────────

    timersRef.current = [
      statsTick,
      toastTick,
      narrativeTick,
      predictionsTick,
      seasonTick,
      powerUpsTick,
      feedTick,
      viewersTick,
      ...chatTicks,
    ];

    return () => {
      timersRef.current.forEach(clearInterval);
      timersRef.current = [];
    };
  }, [
    tickLiveStats,
    pushToast,
    injectNarrative,
    tickPredictions,
    tickSeason,
    tickPowerUps,
    scoreFeed,
    tickViewers,
    injectChatMessage,
    matches,
  ]);
}
