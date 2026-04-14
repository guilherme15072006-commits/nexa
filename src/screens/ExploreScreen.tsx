import React, { useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Avatar, Card, Pill, SectionHeader } from '../components/ui';
import { SmoothEntry, TapScale } from '../components/LiveComponents';
import { hapticLight, hapticMedium } from '../services/haptics';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, ExploreCategory, Match, Tipster, FeedPost } from '../store/nexaStore';

// ─── Category Button ────────────────────────────────────────────────────────

interface CategoryBtnProps {
  category: ExploreCategory;
  onPress: () => void;
}

function CategoryBtn({ category, onPress }: CategoryBtnProps) {
  return (
    <TapScale onPress={onPress} style={styles.categoryBtn}>
      <View style={[styles.categoryCircle, { backgroundColor: category.color + '20' }]}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>{category.name}</Text>
      <Text style={styles.categoryCount}>{category.count}</Text>
    </TapScale>
  );
}

// ─── Trending Match Card ────────────────────────────────────────────────────

interface TrendingCardProps {
  match: Match;
  onPress: () => void;
}

function TrendingCard({ match, onPress }: TrendingCardProps) {
  const isLive = match.status === 'live';
  return (
    <TapScale onPress={onPress} style={styles.trendingCard}>
      <View style={styles.trendingCardInner}>
        {isLive && (
          <View style={styles.liveDot}>
            <View style={styles.liveDotInner} />
            <Text style={styles.liveText}>AO VIVO</Text>
          </View>
        )}
        <Text style={styles.trendingLeague}>{match.league}</Text>
        <View style={styles.trendingTeams}>
          <Text style={styles.trendingTeam} numberOfLines={1}>{match.homeTeam}</Text>
          {isLive && match.score ? (
            <Text style={styles.trendingScore}>{match.score.home} - {match.score.away}</Text>
          ) : (
            <Text style={styles.trendingVs}>vs</Text>
          )}
          <Text style={styles.trendingTeam} numberOfLines={1}>{match.awayTeam}</Text>
        </View>
        {isLive && match.minute != null && (
          <Text style={styles.trendingMinute}>{match.minute}'</Text>
        )}
        <View style={styles.trendingOdds}>
          <View style={styles.oddChip}>
            <Text style={styles.oddChipText}>{match.odds.home.toFixed(2)}</Text>
          </View>
          <View style={styles.oddChip}>
            <Text style={styles.oddChipText}>{match.odds.draw.toFixed(2)}</Text>
          </View>
          <View style={styles.oddChip}>
            <Text style={styles.oddChipText}>{match.odds.away.toFixed(2)}</Text>
          </View>
        </View>
        <Text style={styles.trendingBettors}>{match.bettors} apostadores</Text>
      </View>
    </TapScale>
  );
}

// ─── Tipster Spotlight ──────────────────────────────────────────────────────

interface TipsterSpotlightProps {
  tipster: Tipster;
  onFollow: () => void;
  onPress: () => void;
}

function TipsterSpotlight({ tipster, onFollow, onPress }: TipsterSpotlightProps) {
  const tierColor = tipster.tier === 'elite' ? colors.primary :
    tipster.tier === 'gold' ? colors.gold : colors.textSecondary;
  return (
    <TapScale onPress={onPress} style={styles.tipsterCard}>
      <View style={styles.tipsterCardInner}>
        <Avatar uri={tipster.avatar} size={48} username={tipster.username} />
        <View style={styles.tipsterInfo}>
          <View style={styles.tipsterNameRow}>
            <Text style={styles.tipsterName}>{tipster.username}</Text>
            <Pill label={tipster.tier.toUpperCase()} color={tierColor} />
          </View>
          <Text style={styles.tipsterStats}>
            {(tipster.winRate * 100).toFixed(0)}% WR  ·  {tipster.roi > 0 ? '+' : ''}{(tipster.roi * 100).toFixed(0)}% ROI
          </Text>
          <Text style={styles.tipsterFollowers}>
            {tipster.followers.toLocaleString()} seguidores · {tipster.streak} streak
          </Text>
        </View>
        {!tipster.isFollowing && (
          <TapScale onPress={onFollow}>
            <View style={styles.followBtn}>
              <Text style={styles.followBtnText}>Seguir</Text>
            </View>
          </TapScale>
        )}
      </View>
    </TapScale>
  );
}

// ─── Viral Card ─────────────────────────────────────────────────────────────

interface ViralCardProps {
  post: FeedPost;
}

