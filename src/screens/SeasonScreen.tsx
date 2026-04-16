import React, { useCallback, useMemo, useState } from 'react';
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
import { TapScale, SmoothEntry } from '../components/LiveComponents';
import { colors, radius, spacing, typography, typeScale, shadows } from '../theme';
import {
  type PastSeason,
  type Season,
  type SeasonRankReward,
  type SeasonTier,
  useNexaStore,
} from '../store/nexaStore';
import { hapticLight, hapticMedium, hapticSuccess } from '../services/haptics';
import { playCelebrationPop } from '../services/sounds';

// ─── Helpers ────────────────────────────────────────────────────────────────

type ScreenTab = 'battle_pass' | 'rank_rewards' | 'history';

function fmtCountdown(totalSec: number): string {
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function fmtXP(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

const RARITY_COLORS: Record<string, string> = {
  common: colors.textSecondary,
  rare: '#4DA6FF',
  epic: colors.primary,
  legendary: colors.gold,
};

// ─── Season Header Banner ───────────────────────────────────────────────────

function SeasonBanner({ season }: { season: Season }) {
  const user = useNexaStore(s => s.user);
  const rankTier = useNexaStore(s => s.getSeasonRankTier());
  const isUrgent = season.endsAt < 24 * 3600;

  return (
    <Card style={styles.banner}>
      <View style={styles.bannerTop}>
        <View>
          <Text style={styles.bannerName}>{season.name}</Text>
          <Text style={styles.bannerWeek}>
            Semana {season.weekNumber} de {season.totalWeeks}
          </Text>
        </View>
        <View style={[styles.timerBadge, isUrgent && styles.timerUrgent]}>
          <Text style={styles.timerLabel}>{isUrgent ? 'URGENTE' : 'Termina em'}</Text>
          <Text style={[styles.timerValue, isUrgent && styles.timerValueUrgent]}>
            {fmtCountdown(season.endsAt)}
          </Text>
        </View>
      </View>

      {/* Season XP progress */}
      <View style={styles.xpSection}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>Season Level {season.userSeasonLevel}</Text>
          <Text style={styles.xpValue}>{fmtXP(season.userSeasonXP)} XP</Text>
        </View>
        <View style={styles.xpTrack}>
          <View
            style={[
              styles.xpFill,
              {
                width: `${Math.min(100, getNextTierProgress(season))}%`,
              },
            ]}
          />
        </View>
        {getNextTier(season) && (
          <Text style={styles.xpHint}>
            {fmtXP(getNextTier(season)!.xpRequired - season.userSeasonXP)} XP para nivel {getNextTier(season)!.level}
          </Text>
        )}
      </View>

      {/* User rank tier */}
      {rankTier && (
        <View style={styles.rankRow}>
          <Text style={styles.rankBadge}>{rankTier.badge}</Text>
          <View>
            <Text style={styles.rankTierName}>{rankTier.tier}</Text>
            <Text style={styles.rankPosition}>Rank #{user.rank}</Text>
          </View>
        </View>
      )}
    </Card>
  );
}

function getNextTier(season: Season): SeasonTier | null {
  return season.battlePass.find(t => t.xpRequired > season.userSeasonXP) ?? null;
}

function getNextTierProgress(season: Season): number {
  const next = getNextTier(season);
  if (!next) return 100;
  const prev = season.battlePass.filter(t => t.xpRequired <= season.userSeasonXP).pop();
  const prevXP = prev?.xpRequired ?? 0;
  const range = next.xpRequired - prevXP;
  if (range <= 0) return 100;
  return ((season.userSeasonXP - prevXP) / range) * 100;
}

// ─── Battle Pass Tier Row ───────────────────────────────────────────────────

function BattlePassTier({
  tier,
  currentXP,
  index,
  onClaim,
}: {
  tier: SeasonTier;
  currentXP: number;
  index: number;
  onClaim: (level: number) => void;
}) {
  const unlocked = currentXP >= tier.xpRequired;
  const canClaim = unlocked && !tier.claimed;
  const rarityColor = RARITY_COLORS[tier.reward.rarity ?? 'common'];

  return (
    <SmoothEntry delay={index * 60}>
      <View style={[styles.tierRow, unlocked && styles.tierRowUnlocked]}>
        {/* Level badge */}
        <View style={[styles.tierLevel, unlocked && { borderColor: colors.primary }]}>
          <Text style={[styles.tierLevelText, unlocked && { color: colors.primary }]}>
            {tier.level}
          </Text>
        </View>

        {/* Connector line */}
        {index > 0 && (
          <View style={[styles.tierConnector, unlocked && { backgroundColor: colors.primary }]} />
        )}

        {/* Reward info */}
        <View style={styles.tierInfo}>
          <Text style={styles.tierBadge}>{tier.reward.badge ?? '🎁'}</Text>
          <View style={styles.tierText}>
            <Text style={styles.tierLabel}>{tier.reward.label}</Text>
            {tier.reward.rarity && (
              <Text style={[styles.tierRarity, { color: rarityColor }]}>
                {tier.reward.rarity.toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.tierXP}>{fmtXP(tier.xpRequired)} XP</Text>
        </View>

        {/* Claim button or status */}
        {tier.claimed ? (
          <View style={styles.claimedBadge}>
            <Text style={styles.claimedText}>Resgatado</Text>
          </View>
        ) : canClaim ? (
          <TapScale onPress={() => onClaim(tier.level)}>
            <View style={styles.claimBtn}>
              <Text style={styles.claimBtnText}>Resgatar</Text>
            </View>
          </TapScale>
        ) : (
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedText}>Bloqueado</Text>
          </View>
        )}
      </View>
    </SmoothEntry>
  );
}

// ─── Rank Rewards Section ───────────────────────────────────────────────────

function RankRewardRow({
  reward,
  userRank,
  index,
}: {
  reward: SeasonRankReward;
  userRank: number;
  index: number;
}) {
  const isUserTier = userRank >= reward.rankMin && userRank <= reward.rankMax;

  return (
    <SmoothEntry delay={index * 80}>
      <Card style={[styles.rankRewardCard, isUserTier && styles.rankRewardActive]}>
        <View style={styles.rankRewardRow}>
          <Text style={styles.rankRewardBadge}>{reward.badge}</Text>
          <View style={styles.rankRewardInfo}>
            <Text style={styles.rankRewardTier}>{reward.tier}</Text>
            <Text style={styles.rankRewardRange}>
              {reward.rankMin === reward.rankMax
                ? `Rank #${reward.rankMin}`
                : `Rank #${reward.rankMin} – #${reward.rankMax}`}
            </Text>
          </View>
          <View style={styles.rankRewardRight}>
            <Text style={styles.rankRewardCoins}>{reward.coins} coins</Text>
            {reward.exclusiveBadge && (
              <Text style={styles.rankRewardExclusive}>+ Badge exclusiva</Text>
            )}
          </View>
        </View>
        {isUserTier && (
          <View style={styles.yourTierBadge}>
            <Text style={styles.yourTierText}>Seu tier atual</Text>
          </View>
        )}
      </Card>
    </SmoothEntry>
  );
}

// ─── Past Season Card ───────────────────────────────────────────────────────

function PastSeasonCard({ season, index }: { season: PastSeason; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <SmoothEntry delay={index * 100}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => { hapticLight(); setExpanded(!expanded); }}
      >
        <Card style={styles.pastCard}>
          <View style={styles.pastHeader}>
            <View>
              <Text style={styles.pastName}>{season.name}</Text>
              <Text style={styles.pastDate}>{season.startDate} — {season.endDate}</Text>
            </View>
            <View style={styles.pastTierBadge}>
              <Text style={styles.pastTierText}>{season.tierReached}</Text>
            </View>
          </View>

          <View style={styles.pastStats}>
            <View style={styles.pastStat}>
              <Text style={styles.pastStatValue}>#{season.finalRank}</Text>
              <Text style={styles.pastStatLabel}>Rank</Text>
            </View>
            <View style={styles.pastStat}>
              <Text style={styles.pastStatValue}>{fmtXP(season.finalXP)}</Text>
              <Text style={styles.pastStatLabel}>XP</Text>
            </View>
            <View style={styles.pastStat}>
              <Text style={styles.pastStatValue}>Lv.{season.finalLevel}</Text>
              <Text style={styles.pastStatLabel}>Level</Text>
            </View>
          </View>

          {expanded && season.rewardsClaimed.length > 0 && (
            <View style={styles.pastRewards}>
              <Text style={styles.pastRewardsTitle}>Recompensas resgatadas</Text>
              {season.rewardsClaimed.map((r, i) => (
                <View key={i} style={styles.pastRewardRow}>
                  <Text style={styles.pastRewardBadge}>{r.badge ?? '🎁'}</Text>
                  <Text style={styles.pastRewardLabel}>{r.label}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.expandHint}>{expanded ? 'Fechar' : 'Ver detalhes'}</Text>
        </Card>
      </TouchableOpacity>
    </SmoothEntry>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function SeasonScreen() {
  const navigation = useNavigation();
  const currentSeason = useNexaStore(s => s.currentSeason);
  const pastSeasons = useNexaStore(s => s.pastSeasons);
  const user = useNexaStore(s => s.user);
  const claimSeasonTier = useNexaStore(s => s.claimSeasonTier);

  const [tab, setTab] = useState<ScreenTab>('battle_pass');

  const handleClaim = useCallback((level: number) => {
    hapticSuccess();
    playCelebrationPop();
    claimSeasonTier(level);
  }, [claimSeasonTier]);

  const claimableCount = useMemo(() =>
    currentSeason.battlePass.filter(
      t => !t.claimed && currentSeason.userSeasonXP >= t.xpRequired,
    ).length,
  [currentSeason]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Back + Title */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => { hapticLight(); navigation.goBack(); }}
            style={styles.backBtn}
            accessibilityLabel="Voltar"
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Temporadas</Text>
        </View>

        {/* Season Banner */}
        <SeasonBanner season={currentSeason} />

        {/* Tab toggle */}
        <View style={styles.tabRow}>
          {([
            { key: 'battle_pass' as ScreenTab, label: 'Battle Pass', badge: claimableCount > 0 ? claimableCount : undefined },
            { key: 'rank_rewards' as ScreenTab, label: 'Rank Rewards' },
            { key: 'history' as ScreenTab, label: 'Historico' },
          ]).map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
              onPress={() => { hapticLight(); setTab(t.key); }}
              accessibilityLabel={t.label}
            >
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
              {t.badge && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{t.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Battle Pass */}
        {tab === 'battle_pass' && (
          <View style={styles.section}>
            <SectionHeader title={`Battle Pass — Level ${currentSeason.userSeasonLevel}`} />
            {currentSeason.battlePass.map((tier, i) => (
              <BattlePassTier
                key={tier.level}
                tier={tier}
                currentXP={currentSeason.userSeasonXP}
                index={i}
                onClaim={handleClaim}
              />
            ))}
          </View>
        )}

        {/* Rank Rewards */}
        {tab === 'rank_rewards' && (
          <View style={styles.section}>
            <SectionHeader title="Recompensas por Ranking" />
            <Text style={styles.rankHint}>
              Sua posicao final no ranking determina seu tier de recompensa.
            </Text>
            {currentSeason.rankRewards.map((reward, i) => (
              <RankRewardRow
                key={reward.tier}
                reward={reward}
                userRank={user.rank}
                index={i}
              />
            ))}
          </View>
        )}

        {/* History */}
        {tab === 'history' && (
          <View style={styles.section}>
            <SectionHeader title="Temporadas Passadas" />
            {pastSeasons.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyIcon}>📜</Text>
                <Text style={styles.emptyTitle}>Nenhuma temporada encerrada</Text>
                <Text style={styles.emptySubtitle}>
                  Quando a temporada atual acabar, ela aparecera aqui.
                </Text>
              </View>
            ) : (
              pastSeasons.map((s, i) => (
                <PastSeasonCard key={s.id} season={s} index={i} />
              ))
            )}
          </View>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  backBtn: { padding: spacing.xs },
  backText: { fontSize: 22, color: colors.textPrimary },
  title: { ...typography.display, fontSize: 24, color: colors.textPrimary },

  // Banner
  banner: { padding: spacing.lg, marginBottom: spacing.md, gap: spacing.md },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bannerName: { ...typography.display, fontSize: 20, color: colors.textPrimary },
  bannerWeek: { ...typography.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  timerBadge: { backgroundColor: colors.bgElevated, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, alignItems: 'center' },
  timerUrgent: { backgroundColor: colors.red + '20', borderWidth: 1, borderColor: colors.red + '40' },
  timerLabel: { ...typography.mono, fontSize: 10, color: colors.textMuted, letterSpacing: 1 },
  timerValue: { ...typography.monoBold, fontSize: 14, color: colors.textPrimary, marginTop: 2 },
  timerValueUrgent: { color: colors.red },

  // XP progress
  xpSection: { gap: spacing.xs },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpLabel: { ...typography.bodySemiBold, fontSize: 13, color: colors.textPrimary },
  xpValue: { ...typography.mono, fontSize: 12, color: colors.textMuted },
  xpTrack: { height: 8, backgroundColor: colors.bgElevated, borderRadius: radius.full, overflow: 'hidden', borderWidth: 0.5, borderColor: colors.border },
  xpFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  xpHint: { ...typography.body, fontSize: 11, color: colors.textMuted },

  // Rank tier
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: spacing.sm + 2 },
  rankBadge: { fontSize: 28 },
  rankTierName: { ...typography.bodySemiBold, fontSize: 14, color: colors.gold },
  rankPosition: { ...typography.mono, fontSize: 12, color: colors.textSecondary },

  // Tabs
  tabRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.sm + 2, borderRadius: radius.md, backgroundColor: colors.bgCard, borderWidth: 0.5, borderColor: colors.border },
  tabBtnActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' },
  tabText: { ...typography.bodySemiBold, fontSize: 12, color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  tabBadge: { backgroundColor: colors.red, borderRadius: radius.full, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  tabBadgeText: { ...typography.monoBold, fontSize: 10, color: '#FFF' },

  section: { gap: spacing.sm },

  // Battle Pass Tier
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 0.5, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.xs },
  tierRowUnlocked: { borderColor: colors.primary + '30' },
  tierLevel: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  tierLevelText: { ...typography.monoBold, fontSize: 14, color: colors.textMuted },
  tierConnector: { position: 'absolute', left: 34, top: -8, width: 2, height: 8, backgroundColor: colors.border },
  tierInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tierBadge: { fontSize: 24 },
  tierText: { flex: 1 },
  tierLabel: { ...typography.bodySemiBold, fontSize: 13, color: colors.textPrimary },
  tierRarity: { ...typography.mono, fontSize: 10, letterSpacing: 1 },
  tierXP: { ...typography.mono, fontSize: 11, color: colors.textMuted },
  claimBtn: { backgroundColor: colors.green, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md },
  claimBtnText: { ...typography.bodySemiBold, fontSize: 12, color: '#FFF' },
  claimedBadge: { backgroundColor: colors.bgElevated, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  claimedText: { ...typography.mono, fontSize: 10, color: colors.green },
  lockedBadge: { backgroundColor: colors.bgElevated, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  lockedText: { ...typography.mono, fontSize: 10, color: colors.textMuted },

  // Rank Rewards
  rankHint: { ...typography.body, fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  rankRewardCard: { padding: spacing.md, marginBottom: spacing.sm },
  rankRewardActive: { borderColor: colors.gold + '50', borderWidth: 1 },
  rankRewardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rankRewardBadge: { fontSize: 28 },
  rankRewardInfo: { flex: 1 },
  rankRewardTier: { ...typography.bodySemiBold, fontSize: 15, color: colors.textPrimary },
  rankRewardRange: { ...typography.mono, fontSize: 11, color: colors.textMuted },
  rankRewardRight: { alignItems: 'flex-end' },
  rankRewardCoins: { ...typography.monoBold, fontSize: 13, color: colors.gold },
  rankRewardExclusive: { ...typography.body, fontSize: 10, color: colors.primary, marginTop: 2 },
  yourTierBadge: { backgroundColor: colors.gold + '15', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, alignSelf: 'flex-start', marginTop: spacing.sm },
  yourTierText: { ...typography.monoBold, fontSize: 10, color: colors.gold, letterSpacing: 1 },

  // Past Season Card
  pastCard: { padding: spacing.md, marginBottom: spacing.sm },
  pastHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pastName: { ...typography.bodySemiBold, fontSize: 15, color: colors.textPrimary },
  pastDate: { ...typography.mono, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  pastTierBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  pastTierText: { ...typography.monoBold, fontSize: 11, color: colors.primary },
  pastStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 0.5, borderTopColor: colors.border },
  pastStat: { alignItems: 'center', gap: spacing.xs },
  pastStatValue: { ...typography.monoBold, fontSize: 16, color: colors.textPrimary },
  pastStatLabel: { ...typography.body, fontSize: 11, color: colors.textMuted },
  pastRewards: { marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 0.5, borderTopColor: colors.border, gap: spacing.sm },
  pastRewardsTitle: { ...typography.bodySemiBold, fontSize: 12, color: colors.textSecondary },
  pastRewardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pastRewardBadge: { fontSize: 16 },
  pastRewardLabel: { ...typography.body, fontSize: 13, color: colors.textPrimary },
  expandHint: { ...typography.body, fontSize: 11, color: colors.primary, textAlign: 'center', marginTop: spacing.sm },

  // Empty history
  emptyHistory: { alignItems: 'center', paddingVertical: spacing.xxl * 2 },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...typography.displayMedium, fontSize: 18, color: colors.textPrimary, marginBottom: spacing.sm },
  emptySubtitle: { ...typography.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl, lineHeight: 20 },
});
