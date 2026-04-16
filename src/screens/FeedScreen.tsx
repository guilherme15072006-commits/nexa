import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Avatar, Card, LiveBadge, OddsBtn, Pill, SectionHeader, XPBar } from '../components/ui';
import {
  AnimatedProgress,
  AvatarStack,
  CountBadge,
  FloatingXP,
  LiveActivityBar,
  LiveToast,
  SmoothEntry,
  TapScale,
} from '../components/LiveComponents';
import NexaLogo from '../components/NexaLogo';
import NarrativeCardComponent from '../components/NarrativeCard';
import { SkeletonList } from '../components/SkeletonLoader';
import { SharedView, SharedText, sharedTags } from '../components/SharedTransition';
import { colors, radius, spacing, typography } from '../theme';
import {
  FeedPost,
  FeedPostMatch,
  NarrativeCard as NarrativeCardType,
  Tipster,
  TipsterTier,
  useNexaStore,
} from '../store/nexaStore';
import { hapticLight, hapticMedium, hapticSuccess } from '../services/haptics';
import { playCheckin, playXPGain, playSocialAction } from '../services/sounds';
import DailyLoginCalendar from '../components/DailyLoginCalendar';

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedTab = 'para-voce' | 'seguindo';

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIER_COLOR: Record<TipsterTier, string> = {
  bronze: '#CD7F32',
  silver: '#A8B8C8',
  gold: colors.gold,
  elite: colors.primary,
};