function ViralCard({ post }: ViralCardProps) {
  const tierColor = post.user.tier === 'elite' ? colors.primary :
    post.user.tier === 'gold' ? colors.gold : colors.textSecondary;
  return (
    <View style={styles.viralCard}>
      <View style={styles.viralHeader}>
        <Text style={styles.viralLabel}>Viral da semana</Text>
        <Text style={styles.viralFire}>🔥</Text>
      </View>
      <View style={styles.viralUserRow}>
        <Avatar uri={post.user.avatar} size={32} username={post.user.username} />
        <View style={{ marginLeft: spacing.sm }}>
          <Text style={styles.viralUsername}>{post.user.username}</Text>
          {post.user.tier && <Pill label={post.user.tier.toUpperCase()} color={tierColor} />}
        </View>
      </View>
      <Text style={styles.viralContent}>{post.content}</Text>
      <View style={styles.viralStatsRow}>
        <Text style={styles.viralStat}>{post.copies} cópias</Text>
        <Text style={styles.viralStatSep}>·</Text>
        <Text style={styles.viralStat}>{post.likes} likes</Text>
        <Text style={styles.viralStatSep}>·</Text>
        <Text style={styles.viralStat}>{post.comments} comments</Text>
      </View>
    </View>
  );
}

// ─── Explore Screen ─────────────────────────────────────────────────────────

