import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ViewStyle,
  TouchableOpacity, StatusBar, Animated, Easing,
} from 'react-native';
import { colors, spacing, radius, typography, anim, glass } from '../theme';
import { useNexaStore } from '../store/nexaStore';
import {
  Avatar, Card, SectionHeader, XPBar, ProgressBar,
  Pill, GlowCard, ScalePress, FadeInView, CounterText,
} from '../components/ui';

const RARITY_COLORS: Record<string, [string, string]> = {
  legendary: [colors.gold, colors.gold + '18'],
  epic:      [colors.primary, colors.primary + '18'],
  rare:      [colors.green, colors.green + '18'],
  common:    [colors.textSecondary, colors.bgElevated],
};

const DNA_LABELS: Record<string, string> = {
  aggressive:   'Agressivo',
  conservative: 'Conservador',
  analytical:   'Analitico',
};

const STATE_LABELS: Record<string, string> = {
  motivated:   'Motivado',
  frustrated:  'Frustrado',
  impulsive:   'Impulsivo',
  disengaged:  'Desengajado',
};

const STATE_COLORS: Record<string, string> = {
  motivated:  colors.green,
  frustrated: colors.red,
  impulsive:  colors.orange,
  disengaged: colors.textMuted,
};

// =====================================================
// Hero Section — Vercel: bold identity
// =====================================================
function HeroSection({ user }: { user: any }) {
  const glowAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.4, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(glowAnim, { toValue: 0.2, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  return (
    <FadeInView delay={0}>
      <View style={styles.hero}>
        {/* Ambient glow behind avatar */}
        <Animated.View style={[styles.heroGlow, { opacity: glowAnim }]} />
        <Avatar label={user.avatar} size={72} tier="silver" ring />
        <Text style={styles.heroName}>{user.username}</Text>
        <View style={styles.heroBadges}>
          <Pill label={`Nivel ${user.level}`} color={colors.primary} bg={colors.primary + '18'} size="md" />
          <Pill label={`Cla ${user.clan}`} color={colors.gold} bg={colors.gold + '12'} size="md" />
        </View>
        <View style={styles.heroDNA}>
          <View style={[styles.dnaPill, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
            <Text style={[styles.dnaPillText, { color: colors.primary }]}>{DNA_LABELS[user.dna]}</Text>
          </View>
          <View style={[styles.dnaPill, { backgroundColor: STATE_COLORS[user.state] + '12', borderColor: STATE_COLORS[user.state] + '30' }]}>
            <Text style={[styles.dnaPillText, { color: STATE_COLORS[user.state] }]}>{STATE_LABELS[user.state]}</Text>
          </View>
        </View>
      </View>
    </FadeInView>
  );
}

// =====================================================
// Level Progress — Fortnite battle pass style
// =====================================================
function LevelProgress({ user }: { user: any }) {
  const remaining = user.xpToNext - user.xp;

  return (
    <FadeInView delay={100}>
      <Card style={styles.levelCard} variant="accent">
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{user.level}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelLabel}>Nivel {user.level}</Text>
              <Text style={styles.levelNext}>Nivel {user.level + 1}</Text>
            </View>
            <XPBar current={user.xp} max={user.xpToNext} />
          </View>
        </View>
        <View style={styles.levelMeta}>
          <Text style={styles.levelXP}>{user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP</Text>
          <Text style={styles.levelHint}>Faltam {remaining.toLocaleString()} XP para Tipster Ouro</Text>
        </View>

        {/* Battle pass rewards preview */}
        <View style={styles.rewardsRow}>
          {[
            { level: user.level + 1, label: 'Moldura', color: colors.green, unlocked: false },
            { level: user.level + 2, label: 'Titulo', color: colors.primary, unlocked: false },
            { level: user.level + 3, label: 'Avatar', color: colors.gold, unlocked: false },
          ].map((r, i) => (
            <View key={i} style={[styles.rewardItem, { borderColor: r.color + '35' }]}>
              <Text style={[styles.rewardIcon, { color: r.color }]}>?</Text>
              <Text style={styles.rewardLevel}>Nv {r.level}</Text>
              <Text style={[styles.rewardLabel, { color: r.color }]}>{r.label}</Text>
            </View>
          ))}
        </View>
      </Card>
    </FadeInView>
  );
}

// =====================================================
// Wallet — Stripe: trust + clarity
// =====================================================
function WalletSection({ user }: { user: any }) {
  return (
    <FadeInView delay={200}>
      <View style={styles.walletRow}>
        <ScalePress style={{ flex: 1 }}>
          <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>Saldo</Text>
            <Text style={styles.walletVal}>R$ {user.balance.toFixed(2)}</Text>
            <View style={styles.walletAction}>
              <Text style={styles.walletActionText}>Depositar</Text>
            </View>
          </View>
        </ScalePress>
        <ScalePress style={{ flex: 1 }}>
          <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>Moedas NEXA</Text>
            <CounterText value={user.coins} style={[styles.walletVal, { color: colors.gold }]} />
            <View style={[styles.walletAction, { borderColor: colors.gold + '35' }]}>
              <Text style={[styles.walletActionText, { color: colors.gold }]}>Loja</Text>
            </View>
          </View>
        </ScalePress>
      </View>
    </FadeInView>
  );
}

// =====================================================
// Stat Grid — enhanced with mini trends
// =====================================================
function StatGrid({ user }: { user: any }) {
  const stats = [
    { val: user.xp.toLocaleString(), label: 'XP total', color: colors.primary, trend: '+340' },
    { val: `${user.winRate}%`, label: 'acerto', color: colors.green, trend: '+2.1%' },
    { val: `${user.roi}%`, label: 'ROI', color: colors.green, trend: '+1.2%' },
    { val: `${user.streak}d`, label: 'sequencia', color: colors.gold, trend: null },
    { val: `#${user.rank}`, label: 'ranking', color: colors.primary, trend: '+3' },
    { val: user.coins.toLocaleString(), label: 'moedas', color: colors.gold, trend: '+100' },
  ];
  return (
    <FadeInView delay={350}>
      <View style={styles.statGrid}>
        {stats.map((s, i) => (
          <ScalePress key={i}>
            <View style={styles.statCard}>
              <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              {s.trend && (
                <Text style={styles.statTrend}>{s.trend}</Text>
              )}
            </View>
          </ScalePress>
        ))}
      </View>
    </FadeInView>
  );
}

// =====================================================
// Activity Heatmap — GitHub-style contribution grid
// =====================================================
function ActivityHeatmap() {
  const weeks = 8;
  const days = 7;
  const data = useRef(
    Array.from({ length: weeks * days }, () => Math.random())
  ).current;

  return (
    <FadeInView delay={400}>
      <View style={styles.heatmapWrap}>
        <Text style={styles.heatmapTitle}>Atividade recente</Text>
        <View style={styles.heatmapGrid}>
          {Array.from({ length: weeks }, (_, w) => (
            <View key={w} style={styles.heatmapCol}>
              {Array.from({ length: days }, (_, d) => {
                const val = data[w * days + d];
                const bg = val > 0.7 ? colors.primary
                  : val > 0.4 ? colors.primary + '66'
                  : val > 0.15 ? colors.primary + '30'
                  : colors.bgHighlight;
                return <View key={d} style={[styles.heatmapCell, { backgroundColor: bg }]} />;
              })}
            </View>
          ))}
        </View>
        <View style={styles.heatmapLegend}>
          <Text style={styles.heatmapLegendText}>Menos</Text>
          {[colors.bgHighlight, colors.primary + '30', colors.primary + '66', colors.primary].map((c, i) => (
            <View key={i} style={[styles.heatmapLegendCell, { backgroundColor: c }]} />
          ))}
          <Text style={styles.heatmapLegendText}>Mais</Text>
        </View>
      </View>
    </FadeInView>
  );
}

// =====================================================
// Badge Grid — Fortnite: rarity glow
// =====================================================
function BadgeGrid({ badges }: { badges: any[] }) {
  return (
    <FadeInView delay={400}>
      <View style={styles.badgeGrid}>
        {badges.map((b, i) => {
          const [color, bg] = RARITY_COLORS[b.rarity] ?? RARITY_COLORS.common;
          return (
            <ScalePress key={b.id}>
              <GlowCard
                color={b.unlocked ? color : colors.textMuted}
                intensity={b.rarity === 'legendary' ? 'strong' : b.rarity === 'epic' ? 'normal' : 'subtle'}
                style={StyleSheet.flatten([styles.badgeItem, !b.unlocked && styles.badgeLocked]) as ViewStyle}
              >
                <Text style={styles.badgeIcon}>{b.unlocked ? b.icon : '?'}</Text>
                <View>
                  <Text style={[styles.badgeName, { color: b.unlocked ? color : colors.textMuted }]}>{b.name}</Text>
                  <Text style={[styles.badgeRarity, { color: b.unlocked ? color + '88' : colors.textMuted + '66' }]}>{b.rarity}</Text>
                </View>
              </GlowCard>
            </ScalePress>
          );
        })}
      </View>
    </FadeInView>
  );
}

// =====================================================
// Missions Panel — Duolingo: progress tracking
// =====================================================
function MissionsPanel() {
  const missions = useNexaStore(s => s.missions);
  return (
    <FadeInView delay={400}>
      <View style={styles.missionsWrap}>
        {missions.map((m, i) => (
          <ScalePress key={m.id}>
            <View style={[
              styles.missionItem,
              m.completed && styles.missionCompleted,
              m.type === 'hidden' && !m.completed && styles.missionHiddenCard,
            ]}>
              <View style={styles.missionLeft}>
                <View style={[
                  styles.missionIconWrap,
                  { backgroundColor: m.completed ? colors.green + '18' : m.type === 'hidden' ? colors.primary + '18' : colors.bgHighlight },
                ]}>
                  <Text style={[styles.missionIcon, { color: m.completed ? colors.green : colors.textSecondary }]}>
                    {m.completed ? 'V' : m.icon}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.missionTitle}>{m.title}</Text>
                  {m.type === 'hidden' && !m.completed
                    ? <Text style={styles.missionHiddenText}>Complete uma aposta para revelar</Text>
                    : <Text style={styles.missionDesc}>{m.description}</Text>
                  }
                  {m.type !== 'hidden' && !m.completed && (
                    <View style={styles.missionProgressRow}>
                      <View style={styles.missionProgressBar}>
                        <View style={[styles.missionProgressFill, { width: `${(m.progress / m.target) * 100}%` }]} />
                      </View>
                      <Text style={styles.missionProgressText}>{m.progress}/{m.target}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.missionRight}>
                <Pill label={`+${m.xpReward} XP`} color={colors.green} bg={colors.green + '15'} />
                {m.expiresIn && <Text style={styles.missionExpiry}>{m.expiresIn}</Text>}
              </View>
            </View>
          </ScalePress>
        ))}
      </View>
    </FadeInView>
  );
}

// =====================================================
// Perfil Screen
// =====================================================
export default function PerfilScreen() {
  const { user } = useNexaStore();
  const [tab, setTab] = useState<'stats' | 'missoes' | 'conquistas'>('stats');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <HeroSection user={user} />
        <LevelProgress user={user} />
        <WalletSection user={user} />

        {/* Inner tabs */}
        <View style={styles.tabRow}>
          {(['stats', 'missoes', 'conquistas'] as const).map(t => (
            <ScalePress key={t} onPress={() => setTab(t)}>
              <View style={[styles.tab, tab === t && styles.tabActive]}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === 'stats' ? 'Estatisticas' : t === 'missoes' ? 'Missoes' : 'Conquistas'}
                </Text>
              </View>
            </ScalePress>
          ))}
        </View>

        {tab === 'stats' && (
          <>
            <StatGrid user={user} />
            <ActivityHeatmap />
          </>
        )}
        {tab === 'missoes' && (
          <>
            <SectionHeader title="Missoes ativas" action={`${user.badges.length} ativas`} />
            <MissionsPanel />
          </>
        )}
        {tab === 'conquistas' && (
          <>
            <SectionHeader
              title="Conquistas"
              action={`${user.badges.filter((b: any) => b.unlocked).length} / ${user.badges.length}`}
            />
            <BadgeGrid badges={user.badges} />
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 40 },

  // Hero
  hero: { alignItems: 'center', paddingTop: 60, paddingBottom: spacing.xl, gap: spacing.sm },
  heroGlow: {
    position: 'absolute', top: 20, width: 160, height: 160, borderRadius: 80,
    backgroundColor: colors.primary,
  },
  heroName: { fontSize: 24, fontFamily: typography.display, color: colors.textPrimary, letterSpacing: -0.3 },
  heroBadges: { flexDirection: 'row', gap: spacing.sm },
  heroDNA: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  dnaPill: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 0.5,
  },
  dnaPillText: { fontSize: 11, fontFamily: typography.bodyMed },

  // Level progress
  levelCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, gap: spacing.sm },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  levelBadge: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: colors.primary + '22', borderWidth: 0.5, borderColor: colors.primary + '44',
    alignItems: 'center', justifyContent: 'center',
  },
  levelBadgeText: { fontSize: 18, fontFamily: typography.display, color: colors.primary },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  levelLabel: { fontSize: 12, fontFamily: typography.bodyMed, color: colors.textPrimary },
  levelNext: { fontSize: 11, fontFamily: typography.body, color: colors.textMuted },
  levelMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelXP: { fontSize: 12, fontFamily: typography.mono, color: colors.textSecondary },
  levelHint: { fontSize: 11, color: colors.gold, fontFamily: typography.bodyMed },

  // Battle pass rewards
  rewardsRow: { flexDirection: 'row', gap: spacing.sm },
  rewardItem: {
    flex: 1, alignItems: 'center', gap: 3,
    paddingVertical: spacing.sm, borderRadius: radius.md,
    borderWidth: 0.5, backgroundColor: colors.bgHighlight + '44',
  },
  rewardIcon: { fontSize: 16, fontFamily: typography.display },
  rewardLevel: { fontSize: 9, fontFamily: typography.body, color: colors.textMuted },
  rewardLabel: { fontSize: 10, fontFamily: typography.bodyMed },

  // Wallet
  walletRow: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  walletCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 0.5, borderColor: colors.border,
    padding: spacing.lg, gap: 6,
  },
  walletLabel: { fontSize: 11, color: colors.textMuted, fontFamily: typography.body },
  walletVal: { fontSize: 22, fontFamily: typography.monoBold, color: colors.textPrimary },
  walletAction: {
    marginTop: 4, borderWidth: 0.5, borderColor: colors.primary + '35',
    borderRadius: radius.full, paddingVertical: 5, alignItems: 'center',
  },
  walletActionText: { fontSize: 11, fontFamily: typography.bodyMed, color: colors.primary },

  // Tabs
  tabRow: { flexDirection: 'row', marginHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.bgElevated, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontFamily: typography.bodyMed, color: colors.textSecondary },
  tabTextActive: { color: '#fff' },

  // Stats
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm },
  statCard: {
    width: '30%' as any, flexGrow: 1,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 0.5, borderColor: colors.border,
    padding: spacing.md, alignItems: 'center', gap: 3,
  },
  statVal: { fontSize: 20, fontFamily: typography.monoBold },
  statLabel: { fontSize: 10, color: colors.textMuted, fontFamily: typography.body },
  statTrend: { fontSize: 9, fontFamily: typography.mono, color: colors.green },

  // Heatmap
  heatmapWrap: { marginHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.sm },
  heatmapTitle: { fontSize: 13, fontFamily: typography.bodySemi, color: colors.textSecondary },
  heatmapGrid: { flexDirection: 'row', gap: 3 },
  heatmapCol: { gap: 3 },
  heatmapCell: { width: 12, height: 12, borderRadius: 2 },
  heatmapLegend: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' },
  heatmapLegendText: { fontSize: 9, color: colors.textMuted, fontFamily: typography.body },
  heatmapLegendCell: { width: 10, height: 10, borderRadius: 2 },

  // Badges
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm },
  badgeItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  badgeLocked: { opacity: 0.4 },
  badgeIcon: { fontSize: 16, fontFamily: typography.display, color: colors.textSecondary },
  badgeName: { fontSize: 12, fontFamily: typography.bodySemi },
  badgeRarity: { fontSize: 9, fontFamily: typography.body, marginTop: 1 },

  // Missions
  missionsWrap: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  missionItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 0.5, borderColor: colors.border,
    padding: spacing.md, gap: spacing.sm,
  },
  missionCompleted: { opacity: 0.6 },
  missionHiddenCard: { borderColor: colors.primary + '35', backgroundColor: colors.primary + '06' },
  missionLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  missionIconWrap: {
    width: 34, height: 34, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  missionIcon: { fontSize: 14, fontFamily: typography.bodySemi },
  missionTitle: { fontSize: 13, fontFamily: typography.bodySemi, color: colors.textPrimary },
  missionDesc: { fontSize: 11, color: colors.textMuted, fontFamily: typography.body, marginTop: 2 },
  missionHiddenText: { fontSize: 11, color: colors.primary, fontFamily: typography.bodyMed, marginTop: 2 },
  missionProgressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  missionProgressBar: { flex: 1, height: 3, backgroundColor: colors.bgHighlight, borderRadius: 2, overflow: 'hidden' },
  missionProgressFill: { height: '100%' as any, backgroundColor: colors.primary, borderRadius: 2 },
  missionProgressText: { fontSize: 10, fontFamily: typography.mono, color: colors.textMuted },
  missionRight: { alignItems: 'flex-end', gap: 4 },
  missionExpiry: { fontSize: 9, fontFamily: typography.body, color: colors.red + '88' },
});
