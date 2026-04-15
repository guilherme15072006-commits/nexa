import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Animated, Easing,
  RefreshControl, Dimensions,
} from 'react-native';
import { colors, spacing, radius, typography, anim, glass } from '../theme';
import { useNexaStore } from '../store/nexaStore';
import {
  Avatar, Pill, LiveBadge, OddsBtn, Card, GlowCard,
  SectionHeader, XPBar, ProgressBar, tierColor,
  ScalePress, FadeInView, HeartBurst, CelebrationBurst,
  CounterText, TrendingIndicator, FloatingBar,
} from '../components/ui';

const { width } = Dimensions.get('window');

// =====================================================
// Floating Particles — Stake: ambient depth
// =====================================================
function BackgroundParticles() {
  const particles = useRef(
    Array.from({ length: 6 }, (_, i) => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * 200),
      opacity: new Animated.Value(0.04 + Math.random() * 0.06),
      size: 2 + Math.random() * 3,
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p, i) => {
      const drift = () => {
        Animated.parallel([
          Animated.timing(p.y, {
            toValue: -20, duration: 8000 + i * 2000,
            useNativeDriver: true, easing: Easing.linear,
          }),
          Animated.sequence([
            Animated.timing(p.opacity, {
              toValue: 0.1, duration: 4000, useNativeDriver: true,
            }),
            Animated.timing(p.opacity, {
              toValue: 0, duration: 4000 + i * 1000, useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          p.y.setValue(200 + Math.random() * 100);
          p.x.setValue(Math.random() * width);
          p.opacity.setValue(0.04);
          drift();
        });
      };
      setTimeout(drift, i * 1500);
    });
  }, []);

  return (
    <View style={styles.particlesWrap} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              width: p.size, height: p.size, borderRadius: p.size / 2,
              opacity: p.opacity,
              transform: [{ translateX: p.x }, { translateY: p.y }],
            },
          ]}
        />
      ))}
    </View>
  );
}

// =====================================================
// Check-in Banner — Duolingo: streak celebration
// =====================================================
function CheckinBanner() {
  const { checkinAvailable, claimCheckin, user, celebrating, setCelebrating } = useNexaStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!checkinAvailable) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, [checkinAvailable]);

  if (!checkinAvailable) return null;

  const handleClaim = () => {
    claimCheckin();
    setTimeout(() => setCelebrating(false), 1200);
  };

  return (
    <FadeInView delay={100}>
      <ScalePress onPress={handleClaim}>
        <Animated.View style={[styles.checkin, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.checkinIcon}>
            <Text style={styles.checkinIconText}>G</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.checkinTitle}>Check-in diario disponivel</Text>
            <Text style={styles.checkinSub}>+50 XP  +100 moedas  Sequencia {user.streak + 1}d</Text>
          </View>
          <View style={styles.checkinBadge}>
            <Text style={styles.checkinBadgeText}>Resgatar</Text>
          </View>
          <CelebrationBurst active={celebrating} />
        </Animated.View>
      </ScalePress>
    </FadeInView>
  );
}

// =====================================================
// Mission Card — Duolingo: progress + urgency
// =====================================================
function MissionCard() {
  const missions = useNexaStore(s => s.missions);
  const active = missions.find(m => !m.completed && m.type === 'daily');
  if (!active) return null;
  const almostDone = active.progress === active.target - 1;

  return (
    <FadeInView delay={200}>
      <Card style={styles.missionCard} variant={almostDone ? 'accent' : 'default'}>
        <View style={styles.missionTop}>
          <View style={styles.missionLeft}>
            <View style={styles.missionIconWrap}>
              <Text style={styles.missionIconText}>{active.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.missionTitle}>{active.title}</Text>
              {almostDone && <Text style={styles.missionAlmost}>falta 1 missao</Text>}
            </View>
          </View>
          <Pill label={`+${active.xpReward} XP`} color={colors.green} bg={colors.green + '18'} size="md" />
        </View>
        <ProgressBar progress={active.progress} target={active.target} color={almostDone ? colors.primary : colors.primary} />
        <View style={styles.missionMeta}>
          <Text style={styles.missionCaption}>{active.progress} de {active.target}</Text>
          <Text style={styles.missionExpiry}>expira em {active.expiresIn}</Text>
        </View>
      </Card>
    </FadeInView>
  );
}