const TIER_LABEL: Record<TipsterTier, string> = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
  elite: 'Elite',
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function fmtFollowers(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function fmtLikes(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── CheckinCard ─────────────────────────────────────────────────────────────

function CheckinCard() {
  const streak        = useNexaStore(s => s.user.streak);
  const claimed       = useNexaStore(s => s.checkinClaimed);
  const claimCheckin  = useNexaStore(s => s.claimCheckin);

  const successOpacity = useSharedValue(0);
  const cardOpacity    = useSharedValue(1);
  const [showXP, setShowXP] = useState(false);

  const successStyle = useAnimatedStyle(() => ({ opacity: successOpacity.value }));
  const cardStyle    = useAnimatedStyle(() => ({ opacity: cardOpacity.value }));

  function handleClaim() {
    claimCheckin();
    setShowXP(true);
    hapticSuccess();
    playCheckin();
    cardOpacity.value = withTiming(0, { duration: 200 });
    successOpacity.value = withTiming(1, { duration: 300 });
  }

  return (
    <SmoothEntry delay={100}>
      <Card style={styles.checkinCard}>
        <FloatingXP amount={50} visible={showXP} onDone={() => setShowXP(false)} style={{ top: -8 }} />

        {/* Success overlay */}
        <Reanimated.View
          style={[styles.checkinSuccess, successStyle]}
          pointerEvents={claimed ? 'auto' : 'none'}
        >
          <Text style={styles.checkinSuccessEmoji}>🔥</Text>
          <Text style={styles.checkinSuccessTitle}>Check-in feito!</Text>
          <Text style={styles.checkinSuccessReward}>+50 XP  ·  +100 🪙  ·  Dia {streak}</Text>
        </Reanimated.View>

        {/* Default state */}
        <Reanimated.View style={cardStyle}>
          <View style={styles.checkinRow}>
            <View style={styles.checkinLeft}>
              <Text style={styles.checkinEmoji}>🔥</Text>
              <View>
                <Text style={styles.checkinTitle}>Check-in diário</Text>
                <Text style={styles.checkinStreak}>Sequência de {streak} dia{streak !== 1 ? 's' : ''}</Text>
              </View>
            </View>
            <View style={styles.checkinRewards}>
              <Text style={styles.checkinRewardText}>+50 XP</Text>
              <Text style={styles.checkinRewardText}>+100 🪙</Text>
            </View>
          </View>
          <TapScale onPress={handleClaim} disabled={claimed}>
            <View style={[styles.checkinBtn, claimed && styles.checkinBtnClaimed]}>
              <Text style={styles.checkinBtnText}>
                {claimed ? '✓  Feito hoje' : 'Fazer check-in →'}
              </Text>
            </View>
          </TapScale>
        </Reanimated.View>
      </Card>
    </SmoothEntry>
  );
}

// ─── MissionBanner ────────────────────────────────────────────────────────────

function MissionBanner() {
  const missions = useNexaStore(s => s.missions);

  // Near-win: find the most advanced incomplete non-hidden mission
  const inProgress = missions
    .filter(m => !m.completed && m.revealed)
    .sort((a, b) => b.progress / b.target - a.progress / a.target)[0];

  if (!inProgress) return null;

  const pct    = inProgress.progress / inProgress.target;
  const isNear = inProgress.target - inProgress.progress === 1;

  return (
    <Card style={styles.missionBanner}>
      <View style={styles.missionBannerRow}>
        <View style={styles.missionBannerLeft}>
          <Text style={styles.missionBannerEyebrow}>MISSÃO DO DIA</Text>
          <Text style={styles.missionBannerTitle}>{inProgress.title}</Text>
          {isNear && (
            <Text style={styles.missionBannerNearWin}>
              ⚡ Falta 1 {inProgress.description.toLowerCase().includes('cop') ? 'cópia' : 'ação'} para ganhar +{inProgress.xpReward} XP!
            </Text>
          )}
        </View>
        <Text style={styles.missionBannerXP}>+{inProgress.xpReward} XP</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.missionProgress}>
        <AnimatedProgress progress={Math.max(pct, 0.08)} color={isNear ? colors.gold : colors.primary} height={5} />
        <Text style={styles.missionProgressLabel}>
          {inProgress.progress}/{inProgress.target}
        </Text>
      </View>
    </Card>
  );
}

// ─── TipsterCard ─────────────────────────────────────────────────────────────

interface TipsterCardProps {
  tipster: Tipster;
  onFollow: (id: string) => void;
}

function TipsterCard({ tipster, onFollow }: TipsterCardProps) {
  const navigation = useNavigation<any>();
  const tierColor = TIER_COLOR[tipster.tier];

  const handleTap = useCallback(() => {
    hapticLight();
    navigation.navigate('TipsterProfile', { tipsterId: tipster.id });
  }, [navigation, tipster.id]);

  return (
    <TouchableOpacity style={styles.tipsterCard} onPress={handleTap} activeOpacity={0.85}>
      {/* Avatar + tier ring — shared element */}
      <SharedView tag={sharedTags.tipsterAvatar(tipster.id)} style={[styles.tipsterAvatarRing, { borderColor: tierColor }]}>
        <Avatar username={tipster.username} size={44} />
      </SharedView>

      <SharedText tag={sharedTags.tipsterName(tipster.id)} style={styles.tipsterName} numberOfLines={1}>{tipster.username}</SharedText>

      <Pill
        label={TIER_LABEL[tipster.tier]}
        color={tierColor}
        style={styles.tipsterTierPill}
      />

      <View style={styles.tipsterStats}>
        <Text style={styles.tipsterStatGreen}>{Math.round(tipster.winRate * 100)}%</Text>
        <Text style={styles.tipsterStatSep}>·</Text>
        <Text style={styles.tipsterStatGreen}>+{Math.round(tipster.roi * 100)}% ROI</Text>
      </View>

      {tipster.streak > 0 && (
        <Text style={styles.tipsterStreak}>🔥 {tipster.streak} seguidos</Text>
      )}

      <TouchableOpacity
        style={[styles.followBtn, tipster.isFollowing && styles.followBtnActive]}
        onPress={() => onFollow(tipster.id)}
        accessibilityLabel={tipster.isFollowing ? `Deixar de seguir ${tipster.username}` : `Seguir ${tipster.username}`}
        activeOpacity={0.75}
      >
        <Text style={[styles.followBtnText, tipster.isFollowing && styles.followBtnTextActive]}>
          {tipster.isFollowing ? 'Seguindo' : 'Seguir'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── MatchOddsRow ─────────────────────────────────────────────────────────────

interface MatchOddsRowProps {
  match: FeedPostMatch;
  pick?: { side: 'home' | 'draw' | 'away'; odds: number };
}

function MatchOddsRow({ match, pick }: MatchOddsRowProps) {
  const selectedOdd = useNexaStore(s => s.selectedOdds[match.id]);
  const selectOdd   = useNexaStore(s => s.selectOdd);

  const isFinished = match.status === 'finished';

  return (
    <View style={styles.matchBlock}>
      {/* Match header */}
      <View style={styles.matchBlockHeader}>
        <Text style={styles.matchBlockLeague}>{match.league}</Text>
        {match.status === 'live' && <LiveBadge />}
      </View>

      {/* Teams + score */}
      <View style={styles.matchBlockTeams}>
        <Text style={styles.matchBlockTeamName} numberOfLines={1}>{match.homeTeam}</Text>
        <View style={styles.matchBlockScoreBox}>
          {match.score
            ? <Text style={styles.matchBlockScore}>{match.score.home} – {match.score.away}</Text>
            : <Text style={styles.matchBlockVs}>×</Text>
          }
          {match.status === 'live' && match.minute && (
            <Text style={styles.matchBlockMinute}>{match.minute}'</Text>
          )}
        </View>
        <Text style={[styles.matchBlockTeamName, styles.matchBlockTeamAway]} numberOfLines={1}>
          {match.awayTeam}
        </Text>
      </View>

      {/* Pick highlight */}
      {pick && (
        <View style={styles.pickHighlight}>
          <Text style={styles.pickLabel}>
            Pick: {pick.side === 'home' ? match.homeTeam : pick.side === 'away' ? match.awayTeam : 'Empate'}
          </Text>
          <Text style={styles.pickOdds}>{pick.odds.toFixed(2)}</Text>
        </View>
      )}

      {/* Odds row — only for non-finished */}
      {!isFinished && (
        <>
          <View style={styles.oddsRow}>
            <OddsBtn
              label={match.homeTeam.length > 6 ? match.homeTeam.slice(0, 5) + '.' : match.homeTeam}
              odds={match.odds.home}
              selected={selectedOdd === 'home'}
              onPress={() => selectOdd(match.id, 'home')}
              accessibilityLabel={`${match.homeTeam} ${match.odds.home}`}
            />
            <OddsBtn
              label="Empate"
              odds={match.odds.draw}
              selected={selectedOdd === 'draw'}
              onPress={() => selectOdd(match.id, 'draw')}
              accessibilityLabel={`Empate ${match.odds.draw}`}
            />
            <OddsBtn
              label={match.awayTeam.length > 6 ? match.awayTeam.slice(0, 5) + '.' : match.awayTeam}
              odds={match.odds.away}
              selected={selectedOdd === 'away'}
              onPress={() => selectOdd(match.id, 'away')}
              accessibilityLabel={`${match.awayTeam} ${match.odds.away}`}
            />
          </View>
          <View style={styles.matchBettorsRow}>
            <AvatarStack count={Math.min(match.bettors, 200)} max={3} size={18} />
            <Text style={styles.matchBettors}>{match.bettors.toLocaleString()} apostando</Text>
          </View>
        </>
      )}

      {/* Finished result */}
      {isFinished && match.score && (
        <Text style={styles.matchFinished}>
          Encerrado · {match.homeTeam} {match.score.home}–{match.score.away} {match.awayTeam}
        </Text>
      )}
    </View>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: FeedPost;
}

function PostCard({ post }: PostCardProps) {
  const likePost = useNexaStore(s => s.likePost);
  const copyBet  = useNexaStore(s => s.copyBet);

  const [copied, setCopied] = useState(false);
  const [showCopyXP, setShowCopyXP] = useState(false);

  // Like scale animation (Reanimated 3 — UI thread)
  const likeScale = useSharedValue(1);
  const likeStyle = useAnimatedStyle(() => ({ transform: [{ scale: likeScale.value }] }));

  const handleLike = useCallback(() => {
    likePost(post.id);
    hapticLight();
    likeScale.value = withSequence(
      withSpring(1.45, { damping: 6, stiffness: 200 }),
      withSpring(1, { damping: 12, stiffness: 100 }),
    );
  }, [likePost, post.id]);

  const handleCopy = useCallback(() => {
    if (copied) return;
    copyBet(post.id);
    setCopied(true);
    setShowCopyXP(true);
    hapticMedium();
    playSocialAction();
  }, [copied, copyBet, post.id]);

  const tierColor = post.user.tier ? TIER_COLOR[post.user.tier] : undefined;

  return (
    <Card style={styles.postCard}>
      <FloatingXP amount={10} visible={showCopyXP} onDone={() => setShowCopyXP(false)} style={{ top: -8, right: 16 }} />
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={[
          styles.postAvatarRing,
          tierColor && { borderColor: tierColor },
        ]}>
          <Avatar username={post.user.username} size={38} />
        </View>

        <View style={styles.postUserInfo}>
          <View style={styles.postUserRow}>
            <Text style={styles.postUsername}>{post.user.username}</Text>
            {post.user.tier && (
              <Pill
                label={TIER_LABEL[post.user.tier]}
                color={TIER_COLOR[post.user.tier]}
                style={styles.postTierPill}
              />
            )}
          </View>
          <Text style={styles.postTime}>{post.createdAt}</Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Match block */}
      {post.match && (
        <MatchOddsRow match={post.match} pick={post.pick} />
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        {/* Like */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleLike}
          accessibilityLabel={`${post.isLiked ? 'Descurtir' : 'Curtir'}, ${post.likes} curtidas`}
          activeOpacity={0.7}
        >
          <Reanimated.Text style={[styles.actionIcon, likeStyle]}>
            {post.isLiked ? '❤️' : '🤍'}
          </Reanimated.Text>
          <Text style={[styles.actionCount, post.isLiked && styles.actionCountLiked]}>
            {fmtLikes(post.likes)}
          </Text>
        </TouchableOpacity>

        {/* Copy bet */}
        {post.pick && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleCopy}
            disabled={copied}
            accessibilityLabel={copied ? 'Aposta copiada' : `Copiar aposta, ${post.copies} cópias`}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={[styles.actionCount, copied && styles.actionCountCopied]}>
              {copied ? '+10 XP' : fmtLikes(post.copies)}
            </Text>
          </TouchableOpacity>
        )}

        {/* Comments */}
        <TouchableOpacity style={styles.actionBtn} accessibilityLabel={`${post.comments} comentários`} activeOpacity={0.7}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{fmtLikes(post.comments)}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

// ─── FeedScreen ───────────────────────────────────────────────────────────────

export default function FeedScreen() {
  const [feedTab, setFeedTab] = useState<FeedTab>('para-voce');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const navigation     = useNavigation<any>();
  const isLoading      = useNexaStore(s => s.isLoading);
  const user           = useNexaStore(s => s.user);
  const tipsters       = useNexaStore(s => s.tipsters);
  const feed           = useNexaStore(s => s.feed);
  const scoredFeed     = useNexaStore(s => s.scoredFeed);
  const narrativeCards = useNexaStore(s => s.narrativeCards);
  const unreadCount    = useNexaStore(s => s.unreadCount);
  const dismissNarrative = useNexaStore(s => s.dismissNarrative);
  const scoreFeed      = useNexaStore(s => s.scoreFeed);
  const followTipster  = useNexaStore(s => s.followTipster);
  const loginCalendar  = useNexaStore(s => s.loginCalendar);
  const claimDailyLogin = useNexaStore(s => s.claimDailyLogin);
  const liveStats      = useNexaStore(s => s.liveStats);
  const popToast       = useNexaStore(s => s.popToast);
  const betsPlaced     = useNexaStore(s => s.betsPlaced);

  // Score feed on mount
  useEffect(() => {
    scoreFeed();
  }, [scoreFeed]);

  // Show toasts from queue
  React.useEffect(() => {
    if (liveStats.toastQueue.length > 0 && !toastVisible) {
      setToastMsg(liveStats.toastQueue[0]);
      setToastVisible(true);
      popToast();
    }
  }, [liveStats.toastQueue, toastVisible, popToast]);

  const followingIds = user.following;

  const visiblePosts = feedTab === 'seguindo'
    ? feed.filter(p => followingIds.includes(p.user.id))
    : scoredFeed.length > 0 ? scoredFeed : feed;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    hapticLight();
    scoreFeed();
    setTimeout(() => setRefreshing(false), 800);
  }, [scoreFeed]);

  const handleFollow = useCallback((id: string) => {
    followTipster(id);
  }, [followTipster]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Live toast */}
      <LiveToast message={toastMsg} visible={toastVisible} onDismiss={() => setToastVisible(false)} />

      {/* ── Fixed header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <NexaLogo size="small" />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Text style={styles.headerCoins}>{user.coins}</Text>
            <TapScale onPress={() => navigation.navigate('Notifications')}>
              <View style={styles.bellWrap}>
                <Text style={styles.bellIcon}>🔔</Text>
                {unreadCount > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
            </TapScale>
          </View>
        </View>
        <XPBar xp={user.xp} xpToNext={user.xpToNext} level={user.level} />
      </View>

      {/* ── Quick access bar ── */}
      <View style={styles.quickAccessBar}>
        <TapScale onPress={() => navigation.navigate('Stories' as never)} style={styles.quickBtn}>
          <View style={styles.quickBtnInner}>
            <Text style={styles.quickBtnIcon}>📖</Text>
            <Text style={styles.quickBtnLabel}>Stories</Text>
          </View>
        </TapScale>
        <TapScale onPress={() => navigation.navigate('Explore' as never)} style={styles.quickBtn}>
          <View style={styles.quickBtnInner}>
            <Text style={styles.quickBtnIcon}>🔍</Text>
            <Text style={styles.quickBtnLabel}>Explorar</Text>
          </View>
        </TapScale>
        <TapScale onPress={() => navigation.navigate('Events' as never)} style={styles.quickBtn}>
          <View style={styles.quickBtnInner}>
            <Text style={styles.quickBtnIcon}>🏆</Text>
            <Text style={styles.quickBtnLabel}>Eventos</Text>
          </View>
        </TapScale>
        <TapScale onPress={() => navigation.navigate('Lives' as never)} style={styles.quickBtn}>
          <View style={styles.quickBtnInner}>
            <Text style={styles.quickBtnIcon}>🎙️</Text>
            <Text style={styles.quickBtnLabel}>Lives</Text>
          </View>
        </TapScale>
        <TapScale onPress={() => navigation.navigate('Marketplace' as never)} style={styles.quickBtn}>
          <View style={styles.quickBtnInner}>
            <Text style={styles.quickBtnIcon}>🛒</Text>
            <Text style={styles.quickBtnLabel}>Market</Text>
          </View>
        </TapScale>
        <TapScale onPress={() => navigation.navigate('NexaPlay' as never)} style={styles.quickBtn}>
          <View style={styles.quickBtnInner}>
            <Text style={styles.quickBtnIcon}>🎮</Text>
            <Text style={styles.quickBtnLabel}>Play</Text>
          </View>
        </TapScale>
      </View>

      {/* ── Live activity bar ── */}
      <LiveActivityBar
        usersOnline={liveStats.usersOnline}
        gamesLive={liveStats.gamesLive}
        recentCopies={liveStats.recentCopies}
        style={styles.socialStrip}
      />

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        {(['para-voce', 'seguindo'] as FeedTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => setFeedTab(tab)}
            accessibilityLabel={tab === 'para-voce' ? 'Para você' : 'Seguindo'}
          >
            <Text style={[styles.tabLabel, feedTab === tab && styles.tabLabelActive]}>
              {tab === 'para-voce' ? 'Para você' : 'Seguindo'}
            </Text>
            {feedTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.bgCard}
          />
        }
      >
        {/* Loading skeleton */}
        {isLoading && (
          <View style={{ paddingHorizontal: spacing.xs }}>
            <SkeletonList count={4} type="card" />
          </View>
        )}

        {/* Check-in */}
        {!isLoading && <CheckinCard />}

        {/* Mission near-win banner */}
        {!isLoading && <MissionBanner />}

        {/* Daily login calendar */}
        <SmoothEntry delay={200}>
          <DailyLoginCalendar calendar={loginCalendar} onClaim={claimDailyLogin} />
        </SmoothEntry>

        {/* Tipsters horizontal — only on Para você */}
        {feedTab === 'para-voce' && (
          <>
            <SectionHeader
              title="Tipsters em destaque"
              action="Ver todos"
              style={styles.sectionHeader}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tipsterRow}
            >
              {tipsters.map((t) => (
                <TipsterCard key={t.id} tipster={t} onFollow={handleFollow} />
              ))}
            </ScrollView>
          </>
        )}

        {/* Feed posts */}
        <SectionHeader
          title={feedTab === 'para-voce' ? 'Para você' : 'Seguindo'}
          style={styles.sectionHeader}
        />

        {visiblePosts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Siga tipsters para ver os posts deles aqui.</Text>
          </Card>
        ) : (
          visiblePosts.map((post, i) => {
            // After every 2 posts, insert a narrative card if available
            const narrativeIndex = Math.floor(i / 2);
            const showNarrative = i > 0 && i % 2 === 0 && narrativeCards[narrativeIndex - 1];

            return (
              <React.Fragment key={post.id}>
                {showNarrative && (
                  <SmoothEntry delay={i * 80 - 40}>
                    <NarrativeCardComponent
                      card={narrativeCards[narrativeIndex - 1]}
                      onDismiss={dismissNarrative}
                    />
                  </SmoothEntry>
                )}
                <Reanimated.View
                  entering={FadeInDown.delay(i * 60).duration(300).springify()}
                  layout={LinearTransition.springify().damping(16).stiffness(120)}
                >
                  <PostCard post={post} />
                </Reanimated.View>
              </React.Fragment>
            );
          })
        )}

        {/* ── Next action CTA ── */}
        <SmoothEntry delay={400}>
          <Card style={styles.nextActionCard}>
            <Text style={styles.nextActionEmoji}>🎯</Text>
            <Text style={styles.nextActionTitle}>Próximo passo</Text>
            <Text style={styles.nextActionDesc}>
              {user.streak < 1 ? 'Faça check-in para começar sua sequência!' :
               betsPlaced < 1 ? 'Faça sua primeira aposta do dia!' :
               'Explore os jogos ao vivo e encontre valor!'}
            </Text>
            <TapScale onPress={() => {
              if (user.streak < 1) {} // check-in is already at top
              else navigation.navigate('apostas' as never);
            }}>
              <View style={styles.nextActionBtn}>
                <Text style={styles.nextActionBtnText}>
                  {betsPlaced < 1 ? 'Ver apostas →' : 'Jogos ao vivo →'}
                </Text>
              </View>
            </TapScale>
          </Card>
        </SmoothEntry>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Header
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLogo: {
    ...typography.display,
    fontSize: 22,
    color: colors.primary,
    letterSpacing: 2,
  },
  headerCoins: {
    ...typography.monoBold,
    fontSize: 14,
    color: colors.gold,
  },

  // Quick access bar
  quickAccessBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  quickBtn: { alignItems: 'center' },
  quickBtnInner: { alignItems: 'center', gap: 2 },
  quickBtnIcon: { fontSize: 20 },
  quickBtnLabel: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },

  // Social strip
  socialStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  socialDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.red,
  },
  socialText: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    position: 'relative',
  },
  tabLabel: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.textPrimary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },

  // Check-in card
  checkinCard: {
    overflow: 'hidden',
    position: 'relative',
  },
  checkinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  checkinEmoji: {
    fontSize: 28,
  },
  checkinTitle: {
    ...typography.displayMedium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  checkinStreak: {
    ...typography.mono,
    fontSize: 11,
    color: colors.orange,
    marginTop: 2,
  },
  checkinRewards: {
    alignItems: 'flex-end',
    gap: 2,
  },
  checkinRewardText: {
    ...typography.monoBold,
    fontSize: 12,
    color: colors.green,
  },
  checkinBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  checkinBtnClaimed: {
    backgroundColor: colors.bgElevated,
  },
  checkinBtnText: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  checkinSuccess: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.lg,
    zIndex: 10,
  },
  checkinSuccessEmoji: {
    fontSize: 36,
  },
  checkinSuccessTitle: {
    ...typography.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  checkinSuccessReward: {
    ...typography.mono,
    fontSize: 13,
    color: colors.green,
  },

  // Mission banner
  missionBanner: {
    borderColor: colors.orange + '60',
    gap: spacing.sm,
  },
  missionBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  missionBannerLeft: {
    flex: 1,
    gap: 3,
  },
  missionBannerEyebrow: {
    ...typography.mono,
    fontSize: 10,
    color: colors.orange,
    letterSpacing: 1,
  },
  missionBannerTitle: {
    ...typography.displayMedium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  missionBannerNearWin: {
    ...typography.bodyMedium,
    fontSize: 12,
    color: colors.orange,
    marginTop: 2,
  },
  missionBannerXP: {
    ...typography.monoBold,
    fontSize: 15,
    color: colors.gold,
  },
  missionProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  missionProgressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  missionProgressFill: {
    height: '100%',
    backgroundColor: colors.orange,
    borderRadius: radius.full,
  },
  missionProgressLabel: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
    minWidth: 28,
  },

  // Tipsters
  tipsterRow: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  tipsterCard: {
    width: 120,
    backgroundColor: colors.bgCard,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  tipsterAvatarRing: {
    borderWidth: 2,
    borderRadius: radius.full,
    padding: 2,
  },
  tipsterName: {
    ...typography.bodyMedium,
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tipsterTierPill: {
    alignSelf: 'center',
  },
  tipsterStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tipsterStatGreen: {
    ...typography.mono,
    fontSize: 10,
    color: colors.green,
  },
  tipsterStatSep: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  tipsterStreak: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  followBtn: {
    borderWidth: 0.5,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    marginTop: 2,
    alignItems: 'center',
    width: '100%',
  },
  followBtnActive: {
    backgroundColor: colors.primary + '22',
  },
  followBtnText: {
    ...typography.bodyMedium,
    fontSize: 11,
    color: colors.primary,
  },
  followBtnTextActive: {
    color: colors.primary,
  },

  // Post card
  postCard: {
    gap: spacing.sm,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  postAvatarRing: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    padding: 1.5,
  },
  postUserInfo: {
    flex: 1,
    gap: 2,
  },
  postUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  postUsername: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  postTierPill: {
    paddingVertical: 1,
    paddingHorizontal: 5,
  },
  postTime: {
    ...typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  postContent: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Match block inside post
  matchBlock: {
    backgroundColor: colors.bgElevated,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  matchBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchBlockLeague: {
    ...typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.3,
    flex: 1,
  },
  matchBlockTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchBlockTeamName: {
    ...typography.displayMedium,
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },
  matchBlockTeamAway: {
    textAlign: 'right',
  },
  matchBlockScoreBox: {
    alignItems: 'center',
    minWidth: 60,
  },
  matchBlockScore: {
    ...typography.monoBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  matchBlockVs: {
    ...typography.mono,
    fontSize: 14,
    color: colors.textMuted,
  },
  matchBlockMinute: {
    ...typography.mono,
    fontSize: 10,
    color: colors.red,
    marginTop: 1,
  },
  pickHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary + '18',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: colors.primary + '40',
  },
  pickLabel: {
    ...typography.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  pickOdds: {
    ...typography.monoBold,
    fontSize: 14,
    color: colors.primary,
  },
  oddsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  matchBettorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  matchBettors: {
    ...typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  matchFinished: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Post actions
  postActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionCount: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  actionCountLiked: {
    color: colors.red,
  },
  actionCountCopied: {
    color: colors.green,
  },

  // Section header
  sectionHeader: {
    marginBottom: 0,
  },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Notification bell
  bellWrap: {
    position: 'relative' as const,
    padding: 4,
  },
  bellIcon: {
    fontSize: 18,
  },
  bellBadge: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    backgroundColor: colors.red,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  bellBadgeText: {
    ...typography.monoBold,
    fontSize: 9,
    color: '#fff',
  },

  bottomPad: {
    height: spacing.xxl,
  },

  nextActionCard: { alignItems: 'center' as const, marginTop: spacing.md, borderColor: colors.primary + '30', borderWidth: 1 },
  nextActionEmoji: { fontSize: 28, marginBottom: spacing.xs },
  nextActionTitle: { ...typography.bodySemiBold, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.xs },
  nextActionDesc: { ...typography.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center' as const, marginBottom: spacing.sm },
  nextActionBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  nextActionBtnText: { ...typography.bodySemiBold, fontSize: 14, color: colors.textPrimary },
});
