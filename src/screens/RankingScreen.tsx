import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Card, SectionHeader } from '../components/ui';
import { RankChange, SmoothEntry, TapScale } from '../components/LiveComponents';
import { colors, radius, spacing, typography, shadows } from '../theme';
import { Clan, TipsterTier, User, useNexaStore } from '../store/nexaStore';
import { hapticLight, hapticMedium, hapticSelection } from '../services/haptics';
import { playSocialAction } from '../services/sounds';

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'semanal' | 'mensal';
type RankTab = 'jogadores' | 'clas';

// ─── Constants ────────────────────────────────────────────────────────────────

const PODIUM_COLORS = [colors.gold, '#C0C0C0', '#CD7F32'] as const; // gold, silver, bronze
const PODIUM_SIZES = [72, 60, 56] as const;
const PODIUM_HEIGHTS = [120, 96, 80] as const;
const CROWN_SIZES = ['👑', '🥈', '🥉'] as const;

const TIER_COLOR: Record<TipsterTier, string> = {
  bronze: '#CD7F32',
  silver: '#A8B8C8',
  gold: colors.gold,
  elite: colors.primary,
};

// Mock: weekly reset is next Monday 00:00 (we simulate a fixed countdown)
const MOCK_RESET_SECONDS = 3 * 24 * 3600 + 14 * 3600 + 23 * 60 + 47; // ~3d 14h 23m

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtXP(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function fmtCountdown(totalSec: number): string {
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${String(s).padStart(2, '0')}s`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

function fmtWR(wr: number): string {
  return `${Math.round(wr * 100)}%`;
}

function fmtROI(roi: number): string {
  return `${roi >= 0 ? '+' : ''}${Math.round(roi * 100)}%`;
}

// ─── PulsingGlow ──────────────────────────────────────────────────────────────

function PulsingGlow({ color, size }: { color: string; size: number }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.25, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size + 16,
        height: size + 16,
        borderRadius: (size + 16) / 2,
        backgroundColor: color + '25',
        transform: [{ scale: pulse }],
      }}
    />
  );
}

// ─── CountdownTimer ───────────────────────────────────────────────────────────

function CountdownTimer({ initialSeconds }: { initialSeconds: number }) {
  const [secs, setSecs] = useState(initialSeconds);

  useEffect(() => {
    const iv = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, []);

  const isUrgent = secs < 24 * 3600; // less than 1 day

  return (
    <View style={styles.countdownContainer}>
      <Text style={styles.countdownLabel}>Reset semanal em</Text>
      <View style={[styles.countdownBadge, isUrgent ? styles.countdownUrgent : null]}>
        <Text style={styles.countdownIcon}>⏱️</Text>
        <Text style={[styles.countdownText, isUrgent ? styles.countdownTextUrgent : null]}>
          {fmtCountdown(secs)}
        </Text>
      </View>
    </View>
  );
}

// ─── PodiumCard (Top 3) ───────────────────────────────────────────────────────

function PodiumCard({
  user,
  position,
  scaleAnim,
}: {
  user: User;
  position: 0 | 1 | 2;
  scaleAnim: Animated.Value;
}) {
  const color = PODIUM_COLORS[position];
  const avatarSize = PODIUM_SIZES[position];
  const height = PODIUM_HEIGHTS[position];
  const crown = CROWN_SIZES[position];

  return (
    <Animated.View
      style={[
        styles.podiumCard,
        { transform: [{ scale: scaleAnim }] },
        position === 0 ? styles.podiumFirst : null,
      ]}
    >
      <View style={styles.podiumAvatarWrap}>
        <PulsingGlow color={color} size={avatarSize} />
        <View style={[styles.podiumAvatarRing, { borderColor: color, width: avatarSize + 8, height: avatarSize + 8, borderRadius: (avatarSize + 8) / 2 }]}>
          <Avatar size={avatarSize} username={user.username} />
        </View>
        <Text style={styles.podiumCrown}>{crown}</Text>
      </View>
      <Text style={[styles.podiumName, { color }]} numberOfLines={1}>
        {user.username}
      </Text>
      <Text style={styles.podiumXP}>{fmtXP(user.xp)} XP</Text>
      <View style={[styles.podiumPedestal, { height, backgroundColor: color + '18', borderColor: color + '40' }]}>
        <Text style={[styles.podiumRank, { color }]}>#{position + 1}</Text>
        <View style={styles.podiumStats}>
          <Text style={styles.podiumStatText}>🔥 {user.streak}</Text>
          <Text style={styles.podiumStatText}>WR {fmtWR(user.winRate)}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── UserPositionCard ─────────────────────────────────────────────────────────

function UserPositionCard({
  user,
  leaderboard,
  missions,
}: {
  user: User;
  leaderboard: User[];
  missions: { completed: boolean; xpReward: number }[];
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Find user above
  const userAbove = useMemo(() => {
    const idx = leaderboard.findIndex((u) => u.rank === user.rank - 1);
    return idx >= 0 ? leaderboard[idx] : null;
  }, [leaderboard, user.rank]);

  // XP gap to next rank
  const xpGap = useMemo(() => {
    if (!userAbove) return 0;
    return userAbove.xp - user.xp;
  }, [userAbove, user.xp]);

  // Near-win: less than 100 XP from next rank
  const isNearWin = xpGap > 0 && xpGap <= 100;

  // Pending mission XP
  const pendingMissionXP = useMemo(() => {
    return missions
      .filter((m) => !m.completed)
      .reduce((sum, m) => sum + m.xpReward, 0);
  }, [missions]);

  const canOvertake = pendingMissionXP >= xpGap && xpGap > 0;

  useEffect(() => {
    if (!isNearWin) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    glow.start();
    return () => {
      anim.stop();
      glow.stop();
    };
  }, [isNearWin, pulseAnim, glowAnim]);

  // XP progress bar to next rank
  const progress = userAbove ? Math.min(user.xp / (user.xp + xpGap), 1) : 1;

  return (
    <Animated.View style={[{ transform: [{ scale: pulseAnim }] }]}>
      <Card style={[styles.userPosCard, isNearWin ? styles.userPosCardNearWin : null]}>
        {isNearWin && (
          <Animated.View
            style={[
              styles.nearWinGlow,
              { opacity: glowAnim },
            ]}
          />
        )}
        <View style={styles.userPosHeader}>
          <View style={styles.userPosLeft}>
            <Text style={styles.userPosRank}>#{user.rank}</Text>
            <Avatar size={44} username={user.username} />
            <View>
              <Text style={styles.userPosName}>{user.username}</Text>
              <Text style={styles.userPosLevel}>Nível {user.level} · {fmtXP(user.xp)} XP</Text>
            </View>
          </View>
          <View style={styles.userPosRight}>
            <Text style={styles.userPosStreak}>🔥 {user.streak}</Text>
          </View>
        </View>

        {/* Progress bar to next rank */}
        <View style={styles.rankProgressContainer}>
          <View style={styles.rankProgressTrack}>
            <View style={[styles.rankProgressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {/* Gap message */}
        {xpGap > 0 && (
          <View style={styles.gapRow}>
            <Text style={[styles.gapText, isNearWin ? styles.gapTextNearWin : null]}>
              {isNearWin ? '⚡ ' : ''}
              Você está a <Text style={styles.gapHighlight}>{xpGap} XP</Text> de subir para #{user.rank - 1}
              {isNearWin ? ' — quase lá!' : ''}
            </Text>
          </View>
        )}

        {/* Can overtake hint */}
        {canOvertake && (
          <View style={styles.overtakeHint}>
            <Text style={styles.overtakeText}>
              🎯 Complete suas missões (+{pendingMissionXP} XP) e ultrapasse!
            </Text>
          </View>
        )}

        {/* Stats row */}
        <View style={styles.userStatsRow}>
          <View style={styles.userStat}>
            <Text style={styles.userStatValue}>{fmtWR(user.winRate)}</Text>
            <Text style={styles.userStatLabel}>Win Rate</Text>
          </View>
          <View style={styles.userStatDivider} />
          <View style={styles.userStat}>
            <Text style={[styles.userStatValue, { color: user.roi >= 0 ? colors.green : colors.red }]}>
              {fmtROI(user.roi)}
            </Text>
            <Text style={styles.userStatLabel}>ROI</Text>
          </View>
          <View style={styles.userStatDivider} />
          <View style={styles.userStat}>
            <Text style={styles.userStatValue}>{user.streak}</Text>
            <Text style={styles.userStatLabel}>Streak</Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

// ─── LeaderboardRow ───────────────────────────────────────────────────────────

function LeaderboardRow({
  user,
  isFollowed,
  isNearby,
  onChallenge,
  slideAnim,
}: {
  user: User;
  isFollowed: boolean;
  isNearby: boolean;
  onChallenge: () => void;
  slideAnim: Animated.Value;
}) {
  const scaleRef = useRef(new Animated.Value(1)).current;

  const handleChallenge = useCallback(() => {
    hapticMedium();
    playSocialAction();
    Animated.sequence([
      Animated.timing(scaleRef, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleRef, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    onChallenge();
  }, [onChallenge, scaleRef]);

  return (
    <Animated.View
      style={[
        styles.lbRow,
        isFollowed ? styles.lbRowFollowed : null,
        { opacity: slideAnim, transform: [{ translateX: Animated.multiply(Animated.subtract(1, slideAnim), 40) }] },
      ]}
    >
      <Text style={styles.lbRank}>#{user.rank}</Text>
      <Avatar size={36} username={user.username} />
      <View style={styles.lbInfo}>
        <View style={styles.lbNameRow}>
          <Text style={styles.lbName} numberOfLines={1}>{user.username}</Text>
          {isFollowed && <Text style={styles.lbFollowBadge}>seguindo</Text>}
        </View>
        <Text style={styles.lbMeta}>
          Lv.{user.level} · {fmtXP(user.xp)} XP · 🔥{user.streak}
        </Text>
      </View>
      <View style={styles.lbRight}>
        <RankChange delta={user.rank <= 5 ? 2 : user.rank <= 10 ? 1 : 0} />
        <Text style={styles.lbWR}>{fmtWR(user.winRate)}</Text>
        {isNearby && (
          <TapScale onPress={handleChallenge} scale={0.93}>
            <View style={styles.challengeBtn}>
              <Text style={styles.challengeText}>⚔️ Desafiar</Text>
            </View>
          </TapScale>
        )}
      </View>
    </Animated.View>
  );
}

// ─── ClanRivalryCard ──────────────────────────────────────────────────────────

function ClanRivalryCard({ clans }: { clans: Clan[] }) {
  const [extraXP, setExtraXP] = useState<Record<string, number>>({});
  const barAnims = useRef(clans.slice(0, 3).map(() => new Animated.Value(0))).current;

  // Animate bars in
  useEffect(() => {
    const anims = barAnims.map((anim, i) =>
      Animated.timing(anim, { toValue: 1, duration: 600, delay: i * 150, useNativeDriver: false }),
    );
    Animated.stagger(100, anims).start();
  }, [barAnims]);

  // Live XP ticking
  useEffect(() => {
    const iv = setInterval(() => {
      setExtraXP((prev) => {
        const next = { ...prev };
        clans.slice(0, 3).forEach((c) => {
          next[c.id] = (next[c.id] ?? 0) + Math.floor(Math.random() * 80 + 20);
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(iv);
  }, [clans]);

  const topClans = clans.slice(0, 3);
  const maxXP = Math.max(...topClans.map((c) => c.weeklyXp + (extraXP[c.id] ?? 0)));

  return (
    <Card style={styles.clanCard}>
      <View style={styles.clanHeader}>
        <Text style={styles.clanTitle}>⚔️ Rivalidade dos Clãs</Text>
        <Text style={styles.clanSubtitle}>Batalha semanal ao vivo</Text>
      </View>
      {topClans.map((clan, i) => {
        const totalXP = clan.weeklyXp + (extraXP[clan.id] ?? 0);
        const pct = maxXP > 0 ? totalXP / maxXP : 0;
        const barColor = i === 0 ? colors.gold : i === 1 ? '#C0C0C0' : '#CD7F32';

        return (
          <View key={clan.id} style={styles.clanRow}>
            <View style={styles.clanRowLeft}>
              <Text style={styles.clanBadge}>{clan.badge}</Text>
              <View>
                <Text style={styles.clanName}>{clan.name}</Text>
                <Text style={styles.clanMembers}>{clan.members} membros</Text>
              </View>
            </View>
            <View style={styles.clanBarWrap}>
              <Animated.View
                style={[
                  styles.clanBar,
                  {
                    backgroundColor: barColor,
                    width: barAnims[i]
                      ? barAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${pct * 100}%`],
                        })
                      : `${pct * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.clanXP, { color: barColor }]}>{fmtXP(totalXP)}</Text>
          </View>
        );
      })}
      <View style={styles.clanLiveIndicator}>
        <View style={styles.clanLiveDot} />
        <Text style={styles.clanLiveText}>XP atualizando ao vivo</Text>
      </View>
    </Card>
  );
}

// ─── FollowedUsersSection ─────────────────────────────────────────────────────

function FollowedUsersSection({
  following,
  leaderboard,
  currentUserRank,
}: {
  following: string[];
  leaderboard: User[];
  currentUserRank: number;
}) {
  // Map tipster IDs to leaderboard user IDs (t1→lb2 KingBet, t2→lb5 StatMaster, t5→lb1 AcePredict)
  const followedUsers = useMemo(() => {
    const tipsterToLb: Record<string, string> = {
      t1: 'lb2', t2: 'lb5', t3: 'lb7', t5: 'lb1', t6: 'lb16',
    };
    const lbIds = following.map((tid) => tipsterToLb[tid]).filter(Boolean);
    return leaderboard.filter((u) => lbIds.includes(u.id));
  }, [following, leaderboard]);

  if (followedUsers.length === 0) return null;

  return (
    <View style={styles.followedSection}>
      <SectionHeader title="Seus seguidos" style={styles.section} />
      {followedUsers.map((u) => {
        const diff = u.rank - currentUserRank;
        const ahead = diff < 0;
        return (
          <View key={u.id} style={styles.followedRow}>
            <Text style={styles.followedRank}>#{u.rank}</Text>
            <Avatar size={32} username={u.username} />
            <View style={styles.followedInfo}>
              <Text style={styles.followedName}>{u.username}</Text>
              <Text style={styles.followedXP}>{fmtXP(u.xp)} XP · Lv.{u.level}</Text>
            </View>
            <View style={[styles.followedDiffBadge, ahead ? styles.followedAhead : styles.followedBehind]}>
              <Text style={[styles.followedDiffText, ahead ? styles.followedAheadText : styles.followedBehindText]}>
                {ahead ? `${Math.abs(diff)} acima` : `${diff} abaixo`}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── LiveActivityTicker ───────────────────────────────────────────────────────

function LiveActivityTicker() {
  const MSGS = [
    '🟢  AcePredict subiu para #1 agora',
    '⚡  SharkBets fez 3 picks verdes seguidos',
    '🔥  Sharks Elite lidera a batalha de clãs',
    '🎯  12 apostadores subiram de rank na última hora',
    '💎  KingBet completou a missão "Streak Master"',
  ];

  const [idx, setIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const iv = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setIdx((i) => (i + 1) % MSGS.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 4000);
    return () => clearInterval(iv);
  }, [fadeAnim, MSGS.length]);

  return (
    <View style={styles.tickerContainer}>
      <View style={styles.tickerDot} />
      <Animated.Text style={[styles.tickerText, { opacity: fadeAnim }]} numberOfLines={1}>
        {MSGS[idx]}
      </Animated.Text>
    </View>
  );
}

// ─── ChallengeOverlay ─────────────────────────────────────────────────────────

function ChallengeOverlay({
  target,
  onDismiss,
}: {
  target: User;
  onDismiss: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      Animated.timing(opacityAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(onDismiss);
    }, 2000);
    return () => clearTimeout(t);
  }, [scaleAnim, opacityAnim, onDismiss]);

  return (
    <Animated.View style={[styles.challengeOverlay, { opacity: opacityAnim }]}>
      <TouchableOpacity style={styles.challengeOverlayBg} activeOpacity={1} onPress={onDismiss} />
      <Animated.View style={[styles.challengeCard, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.challengeEmoji}>⚔️</Text>
        <Text style={styles.challengeTitle}>Desafio enviado!</Text>
        <Text style={styles.challengeDesc}>
          Você desafiou <Text style={styles.challengeTarget}>{target.username}</Text>
        </Text>
        <Text style={styles.challengeXP}>+15 XP ⚡</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ─── RankingScreen ────────────────────────────────────────────────────────────

export default function RankingScreen() {
  const [period, setPeriod] = useState<Period>('semanal');
  const [rankTab, setRankTab] = useState<RankTab>('jogadores');
  const [challengeTarget, setChallengeTarget] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const user = useNexaStore((s) => s.user);
  const leaderboard = useNexaStore((s) => s.leaderboard);
  const clans = useNexaStore((s) => s.clans);
  const missions = useNexaStore((s) => s.missions);
  const challengeUser = useNexaStore((s) => s.challengeUser);
  const currentSeason = useNexaStore((s) => s.currentSeason);

  // Podium entrance animations
  const podiumAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    hapticLight();
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // Row slide-in animations
  const rowAnims = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    // Stagger podium: center (1st) → left (2nd) → right (3rd)
    const order = [1, 0, 2]; // show 2nd, then 1st, then 3rd
    Animated.stagger(
      150,
      order.map((i) =>
        Animated.spring(podiumAnims[i], { toValue: 1, friction: 5, useNativeDriver: true }),
      ),
    ).start();

    // Stagger rows
    const rowTimers = rowAnims.map((anim, i) =>
      setTimeout(() => {
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      }, 500 + i * 60),
    );
    return () => rowTimers.forEach(clearTimeout);
  }, [podiumAnims, rowAnims]);

  const top3 = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
  const rest = useMemo(() => leaderboard.slice(3), [leaderboard]);

  // Users near the current user's rank (±3 positions)
  const nearbyRanks = useMemo(() => {
    const low = user.rank - 3;
    const high = user.rank + 3;
    return new Set(
      leaderboard.filter((u) => u.rank >= low && u.rank <= high && u.id !== user.id).map((u) => u.id),
    );
  }, [leaderboard, user.rank]);

  const handleChallenge = useCallback(
    (target: User) => {
      challengeUser(target.id);
      setChallengeTarget(target);
    },
    [challengeUser],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
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
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Ranking</Text>
          <CountdownTimer initialSeconds={MOCK_RESET_SECONDS} />
        </View>

        {/* Season Banner */}
        {currentSeason && (
          <Card style={styles.seasonCard}>
            <View style={styles.seasonHeader}>
              <View>
                <Text style={styles.seasonName}>{currentSeason.name}</Text>
                <Text style={styles.seasonWeek}>Semana {currentSeason.weekNumber}</Text>
              </View>
              <View style={styles.seasonTimer}>
                <Text style={styles.seasonTimerLabel}>Termina em</Text>
                <Text style={styles.seasonTimerValue}>{fmtCountdown(currentSeason.endsAt)}</Text>
              </View>
            </View>
            <View style={styles.seasonRewards}>
              {currentSeason.rewards.map((r) => (
                <View key={r.rank} style={styles.seasonRewardItem}>
                  <Text style={styles.seasonRewardBadge}>{r.badge}</Text>
                  <Text style={styles.seasonRewardTitle}>{r.title}</Text>
                  <Text style={styles.seasonRewardCoins}>{r.coins} 🪙</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Live activity ticker */}
        <LiveActivityTicker />

        {/* Period toggle */}
        <View style={styles.toggle}>
          {(['semanal', 'mensal'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.toggleBtn, period === p ? styles.toggleBtnActive : null]}
              onPress={() => setPeriod(p)}
              accessibilityLabel={`Ranking ${p}`}
            >
              <Text style={[styles.toggleText, period === p ? styles.toggleTextActive : null]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rank Tab: Jogadores / Clãs */}
        <View style={styles.rankToggle}>
          {(['jogadores', 'clas'] as RankTab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.rankToggleBtn, rankTab === t ? styles.rankToggleBtnActive : null]}
              onPress={() => setRankTab(t)}
            >
              <Text style={[styles.rankToggleText, rankTab === t ? styles.rankToggleTextActive : null]}>
                {t === 'jogadores' ? '🏅 Jogadores' : '⚔️ Clãs'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {rankTab === 'jogadores' ? (
          <>
            {/* Podium — Top 3 */}
            <View style={styles.podiumContainer}>
              {/* Render in order: #2, #1, #3 for visual layout */}
              {[1, 0, 2].map((pos) => (
                <PodiumCard
                  key={top3[pos]?.id ?? pos}
                  user={top3[pos]}
                  position={pos as 0 | 1 | 2}
                  scaleAnim={podiumAnims[pos]}
                />
              ))}
            </View>

            {/* Your Position */}
            <SectionHeader title="Sua posição" style={styles.section} />
            <UserPositionCard user={user} leaderboard={leaderboard} missions={missions} />

            {/* Followed users */}
            <FollowedUsersSection
              following={user.following}
              leaderboard={leaderboard}
              currentUserRank={user.rank}
            />

            {/* Full Leaderboard */}
            <SectionHeader title="Leaderboard completo" style={styles.section} />
            {rest.map((u, i) => (
              <LeaderboardRow
                key={u.id}
                user={u}
                isFollowed={user.following.some((fid) => {
                  const map: Record<string, string> = { t1: 'lb2', t2: 'lb5', t3: 'lb7', t5: 'lb1', t6: 'lb16' };
                  return map[fid] === u.id;
                })}
                isNearby={nearbyRanks.has(u.id)}
                onChallenge={() => handleChallenge(u)}
                slideAnim={rowAnims[i] ?? new Animated.Value(1)}
              />
            ))}
          </>
        ) : (
          <>
            {/* Clan Rivalry */}
            <ClanRivalryCard clans={clans} />

            {/* Full Clan list */}
            <SectionHeader title="Todos os clãs" style={styles.section} />
            {clans.map((clan, i) => (
              <View key={clan.id} style={styles.clanListRow}>
                <Text style={styles.clanListRank}>#{i + 1}</Text>
                <Text style={styles.clanListBadge}>{clan.badge}</Text>
                <View style={styles.clanListInfo}>
                  <Text style={styles.clanListName}>{clan.name}</Text>
                  <Text style={styles.clanListMeta}>
                    [{clan.tag}] · {clan.members} membros · {fmtXP(clan.xp)} XP total
                  </Text>
                </View>
                <Text style={styles.clanListWeekly}>+{fmtXP(clan.weeklyXp)}/sem</Text>
              </View>
            ))}
          </>
        )}

        {/* Bottom spacing */}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Challenge overlay */}
      {challengeTarget && (
        <ChallengeOverlay target={challengeTarget} onDismiss={() => setChallengeTarget(null)} />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg } as ViewStyle,
  scroll: { flex: 1 } as ViewStyle,
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl } as ViewStyle,

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
  } as ViewStyle,
  title: {
    ...typography.display,
    fontSize: 24,
    color: colors.textPrimary,
  },

  // Countdown
  countdownContainer: { alignItems: 'flex-end' } as ViewStyle,
  countdownLabel: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    gap: 4,
  } as ViewStyle,
  countdownUrgent: {
    backgroundColor: colors.red + '22',
    borderWidth: 0.5,
    borderColor: colors.red + '60',
  } as ViewStyle,
  countdownIcon: { fontSize: 11 },
  countdownText: {
    ...typography.monoBold,
    fontSize: 11,
    color: colors.textSecondary,
  },
  countdownTextUrgent: { color: colors.red },

  // Ticker
  tickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginBottom: spacing.md,
    gap: 6,
  } as ViewStyle,
  tickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  } as ViewStyle,
  tickerText: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },

  // Period toggle
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: 3,
    marginBottom: spacing.sm,
  } as ViewStyle,
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
  } as ViewStyle,
  toggleBtnActive: { backgroundColor: colors.primary } as ViewStyle,
  toggleText: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
  },
  toggleTextActive: { color: colors.textPrimary },

  // Rank tab toggle
  rankToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  } as ViewStyle,
  rankToggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  } as ViewStyle,
  rankToggleBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '18',
  } as ViewStyle,
  rankToggleText: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  rankToggleTextActive: { color: colors.primary },

  section: { marginTop: spacing.lg, marginBottom: spacing.sm } as ViewStyle,

  // ─── Podium ──────────────────────────────────────────────────────────────
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingTop: spacing.lg,
  } as ViewStyle,
  podiumCard: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 120,
  } as ViewStyle,
  podiumFirst: { marginTop: -spacing.md } as ViewStyle,
  podiumAvatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  } as ViewStyle,
  podiumAvatarRing: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  podiumCrown: {
    position: 'absolute',
    top: -14,
    fontSize: 20,
  },
  podiumName: {
    ...typography.bodySemiBold,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 2,
  },
  podiumXP: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  podiumPedestal: {
    width: '100%',
    borderRadius: radius.md,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
  } as ViewStyle,
  podiumRank: {
    ...typography.display,
    fontSize: 22,
  },
  podiumStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  } as ViewStyle,
  podiumStatText: {
    ...typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },

  // ─── User Position Card ──────────────────────────────────────────────────
  userPosCard: {
    overflow: 'hidden',
  } as ViewStyle,
  userPosCardNearWin: {
    borderColor: colors.gold + '80',
    borderWidth: 1.5,
  } as ViewStyle,
  nearWinGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.gold + '08',
    borderRadius: radius.lg,
  } as ViewStyle,
  userPosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  } as ViewStyle,
  userPosLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  } as ViewStyle,
  userPosRank: {
    ...typography.display,
    fontSize: 20,
    color: colors.primary,
  },
  userPosName: {
    ...typography.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  userPosLevel: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textSecondary,
  },
  userPosRight: { alignItems: 'flex-end' } as ViewStyle,
  userPosStreak: {
    ...typography.monoBold,
    fontSize: 14,
    color: colors.orange,
  },

  // Rank progress
  rankProgressContainer: { marginBottom: spacing.sm } as ViewStyle,
  rankProgressTrack: {
    height: 4,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
  } as ViewStyle,
  rankProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  } as ViewStyle,

  // Gap message
  gapRow: { marginBottom: spacing.sm } as ViewStyle,
  gapText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  gapTextNearWin: { color: colors.gold },
  gapHighlight: {
    ...typography.monoBold,
    color: colors.primary,
  },

  // Overtake hint
  overtakeHint: {
    backgroundColor: colors.green + '15',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginBottom: spacing.sm,
  } as ViewStyle,
  overtakeText: {
    ...typography.bodyMedium,
    fontSize: 12,
    color: colors.green,
  },

  // User stats row
  userStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  } as ViewStyle,
  userStat: { alignItems: 'center', gap: 2 } as ViewStyle,
  userStatValue: {
    ...typography.monoBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  userStatLabel: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  userStatDivider: {
    width: 0.5,
    height: 24,
    backgroundColor: colors.border,
  } as ViewStyle,

  // ─── Leaderboard Row ─────────────────────────────────────────────────────
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  } as ViewStyle,
  lbRowFollowed: {
    borderColor: colors.primary + '50',
    backgroundColor: colors.primary + '08',
  } as ViewStyle,
  lbRank: {
    ...typography.monoBold,
    fontSize: 14,
    color: colors.textMuted,
    width: 32,
    textAlign: 'center',
  },
  lbInfo: { flex: 1 } as ViewStyle,
  lbNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as ViewStyle,
  lbName: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  lbFollowBadge: {
    ...typography.body,
    fontSize: 9,
    color: colors.primary,
    backgroundColor: colors.primary + '18',
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  lbMeta: {
    ...typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  lbRight: {
    alignItems: 'flex-end',
    gap: 4,
  } as ViewStyle,
  lbWR: {
    ...typography.monoBold,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Challenge button
  challengeBtn: {
    backgroundColor: colors.orange + '20',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: colors.orange + '60',
  } as ViewStyle,
  challengeText: {
    ...typography.bodyMedium,
    fontSize: 11,
    color: colors.orange,
  },

  // ─── Followed Users ──────────────────────────────────────────────────────
  followedSection: {} as ViewStyle,
  followedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.primary + '30',
  } as ViewStyle,
  followedRank: {
    ...typography.monoBold,
    fontSize: 13,
    color: colors.primary,
    width: 32,
    textAlign: 'center',
  },
  followedInfo: { flex: 1 } as ViewStyle,
  followedName: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  followedXP: {
    ...typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  followedDiffBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  } as ViewStyle,
  followedAhead: {
    backgroundColor: colors.green + '18',
  } as ViewStyle,
  followedBehind: {
    backgroundColor: colors.red + '18',
  } as ViewStyle,
  followedDiffText: {
    ...typography.monoBold,
    fontSize: 10,
  },
  followedAheadText: { color: colors.green },
  followedBehindText: { color: colors.red },

  // ─── Clan Rivalry ────────────────────────────────────────────────────────
  clanCard: {
    overflow: 'hidden',
  } as ViewStyle,
  clanHeader: {
    marginBottom: spacing.md,
  } as ViewStyle,
  clanTitle: {
    ...typography.displayMedium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  clanSubtitle: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  clanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  } as ViewStyle,
  clanRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    width: 120,
  } as ViewStyle,
  clanBadge: { fontSize: 20 },
  clanName: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  clanMembers: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  clanBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
  } as ViewStyle,
  clanBar: {
    height: '100%',
    borderRadius: radius.full,
  } as ViewStyle,
  clanXP: {
    ...typography.monoBold,
    fontSize: 12,
    width: 44,
    textAlign: 'right',
  },
  clanLiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    alignSelf: 'center',
  } as ViewStyle,
  clanLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.green,
  } as ViewStyle,
  clanLiveText: {
    ...typography.body,
    fontSize: 10,
    color: colors.green,
  },

  // ─── Clan List ───────────────────────────────────────────────────────────
  clanListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  } as ViewStyle,
  clanListRank: {
    ...typography.monoBold,
    fontSize: 14,
    color: colors.textMuted,
    width: 28,
    textAlign: 'center',
  },
  clanListBadge: { fontSize: 22 },
  clanListInfo: { flex: 1 } as ViewStyle,
  clanListName: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  clanListMeta: {
    ...typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  clanListWeekly: {
    ...typography.monoBold,
    fontSize: 12,
    color: colors.green,
  },

  // ─── Challenge Overlay ───────────────────────────────────────────────────
  challengeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  challengeOverlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000AA',
  } as ViewStyle,
  challengeCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.orange + '50',
    width: 260,
    ...shadows.md,
  } as ViewStyle,
  challengeEmoji: { fontSize: 42, marginBottom: spacing.sm },
  challengeTitle: {
    ...typography.display,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  challengeDesc: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  challengeTarget: {
    ...typography.bodySemiBold,
    color: colors.orange,
  },
  challengeXP: {
    ...typography.monoBold,
    fontSize: 18,
    color: colors.green,
  },

  // ─── Season Banner ───────────────────────────────────────────────────────
  seasonCard: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gold + '40',
    backgroundColor: colors.gold + '06',
  } as ViewStyle,
  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  } as ViewStyle,
  seasonName: {
    ...typography.display,
    fontSize: 18,
    color: colors.gold,
  },
  seasonWeek: {
    ...typography.mono,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seasonTimer: {
    alignItems: 'flex-end',
  } as ViewStyle,
  seasonTimerLabel: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  seasonTimerValue: {
    ...typography.monoBold,
    fontSize: 14,
    color: colors.gold,
  },
  seasonRewards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    borderTopColor: colors.gold + '30',
    paddingTop: spacing.sm,
  } as ViewStyle,
  seasonRewardItem: {
    alignItems: 'center',
    gap: 2,
  } as ViewStyle,
  seasonRewardBadge: {
    fontSize: 24,
  },
  seasonRewardTitle: {
    ...typography.bodyMedium,
    fontSize: 11,
    color: colors.textPrimary,
  },
  seasonRewardCoins: {
    ...typography.mono,
    fontSize: 10,
    color: colors.gold,
  },
});
