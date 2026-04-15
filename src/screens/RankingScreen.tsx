import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Animated, Easing,
} from 'react-native';
import { colors, spacing, radius, typography, anim, glass } from '../theme';
import { useNexaStore } from '../store/nexaStore';
import {
  Avatar, Card, SectionHeader, Pill, tierColor,
  ScalePress, FadeInView, CounterText, ProgressBar, XPBar,
} from '../components/ui';

const TABS = ['Semanal', 'Mensal', 'Clas'];

// =====================================================
// Top 3 Podium — Fortnite/Clash Royale: crown display
// =====================================================
function Podium({ entries }: { entries: any[] }) {
  const top3 = entries.filter(e => e.rank <= 3);
  if (top3.length < 3) return null;

  // Reorder for podium: 2nd, 1st, 3rd
  const ordered = [top3[1], top3[0], top3[2]];
  const heights = [80, 108, 64];
  const tierMap = ['gold', 'elite', 'silver'];
  const crownLabels = ['2', '1', '3'];

  return (
    <FadeInView delay={100}>
      <View style={styles.podiumRow}>
        {ordered.map((entry, i) => {
          const isFirst = i === 1;
          return (
            <PodiumItem
              key={entry.rank}
              entry={entry}
              height={heights[i]}
              tier={tierMap[i]}
              crown={crownLabels[i]}
              isFirst={isFirst}
              delay={200 + i * 150}
            />
          );
        })}
      </View>
    </FadeInView>
  );
}

function PodiumItem({ entry, height, tier, crown, isFirst, delay }: {
  entry: any; height: number; tier: string; crown: string;
  isFirst: boolean; delay: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, ...anim.springBouncy }),
        Animated.spring(slideAnim, { toValue: 0, ...anim.springGentle }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const crownColor = isFirst ? colors.gold : tier === 'gold' ? '#C0C0C0' : '#CD7F32';

  return (
    <Animated.View style={[
      styles.podiumItem,
      { transform: [{ scale: scaleAnim }, { translateY: slideAnim }] },
    ]}>
      {/* Crown */}
      <View style={[styles.podiumCrown, { backgroundColor: crownColor + '22', borderColor: crownColor + '55' }]}>
        <Text style={[styles.podiumCrownText, { color: crownColor }]}>{crown}</Text>
      </View>

      <Avatar label={entry.user.avatar} size={isFirst ? 52 : 42} tier={tier} ring={isFirst} />
      <Text style={[styles.podiumName, isFirst && styles.podiumNameFirst]} numberOfLines={1}>
        {entry.user.username}
      </Text>
      <Text style={styles.podiumXP}>{entry.xp.toLocaleString()}</Text>

      {/* Podium base */}
      <View style={[
        styles.podiumBase,
        { height, backgroundColor: isFirst ? colors.gold + '18' : colors.bgElevated },
        isFirst && { borderColor: colors.gold + '44', borderWidth: 0.5 },
      ]}>
        <Text style={[styles.podiumRank, isFirst && { color: colors.gold }]}>#{entry.rank}</Text>
        <Text style={styles.podiumWinRate}>{entry.user.winRate}%</Text>
      </View>
    </Animated.View>
  );
}

