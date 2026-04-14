import React, { useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card, SectionHeader } from '../components/ui';
import { SmoothEntry, TapScale } from '../components/LiveComponents';
import { hapticLight } from '../services/haptics';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore } from '../store/nexaStore';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTimeRemaining(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function timeAgo(minutesAgo: number): string {
  if (minutesAgo < 1) return 'agora';
  if (minutesAgo < 60) return `há ${minutesAgo}min`;
  const h = Math.floor(minutesAgo / 60);
  return `há ${h}h`;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  trend,
  trendColor,
  delay,
}: {
  label: string;
  value: string;
  trend?: string;
  trendColor?: string;
  delay: number;
}) {
  return (
    <SmoothEntry delay={delay} direction="up">
      <View style={styles.kpiCard}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={styles.kpiValue}>{value}</Text>
        {trend ? (
          <Text style={[styles.kpiTrend, { color: trendColor ?? colors.green }]}>
            {trend}
          </Text>
        ) : null}
      </View>
    </SmoothEntry>
  );
}

// ─── Metric Row ──────────────────────────────────────────────────────────────

function MetricRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

// ─── Status Row ──────────────────────────────────────────────────────────────

function StatusRow({
  label,
  status,
  statusColor,
}: {
  label: string;
  status: string;
  statusColor: string;
}) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.statusBadge}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.metricValue, { color: statusColor }]}>{status}</Text>
      </View>
    </View>
  );
}

// ─── Activity Item ───────────────────────────────────────────────────────────

function ActivityItem({
  icon,
  text,
  time,
  delay,
}: {
  icon: string;
  text: string;
  time: string;
  delay: number;
}) {
  return (
    <SmoothEntry delay={delay} direction="up">
      <View style={styles.activityItem}>
        <View style={styles.activityIconContainer}>
          <Text style={styles.activityIcon}>{icon}</Text>
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText} numberOfLines={1}>
            {text}
          </Text>
          <Text style={styles.activityTime}>{time}</Text>
        </View>
      </View>
    </SmoothEntry>
  );
}

// ─── Subscription Breakdown ──────────────────────────────────────────────────

