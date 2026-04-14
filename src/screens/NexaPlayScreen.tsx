import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { useNexaStore, type MiniGame } from '../store/nexaStore';
import { Card, SectionHeader } from '../components/ui';
import { TapScale, SmoothEntry, FloatingXP } from '../components/LiveComponents';
import { hapticHeavy, hapticLight } from '../services/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 2 - CARD_GAP) / 2;

// ─── Countdown Timer ──────────────────────────────────────────────────────────

function CountdownTimer() {
  const [seconds, setSeconds] = useState(7 * 3600 + 23 * 60 + 45); // 7h 23m 45s

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return (
    <Text style={styles.countdown}>
      {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:
      {String(s).padStart(2, '0')}
    </Text>
  );
}

// ─── Daily Challenge Card ─────────────────────────────────────────────────────

function DailyChallenge({
  game,
  onPlay,
  userLevel,
}: {
  game: MiniGame;
  onPlay: (id: string) => void;
  userLevel: number;
}) {
  const locked = userLevel < game.unlockLevel;

  return (
    <SmoothEntry delay={0}>
      <Card style={styles.dailyCard}>
        <View style={styles.dailyBadgeRow}>
          <View style={styles.dailyBadge}>
            <Text style={styles.dailyBadgeText}>DESAFIO DIARIO</Text>
          </View>
          <View style={styles.doubleXpBadge}>
            <Text style={styles.doubleXpText}>2x XP</Text>
          </View>
        </View>

        <View style={styles.dailyContent}>
          <Text style={styles.dailyIcon}>{game.icon}</Text>
          <View style={styles.dailyInfo}>
            <Text style={styles.dailyName}>{game.name}</Text>
            <Text style={styles.dailyDesc}>{game.description}</Text>
            <View style={styles.dailyRewards}>
              <Text style={styles.rewardText}>+{game.xpReward * 2} XP</Text>
              <Text style={styles.rewardSep}>·</Text>
              <Text style={styles.rewardCoins}>+{game.coinsReward} coins</Text>
            </View>
          </View>
        </View>

        <View style={styles.dailyFooter}>
          <View style={styles.timerRow}>
            <Text style={styles.timerLabel}>Expira em</Text>
            <CountdownTimer />
          </View>
          <TapScale onPress={() => !locked && onPlay(game.id)}>
            <View style={[styles.playBtnLarge, locked && styles.playBtnLocked]}>
              <Text style={[styles.playBtnLargeText, locked && styles.playBtnLockedText]}>
                {locked ? `Nivel ${game.unlockLevel}` : 'JOGAR'}
              </Text>
            </View>
          </TapScale>
        </View>
      </Card>
    </SmoothEntry>
  );
}

// ─── Game Card ────────────────────────────────────────────────────────────────

function GameCard({
  game,
  index,
  onPlay,
  userLevel,
}: {
  game: MiniGame;
  index: number;
  onPlay: (id: string) => void;
  userLevel: number;
}) {
  const locked = userLevel < game.unlockLevel;

  return (
    <SmoothEntry delay={index * 80 + 200}>
      <View style={styles.gameCard}>
        <Card style={styles.gameCardInner}>
          {/* Icon */}
          <Text style={styles.gameIcon}>{game.icon}</Text>

          {/* Name */}
          <Text style={styles.gameName} numberOfLines={1}>
            {game.name}
          </Text>

          {/* Description */}
          <Text style={styles.gameDesc} numberOfLines={2}>
            {game.description}
          </Text>

          {/* Rewards */}
          <View style={styles.gameRewards}>
            <View style={styles.gameRewardItem}>
              <Text style={styles.gameRewardLabel}>XP</Text>
              <Text style={styles.gameRewardValue}>+{game.xpReward}</Text>
            </View>
            <View style={styles.gameRewardDivider} />
            <View style={styles.gameRewardItem}>
              <Text style={styles.gameRewardLabel}>Coins</Text>
              <Text style={styles.gameRewardCoins}>+{game.coinsReward}</Text>
            </View>
          </View>

          {/* Played badge / High score */}
          {game.played && (
            <View style={styles.playedBadge}>
              <Text style={styles.playedText}>
                Recorde: {game.highScore.toLocaleString()} pts
              </Text>
            </View>
          )}

          {/* Play button or locked */}
          {locked ? (
            <View style={styles.lockedContainer}>
              <Text style={styles.lockedIcon}>🔒</Text>
              <Text style={styles.lockedText}>
                Nivel {game.unlockLevel} necessario
              </Text>
            </View>
          ) : (
            <TapScale onPress={() => onPlay(game.id)}>
              <View style={styles.playBtn}>
                <Text style={styles.playBtnText}>JOGAR</Text>
              </View>
            </TapScale>
          )}
        </Card>
      </View>
    </SmoothEntry>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function NexaPlayScreen() {
  const miniGames = useNexaStore((s) => s.miniGames);
  const userLevel = useNexaStore((s) => s.user.level);
  const playMiniGame = useNexaStore((s) => s.playMiniGame);

  const [floatingXP, setFloatingXP] = useState<{ amount: number; visible: boolean }>({
    amount: 0,
    visible: false,
  });

  const handlePlay = useCallback(
    (gameId: string) => {
      const game = miniGames.find((g) => g.id === gameId);
      if (!game) return;
      hapticHeavy();
      playMiniGame(gameId);
      setFloatingXP({ amount: game.xpReward, visible: true });
    },
    [miniGames, playMiniGame],
  );

  // Daily challenge = first unlocked, unplayed game (or first game)
  const dailyGame =
    miniGames.find((g) => !g.played && userLevel >= g.unlockLevel) || miniGames[0];
  const otherGames = miniGames.filter((g) => g.id !== dailyGame.id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Floating XP */}
      <FloatingXP
        amount={floatingXP.amount}
        visible={floatingXP.visible}
        onDone={() => setFloatingXP((s) => ({ ...s, visible: false }))}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>NEXA Play 🎮</Text>
          <Text style={styles.headerSubtitle}>
            Jogue, ganhe XP e suba de nivel
          </Text>
        </View>

        {/* Daily Challenge */}
        <SectionHeader title="Desafio do Dia" />
        <DailyChallenge
          game={dailyGame}
          onPlay={handlePlay}
          userLevel={userLevel}
        />

        {/* Games Grid */}
        <SectionHeader title="Todos os Jogos" style={styles.gamesHeader} />
        <View style={styles.gamesGrid}>
          {otherGames.map((game, i) => (
            <GameCard
              key={game.id}
              game={game}
              index={i}
              onPlay={handlePlay}
              userLevel={userLevel}
            />
          ))}
        </View>

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Header
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.display,
    fontSize: 28,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Daily Challenge
  dailyCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dailyBadgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dailyBadge: {
    backgroundColor: 'rgba(124,92,252,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  dailyBadgeText: {
    ...typography.monoBold,
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 1,
  },
  doubleXpBadge: {
    backgroundColor: 'rgba(0,200,150,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  doubleXpText: {
    ...typography.monoBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 0.5,
  },
  dailyContent: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  dailyIcon: {
    fontSize: 48,
  },
  dailyInfo: {
    flex: 1,
  },
  dailyName: {
    ...typography.bodySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  dailyDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  dailyRewards: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  rewardText: {
    ...typography.monoBold,
    fontSize: 12,
    color: colors.green,
  },
  rewardSep: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  rewardCoins: {
    ...typography.monoBold,
    fontSize: 12,
    color: colors.gold,
  },
  dailyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timerLabel: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  countdown: {
    ...typography.monoBold,
    fontSize: 14,
    color: colors.orange,
  },
  playBtnLarge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
  },
  playBtnLargeText: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  playBtnLocked: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playBtnLockedText: {
    color: colors.textMuted,
    letterSpacing: 0,
  },

  // Games Grid
  gamesHeader: {
    marginTop: spacing.lg,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  gameCard: {
    width: CARD_WIDTH,
  },
  gameCardInner: {
    padding: spacing.md,
    alignItems: 'center',
    minHeight: 220,
  },
  gameIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  gameName: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  gameDesc: {
    ...typography.body,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: spacing.sm,
  },
  gameRewards: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  gameRewardItem: {
    alignItems: 'center',
  },
  gameRewardLabel: {
    ...typography.body,
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 2,
  },
  gameRewardValue: {
    ...typography.monoBold,
    fontSize: 12,
    color: colors.green,
  },
  gameRewardDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  gameRewardCoins: {
    ...typography.monoBold,
    fontSize: 12,
    color: colors.gold,
  },

  // Played badge
  playedBadge: {
    backgroundColor: 'rgba(0,200,150,0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  playedText: {
    ...typography.mono,
    fontSize: 10,
    color: colors.green,
  },

  // Play button
  playBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
  },
  playBtnText: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // Locked
  lockedContainer: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 'auto',
  },
  lockedIcon: {
    fontSize: 20,
  },
  lockedText: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },

  bottomSpacer: {
    height: spacing.xxl,
  },
});
