import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, Tipster, TipsterTier } from '../store/nexaStore';
import { SmoothEntry, TapScale } from '../components/LiveComponents';
import { Card, StatBox } from '../components/ui';
import { hapticLight, hapticMedium, hapticSuccess } from '../services/haptics';

// ─── Types ──────────────────────────────────────────────────────────────────

type RouteParams = { TipsterProfile: { tipsterId: string } };

const TIER_COLORS: Record<TipsterTier, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: colors.gold,
  elite: colors.primary,
};

const TIER_LABELS: Record<TipsterTier, string> = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
  elite: 'Elite',
};

// Mock performance data (last 14 picks)
const MOCK_PERFORMANCE: ('won' | 'lost' | 'pending')[] = [
  'won', 'won', 'lost', 'won', 'won', 'won', 'lost', 'won',
  'pending', 'won', 'lost', 'won', 'won', 'pending',
];

// Mock recent picks
const MOCK_RECENT_PICKS = [
  { id: 'rp1', match: 'Arsenal vs Liverpool', side: 'away' as const, odds: 1.85, result: 'pending' as const, league: 'Premier League' },
  { id: 'rp2', match: 'Barcelona vs Atlético Madrid', side: 'home' as const, odds: 1.72, result: 'won' as const, league: 'La Liga' },
  { id: 'rp3', match: 'Flamengo vs Corinthians', side: 'home' as const, odds: 1.45, result: 'won' as const, league: 'Brasileirão' },
  { id: 'rp4', match: 'Napoli vs Roma', side: 'draw' as const, odds: 3.30, result: 'lost' as const, league: 'Serie A' },
  { id: 'rp5', match: 'PSG vs Lyon', side: 'home' as const, odds: 1.28, result: 'won' as const, league: 'Ligue 1' },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function TipsterProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'TipsterProfile'>>();
  const { tipsterId } = route.params;

  const tipster = useNexaStore((s) => s.tipsters.find((t) => t.id === tipsterId));
  const followTipster = useNexaStore((s) => s.followTipster);
  const [copyNextBet, setCopyNextBet] = useState(false);

  if (!tipster) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Tipster no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tierColor = TIER_COLORS[tipster.tier];
  const tierLabel = TIER_LABELS[tipster.tier];
  const isEliteOrGold = tipster.tier === 'elite' || tipster.tier === 'gold';

  const handleFollow = () => {
    hapticMedium();
    followTipster(tipster.id);
  };

  const handleCopyToggle = () => {
    hapticLight();
    setCopyNextBet(!copyNextBet);
  };

  const handleGoBack = () => {
    hapticLight();
    navigation.goBack();
  };

  const resultColor = (result: 'won' | 'lost' | 'pending') => {
    if (result === 'won') return colors.green;
    if (result === 'lost') return colors.red;
    return colors.orange;
  };

  const resultLabel = (result: 'won' | 'lost' | 'pending') => {
    if (result === 'won') return 'GREEN';
    if (result === 'lost') return 'RED';
    return 'PENDENTE';
  };

  const sideLabel = (side: 'home' | 'draw' | 'away') => {
    if (side === 'home') return 'Casa';
    if (side === 'draw') return 'Empate';
    return 'Fora';
  };

  // Influence score (mock)
  const influenceScore = Math.round(
    tipster.winRate * 30 + tipster.roi * 100 + Math.min(tipster.followers / 1000, 20) + tipster.streak * 2
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <SmoothEntry delay={0}>
          <View style={styles.header}>
            <TapScale onPress={handleGoBack}>
              <View style={styles.backButton}>
                <Text style={styles.backIcon}>{'<'}</Text>
              </View>
            </TapScale>
            <Text style={styles.headerTitle}>Perfil do Tipster</Text>
            <View style={styles.backButton} />
          </View>
        </SmoothEntry>

        {/* Avatar + Info */}
        <SmoothEntry delay={100}>
          <View style={styles.profileSection}>
            <View style={[styles.avatarRing, { borderColor: tierColor }]}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>
                  {tipster.username.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.username}>{tipster.username}</Text>
            <View style={[styles.tierBadge, { backgroundColor: tierColor + '20' }]}>
              <Text style={[styles.tierText, { color: tierColor }]}>{tierLabel}</Text>
            </View>
          </View>
        </SmoothEntry>

        {/* Stats Row */}
        <SmoothEntry delay={200}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(tipster.winRate * 100).toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: tipster.roi >= 0 ? colors.green : colors.red }]}>
                {tipster.roi >= 0 ? '+' : ''}{(tipster.roi * 100).toFixed(0)}%
              </Text>
              <Text style={styles.statLabel}>ROI</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {tipster.followers >= 1000
                  ? `${(tipster.followers / 1000).toFixed(1)}k`
                  : tipster.followers}
              </Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.orange }]}>
                {tipster.streak}
              </Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </SmoothEntry>

        {/* Follow Button */}
        <SmoothEntry delay={300}>
          <TapScale onPress={handleFollow}>
            <View
              style={[
                styles.followButton,
                tipster.isFollowing && styles.followingButton,
              ]}
            >
              <Text
                style={[
                  styles.followButtonText,
                  tipster.isFollowing && styles.followingButtonText,
                ]}
              >
                {tipster.isFollowing ? 'Seguindo' : 'Seguir'}
              </Text>
            </View>
          </TapScale>
        </SmoothEntry>

        {/* Performance Chart */}
        <SmoothEntry delay={400}>
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Desempenho (14 picks)</Text>
            <View style={styles.chartContainer}>
              {MOCK_PERFORMANCE.map((result, index) => {
                const barColor = resultColor(result);
                const barHeight = result === 'pending' ? 20 : result === 'won' ? 40 : 28;
                return (
                  <View key={index} style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor: barColor,
                          height: barHeight,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
                <Text style={styles.legendText}>Green</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
                <Text style={styles.legendText}>Red</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.orange }]} />
                <Text style={styles.legendText}>Pendente</Text>
              </View>
            </View>
          </Card>
        </SmoothEntry>

        {/* Recent Picks */}
        <SmoothEntry delay={500}>
          <Card style={styles.picksCard}>
            <Text style={styles.sectionTitle}>Picks Recentes</Text>
            {MOCK_RECENT_PICKS.map((pick) => (
              <View key={pick.id} style={styles.pickRow}>
                <View style={styles.pickInfo}>
                  <Text style={styles.pickLeague}>{pick.league}</Text>
                  <Text style={styles.pickMatch}>{pick.match}</Text>
                  <View style={styles.pickMeta}>
                    <Text style={styles.pickSide}>{sideLabel(pick.side)}</Text>
                    <Text style={styles.pickOdds}>@{pick.odds.toFixed(2)}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.resultBadge,
                    { backgroundColor: resultColor(pick.result) + '20' },
                  ]}
                >
                  <Text
                    style={[styles.resultBadgeText, { color: resultColor(pick.result) }]}
                  >
                    {resultLabel(pick.result)}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </SmoothEntry>

        {/* Copy Next Bet Toggle */}
        <SmoothEntry delay={600}>
          <TapScale onPress={handleCopyToggle}>
            <Card style={styles.copyCard}>
              <View style={styles.copyContent}>
                <View style={styles.copyTextWrap}>
                  <Text style={styles.copyTitle}>Copiar proxima aposta</Text>
                  <Text style={styles.copySubtitle}>
                    Receba uma notificacao quando {tipster.username} fizer uma pick
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggle,
                    copyNextBet && styles.toggleActive,
                  ]}
                >
                  <View
                    style={[
                      styles.toggleKnob,
                      copyNextBet && styles.toggleKnobActive,
                    ]}
                  />
                </View>
              </View>
            </Card>
          </TapScale>
        </SmoothEntry>

        {/* Creator Earnings (elite/gold only) */}
        {isEliteOrGold && (
          <SmoothEntry delay={700}>
            <Card style={styles.earningsCard}>
              <Text style={styles.sectionTitle}>Ganhos do Criador</Text>
              <View style={styles.earningsRow}>
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsValue}>
                    R$ {(tipster.followers * 0.012).toFixed(2)}
                  </Text>
                  <Text style={styles.earningsLabel}>Ganhos Semanais</Text>
                </View>
                <View style={styles.earningsItem}>
                  <Text style={styles.earningsValue}>
                    {Math.round(tipster.followers * 0.04)}
                  </Text>
                  <Text style={styles.earningsLabel}>Total de Copias</Text>
                </View>
              </View>
            </Card>
          </SmoothEntry>
        )}

        {/* Influence Score */}
        <SmoothEntry delay={isEliteOrGold ? 800 : 700}>
          <Card style={styles.influenceCard}>
            <View style={styles.influenceContent}>
              <View>
                <Text style={styles.sectionTitle}>Indice de Influencia</Text>
                <Text style={styles.influenceDesc}>
                  Baseado em WR, ROI, seguidores e streak
                </Text>
              </View>
              <View style={styles.influenceBadge}>
                <Text style={styles.influenceScore}>{influenceScore}</Text>
              </View>
            </View>
            {/* Score bar */}
            <View style={styles.influenceBarBg}>
              <View
                style={[
                  styles.influenceBarFill,
                  { width: `${Math.min(influenceScore, 100)}%` },
                ]}
              />
            </View>
          </Card>
        </SmoothEntry>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  headerTitle: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    fontSize: 17,
  },

  // Profile
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.display,
    color: colors.textPrimary,
    fontSize: 32,
  },
  username: {
    ...typography.display,
    color: colors.textPrimary,
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  tierBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  tierText: {
    ...typography.bodySemiBold,
    fontSize: 13,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.monoBold,
    color: colors.textPrimary,
    fontSize: 18,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },

  // Follow
  followButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followButtonText: {
    ...typography.bodySemiBold,
    color: '#fff',
    fontSize: 16,
  },
  followingButtonText: {
    color: colors.primary,
  },

  // Chart
  chartCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 50,
    marginBottom: spacing.sm,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  bar: {
    width: '80%',
    borderRadius: 3,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
  },

  // Picks
  picksCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  pickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  pickInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  pickLeague: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 2,
  },
  pickMatch: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 4,
  },
  pickMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pickSide: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 12,
  },
  pickOdds: {
    ...typography.mono,
    color: colors.primary,
    fontSize: 12,
  },
  resultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  resultBadgeText: {
    ...typography.monoBold,
    fontSize: 10,
  },

  // Copy
  copyCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  copyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyTextWrap: {
    flex: 1,
    marginRight: spacing.md,
  },
  copyTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: 4,
  },
  copySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 12,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textMuted,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
  },

  // Earnings
  earningsCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  earningsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  earningsItem: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  earningsValue: {
    ...typography.monoBold,
    color: colors.green,
    fontSize: 18,
    marginBottom: 4,
  },
  earningsLabel: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
  },

  // Influence
  influenceCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  influenceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  influenceDesc: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  influenceBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  influenceScore: {
    ...typography.monoBold,
    color: colors.primary,
    fontSize: 22,
  },
  influenceBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.bgElevated,
    overflow: 'hidden',
  },
  influenceBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