function SubscriptionBar({
  free,
  pro,
  elite,
}: {
  free: number;
  pro: number;
  elite: number;
}) {
  const total = free + pro + elite;
  const freePercent = (free / total) * 100;
  const proPercent = (pro / total) * 100;
  const elitePercent = (elite / total) * 100;

  return (
    <View style={styles.subSection}>
      <View style={styles.subBarContainer}>
        <View style={[styles.subBarSegment, { width: `${freePercent}%`, backgroundColor: colors.textMuted }]} />
        <View style={[styles.subBarSegment, { width: `${proPercent}%`, backgroundColor: colors.primary }]} />
        <View style={[styles.subBarSegment, { width: `${elitePercent}%`, backgroundColor: colors.gold }]} />
      </View>
      <View style={styles.subLegend}>
        <View style={styles.subLegendItem}>
          <View style={[styles.subLegendDot, { backgroundColor: colors.textMuted }]} />
          <Text style={styles.subLegendText}>Free {free}</Text>
        </View>
        <View style={styles.subLegendItem}>
          <View style={[styles.subLegendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.subLegendText}>Pro {pro}</Text>
        </View>
        <View style={styles.subLegendItem}>
          <View style={[styles.subLegendDot, { backgroundColor: colors.gold }]} />
          <Text style={styles.subLegendText}>Elite {elite}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AdminDashboardScreen() {
  const navigation = useNavigation();
  const liveStats = useNexaStore(s => s.liveStats);
  const feed = useNexaStore(s => s.feed);
  const matches = useNexaStore(s => s.matches);
  const tipsters = useNexaStore(s => s.tipsters);
  const leaderboard = useNexaStore(s => s.leaderboard);
  const transactions = useNexaStore(s => s.transactions);
  const betsPlaced = useNexaStore(s => s.betsPlaced);
  const currentSeason = useNexaStore(s => s.currentSeason);

  const handleBack = useCallback(() => {
    hapticLight();
    navigation.goBack();
  }, [navigation]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const liveMatchCount = useMemo(
    () => matches.filter(m => m.status === 'live').length,
    [matches],
  );

  const totalVolume = useMemo(
    () => transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [transactions],
  );

  const extrapolatedUsers = useMemo(
    () => Math.max(leaderboard.length * 12, 2400),
    [leaderboard],
  );

  const activeBets = useMemo(
    () => betsPlaced + liveStats.recentBets * 14,
    [betsPlaced, liveStats.recentBets],
  );

  const revenueToday = useMemo(() => {
    const base = totalVolume * 0.035;
    return Math.max(base, 4720);
  }, [totalVolume]);

  // ── Mock activity feed ─────────────────────────────────────────────────────

  const recentActivity = useMemo(
    () => [
      { icon: '👤', text: 'Novo usuário registrado: @LucasM_BR', minutesAgo: 2 },
      { icon: '💰', text: 'Aposta confirmada R$50 — Flamengo x Santos', minutesAgo: 5 },
      { icon: '🏆', text: 'Missão completada por @GabrielP', minutesAgo: 8 },
      { icon: '📊', text: 'Tipster @AnaLuiza publicou análise', minutesAgo: 14 },
      { icon: '🎉', text: 'Novo assinante Pro: @ThiagoSouza', minutesAgo: 22 },
    ],
    [],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <SmoothEntry delay={0} direction="up">
        <View style={styles.header}>
          <TapScale onPress={handleBack} accessibilityLabel="Voltar">
            <View style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </View>
          </TapScale>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>
      </SmoothEntry>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Real-time KPIs ──────────────────────────────────────────────── */}
        <SmoothEntry delay={50} direction="up">
          <SectionHeader title="KPIs em Tempo Real" />
        </SmoothEntry>

        <View style={styles.kpiGrid}>
          <KPICard
            label="DAU"
            value={liveStats.usersOnline.toLocaleString('pt-BR')}
            trend="▲ 12%"
            trendColor={colors.green}
            delay={100}
          />
          <KPICard
            label="Receita hoje"
            value={formatCurrency(revenueToday)}
            trend="▲ 8.4%"
            trendColor={colors.green}
            delay={150}
          />
          <KPICard
            label="Apostas ativas"
            value={activeBets.toLocaleString('pt-BR')}
            trend="▲ 5.2%"
            trendColor={colors.green}
            delay={200}
          />
          <KPICard
            label="Sessão média"
            value="12m 34s"
            trend="▲ 1.8%"
            trendColor={colors.green}
            delay={250}
          />
        </View>

        {/* ── User Metrics ────────────────────────────────────────────────── */}
        <SmoothEntry delay={300} direction="up">
          <SectionHeader title="Usuários" />
          <Card style={styles.metricCard}>
            <MetricRow label="Total de usuários" value={extrapolatedUsers.toLocaleString('pt-BR')} />
            <MetricRow label="Ativos agora" value={liveStats.usersOnline.toString()} color={colors.green} />
            <MetricRow label="Novos hoje" value="47" color={colors.primary} />
            <MetricRow label="Retenção D7" value="34.2%" color={colors.gold} />
          </Card>
        </SmoothEntry>

        {/* ── Content Metrics ─────────────────────────────────────────────── */}
        <SmoothEntry delay={400} direction="up">
          <SectionHeader title="Conteúdo" />
          <Card style={styles.metricCard}>
            <MetricRow label="Total de partidas" value={matches.length.toString()} />
            <MetricRow label="Ao vivo agora" value={liveMatchCount.toString()} color={colors.red} />
            <MetricRow label="Posts no feed" value={feed.length.toString()} />
            <MetricRow label="Tipsters ativos" value={tipsters.length.toString()} color={colors.primary} />
          </Card>
        </SmoothEntry>

        {/* ── Revenue Metrics ─────────────────────────────────────────────── */}
        <SmoothEntry delay={500} direction="up">
          <SectionHeader title="Receita" />
          <Card style={styles.metricCard}>
            <MetricRow label="Transações hoje" value={transactions.length.toString()} />
            <MetricRow
              label="Volume total"
              value={formatCurrency(totalVolume)}
              color={colors.green}
            />
            <MetricRow label="ARPU" value="R$ 14,80" color={colors.gold} />
            <View style={styles.metricDivider} />
            <Text style={styles.metricSubheader}>Assinaturas</Text>
            <SubscriptionBar free={2100} pro={280} elite={42} />
          </Card>
        </SmoothEntry>

        {/* ── Season Status ───────────────────────────────────────────────── */}
        <SmoothEntry delay={600} direction="up">
          <SectionHeader title="Temporada" />
          <Card style={styles.metricCard}>
            <MetricRow label="Atual" value={currentSeason.name} />
            <MetricRow label="Semana" value={`#${currentSeason.weekNumber}`} color={colors.primary} />
            <MetricRow label="Participantes" value="3.420" />
            <MetricRow
              label="Tempo restante"
              value={formatTimeRemaining(currentSeason.endsAt)}
              color={colors.orange}
            />
          </Card>
        </SmoothEntry>

        {/* ── System Health ───────────────────────────────────────────────── */}
        <SmoothEntry delay={700} direction="up">
          <SectionHeader title="Saúde do Sistema" />
          <Card style={styles.metricCard}>
            <StatusRow label="API Status" status="Operacional" statusColor={colors.green} />
            <StatusRow label="Database" status="Operacional" statusColor={colors.green} />
            <StatusRow label="Push Notifications" status="Ativo" statusColor={colors.green} />
            <View style={styles.metricDivider} />
            <MetricRow label="Taxa de erro" value="0.02%" color={colors.green} />
            <MetricRow label="P95 latência" value="142ms" color={colors.green} />
          </Card>
        </SmoothEntry>

        {/* ── Recent Activity ─────────────────────────────────────────────── */}
        <SmoothEntry delay={800} direction="up">
          <SectionHeader title="Atividade Recente" />
        </SmoothEntry>
        <Card style={styles.activityCard}>
          {recentActivity.map((item, i) => (
            <ActivityItem
              key={i}
              icon={item.icon}
              text={item.text}
              time={timeAgo(item.minutesAgo)}
              delay={850 + i * 60}
            />
          ))}
        </Card>

        {/* ── Quick Actions ───────────────────────────────────────────────── */}
        <SmoothEntry delay={1150} direction="up">
          <SectionHeader title="Ações Rápidas" />
          <View style={styles.actionsRow}>
            <TapScale
              onPress={() => hapticLight()}
              style={styles.actionBtnWrapper}
              accessibilityLabel="Enviar notificação push"
            >
              <View style={[styles.actionBtn, { backgroundColor: colors.primary + '18' }]}>
                <Text style={styles.actionBtnIcon}>🔔</Text>
                <Text style={styles.actionBtnLabel}>Push Global</Text>
              </View>
            </TapScale>
            <TapScale
              onPress={() => hapticLight()}
              style={styles.actionBtnWrapper}
              accessibilityLabel="Exportar relatório"
            >
              <View style={[styles.actionBtn, { backgroundColor: colors.green + '18' }]}>
                <Text style={styles.actionBtnIcon}>📊</Text>
                <Text style={styles.actionBtnLabel}>Exportar</Text>
              </View>
            </TapScale>
            <TapScale
              onPress={() => hapticLight()}
              style={styles.actionBtnWrapper}
              accessibilityLabel="Gerenciar usuários"
            >
              <View style={[styles.actionBtn, { backgroundColor: colors.gold + '18' }]}>
                <Text style={styles.actionBtnIcon}>👥</Text>
                <Text style={styles.actionBtnLabel}>Usuários</Text>
              </View>
            </TapScale>
          </View>
        </SmoothEntry>

        {/* Bottom spacing for tab bar */}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  backButton: {
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
    fontSize: 22,
    color: colors.textPrimary,
    flex: 1,
  },
  adminBadge: {
    backgroundColor: colors.red + '22',
    borderWidth: 1,
    borderColor: colors.red,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  adminBadgeText: {
    ...typography.monoBold,
    fontSize: 10,
    color: colors.red,
    letterSpacing: 1.5,
  },

  // ── KPI Grid ─────────────────────────────────────────────────────────────
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  kpiCard: {
    flex: 1,
    minWidth: '46%' as unknown as number,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  kpiLabel: {
    ...typography.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  kpiValue: {
    ...typography.monoBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  kpiTrend: {
    ...typography.mono,
    fontSize: 12,
    color: colors.green,
  },

  // ── Metric Card ──────────────────────────────────────────────────────────
  metricCard: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  metricLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  metricValue: {
    ...typography.monoBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  metricDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  metricSubheader: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  // ── Status Badge ─────────────────────────────────────────────────────────
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },

  // ── Subscription Bar ─────────────────────────────────────────────────────
  subSection: {
    gap: spacing.sm,
  },
  subBarContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: colors.bgElevated,
  },
  subBarSegment: {
    height: '100%',
  },
  subLegend: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  subLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  subLegendDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  subLegendText: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },

  // ── Activity Feed ────────────────────────────────────────────────────────
  activityCard: {
    marginBottom: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
    gap: 2,
  },
  activityText: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  activityTime: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  },

  // ── Quick Actions ────────────────────────────────────────────────────────
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionBtnWrapper: {
    flex: 1,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  actionBtnIcon: {
    fontSize: 24,
  },
  actionBtnLabel: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // ── Bottom Spacer ────────────────────────────────────────────────────────
  bottomSpacer: {
    height: 100,
  },
});