export default function ExploreScreen() {
  const exploreCategories = useNexaStore((s) => s.exploreCategories);
  const matches = useNexaStore((s) => s.matches);
  const tipsters = useNexaStore((s) => s.tipsters);
  const feed = useNexaStore((s) => s.feed);
  const followTipster = useNexaStore((s) => s.followTipster);
  const trackEvent = useNexaStore((s) => s.trackEvent);
  const user = useNexaStore((s) => s.user);
  const interactionHistory = useNexaStore((s) => s.interactionHistory);
  const navigation = useNavigation<any>();

  // Trending matches: live first, then by bettors
  const trendingMatches = [...matches].sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (b.status === 'live' && a.status !== 'live') return 1;
    return b.bettors - a.bettors;
  });

  // Top tipsters not yet followed, by influence (followers * winRate)
  const spotlightTipsters = [...tipsters]
    .filter((t) => !t.isFollowing)
    .sort((a, b) => (b.followers * b.winRate) - (a.followers * a.winRate))
    .slice(0, 5);

  // Popular bets (highest bettors)
  const popularMatches = [...matches]
    .sort((a, b) => b.bettors - a.bettors)
    .slice(0, 4);

  // Viral post (most copies)
  const viralPost = [...feed].sort((a, b) => b.copies - a.copies)[0];

  // Activity-based recommendations
  const hasActivity = interactionHistory.length > 0;
  const activityMatches = hasActivity
    ? matches.filter((m) => m.trending).slice(0, 3)
    : [];

  const handleCategoryPress = useCallback((cat: ExploreCategory) => {
    hapticLight();
    trackEvent('explore_category_tap', { categoryId: cat.id, name: cat.name });
    // Navigation to filtered view (future)
  }, []);

  const handleFollowTipster = useCallback((tipsterId: string) => {
    hapticMedium();
    followTipster(tipsterId);
    trackEvent('explore_follow', { tipsterId });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { hapticLight(); navigation.goBack(); }} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Explorar</Text>
          <TapScale onPress={() => { hapticLight(); navigation.navigate('Search'); }}>
            <View style={styles.searchIcon}>
              <Text style={styles.searchIconText}>🔍</Text>
            </View>
          </TapScale>
        </View>

        {/* Category Grid */}
        <SmoothEntry delay={0}>
          <View style={styles.categoryGrid}>
            {exploreCategories.map((cat) => (
              <CategoryBtn
                key={cat.id}
                category={cat}
                onPress={() => handleCategoryPress(cat)}
              />
            ))}
          </View>
        </SmoothEntry>

        {/* Em alta agora */}
        <SmoothEntry delay={100}>
          <SectionHeader title="🔥 Em alta agora" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {trendingMatches.slice(0, 6).map((match) => (
              <TrendingCard
                key={match.id}
                match={match}
                onPress={() => {
                  hapticLight();
                  trackEvent('explore_match_tap', { matchId: match.id });
                }}
              />
            ))}
          </ScrollView>
        </SmoothEntry>

        {/* Tipsters em destaque */}
        <SmoothEntry delay={200}>
          <SectionHeader title="🏅 Tipsters em destaque" />
          <View style={styles.tipstersList}>
            {spotlightTipsters.map((tipster) => (
              <TipsterSpotlight
                key={tipster.id}
                tipster={tipster}
                onFollow={() => handleFollowTipster(tipster.id)}
                onPress={() => {
                  hapticLight();
                  trackEvent('explore_tipster_tap', { tipsterId: tipster.id });
                  navigation.navigate('TipsterProfile', { tipsterId: tipster.id });
                }}
              />
            ))}
          </View>
        </SmoothEntry>

        {/* Apostas populares */}
        <SmoothEntry delay={300}>
          <SectionHeader title="📈 Apostas populares" />
          <View style={styles.popularList}>
            {popularMatches.map((match, i) => (
              <TapScale
                key={match.id}
                onPress={() => {
                  hapticLight();
                  trackEvent('explore_popular_tap', { matchId: match.id });
                }}
              >
                <View style={styles.popularItem}>
                  <Text style={styles.popularRank}>#{i + 1}</Text>
                  <View style={styles.popularInfo}>
                    <Text style={styles.popularTeams}>{match.homeTeam} vs {match.awayTeam}</Text>
                    <Text style={styles.popularLeague}>{match.league}</Text>
                  </View>
                  <View style={styles.popularBettors}>
                    <Text style={styles.popularBettorsCount}>{match.bettors}</Text>
                    <Text style={styles.popularBettorsLabel}>apostas</Text>
                  </View>
                </View>
              </TapScale>
            ))}
          </View>
        </SmoothEntry>

        {/* Baseado na sua atividade */}
        {hasActivity && activityMatches.length > 0 && (
          <SmoothEntry delay={400}>
            <SectionHeader title="🎯 Baseado na sua atividade" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {activityMatches.map((match) => (
                <TrendingCard
                  key={`act-${match.id}`}
                  match={match}
                  onPress={() => {
                    hapticLight();
                    trackEvent('explore_activity_tap', { matchId: match.id });
                  }}
                />
              ))}
            </ScrollView>
          </SmoothEntry>
        )}

        {/* Viral da semana */}
        {viralPost && (
          <SmoothEntry delay={500}>
            <View style={styles.viralSection}>
              <ViralCard post={viralPost} />
            </View>
          </SmoothEntry>
        )}

        <View style={{ height: spacing.xxl * 2 }} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    ...typography.display,
    color: colors.textPrimary,
    fontSize: 26,
  },
  backBtn: {
    padding: spacing.xs,
  },
  backBtnText: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  searchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIconText: {
    fontSize: 18,
  },

  // Categories
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  categoryBtn: {
    width: '22%',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 11,
    textAlign: 'center',
  },
  categoryCount: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 10,
  },

  // Horizontal scroll
  horizontalScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },

  // Trending cards
  trendingCard: {
    width: 220,
  },
  trendingCardInner: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  liveDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  liveDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.red,
  },
  liveText: {
    ...typography.monoBold,
    color: colors.red,
    fontSize: 9,
  },
  trendingLeague: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  trendingTeams: {
    alignItems: 'center',
    gap: 2,
    marginBottom: spacing.sm,
  },
  trendingTeam: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 14,
    textAlign: 'center',
  },
  trendingVs: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
  },
  trendingScore: {
    ...typography.monoBold,
    color: colors.primary,
    fontSize: 18,
  },
  trendingMinute: {
    ...typography.monoBold,
    color: colors.green,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  trendingOdds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  oddChip: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    paddingVertical: 4,
    alignItems: 'center',
  },
  oddChipText: {
    ...typography.mono,
    color: colors.textPrimary,
    fontSize: 12,
  },
  trendingBettors: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },

  // Tipsters list
  tipstersList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  tipsterCard: {
    width: '100%',
  },
  tipsterCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipsterInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  tipsterNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  tipsterName: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  tipsterStats: {
    ...typography.mono,
    color: colors.green,
    fontSize: 11,
  },
  tipsterFollowers: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
  },
  followBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  followBtnText: {
    ...typography.bodySemiBold,
    color: '#fff',
    fontSize: 12,
  },

  // Popular
  popularList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  popularRank: {
    ...typography.monoBold,
    color: colors.primary,
    fontSize: 16,
    width: 32,
  },
  popularInfo: {
    flex: 1,
  },
  popularTeams: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  popularLeague: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
  },
  popularBettors: {
    alignItems: 'center',
  },
  popularBettorsCount: {
    ...typography.monoBold,
    color: colors.gold,
    fontSize: 16,
  },
  popularBettorsLabel: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 10,
  },

  // Viral
  viralSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  viralCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  viralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  viralLabel: {
    ...typography.bodySemiBold,
    color: colors.primary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  viralFire: {
    fontSize: 20,
  },
  viralUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viralUsername: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  viralContent: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  viralStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viralStat: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 11,
  },
  viralStatSep: {
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },
});
