import React, { useMemo, useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TapScale, SmoothEntry } from '../components/LiveComponents';
import { Card, SectionHeader, Pill } from '../components/ui';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, type TipsterTier, type CreatorPayout } from '../store/nexaStore';
import { hapticLight, hapticSuccess, hapticMedium } from '../services/haptics';

// ─── Tier Config ─────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<TipsterTier, { label: string; color: string; next?: TipsterTier; copiesNeeded?: number }> = {
  bronze: { label: 'Bronze', color: colors.textSecondary, next: 'silver', copiesNeeded: 100 },
  silver: { label: 'Silver', color: '#C0C0C0', next: 'gold', copiesNeeded: 500 },
  gold:   { label: 'Gold',   color: colors.gold, next: 'elite', copiesNeeded: 2000 },
  elite:  { label: 'Elite',  color: colors.primary },
};

// ─── ROI Chart ───────────────────────────────────────────────────────────────

function ROIChart({ data }: { data: number[] }) {
  const maxAbs = useMemo(
    () => Math.max(...data.map(Math.abs), 1),
    [data],
  );
  const chartHeight = 100;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {data.slice(-14).map((val, i) => {
          const absVal = Math.abs(val);
          const barHeight = Math.max((absVal / maxAbs) * chartHeight, 2);
          const barColor = val >= 0 ? colors.green : colors.red;

          return (
            <View key={i} style={styles.chartBarCol}>
              <View style={styles.chartBarArea}>
                <View
                  style={[
                    styles.chartBar,
                    { height: barHeight, backgroundColor: barColor },
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

// ─── Post Performance Row ────────────────────────────────────────────────────

function PostRow({
  content,
  likes,
  copies,
  comments,
  index,
}: {
  content: string;
  likes: number;
  copies: number;
  comments: number;
  index: number;
}) {
  return (
    <SmoothEntry delay={index * 60}>
      <View style={styles.postRow}>
        <Text style={styles.postContent} numberOfLines={2}>
          {content}
        </Text>
        <View style={styles.postStats}>
          <View style={styles.postStatItem}>
            <Text style={styles.postStatIcon}>♥</Text>
            <Text style={styles.postStatValue}>{likes}</Text>
          </View>
          <View style={styles.postStatItem}>
            <Text style={styles.postStatIcon}>◈</Text>
            <Text style={styles.postStatValue}>{copies}</Text>
          </View>
          <View style={styles.postStatItem}>
            <Text style={styles.postStatIcon}>💬</Text>
            <Text style={styles.postStatValue}>{comments}</Text>
          </View>
        </View>
      </View>
    </SmoothEntry>
  );
}

// ─── Tier Ladder ─────────────────────────────────────────────────────────────

function TierLadder({ currentTier }: { currentTier: TipsterTier }) {
  const tiers: TipsterTier[] = ['bronze', 'silver', 'gold', 'elite'];
  const currentIndex = tiers.indexOf(currentTier);

  return (
    <View style={styles.tierLadder}>
      {tiers.map((tier, i) => {
        const config = TIER_CONFIG[tier];
        const isActive = i <= currentIndex;
        const isCurrent = tier === currentTier;

        return (
          <React.Fragment key={tier}>
            <View style={styles.tierStep}>
              <View
                style={[
                  styles.tierDot,
                  {
                    backgroundColor: isActive ? config.color : colors.bgElevated,
                    borderColor: config.color,
                  },
                ]}
              />
              <Text
                style={[
                  styles.tierStepLabel,
                  isCurrent && { color: config.color, ...typography.bodySemiBold },
                ]}
              >
                {config.label}
              </Text>
            </View>
            {i < tiers.length - 1 && (
              <View
                style={[
                  styles.tierLine,
                  { backgroundColor: isActive ? config.color : colors.border },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── Payout Section ─────────────────────────────────────────────────────────

function PayoutSection() {
  const creatorStats = useNexaStore(s => s.creatorStats);
  const requestCreatorPayout = useNexaStore(s => s.requestCreatorPayout);
  const [payoutPixKey, setPayoutPixKey] = useState('');
  const [showPayoutForm, setShowPayoutForm] = useState(false);

  const available = creatorStats?.availableBalance ?? 0;
  const pending = creatorStats?.pendingBalance ?? 0;
  const brlAvailable = (available / 100).toFixed(2);
  const minPayout = 500; // min 500 coins = R$5.00

  const handlePayout = useCallback(() => {
    if (available < minPayout || !payoutPixKey.trim()) return;
    hapticSuccess();
    requestCreatorPayout(available, payoutPixKey.trim());
    setShowPayoutForm(false);
    setPayoutPixKey('');
  }, [available, payoutPixKey, requestCreatorPayout]);

  return (
    <Card>
      <View style={styles.payoutBalanceRow}>
        <View>
          <Text style={styles.payoutBalanceLabel}>Disponivel para saque</Text>
          <Text style={styles.payoutBalanceValue}>{available.toLocaleString()} coins</Text>
          <Text style={styles.payoutBalanceBrl}>= R$ {brlAvailable}</Text>
        </View>
        {pending > 0 && (
          <View style={styles.payoutPending}>
            <Text style={styles.payoutPendingLabel}>Processando</Text>
            <Text style={styles.payoutPendingValue}>{pending} coins</Text>
          </View>
        )}
      </View>

      {!showPayoutForm ? (
        <TapScale onPress={() => { hapticMedium(); setShowPayoutForm(true); }} disabled={available < minPayout}>
          <View style={[styles.payoutBtn, available < minPayout && styles.payoutBtnDisabled]}>
            <Text style={styles.payoutBtnText}>
              {available < minPayout ? `Minimo: ${minPayout} coins` : 'Solicitar saque'}
            </Text>
          </View>
        </TapScale>
      ) : (
        <View style={styles.payoutForm}>
          <TextInput
            style={styles.payoutInput}
            value={payoutPixKey}
            onChangeText={setPayoutPixKey}
            placeholder="Sua chave Pix"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />
          <View style={styles.payoutFormActions}>
            <TapScale onPress={() => setShowPayoutForm(false)}>
              <View style={styles.payoutCancel}><Text style={styles.payoutCancelText}>Cancelar</Text></View>
            </TapScale>
            <TapScale onPress={handlePayout}>
              <View style={styles.payoutConfirm}><Text style={styles.payoutConfirmText}>Sacar R$ {brlAvailable}</Text></View>
            </TapScale>
          </View>
        </View>
      )}

      {/* Payout history */}
      {(creatorStats?.payoutHistory?.length ?? 0) > 0 && (
        <View style={styles.payoutHistory}>
          <Text style={styles.payoutHistoryTitle}>Historico de saques</Text>
          {creatorStats!.payoutHistory.slice(0, 5).map((p: CreatorPayout) => (
            <View key={p.id} style={styles.payoutHistoryRow}>
              <View style={[styles.payoutStatusDot, { backgroundColor: p.status === 'completed' ? colors.green : p.status === 'pending' ? colors.gold : colors.red }]} />
              <Text style={styles.payoutHistoryAmount}>R$ {p.amount.toFixed(2)}</Text>
              <Text style={styles.payoutHistoryDate}>{p.requestedAt}</Text>
              <Text style={styles.payoutHistoryStatus}>{p.status}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function CreatorStudioScreen() {
  const navigation = useNavigation();
  const creatorStats = useNexaStore(s => s.creatorStats);
  const socialStats = useNexaStore(s => s.socialStats);
  const user = useNexaStore(s => s.user);
  const roiHistory = useNexaStore(s => s.roiHistory);
  const feed = useNexaStore(s => s.feed);

  const userPosts = useMemo(
    () => feed.filter(p => p.user.id === user.id).slice(0, 8),
    [feed, user.id],
  );

  const tier: TipsterTier = 'bronze';
  const tierConfig = TIER_CONFIG[tier];
  const reachGrowth = useMemo(() => {
    const base = creatorStats?.weeklyReach ?? 0;
    return base > 0 ? Math.min(Math.round((base / 100) * 15), 999) : 0;
  }, [creatorStats]);

  const handleBack = useCallback(() => {
    hapticLight();
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TapScale onPress={handleBack} accessibilityLabel="Voltar">
          <Text style={styles.backButton}>←</Text>
        </TapScale>
        <Text style={styles.headerTitle}>Estúdio do Criador</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Earnings Overview */}
        <SmoothEntry delay={0}>
          <Card>
            <View style={styles.earningsHeader}>
              <Text style={styles.sectionLabel}>Ganhos da Semana</Text>
              {creatorStats?.isTopTipster && (
                <Pill label="⭐ Top Tipster da Semana" color={colors.gold} />
              )}
            </View>
            <Text style={styles.earningsBig}>
              R$ {(creatorStats?.weeklyEarnings ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
            <View style={styles.earningsRow}>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsItemLabel}>Total acumulado</Text>
                <Text style={styles.earningsItemValue}>
                  R$ {(creatorStats?.totalEarnings ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={styles.earningsItemLabel}>Cópias totais</Text>
                <Text style={styles.earningsItemValue}>
                  {creatorStats?.totalCopies ?? 0}
                </Text>
              </View>
            </View>
          </Card>
        </SmoothEntry>

        {/* Content Performance */}
        <SmoothEntry delay={100}>
          <SectionHeader title="Performance do Conteúdo" />
          <Card>
            {userPosts.length > 0 ? (
              userPosts.map((post, i) => (
                <PostRow
                  key={post.id}
                  content={post.content}
                  likes={post.likes}
                  copies={post.copies ?? 0}
                  comments={post.comments}
                  index={i}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>
                Nenhum post encontrado. Comece a publicar para ver seus dados aqui.
              </Text>
            )}
          </Card>
        </SmoothEntry>

        {/* Audience Insights */}
        <SmoothEntry delay={200}>
          <SectionHeader title="Audiência" />
          <Card>
            <View style={styles.audienceRow}>
              <View style={styles.audienceItem}>
                <Text style={styles.audienceValue}>{socialStats?.followers ?? 0}</Text>
                <Text style={styles.audienceLabel}>Seguidores</Text>
              </View>
              <View style={styles.audienceItem}>
                <Text style={styles.audienceValue}>{creatorStats?.weeklyReach ?? 0}</Text>
                <Text style={styles.audienceLabel}>Alcance semanal</Text>
              </View>
            </View>
            {reachGrowth > 0 && (
              <View style={styles.reachGrowth}>
                <Text style={styles.reachGrowthText}>
                  📈 Seu alcance cresceu {reachGrowth}% esta semana
                </Text>
              </View>
            )}
          </Card>
        </SmoothEntry>

        {/* ROI Chart */}
        <SmoothEntry delay={300}>
          <SectionHeader title="ROI Últimos 14 Dias" />
          <Card>
            {roiHistory && roiHistory.length > 0 ? (
              <ROIChart data={roiHistory} />
            ) : (
              <Text style={styles.emptyText}>Sem dados de ROI ainda.</Text>
            )}
          </Card>
        </SmoothEntry>

        {/* Tier Progression */}
        <SmoothEntry delay={400}>
          <SectionHeader title="Progressão de Tier" />
          <Card>
            <View style={styles.currentTierRow}>
              <Text style={styles.currentTierLabel}>Tier atual</Text>
              <Pill label={tierConfig.label} color={tierConfig.color} />
            </View>
            <TierLadder currentTier={tier} />
            {tierConfig.next != null && tierConfig.copiesNeeded != null && (
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {Math.max(tierConfig.copiesNeeded - (creatorStats?.totalCopies ?? 0), 0)} mais cópias para{' '}
                  {TIER_CONFIG[tierConfig.next as TipsterTier].label}
                </Text>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(
                          ((creatorStats?.totalCopies ?? 0) / tierConfig.copiesNeeded) * 100,
                          100,
                        )}%`,
                        backgroundColor: TIER_CONFIG[tierConfig.next as TipsterTier].color,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </Card>
        </SmoothEntry>

        {/* Earnings Breakdown */}
        <SmoothEntry delay={500}>
          <SectionHeader title="De onde vem sua receita" />
          <Card>
            <View style={styles.breakdownGrid}>
              {[
                { label: 'Copias', value: creatorStats?.earningsBreakdown?.fromCopies ?? 0, color: colors.green },
                { label: 'Marketplace', value: creatorStats?.earningsBreakdown?.fromMarketplace ?? 0, color: colors.primary },
                { label: 'Afiliados', value: creatorStats?.earningsBreakdown?.fromAffiliates ?? 0, color: colors.gold },
                { label: 'Tips', value: creatorStats?.earningsBreakdown?.fromTips ?? 0, color: colors.orange },
              ].map((item) => (
                <View key={item.label} style={styles.breakdownItem}>
                  <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                  <Text style={styles.breakdownValue}>{item.value.toLocaleString()} coins</Text>
                </View>
              ))}
            </View>
          </Card>
        </SmoothEntry>

        {/* Payout Section */}
        <SmoothEntry delay={600}>
          <SectionHeader title="Sacar ganhos" />
          <PayoutSection />
        </SmoothEntry>

        {/* Monetization Tips */}
        <SmoothEntry delay={700}>
          <Card style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipTitle}>Dica do Dia</Text>
            <Text style={styles.tipText}>
              Tipsters que postam 3x/dia ganham 40% mais cópias. Mantenha a consistência!
            </Text>
          </Card>
        </SmoothEntry>

        <View style={{ height: spacing.xxl }} />
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
  backButton: {
    ...typography.display,
    fontSize: 22,
    color: colors.textPrimary,
    paddingRight: spacing.sm,
  },
  headerTitle: {
    ...typography.displayMedium,
    fontSize: 20,
    color: colors.textPrimary,
    flex: 1,
  },
  headerSpacer: {
    width: 30,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingTop: spacing.sm,
  },

  // Earnings
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  earningsBig: {
    ...typography.monoBold,
    fontSize: 36,
    color: colors.green,
    marginBottom: spacing.md,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningsItem: {
    flex: 1,
  },
  earningsItemLabel: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  earningsItemValue: {
    ...typography.monoBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  earningsDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },

  // Post Performance
  postRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  postContent: {
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  postStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  postStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatIcon: {
    fontSize: 12,
    color: colors.textMuted,
  },
  postStatValue: {
    ...typography.mono,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Audience
  audienceRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  audienceItem: {
    flex: 1,
    alignItems: 'center',
  },
  audienceValue: {
    ...typography.monoBold,
    fontSize: 24,
    color: colors.textPrimary,
  },
  audienceLabel: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  reachGrowth: {
    marginTop: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  reachGrowthText: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: colors.green,
    textAlign: 'center',
  },

  // ROI Chart
  chartContainer: {
    position: 'relative',
    paddingTop: spacing.sm,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 8,
    borderRadius: radius.sm,
  },
  chartDayLabel: {
    ...typography.mono,
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 4,
  },
  chartZeroLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    height: 0.5,
    backgroundColor: colors.border,
  },

  // Tier Progression
  currentTierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  currentTierLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tierLadder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  tierStep: {
    alignItems: 'center',
    gap: 4,
  },
  tierDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  tierStepLabel: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  tierLine: {
    width: 28,
    height: 2,
    borderRadius: 1,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  progressInfo: {
    marginTop: spacing.xs,
  },
  progressText: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },

  // Tips
  tipCard: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  tipIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  tipTitle: {
    ...typography.displayMedium,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  tipText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Empty
  emptyText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },

  // Earnings breakdown
  breakdownGrid: { gap: spacing.sm },
  breakdownItem: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.sm },
  breakdownDot: { width: 10, height: 10, borderRadius: 5 },
  breakdownLabel: { ...typography.body, fontSize: 13, color: colors.textSecondary, flex: 1 },
  breakdownValue: { ...typography.monoBold, fontSize: 13, color: colors.textPrimary },

  // Payout
  payoutBalanceRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'flex-start' as const, marginBottom: spacing.md },
  payoutBalanceLabel: { ...typography.body, fontSize: 12, color: colors.textMuted },
  payoutBalanceValue: { ...typography.monoBold, fontSize: 20, color: colors.green, marginTop: 2 },
  payoutBalanceBrl: { ...typography.mono, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  payoutPending: { alignItems: 'flex-end' as const },
  payoutPendingLabel: { ...typography.body, fontSize: 11, color: colors.textMuted },
  payoutPendingValue: { ...typography.mono, fontSize: 13, color: colors.gold },
  payoutBtn: { backgroundColor: colors.green, borderRadius: radius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' as const },
  payoutBtnDisabled: { backgroundColor: colors.bgElevated, borderWidth: 0.5, borderColor: colors.border },
  payoutBtnText: { ...typography.bodySemiBold, fontSize: 14, color: '#FFF' },
  payoutForm: { gap: spacing.md },
  payoutInput: { backgroundColor: colors.bgElevated, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, ...typography.body, fontSize: 14, color: colors.textPrimary },
  payoutFormActions: { flexDirection: 'row' as const, gap: spacing.md },
  payoutCancel: { flex: 1, backgroundColor: colors.bgElevated, borderRadius: radius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' as const, borderWidth: 0.5, borderColor: colors.border },
  payoutCancelText: { ...typography.bodySemiBold, fontSize: 13, color: colors.textMuted },
  payoutConfirm: { flex: 1, backgroundColor: colors.green, borderRadius: radius.md, paddingVertical: spacing.sm + 2, alignItems: 'center' as const },
  payoutConfirmText: { ...typography.bodySemiBold, fontSize: 13, color: '#FFF' },
  payoutHistory: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 0.5, borderTopColor: colors.border, gap: spacing.sm },
  payoutHistoryTitle: { ...typography.bodySemiBold, fontSize: 12, color: colors.textSecondary, marginBottom: spacing.xs },
  payoutHistoryRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.sm },
  payoutStatusDot: { width: 8, height: 8, borderRadius: 4 },
  payoutHistoryAmount: { ...typography.monoBold, fontSize: 13, color: colors.textPrimary, flex: 1 },
  payoutHistoryDate: { ...typography.mono, fontSize: 11, color: colors.textMuted },
  payoutHistoryStatus: { ...typography.mono, fontSize: 10, color: colors.textMuted, textTransform: 'capitalize' as const },
});
