import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Reanimated, {
  FadeInDown,
  FadeOutRight,
  LinearTransition,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, PlacedBet } from '../store/nexaStore';
import { SmoothEntry, TapScale } from '../components/LiveComponents';
import { Card } from '../components/ui';
import { SkeletonList } from '../components/SkeletonLoader';
import { hapticLight } from '../services/haptics';

// ─── Types ──────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'won' | 'lost' | 'pending';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'won', label: 'Ganhas' },
  { key: 'lost', label: 'Perdidas' },
  { key: 'pending', label: 'Pendentes' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const sideLabel = (side: 'home' | 'draw' | 'away') => {
  if (side === 'home') return 'Casa';
  if (side === 'draw') return 'Empate';
  return 'Fora';
};

const resultColor = (result: PlacedBet['result']) => {
  if (result === 'won') return colors.green;
  if (result === 'lost') return colors.red;
  return colors.orange;
};

const resultLabel = (result: PlacedBet['result']) => {
  if (result === 'won') return 'GREEN';
  if (result === 'lost') return 'RED';
  return 'PENDENTE';
};

const formatDate = (isoString: string) => {
  try {
    const d = new Date(isoString);
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const month = months[d.getMonth()];
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${hours}:${mins}`;
  } catch {
    return isoString;
  }
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function BetHistoryScreen() {
  const navigation = useNavigation();
  const isLoading = useNexaStore((s) => s.isLoading);
  const betHistory = useNexaStore((s) => s.betHistory);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filteredBets = useMemo(() => {
    if (activeFilter === 'all') return betHistory;
    return betHistory.filter((b) => b.result === activeFilter);
  }, [betHistory, activeFilter]);

  // Summary stats
  const summary = useMemo(() => {
    const total = betHistory.length;
    const totalProfit = betHistory.reduce((sum, b) => sum + b.profit, 0);
    const wonBets = betHistory.filter((b) => b.result === 'won');
    const bestOdds = wonBets.length > 0
      ? Math.max(...wonBets.map((b) => b.odds))
      : 0;
    return { total, totalProfit, bestOdds };
  }, [betHistory]);

  const handleGoBack = useCallback(() => {
    hapticLight();
    navigation.goBack();
  }, [navigation]);

  const handleFilterChange = useCallback((tab: FilterTab) => {
    hapticLight();
    setActiveFilter(tab);
  }, []);

  const renderBetItem = useCallback(
    ({ item, index }: { item: PlacedBet; index: number }) => (
      <Reanimated.View
        entering={FadeInDown.delay(index * 50).duration(300).springify()}
        exiting={FadeOutRight.duration(200)}
        layout={LinearTransition.springify().damping(16).stiffness(120)}
      >
        <View style={styles.betCard}>
          {/* League Pill */}
          <View style={styles.leaguePill}>
            <Text style={styles.leagueText}>{item.league}</Text>
          </View>

          {/* Teams */}
          <Text style={styles.teamsText}>
            {item.homeTeam} vs {item.awayTeam}
          </Text>

          {/* Details Row */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Lado</Text>
              <Text style={styles.detailValue}>{sideLabel(item.side)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Odds</Text>
              <Text style={[styles.detailValue, styles.oddsValue]}>
                @{item.odds.toFixed(2)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Stake</Text>
              <Text style={styles.detailValue}>R$ {item.stake.toFixed(2)}</Text>
            </View>
          </View>

          {/* Result + Profit Row */}
          <View style={styles.resultRow}>
            <View
              style={[
                styles.resultBadge,
                { backgroundColor: resultColor(item.result) + '20' },
              ]}
            >
              <Text
                style={[styles.resultBadgeText, { color: resultColor(item.result) }]}
              >
                {resultLabel(item.result)}
              </Text>
            </View>

            {item.result !== 'pending' && (
              <Text
                style={[
                  styles.profitText,
                  { color: item.profit >= 0 ? colors.green : colors.red },
                ]}
              >
                {item.profit >= 0 ? '+' : ''}R$ {item.profit.toFixed(2)}
              </Text>
            )}

            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </Reanimated.View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: PlacedBet) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <View>
        {/* Summary Card */}
        <SmoothEntry delay={0}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{summary.total}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        summary.totalProfit >= 0 ? colors.green : colors.red,
                    },
                  ]}
                >
                  {summary.totalProfit >= 0 ? '+' : ''}R${' '}
                  {summary.totalProfit.toFixed(2)}
                </Text>
                <Text style={styles.summaryLabel}>Lucro</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.gold }]}>
                  {summary.bestOdds > 0 ? `@${summary.bestOdds.toFixed(2)}` : '--'}
                </Text>
                <Text style={styles.summaryLabel}>Maior odd</Text>
              </View>
            </View>
          </Card>
        </SmoothEntry>

        {/* Filter Tabs */}
        <SmoothEntry delay={100}>
          <View style={styles.filterRow}>
            {FILTER_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  activeFilter === tab.key && styles.filterTabActive,
                ]}
                onPress={() => handleFilterChange(tab.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilter === tab.key && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SmoothEntry>
      </View>
    ),
    [summary, activeFilter, handleFilterChange],
  );

  const ListEmpty = useMemo(
    () => (
      <SmoothEntry delay={200}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>{'{ }'}</Text>
          <Text style={styles.emptyTitle}>
            {activeFilter === 'all'
              ? 'Nenhuma aposta registrada'
              : activeFilter === 'won'
              ? 'Nenhuma aposta ganha'
              : activeFilter === 'lost'
              ? 'Nenhuma aposta perdida'
              : 'Nenhuma aposta pendente'}
          </Text>
          <Text style={styles.emptySubtitle}>
            Suas apostas aparecerrao aqui
          </Text>
        </View>
      </SmoothEntry>
    ),
    [activeFilter],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <SmoothEntry delay={0}>
        <View style={styles.header}>
          <TapScale onPress={handleGoBack}>
            <View style={styles.backButton}>
              <Text style={styles.backIcon}>{'<'}</Text>
            </View>
          </TapScale>
          <Text style={styles.headerTitle}>Historico de Apostas</Text>
          <View style={styles.backButton} />
        </View>
      </SmoothEntry>

      {isLoading ? (
        <View style={styles.listContent}>
          <SkeletonList count={5} type="card" />
        </View>
      ) : (
        <Reanimated.FlatList
          data={filteredBets}
          keyExtractor={keyExtractor}
          renderItem={renderBetItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          itemLayoutAnimation={LinearTransition.springify().damping(16).stiffness(120)}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={7}
          initialNumToRender={8}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
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

  // Summary
  summaryCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.monoBold,
    color: colors.textPrimary,
    fontSize: 18,
    marginBottom: 4,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  filterTabText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    fontSize: 13,
  },
  filterTabTextActive: {
    color: colors.primary,
  },

  // Bet Card
  betCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  leaguePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  leagueText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 11,
  },
  teamsText: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  detailItem: {
    gap: 2,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
  },
  detailValue: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 13,
  },
  oddsValue: {
    ...typography.mono,
    color: colors.primary,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
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
  profitText: {
    ...typography.monoBold,
    fontSize: 14,
  },
  dateText: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
    marginLeft: 'auto',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyIcon: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 32,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 14,
  },
});