// =====================================================
// Leaderboard Item — Linear: clean rows with hierarchy
// =====================================================
function LeaderboardItem({ entry, isMe, index }: { entry: any; isMe: boolean; index: number }) {
  if (entry.rank <= 3) return null;

  return (
    <FadeInView delay={300 + index * 60}>
      <ScalePress scale={0.99}>
        <View style={[styles.rankRow, isMe && styles.rankRowMe]}>
          <View style={styles.rankNumWrap}>
            <Text style={[styles.rankNum, isMe && styles.rankNumMe]}>{entry.rank}</Text>
          </View>
          <Avatar label={entry.user.avatar} size={36} tier="default" />
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <View style={styles.rankNameRow}>
              <Text style={[styles.rankName, isMe && styles.rankNameMe]}>
                {entry.user.username}{isMe ? ' (voce)' : ''}
              </Text>
            </View>
            <View style={styles.rankMeta}>
              <Text style={styles.rankSub}>{entry.user.winRate}% acerto</Text>
              <View style={styles.rankDot} />
              <Text style={styles.rankClan}>{entry.user.clan}</Text>
            </View>
            {isMe && (
              <View style={styles.rankHintRow}>
                <Text style={styles.rankAlmost}>quase subiu de nivel</Text>
                <View style={styles.rankHintBar}>
                  <View style={[styles.rankHintFill, { width: '78%' }]} />
                </View>
              </View>
            )}
          </View>
          <View style={styles.rankXPWrap}>
            <CounterText value={entry.xp} style={[styles.rankXP, isMe && styles.rankXPMe]} />
            <Text style={styles.rankXPLabel}>XP</Text>
          </View>
        </View>
      </ScalePress>
    </FadeInView>
  );
}

// =====================================================
// Season Card — Fortnite: battle pass / season progress
// =====================================================
function SeasonCard() {
  return (
    <FadeInView delay={50}>
      <Card style={styles.seasonCard} variant="accent">
        <View style={styles.seasonTop}>
          <View>
            <Text style={styles.seasonLabel}>Temporada 3</Text>
            <Text style={styles.seasonTitle}>Ascensao dos Predadores</Text>
          </View>
          <View style={styles.seasonTimer}>
            <Text style={styles.seasonTimerVal}>18d</Text>
            <Text style={styles.seasonTimerLabel}>restantes</Text>
          </View>
        </View>
        <ProgressBar progress={72} target={100} color={colors.gold} />
        <View style={styles.seasonMeta}>
          <Text style={styles.seasonMetaText}>Nivel 38 / 50</Text>
          <Text style={styles.seasonMetaReward}>Proxima: Moldura Lendaria</Text>
        </View>
      </Card>
    </FadeInView>
  );
}

// =====================================================
// Clan Card — Clash Royale: clan competition
// =====================================================
function ClanCard({ clan, index }: { clan: any; index: number }) {
  return (
    <FadeInView delay={200 + index * 100}>
      <ScalePress>
        <Card style={styles.clanCard}>
          <View style={styles.clanTop}>
            <View style={[styles.clanIcon, { backgroundColor: clan.color + '22' }]}>
              <Text style={[styles.clanIconText, { color: clan.color }]}>{clan.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.clanNameRow}>
                <Text style={styles.clanName}>{clan.name}</Text>
                <Pill label={`[${clan.tag}]`} color={clan.color} bg={clan.color + '18'} />
              </View>
              <Text style={styles.clanSub}>{clan.members} membros  Rank #{clan.rank}</Text>
            </View>
            <View style={styles.clanXPWrap}>
              <Text style={styles.clanXP}>{(clan.xp / 1000).toFixed(1)}k</Text>
            </View>
          </View>

          {/* Clan stats — Clash Royale grid */}
          <View style={styles.clanStats}>
            <View style={styles.clanStat}>
              <Text style={styles.clanStatVal}>+{(clan.weeklyXp / 1000).toFixed(1)}k</Text>
              <Text style={styles.clanStatLabel}>XP semana</Text>
            </View>
            <View style={styles.clanStatSep} />
            <View style={styles.clanStat}>
              <Text style={styles.clanStatVal}>{clan.members}</Text>
              <Text style={styles.clanStatLabel}>membros</Text>
            </View>
            <View style={styles.clanStatSep} />
            <View style={styles.clanStat}>
              <Text style={styles.clanStatVal}>#{clan.rank}</Text>
              <Text style={styles.clanStatLabel}>ranking</Text>
            </View>
          </View>

          {/* Weekly progress bar */}
          <View style={styles.clanProgress}>
            <View style={styles.clanProgressHeader}>
              <Text style={styles.clanProgressLabel}>Meta semanal</Text>
              <Text style={styles.clanProgressVal}>{Math.round((clan.weeklyXp / 10000) * 100)}%</Text>
            </View>
            <ProgressBar progress={clan.weeklyXp} target={10000} color={clan.color} />
          </View>
        </Card>
      </ScalePress>
    </FadeInView>
  );
}

