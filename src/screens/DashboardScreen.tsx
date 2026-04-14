import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SmoothEntry, TapScale } from '../components/LiveComponents';
import { hapticLight } from '../services/haptics';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore } from '../store/nexaStore';

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── ROI Bar Chart ────────────────────────────────────────────────────────────

function ROIChart({ data }: { data: number[] }) {
  const maxAbs = useMemo(
    () => Math.max(...data.map(Math.abs), 1),
    [data],
  );
  const chartHeight = 120;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {data.map((val, i) => {
          const absVal = Math.abs(val);
          const barHeight = Math.max((absVal / maxAbs) * chartHeight, 2);
          const barColor = val >= 0 ? colors.green : colors.red;

          return (
            <View key={i} style={styles.chartBarCol}>
              <View style={styles.chartBarArea}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: barHeight,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.chartDayLabel}>
                {i % 2 === 0 ? `D${i + 1}` : ''}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.chartZeroLine} />
    </View>
  );
}

// ─── Win/Loss Bar ─────────────────────────────────────────────────────────────

function WinLossBar({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses || 1;
  const winPct = Math.round((wins / total) * 100);
  const lossPct = 100 - winPct;

  return (
    <View style={styles.wlContainer}>
      <View style={styles.wlLabels}>
        <View style={styles.wlLabelRow}>
          <View style={[styles.wlDot, { backgroundColor: colors.green }]} />
          <Text style={styles.wlLabelText}>Vitórias</Text>
          <Text style={[styles.wlLabelValue, { color: colors.green }]}>{wins}</Text>
        </View>
        <View style={styles.wlLabelRow}>
          <View style={[styles.wlDot, { backgroundColor: colors.red }]} />
          <Text style={styles.wlLabelText}>Derrotas</Text>
          <Text style={[styles.wlLabelValue, { color: colors.red }]}>{losses}</Text>
        </View>
      </View>
      <View style={styles.wlBarTrack}>
        <View
          style={[
            styles.wlBarGreen,
            { flex: winPct },
          ]}
        >
          <Text style={styles.wlBarPct}>{winPct}%</Text>
        </View>
        <View
          style={[
            styles.wlBarRed,
            { flex: lossPct },
          ]}
        >
          <Text style={styles.wlBarPct}>{lossPct}%</Text>
        </View>
      </View>
    </View>
  );
}

// ─── DashboardScreen ──────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const navigation = useNavigation();
  const user = useNexaStore((s) => s.user);
  const stats = useNexaStore((s) => s.dashboardStats);
  const roiHistory = useNexaStore((s) => s.roiHistory);

  const sortedLeagues = useMemo(() => {
    return Object.entries(stats.profitByLeague).sort(
      (a, b) => b[1] - a[1],
    );
  }, [stats.profitByLeague]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TapScale onPress={() => { hapticLight(); navigation.goBack(); }}>
          <View style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </View>
        </TapScale>
        <Text style={styles.headerTitle}>Dashboard Pro</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Summary */}
        <SmoothEntry delay={0}>
          <View style={styles.statsGrid}>
            <StatCard
              label="Total Apostas"
              value={String(stats.totalBets)}
            />
            <StatCard
              label="Vitórias"
              value={String(stats.wins)}
              color={colors.green}
            />
            <StatCard
              label="Derrotas"
              value={String(stats.losses)}
              color={colors.red}
            />
            <StatCard
              label="Odds Média"
              value={stats.avgOdds.toFixed(2)}
              color={colors.primary}
            />
          </View>
        </SmoothEntry>

        {/* ROI Chart */}
        <SmoothEntry delay={100}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>ROI - Últimos 14 dias</Text>
            <ROIChart data={roiHistory} />
            <View style={styles.roiSummary}>
              <Text style={styles.roiLabel}>ROI Atual</Text>
              <Text
                style={[
                  styles.roiValue,
                  {
                    color:
                      roiHistory[roiHistory.length - 1] >= 0
                        ? colors.green
                        : colors.red,
                  },
                ]}
              >
                {roiHistory[roiHistory.length - 1] >= 0 ? '+' : ''}
                {roiHistory[roiHistory.length - 1]}%
              </Text>
            </View>
          </View>
        </SmoothEntry>

        {/* Win/Loss Visual */}
        <SmoothEntry delay={200}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Vitórias vs Derrotas</Text>
            <WinLossBar wins={stats.wins} losses={stats.losses} />
          </View>
        </SmoothEntry>

        {/* Best Streak */}
        <SmoothEntry delay={250}>
          <View style={styles.streakCard}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View style={styles.streakInfo}>
              <Text style={styles.streakLabel}>Melhor Sequência</Text>
              <Text style={styles.streakValue}>
                {stats.bestStreak} green{stats.bestStreak > 1 ? 's' : ''} seguido{stats.bestStreak > 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>{stats.bestStreak}</Text>
            </View>
          </View>
        </SmoothEntry>

        {/* Profit by League */}
        <SmoothEntry delay={300}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Lucro por Liga</Text>
            {sortedLeagues.map(([league, profit], index) => {
              const isPositive = profit >= 0;
              return (
                <View key={league} style={styles.leagueRow}>
                  <Text style={styles.leagueName}>{league}</Text>
                  <Text
                    style={[
                      styles.leagueProfit,
                      { color: isPositive ? colors.green : colors.red },
                    ]}
                  >
                    {isPositive ? '+' : ''}R$ {profit.toFixed(2)}
                  </Text>
                </View>
              );
            })}
            {sortedLeagues.length === 0 && (
              <Text style={styles.emptyText}>Sem dados de ligas ainda.</Text>
            )}
          </View>
        </SmoothEntry>

        {/* Seu Estilo */}
        <SmoothEntry delay={400}>
          <View style={styles.styleCard}>
            <View style={styles.styleHeader}>
              <Text style={styles.styleEmoji}>🧬</Text>
              <Text style={styles.styleTitle}>Seu Estilo</Text>
            </View>
            <Text style={styles.styleName}>{user.dna.style}</Text>
            <View style={styles.styleStats}>
              <View style={styles.styleStatItem}>
                <Text style={styles.styleStatLabel}>Win Rate</Text>
                <Text style={styles.styleStatValue}>
                  {(user.winRate * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.styleStatDivider} />
              <View style={styles.styleStatItem}>
                <Text style={styles.styleStatLabel}>Perfil de Risco</Text>
                <Text style={styles.styleStatValue}>
                  {user.dna.riskProfile === 'conservative'
                    ? 'Conservador'
                    : user.dna.riskProfile === 'moderate'
                    ? 'Analítico'
                    : 'Agressivo'}
                </Text>
              </View>
            </View>
            <View style={styles.strengthsRow}>
              {user.dna.strengths.map((s) => (
                <View key={s} style={styles.strengthChip}>
                  <Text style={styles.strengthText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        </SmoothEntry>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    ...typography.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  headerTitle: {
    ...typography.display,
    fontSize: 20,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    ...typography.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Section Card
  sectionCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.display,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // ROI Chart
  chartContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: 2,
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  chartBar: {
    width: '70%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    minHeight: 2,
  },
  chartDayLabel: {
    ...typography.mono,
    fontSize: 8,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  chartZeroLine: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  roiSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  roiLabel: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  roiValue: {
    ...typography.monoBold,
    fontSize: 18,
  },

  // Win/Loss Bar
  wlContainer: {},
  wlLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  wlLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  wlDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  wlLabelText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  wlLabelValue: {
    ...typography.monoBold,
    fontSize: 14,
  },
  wlBarTrack: {
    flexDirection: 'row',
    height: 32,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  wlBarGreen: {
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wlBarRed: {
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wlBarPct: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },

  // Streak
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.orange + '30',
  },
  streakIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakLabel: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  streakValue: {
    ...typography.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  streakBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.orange + '20',
    borderWidth: 2,
    borderColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadgeText: {
    ...typography.display,
    fontSize: 18,
    color: colors.orange,
  },

  // League Profit
  leagueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leagueName: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  leagueProfit: {
    ...typography.monoBold,
    fontSize: 14,
  },
  emptyText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },

  // Style Card
  styleCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  styleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  styleEmoji: {
    fontSize: 20,
  },
  styleTitle: {
    ...typography.display,
    fontSize: 16,
    color: colors.textPrimary,
  },
  styleName: {
    ...typography.display,
    fontSize: 22,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  styleStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  styleStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  styleStatLabel: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  styleStatValue: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  styleStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  strengthsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  strengthChip: {
    backgroundColor: colors.primary + '15',
    borderRadius: radius.full,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  strengthText: {
    ...typography.bodyMedium,
    fontSize: 12,
    color: colors.primary,
  },

  bottomSpacer: {
    height: spacing.xxl,
  },
});