// =====================================================
// Tipster Row — enhanced with profit + social proof
// =====================================================
function TipsterRow() {
  const { tipsters, followTipster } = useNexaStore();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipsterScroll}>
      {tipsters.map((t, i) => (
        <FadeInView key={t.id} delay={300 + i * 80}>
          <ScalePress onPress={() => followTipster(t.id)}>
            <View style={[styles.tipsterCard, t.tier === 'elite' && styles.tipsterCardElite]}>
              <Avatar label={t.avatar} size={40} tier={t.tier} ring={t.tier === 'elite'} />
              <Text style={styles.tipsterName} numberOfLines={1}>{t.username}</Text>
              <View style={styles.tipsterStats}>
                <Text style={styles.tipsterRate}>{t.winRate}%</Text>
                <Text style={styles.tipsterRoi}>+{t.roi}%</Text>
              </View>
              {/* Social proof: follower count */}
              <Text style={styles.tipsterFollowers}>{(t.followers / 1000).toFixed(1)}k</Text>
              {t.isFollowing
                ? <View style={styles.followingBadge}><Text style={styles.followingText}>V</Text></View>
                : <View style={styles.followBtn}><Text style={styles.followBtnText}>+</Text></View>
              }
            </View>
          </ScalePress>
        </FadeInView>
      ))}
    </ScrollView>
  );
}

// =====================================================
// AvatarStack — social proof: who else bet on this
// =====================================================
function AvatarStack({ count }: { count: number }) {
  const avatars = ['GP', 'MF', 'BK', 'TZ'];
  const shown = avatars.slice(0, Math.min(3, count));
  return (
    <View style={styles.avatarStack}>
      {shown.map((a, i) => (
        <View key={i} style={[styles.avatarStackItem, { marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }]}>
          <Avatar label={a} size={20} tier="default" />
        </View>
      ))}
      {count > 3 && <Text style={styles.avatarStackCount}>+{count - 3}</Text>}
    </View>
  );
}