// =====================================================
// Ranking Screen
// =====================================================
export default function RankingScreen() {
  const { leaderboard, user, clan } = useNexaStore();
  const [tab, setTab] = useState(0);

  const clans = [
    clan,
    { ...clan, id: 'c2', name: 'Sharks FC', tag: 'SHK', rank: 3, xp: 52000, weeklyXp: 9200, icon: 'S', color: colors.green, members: 34 },
    { ...clan, id: 'c3', name: 'Wolves', tag: 'WLF', rank: 8, xp: 38000, weeklyXp: 6100, icon: 'W', color: colors.orange, members: 21 },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ranking</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((t, i) => (
          <ScalePress key={i} onPress={() => setTab(i)}>
            <View style={[styles.tab, i === tab && styles.tabActive]}>
              <Text style={[styles.tabText, i === tab && styles.tabTextActive]}>{t}</Text>
            </View>
          </ScalePress>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Season progress */}
        <SeasonCard />

        {tab < 2 && (
          <>
            {/* Your position */}
            <FadeInView delay={80}>
              <View style={styles.myPosition}>
                <View style={styles.myPosLeft}>
                  <Text style={styles.myPosLabel}>Sua posicao</Text>
                  <Text style={styles.myPosNum}>#{user.rank}</Text>
                </View>
                <View style={styles.myPosRight}>
                  <CounterText value={user.xp} style={styles.myPosXP} suffix=" XP" />
                  <Text style={styles.myPosWinRate}>{user.winRate}% acerto</Text>
                </View>
              </View>
            </FadeInView>

            {/* Top 3 Podium */}
            <Podium entries={leaderboard} />

            {/* Rest of leaderboard */}
            <SectionHeader title={tab === 0 ? 'Top apostadores -- semana' : 'Top apostadores -- mes'} />
            {leaderboard.map((entry, i) => (
              <LeaderboardItem
                key={entry.rank}
                entry={entry}
                isMe={entry.user.username === user.username}
                index={i}
              />
            ))}
          </>
        )}

        {tab === 2 && (
          <>
            <SectionHeader title="Ranking de clas" action="criar cla" />
            {clans.map((c, i) => <ClanCard key={c.id} clan={c} index={i} />)}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  headerTitle: { fontSize: 24, fontFamily: typography.display, color: colors.textPrimary, letterSpacing: -0.3 },

  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.bgElevated, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontFamily: typography.bodyMed, color: colors.textSecondary },
  tabTextActive: { color: '#fff' },
  scroll: { paddingBottom: 40 },

  // Season
  seasonCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  seasonTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  seasonLabel: { fontSize: 11, fontFamily: typography.bodyMed, color: colors.primary },
  seasonTitle: { fontSize: 15, fontFamily: typography.bodySemi, color: colors.textPrimary, marginTop: 2 },
  seasonTimer: { alignItems: 'center' },
  seasonTimerVal: { fontSize: 18, fontFamily: typography.monoBold, color: colors.gold },
  seasonTimerLabel: { fontSize: 10, fontFamily: typography.body, color: colors.textMuted },
  seasonMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  seasonMetaText: { fontSize: 11, fontFamily: typography.body, color: colors.textMuted },
  seasonMetaReward: { fontSize: 11, fontFamily: typography.bodyMed, color: colors.gold },

  // My position
  myPosition: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    ...glass.elevated,
    padding: spacing.lg, borderRadius: radius.lg,
  },
  myPosLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  myPosLabel: { fontSize: 12, color: colors.textMuted, fontFamily: typography.body },
  myPosNum: { fontSize: 24, fontFamily: typography.display, color: colors.primary },
  myPosRight: { alignItems: 'flex-end' },
  myPosXP: { fontSize: 16, fontFamily: typography.monoBold, color: colors.textPrimary },
  myPosWinRate: { fontSize: 11, fontFamily: typography.body, color: colors.textMuted, marginTop: 2 },

  // Podium
  podiumRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm,
  },
  podiumItem: { alignItems: 'center', flex: 1, gap: 4 },
  podiumCrown: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, marginBottom: 4,
  },
  podiumCrownText: { fontSize: 14, fontFamily: typography.display },
  podiumName: { fontSize: 11, fontFamily: typography.bodySemi, color: colors.textPrimary, textAlign: 'center' },
  podiumNameFirst: { fontSize: 13 },
  podiumXP: { fontSize: 11, fontFamily: typography.mono, color: colors.textSecondary },
  podiumBase: {
    width: '100%', borderRadius: radius.md, alignItems: 'center',
    justifyContent: 'center', gap: 2, marginTop: 4,
  },
  podiumRank: { fontSize: 18, fontFamily: typography.display, color: colors.textPrimary },
  podiumWinRate: { fontSize: 10, fontFamily: typography.mono, color: colors.textMuted },

  // Leaderboard
  rankRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  rankRowMe: { backgroundColor: colors.primarySurface },
  rankNumWrap: { width: 28, alignItems: 'center' },
  rankNum: { fontSize: 14, fontFamily: typography.bodySemi, color: colors.textMuted },
  rankNumMe: { color: colors.primary },
  rankNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rankName: { fontSize: 14, fontFamily: typography.bodySemi, color: colors.textPrimary },
  rankNameMe: { color: colors.primary },
  rankMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  rankSub: { fontSize: 11, color: colors.textMuted, fontFamily: typography.body },
  rankDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textMuted },
  rankClan: { fontSize: 11, color: colors.textMuted, fontFamily: typography.bodyMed },
  rankHintRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  rankAlmost: { fontSize: 10, color: colors.primary, fontFamily: typography.bodySemi },
  rankHintBar: { flex: 1, height: 3, backgroundColor: colors.bgHighlight, borderRadius: 2, overflow: 'hidden' },
  rankHintFill: { height: '100%' as any, backgroundColor: colors.primary, borderRadius: 2 },
  rankXPWrap: { alignItems: 'flex-end' },
  rankXP: { fontSize: 14, fontFamily: typography.monoBold, color: colors.textSecondary },
  rankXPMe: { color: colors.primary },
  rankXPLabel: { fontSize: 9, fontFamily: typography.body, color: colors.textMuted },

  // Clan
  clanCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.md },
  clanTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  clanIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  clanIconText: { fontSize: 20, fontFamily: typography.display },
  clanNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  clanName: { fontSize: 15, fontFamily: typography.bodySemi, color: colors.textPrimary },
  clanSub: { fontSize: 11, color: colors.textMuted, fontFamily: typography.body, marginTop: 2 },
  clanXPWrap: { alignItems: 'flex-end' },
  clanXP: { fontSize: 16, fontFamily: typography.monoBold, color: colors.gold },
  clanStats: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: spacing.md },
  clanStat: { flex: 1, alignItems: 'center' },
  clanStatSep: { width: 0.5, backgroundColor: colors.border, marginVertical: 2 },
  clanStatVal: { fontSize: 16, fontFamily: typography.bodySemi, color: colors.textPrimary },
  clanStatLabel: { fontSize: 10, color: colors.textMuted, fontFamily: typography.body, marginTop: 2 },
  clanProgress: { gap: spacing.xs },
  clanProgressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  clanProgressLabel: { fontSize: 11, fontFamily: typography.body, color: colors.textMuted },
  clanProgressVal: { fontSize: 11, fontFamily: typography.mono, color: colors.textSecondary },
});