// =====================================================
// Feed Post — Instagram: double-tap + enriched cards
// =====================================================
function FeedPost({ post, index }: { post: any; index: number }) {
  const { likePost, copyBet, selectedOdds, selectOdd } = useNexaStore();
  const [showHeart, setShowHeart] = useState(false);

  const handleDoubleTap = useCallback(() => {
    if (!post.isLiked) likePost(post.id);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  }, [post.isLiked, post.id]);

  return (
    <FadeInView delay={400 + index * 100} from={16}>
      <ScalePress onDoublePress={handleDoubleTap} scale={0.985}>
        <Card style={styles.feedCard}>
          {/* Header */}
          <View style={styles.postHeader}>
            <Avatar label={post.user.avatar} size={36} tier={post.user.tier} ring={post.user.tier === 'elite'} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <View style={styles.postUserRow}>
                <Text style={styles.postUsername}>{post.user.username}</Text>
                <Pill label={post.user.tier} color={tierColor(post.user.tier)} bg={tierColor(post.user.tier) + '18'} />
              </View>
              <Text style={styles.postTime}>{post.timestamp}</Text>
            </View>
            {post.hot && (
              <View style={styles.hotBadge}>
                <Text style={styles.hotText}>Em alta</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <Text style={styles.postContent}>{post.content}</Text>

          {/* Pick badge */}
          {post.pick && (
            <View style={styles.pickRow}>
              <View style={styles.pickBadge}>
                <Text style={styles.pickText}>{post.pick}</Text>
              </View>
              {post.odds && (
                <View style={styles.oddsBadge}>
                  <Text style={styles.oddsText}>{post.odds.toFixed(2)}</Text>
                </View>
              )}
            </View>
          )}

          {/* Match odds */}
          {post.match && post.type !== 'achievement' && (
            <View style={styles.matchOdds}>
              <View style={styles.matchHeader}>
                <Text style={styles.matchLeague}>{post.match.leagueIcon}  {post.match.league}</Text>
                {post.match.status === 'live' && <LiveBadge minute={post.match.minute} />}
              </View>
              <Text style={styles.matchTeams}>{post.match.homeTeam} vs {post.match.awayTeam}</Text>
              <View style={styles.oddsRow}>
                <OddsBtn
                  label={post.match.homeLogo} value={post.match.odds.home}
                  prevValue={post.match.prevOdds?.home}
                  selected={selectedOdds[post.match.id] === 'home'}
                  onPress={() => selectOdd(post.match.id, 'home')}
                />
                <OddsBtn
                  label="X" value={post.match.odds.draw}
                  prevValue={post.match.prevOdds?.draw}
                  selected={selectedOdds[post.match.id] === 'draw'}
                  onPress={() => selectOdd(post.match.id, 'draw')}
                />
                <OddsBtn
                  label={post.match.awayLogo} value={post.match.odds.away}
                  prevValue={post.match.prevOdds?.away}
                  selected={selectedOdds[post.match.id] === 'away'}
                  onPress={() => selectOdd(post.match.id, 'away')}
                />
              </View>
              {/* Betfair: bettors social proof */}
              <View style={styles.bettorsRow}>
                <AvatarStack count={6} />
                <Text style={styles.bettorsText}>{post.match.bettors.toLocaleString()} apostando agora</Text>
              </View>
            </View>
          )}

          {/* Social bar — Twitter: quick interactions */}
          <View style={styles.socialBar}>
            <ScalePress onPress={() => likePost(post.id)} scale={0.9}>
              <View style={styles.socialBtn}>
                <Text style={[styles.socialIcon, post.isLiked && { color: colors.red }]}>
                  {post.isLiked ? '\u2665' : '\u2661'}
                </Text>
                <Text style={[styles.socialCount, post.isLiked && { color: colors.red }]}>{post.likes}</Text>
              </View>
            </ScalePress>
            <View style={styles.socialBtn}>
              <Text style={styles.socialIcon}>C</Text>
              <Text style={styles.socialCount}>{post.comments}</Text>
            </View>
            {post.type === 'tip' && (
              <ScalePress onPress={() => copyBet(post.id)}>
                <View style={styles.copyBtn}>
                  <Text style={styles.copyBtnText}>Copiar aposta  {post.copies}</Text>
                </View>
              </ScalePress>
            )}
          </View>

          {/* Instagram: heart burst on double-tap */}
          <HeartBurst visible={showHeart} />
        </Card>
      </ScalePress>
    </FadeInView>
  );
}

// =====================================================
// Trending Section — Twitter: what's hot right now
// =====================================================
function TrendingBar() {
  const { matches } = useNexaStore();
  const liveCount = matches.filter(m => m.status === 'live').length;
  const totalBettors = matches.reduce((sum, m) => sum + m.bettors, 0);

  return (
    <FadeInView delay={50}>
      <View style={styles.trendingBar}>
        <View style={styles.trendingItem}>
          <LiveBadge />
          <Text style={styles.trendingItemText}>{liveCount} ao vivo</Text>
        </View>
        <View style={styles.trendingSeparator} />
        <TrendingIndicator count={totalBettors} label="apostando" />
      </View>
    </FadeInView>
  );
}

// =====================================================
// Feed Screen
// =====================================================
export default function FeedScreen() {
  const { feed, user, checkinAvailable, betslip, betslipVisible, simulateOddsChange } = useNexaStore();
  const [tab, setTab] = useState<'para-voce' | 'seguindo'>('para-voce');
  const [refreshing, setRefreshing] = useState(false);

  // Bet365: simulate live odds changes
  useEffect(() => {
    const interval = setInterval(() => {
      simulateOddsChange();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = tab === 'seguindo'
    ? feed.filter(p => user.following.includes(p.user.id))
    : feed;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      simulateOddsChange();
      setRefreshing(false);
    }, 800);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <BackgroundParticles />

      {/* Top bar — Linear: clean hierarchy */}
      <View style={styles.topBar}>
        <Text style={styles.logoText}>NEXA</Text>
        <View style={styles.topRight}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>{user.streak}d</Text>
          </View>
          <View style={styles.xpBadge}>
            <CounterText value={user.xp} style={styles.xpBadgeText} suffix=" XP" />
          </View>
          <Avatar label={user.avatar} size={30} tier="silver" />
        </View>
      </View>

      {/* XP bar — Duolingo: animated progress */}
      <View style={styles.xpBarWrap}>
        <XPBar current={user.xp} max={user.xpToNext} />
        <Text style={styles.levelText}>Nivel {user.level}</Text>
      </View>

      {/* Feed tabs */}
      <View style={styles.tabRow}>
        {(['para-voce', 'seguindo'] as const).map(t => (
          <ScalePress key={t} onPress={() => setTab(t)}>
            <View style={[styles.tab, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'para-voce' ? 'Para voce' : 'Seguindo'}
              </Text>
            </View>
          </ScalePress>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <TrendingBar />
        <CheckinBanner />
        <MissionCard />
        <SectionHeader title="Tipsters em destaque" action="ver todos" />
        <TipsterRow />
        <SectionHeader title="Feed ao vivo" />
        {filtered.map((post, i) => <FeedPost key={post.id} post={post} index={i} />)}
        <View style={{ height: betslipVisible ? 140 : 100 }} />
      </ScrollView>

      {/* Bet365: floating betslip */}
      <FloatingBar visible={betslipVisible}>
        <View style={styles.betslipBar}>
          <View style={styles.betslipInfo}>
            <Text style={styles.betslipCount}>{betslip.length} {betslip.length === 1 ? 'selecao' : 'selecoes'}</Text>
            <Text style={styles.betslipOdds}>
              Odds {betslip.reduce((acc, b) => acc * b.odds, 1).toFixed(2)}
            </Text>
          </View>
          <ScalePress onPress={() => useNexaStore.getState().placeBet()}>
            <View style={styles.betslipBtn}>
              <Text style={styles.betslipBtnText}>Apostar</Text>
            </View>
          </ScalePress>
        </View>
      </FloatingBar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  particlesWrap: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  particle: { position: 'absolute', backgroundColor: colors.primary },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: spacing.sm,
  },
  logoText: { fontSize: 22, fontFamily: typography.display, color: colors.textPrimary, letterSpacing: 4 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  streakBadge: {
    backgroundColor: colors.gold + '18', borderWidth: 0.5, borderColor: colors.gold + '44',
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.full,
  },
  streakText: { fontSize: 11, fontFamily: typography.monoBold, color: colors.gold },
  xpBadge: {
    backgroundColor: colors.green + '18', borderWidth: 0.5, borderColor: colors.green + '44',
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.full,
  },
  xpBadgeText: { fontSize: 11, fontFamily: typography.monoBold, color: colors.green },

  xpBarWrap: {
    paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  levelText: { fontSize: 11, color: colors.textMuted, fontFamily: typography.bodyMed },

  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm },
  tab: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: radius.full, backgroundColor: colors.bgElevated },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontFamily: typography.bodyMed, color: colors.textSecondary },
  tabTextActive: { color: '#fff' },
  scroll: { paddingBottom: 40 },

  // Trending bar
  trendingBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  trendingItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  trendingItemText: { fontSize: 12, color: colors.textSecondary, fontFamily: typography.bodyMed },
  trendingSeparator: { width: 1, height: 14, backgroundColor: colors.border },

  // Checkin
  checkin: {
    margin: spacing.lg, padding: spacing.lg,
    ...glass.accent,
    borderRadius: radius.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  checkinIcon: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.primary + '25',
    alignItems: 'center', justifyContent: 'center',
  },
  checkinIconText: { fontSize: 20, fontFamily: typography.display, color: colors.primary },
  checkinTitle: { fontSize: 13, fontFamily: typography.bodySemi, color: colors.textPrimary },
  checkinSub: { fontSize: 11, color: colors.primary, fontFamily: typography.bodyMed, marginTop: 2 },
  checkinBadge: { backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full },
  checkinBadgeText: { fontSize: 12, fontFamily: typography.bodySemi, color: '#fff' },

  // Mission
  missionCard: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, gap: spacing.sm },
  missionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  missionLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  missionIconWrap: {
    width: 32, height: 32, borderRadius: radius.sm,
    backgroundColor: colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  missionIconText: { fontSize: 14, fontFamily: typography.bodySemi, color: colors.primary },
  missionTitle: { fontSize: 13, fontFamily: typography.bodyMed, color: colors.textPrimary },
  missionAlmost: { fontSize: 11, color: colors.primary, fontFamily: typography.bodySemi, marginTop: 1 },
  missionMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  missionCaption: { fontSize: 11, color: colors.textMuted, fontFamily: typography.body },
  missionExpiry: { fontSize: 11, color: colors.red + '99', fontFamily: typography.bodyMed },

  // Tipster cards
  tipsterScroll: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm },
  tipsterCard: {
    width: 88, alignItems: 'center', gap: 4,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 0.5, borderColor: colors.border,
    paddingVertical: spacing.md, paddingHorizontal: spacing.xs,
  },
  tipsterCardElite: { borderColor: colors.gold + '44', backgroundColor: colors.gold + '08' },
  tipsterName: { fontSize: 10, fontFamily: typography.bodySemi, color: colors.textPrimary, textAlign: 'center' },
  tipsterStats: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  tipsterRate: { fontSize: 11, fontFamily: typography.monoBold, color: colors.green },
  tipsterRoi: { fontSize: 9, fontFamily: typography.mono, color: colors.textMuted },
  tipsterFollowers: { fontSize: 9, fontFamily: typography.body, color: colors.textMuted },
  followBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  followBtnText: { fontSize: 16, color: '#fff', lineHeight: 20, fontFamily: typography.bodyBold },
  followingBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.green + '25', alignItems: 'center', justifyContent: 'center' },
  followingText: { fontSize: 11, color: colors.green, fontFamily: typography.bodySemi },

  // Avatar stack (social proof)
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  avatarStackItem: { borderWidth: 1.5, borderColor: colors.bgElevated, borderRadius: 12 },
  avatarStackCount: { fontSize: 10, color: colors.textMuted, fontFamily: typography.bodyMed, marginLeft: 4 },

  // Feed post
  feedCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
  postUserRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  postUsername: { fontSize: 13, fontFamily: typography.bodySemi, color: colors.textPrimary },
  postTime: { fontSize: 11, color: colors.textMuted, fontFamily: typography.body },
  hotBadge: {
    backgroundColor: colors.red + '15', borderWidth: 0.5, borderColor: colors.red + '44',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full,
  },
  hotText: { fontSize: 10, fontFamily: typography.bodySemi, color: colors.red },
  postContent: { fontSize: 14, fontFamily: typography.body, color: colors.textSecondary, lineHeight: 21 },
  pickRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  pickBadge: {
    backgroundColor: colors.primary + '15', borderWidth: 0.5, borderColor: colors.primary + '35',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.md,
  },
  pickText: { fontSize: 12, fontFamily: typography.bodyMed, color: colors.primary },
  oddsBadge: {
    backgroundColor: colors.gold + '15', borderWidth: 0.5, borderColor: colors.gold + '35',
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: radius.md,
  },
  oddsText: { fontSize: 12, fontFamily: typography.monoBold, color: colors.gold },
  matchOdds: {
    ...glass.elevated,
    borderRadius: radius.md, padding: spacing.md, gap: spacing.sm,
  },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  matchLeague: { fontSize: 11, color: colors.textMuted, fontFamily: typography.bodyMed },
  matchTeams: { fontSize: 14, fontFamily: typography.bodySemi, color: colors.textPrimary },
  oddsRow: { flexDirection: 'row', gap: spacing.sm },
  bettorsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bettorsText: { fontSize: 11, color: colors.textMuted, fontFamily: typography.body },

  // Social bar
  socialBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.xs },
  socialBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  socialIcon: { fontSize: 15, color: colors.textMuted, fontFamily: typography.body },
  socialCount: { fontSize: 12, color: colors.textMuted, fontFamily: typography.bodyMed },
  copyBtn: {
    marginLeft: 'auto' as any,
    backgroundColor: colors.primary + '15', borderWidth: 0.5, borderColor: colors.primary + '35',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full,
  },
  copyBtnText: { fontSize: 11, color: colors.primary, fontFamily: typography.bodySemi },

  // Betslip floating bar
  betslipBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  betslipInfo: { gap: 2 },
  betslipCount: { fontSize: 14, fontFamily: typography.bodySemi, color: colors.textPrimary },
  betslipOdds: { fontSize: 12, fontFamily: typography.mono, color: colors.primary },
  betslipBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: radius.lg,
  },
  betslipBtnText: { fontSize: 14, fontFamily: typography.bodySemi, color: '#fff' },
});
