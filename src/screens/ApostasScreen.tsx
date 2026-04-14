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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Avatar, Card, LiveBadge, Pill } from '../components/ui';
import {
  AvatarStack,
  BetDistribution,
  FloatingXP,
  LiveActivityBar,
  SmoothEntry,
  TapScale,
} from '../components/LiveComponents';
import { colors, radius, spacing, typography } from '../theme';
import { Match, Tipster, TipsterTier, useNexaStore } from '../store/nexaStore';
import NexaLogo from '../components/NexaLogo';
import LiveChat from '../components/LiveChat';
import PowerUpShop from '../components/PowerUpShop';
import { hapticHeavy, hapticLight, hapticMedium, hapticSuccess, hapticWarning } from '../services/haptics';
import { playBetPlaced, playXPGain } from '../services/sounds';

// ─── Types ────────────────────────────────────────────────────────────────────

type ApostasTab = 'ao-vivo' | 'hoje' | 'amanha' | 'copiar';
type OddSide    = 'home' | 'draw' | 'away';

interface SelectedBet {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  side: OddSide;
  odds: number;
}

interface RewardData {
  xpBefore: number;
  xpToNext: number;
  level: number;
  leveledUp: boolean;
  betsToday: number;
  missionHint: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BETSLIP_HEIGHT = 280;
const MOCK_NOW_MINUTES = 13 * 60; // mock current time: 13:00

const TABS: { key: ApostasTab; label: string }[] = [
  { key: 'ao-vivo', label: '🔴  Ao vivo' },
  { key: 'hoje',    label: 'Hoje' },
  { key: 'amanha',  label: 'Amanhã' },
  { key: 'copiar',  label: '📋  Copiar Bet' },
];

const TIER_COLOR: Record<TipsterTier, string> = {
  bronze: '#CD7F32', silver: '#A8B8C8', gold: colors.gold, elite: colors.primary,
};
const TIER_LABEL: Record<TipsterTier, string> = {
  bronze: 'Bronze', silver: 'Prata', gold: 'Ouro', elite: 'Elite',
};

// Rotating social proof messages
const SOCIAL_MSGS = [
  (n: number, l: number) => `🔴  ${n} apostando agora  ·  ${l} jogos ao vivo`,
  (n: number, _l: number) => `⚡  ${Math.round(n * 0.3)} apostaram nos últimos 5min`,
  (n: number, l: number) => `🔥  ${l} jogos quentes  ·  ${n} usuários ativos`,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sideName(match: Match, side: OddSide): string {
  return side === 'home' ? match.homeTeam : side === 'away' ? match.awayTeam : 'Empate';
}

function fmtBettors(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function shortName(name: string, max = 7): string {
  return name.length > max ? name.slice(0, max - 1) + '.' : name;
}

function getActivityBadge(match: Match): { label: string; color: string } | null {
  if (match.bettors > 7000)              return { label: '🔥 HOT',      color: colors.red };
  if (match.trending && match.bettors > 3000) return { label: '📈 TRENDING', color: colors.primary };
  if (match.bettors > 1800)              return { label: '⚡ POPULAR',  color: colors.orange };
  if (match.bettors > 900)              return { label: '↑ RISING',   color: colors.green };
  return null;
}

function parseTimeMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function fmtCountdown(scheduledTime: string, day: 'today' | 'tomorrow'): string {
  if (day === 'tomorrow') return scheduledTime; // shown as "Amanhã HH:MM"
  const diff = parseTimeMinutes(scheduledTime) - MOCK_NOW_MINUTES;
  if (diff <= 0) return 'Em breve';
  if (diff < 60) return `${diff}min`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function isUrgent(scheduledTime: string): boolean {
  const diff = parseTimeMinutes(scheduledTime) - MOCK_NOW_MINUTES;
  return diff > 0 && diff <= 90;
}

// ─── PulsingDot ───────────────────────────────────────────────────────────────

function PulsingDot() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.6, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,   duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View style={styles.pulsingWrap}>
      <Animated.View style={[styles.pulsingRing, { transform: [{ scale: pulse }] }]} />
      <View style={styles.pulsingDot} />
    </View>
  );
}

// ─── BetOddsButton ────────────────────────────────────────────────────────────

interface BetOddsBtnProps {
  label: string;
  odds: number;
  selected: boolean;
  movement?: -1 | 0 | 1;
  onPress: () => void;
  accessibilityLabel: string;
}

function BetOddsBtn({ label, odds, selected, movement, onPress, accessibilityLabel }: BetOddsBtnProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }),
    ]).start();
    onPress();
  }

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.betOddsBtn, selected && styles.betOddsBtnSelected]}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={styles.betOddsBtnLabel}>{label}</Text>
        <View style={styles.betOddsBtnValueRow}>
          <Text style={[styles.betOddsBtnOdds, selected && styles.betOddsBtnOddsSelected]}>
            {odds.toFixed(2)}
          </Text>
          {movement !== undefined && movement !== 0 && (
            <Text style={movement === -1 ? styles.movementDown : styles.movementUp}>
              {movement === -1 ? '▼' : '▲'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── MatchCard ────────────────────────────────────────────────────────────────

interface MatchCardProps {
  match: Match;
  selectedSide?: OddSide;
  isConfirmed: boolean;
  tipsterSuggestion?: Tipster;
  onSelectOdd: (match: Match, side: OddSide) => void;
}

function MatchCard({ match, selectedSide, isConfirmed, tipsterSuggestion, onSelectOdd }: MatchCardProps) {
  const confirmedAlpha = useRef(new Animated.Value(0)).current;
  const prevConfirmed  = useRef(false);

  useEffect(() => {
    if (isConfirmed && !prevConfirmed.current) {
      prevConfirmed.current = true;
      Animated.sequence([
        Animated.timing(confirmedAlpha, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.delay(700),
        Animated.timing(confirmedAlpha, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start(() => { prevConfirmed.current = false; });
    }
  }, [isConfirmed, confirmedAlpha]);

  const isLive   = match.status === 'live';
  const activity = getActivityBadge(match);
  const mv       = match.oddsMovement;

  const showCountdown = !isLive && match.scheduledDay && match.scheduledTime;
  const countdown     = showCountdown ? fmtCountdown(match.scheduledTime!, match.scheduledDay!) : null;
  const urgent        = showCountdown && match.scheduledDay === 'today' && isUrgent(match.scheduledTime!);

  return (
    <View>
      {/* Confirmed flash overlay */}
      <Animated.View style={[styles.confirmedOverlay, { opacity: confirmedAlpha }]} pointerEvents="none">
        <Text style={styles.confirmedIcon}>✓</Text>
        <Text style={styles.confirmedText}>Aposta registrada</Text>
        <Text style={styles.confirmedXP}>+20 XP</Text>
      </Animated.View>

      <Card style={[styles.matchCard, isLive ? styles.matchCardLive : null]}>
        {/* Top row: league + activity badge + time/live */}
        <View style={styles.mcTopRow}>
          <Text style={styles.mcLeague} numberOfLines={1}>{match.league}</Text>
          <View style={styles.mcTopRight}>
            {activity && (
              <View style={[styles.activityBadge, { borderColor: activity.color + '60', backgroundColor: activity.color + '18' }]}>
                <Text style={[styles.activityText, { color: activity.color }]}>{activity.label}</Text>
              </View>
            )}
            {isLive && <PulsingDot />}
            {isLive && <LiveBadge />}
            {urgent && !isLive && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>⚡ {countdown}</Text>
              </View>
            )}
            {!isLive && !urgent && countdown && (
              <Text style={styles.mcTime}>
                {match.scheduledDay === 'tomorrow' ? `Amanhã  ${countdown}` : countdown}
              </Text>
            )}
          </View>
        </View>

        {/* Teams + score */}
        <View style={styles.mcTeamsRow}>
          <Text style={styles.mcTeam} numberOfLines={1}>{match.homeTeam}</Text>
          <View style={styles.mcCenter}>
            {match.score ? (
              <>
                <Text style={styles.mcScore}>{match.score.home}–{match.score.away}</Text>
                {isLive && <Text style={styles.mcMinute}>{match.minute}'</Text>}
              </>
            ) : (
              <Text style={styles.mcVs}>×</Text>
            )}
          </View>
          <Text style={[styles.mcTeam, styles.mcTeamRight]} numberOfLines={1}>{match.awayTeam}</Text>
        </View>

        {/* Social proof */}
        <View style={styles.mcSocialRow}>
          <AvatarStack count={Math.min(match.bettors, 300)} max={4} size={18} />
          {isLive
            ? <Text style={styles.mcBettorsLive}>{fmtBettors(match.bettors)} apostando agora</Text>
            : <Text style={styles.mcBettors}>{fmtBettors(match.bettors)} apostaram</Text>
          }
        </View>

        {/* Tipster suggestion */}
        {tipsterSuggestion?.recentPick && (
          <View style={styles.tipSuggestion}>
            <View style={[styles.tipAvatarRing, { borderColor: TIER_COLOR[tipsterSuggestion.tier] }]}>
              <Avatar username={tipsterSuggestion.username} size={20} />
            </View>
            <Text style={styles.tipText} numberOfLines={1}>
              <Text style={{ color: TIER_COLOR[tipsterSuggestion.tier] }}>{tipsterSuggestion.username}</Text>
              <Text style={styles.tipTextMid}> apostou em </Text>
              <Text style={{ color: colors.textPrimary }}>{sideName(match, tipsterSuggestion.recentPick.side)}</Text>
              <Text style={styles.tipOdds}> @{tipsterSuggestion.recentPick.odds.toFixed(2)}</Text>
            </Text>
            <View style={[styles.tipTierBadge, { backgroundColor: TIER_COLOR[tipsterSuggestion.tier] + '22' }]}>
              <Text style={[styles.tipTierText, { color: TIER_COLOR[tipsterSuggestion.tier] }]}>
                {Math.round(tipsterSuggestion.winRate * 100)}% WR
              </Text>
            </View>
          </View>
        )}

        {/* Odds row */}
        <View style={styles.oddsRow}>
          {(['home', 'draw', 'away'] as OddSide[]).map(side => (
            <BetOddsBtn
              key={side}
              label={side === 'draw' ? 'Empate' : shortName(side === 'home' ? match.homeTeam : match.awayTeam)}
              odds={match.odds[side]}
              selected={selectedSide === side}
              movement={mv ? mv[side] : undefined}
              onPress={() => onSelectOdd(match, side)}
              accessibilityLabel={`${sideName(match, side)} ${match.odds[side]}`}
            />
          ))}
        </View>

        {/* Bet distribution */}
        <BetDistribution
          home={Math.round(match.bettors * 0.45)}
          draw={Math.round(match.bettors * 0.25)}
          away={Math.round(match.bettors * 0.30)}
          homeTeam={shortName(match.homeTeam)}
          awayTeam={shortName(match.awayTeam)}
          style={{ marginTop: spacing.xs }}
        />

        {/* Odds movement legend — only if any movement */}
        {mv && (mv.home !== 0 || mv.draw !== 0 || mv.away !== 0) && (
          <Text style={styles.movementLegend}>▼ odds caindo  ·  ▲ odds subindo</Text>
        )}
      </Card>
    </View>
  );
}

// ─── CopyBetCard ──────────────────────────────────────────────────────────────

interface CopyBetCardProps {
  tipster: Tipster;
  match: Match;
  isConfirmed: boolean;
  selectedSide?: OddSide;
  onCopy: (match: Match, side: OddSide) => void;
}

function CopyBetCard({ tipster, match, isConfirmed, selectedSide, onCopy }: CopyBetCardProps) {
  const pick    = tipster.recentPick!;
  const tierCol = TIER_COLOR[tipster.tier];
  const mv      = match.oddsMovement;

  return (
    <Card style={[styles.copyCard, isConfirmed ? { borderColor: colors.green, borderWidth: 1 } : null]}>
      {/* Tipster header */}
      <View style={styles.copyHeader}>
        <View style={[styles.copyAvatarRing, { borderColor: tierCol }]}>
          <Avatar username={tipster.username} size={42} />
        </View>
        <View style={styles.copyTipInfo}>
          <View style={styles.copyNameRow}>
            <Text style={styles.copyName}>{tipster.username}</Text>
            <Pill label={TIER_LABEL[tipster.tier]} color={tierCol} />
          </View>
          <View style={styles.copyStatsRow}>
            <Text style={styles.copyStatGreen}>{Math.round(tipster.winRate * 100)}% WR</Text>
            <Text style={styles.copyStatSep}>·</Text>
            <Text style={styles.copyStatGreen}>+{Math.round(tipster.roi * 100)}% ROI</Text>
            <Text style={styles.copyStatSep}>·</Text>
            <Text style={styles.copyStatMuted}>🔥 {tipster.streak} seguidos</Text>
          </View>
          {/* Confidence bar */}
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>Confiança</Text>
            <View style={styles.confidenceTrack}>
              <View style={[styles.confidenceFill, { width: `${tipster.winRate * 100}%` }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Match */}
      <View style={styles.copyMatchRow}>
        <Text style={styles.copyLeague}>{match.league}</Text>
        {match.status === 'live' && <LiveBadge />}
        {match.scheduledTime && match.status === 'pre' && (
          <Text style={styles.copyTime}>{match.scheduledTime}</Text>
        )}
      </View>
      <Text style={styles.copyTeams}>{match.homeTeam}  ×  {match.awayTeam}</Text>

      {/* Pick highlight */}
      <View style={styles.copyPickRow}>
        <View>
          <Text style={styles.copyPickEyebrow}>PICK DO TIPSTER</Text>
          <Text style={styles.copyPickSide}>{sideName(match, pick.side)}</Text>
        </View>
        <Text style={styles.copyPickOdds}>@{pick.odds.toFixed(2)}</Text>
      </View>

      {/* Odds */}
      <View style={styles.oddsRow}>
        {(['home', 'draw', 'away'] as OddSide[]).map(side => (
          <BetOddsBtn
            key={side}
            label={side === 'draw' ? 'Empate' : shortName(side === 'home' ? match.homeTeam : match.awayTeam)}
            odds={match.odds[side]}
            selected={selectedSide === side}
            movement={mv ? mv[side] : undefined}
            onPress={() => onCopy(match, side)}
            accessibilityLabel={`${sideName(match, side)} ${match.odds[side]}`}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.copyBtn, isConfirmed ? styles.copyBtnDone : null]}
        onPress={() => onCopy(match, pick.side)}
        activeOpacity={0.8}
        accessibilityLabel={`Copiar aposta de ${tipster.username}`}
      >
        <Text style={styles.copyBtnText}>
          {isConfirmed ? '✓  Copiado  +20 XP' : `📋  Copiar aposta de ${tipster.username}`}
        </Text>
      </TouchableOpacity>
    </Card>
  );
}

// ─── HiddenMissionCard ────────────────────────────────────────────────────────

function HiddenMissionCard() {
  const mission    = useNexaStore(s => s.missions.find(m => m.id === 'm4'));
  const betsPlaced = useNexaStore(s => s.betsPlaced);

  const flashAlpha   = useRef(new Animated.Value(0)).current;
  const lockPulse    = useRef(new Animated.Value(1)).current;
  const prevRevealed = useRef(false);

  // Pulse lock icon when unrevealed
  useEffect(() => {
    if (mission?.revealed) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(lockPulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(lockPulse, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [mission?.revealed, lockPulse]);

  // Flash on reveal
  useEffect(() => {
    if (mission?.revealed && !prevRevealed.current) {
      prevRevealed.current = true;
      Animated.sequence([
        Animated.timing(flashAlpha, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(flashAlpha, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
    }
  }, [mission?.revealed, flashAlpha]);

  if (!mission) return null;

  const revealed = mission.revealed;
  const pct      = Math.min(betsPlaced / mission.target, 1);

  return (
    <View>
      <Animated.View style={[styles.hiddenFlash, { opacity: flashAlpha }]} pointerEvents="none" />
      <Card style={[styles.hiddenCard, revealed ? styles.hiddenCardDone : null]}>
        <View style={styles.hiddenTop}>
          <Animated.Text style={[styles.hiddenEmoji, !revealed && { transform: [{ scale: lockPulse }] }]}>
            {revealed ? '🎯' : '🔒'}
          </Animated.Text>
          <View style={styles.hiddenInfo}>
            <Text style={styles.hiddenEyebrow}>MISSÃO OCULTA</Text>
            <Text style={styles.hiddenTitle}>{revealed ? mission.title : '???'}</Text>
            <Text style={styles.hiddenDesc}>{mission.description}</Text>
          </View>
          <Text style={styles.hiddenXP}>{revealed ? `+${mission.xpReward} XP` : '??? XP'}</Text>
        </View>

        {/* Progress */}
        <View style={styles.hiddenProgressRow}>
          <View style={styles.hiddenTrack}>
            <View style={[
              styles.hiddenFill,
              { width: `${(revealed ? 1 : pct) * 100}%`, backgroundColor: revealed ? colors.green : colors.primary },
            ]} />
          </View>
          <Text style={styles.hiddenProgressLabel}>
            {revealed ? `${mission.target}/${mission.target}` : `${betsPlaced}/${mission.target}`}
          </Text>
        </View>

        {!revealed && (
          <Text style={styles.hiddenHint}>
            Faça {mission.target - betsPlaced} aposta{mission.target - betsPlaced !== 1 ? 's' : ''} para revelar esta missão
          </Text>
        )}
        {revealed && (
          <Text style={styles.hiddenRevealBadge}>🏆  MISSÃO DESBLOQUEADA!</Text>
        )}
      </Card>
    </View>
  );
}

// ─── RewardOverlay ────────────────────────────────────────────────────────────

interface RewardOverlayProps {
  data: RewardData | null;
  onDismiss: () => void;
}

function RewardOverlay({ data, onDismiss }: RewardOverlayProps) {
  const bgAlpha    = useRef(new Animated.Value(0)).current;
  const cardScale  = useRef(new Animated.Value(0.82)).current;
  const cardAlpha  = useRef(new Animated.Value(0)).current;
  const xpScale    = useRef(new Animated.Value(0)).current;
  const barWidth   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!data) return;

    // Reset
    bgAlpha.setValue(0);
    cardScale.setValue(0.82);
    cardAlpha.setValue(0);
    xpScale.setValue(0);
    barWidth.setValue(data.xpBefore / data.xpToNext);

    // Phase 1 — card appears (native)
    Animated.parallel([
      Animated.timing(bgAlpha,   { toValue: 0.75, duration: 180, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 7 }),
      Animated.timing(cardAlpha, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      // Phase 2 — XP text bounces (native)
      Animated.spring(xpScale, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 14 }).start();
    });

    // Phase 3 — bar fills (non-native, separate timing)
    const t1 = setTimeout(() => {
      Animated.timing(barWidth, {
        toValue: Math.min((data.xpBefore + 20) / data.xpToNext, 1),
        duration: 700,
        useNativeDriver: false,
      }).start();
    }, 150);

    // Phase 4 — auto-dismiss
    const t2 = setTimeout(() => {
      Animated.parallel([
        Animated.timing(bgAlpha,   { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(cardAlpha, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(onDismiss);
    }, 2100);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return null;

  const xpAfter = Math.min(data.xpBefore + 20, data.xpToNext);

  return (
    <TouchableOpacity
      style={styles.rewardBackdrop}
      onPress={onDismiss}
      activeOpacity={1}
      accessibilityLabel="Fechar recompensa"
    >
      <Animated.View style={[styles.rewardBg, { opacity: bgAlpha }]} />

      <Animated.View style={[
        styles.rewardCard,
        { opacity: cardAlpha, transform: [{ scale: cardScale }] },
      ]}>
        {/* XP pop */}
        <Animated.Text style={[styles.rewardXP, { transform: [{ scale: xpScale }] }]}>
          +20 XP ⚡
        </Animated.Text>

        {/* Level-up banner */}
        {data.leveledUp && (
          <View style={styles.rewardLevelUpBadge}>
            <Text style={styles.rewardLevelUpText}>⬆️  LEVEL UP!  Nível {data.level}</Text>
          </View>
        )}

        {/* XP bar */}
        <View style={styles.rewardBarSection}>
          <View style={styles.rewardBarHeader}>
            <Text style={styles.rewardBarLevel}>Nível {data.leveledUp ? data.level - 1 : data.level}</Text>
            <Text style={styles.rewardBarXP}>{data.xpBefore} → {xpAfter} XP</Text>
          </View>
          <View style={styles.rewardBarTrack}>
            <Animated.View style={[
              styles.rewardBarFill,
              {
                width: barWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]} />
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.rewardStatsRow}>
          <View style={styles.rewardStat}>
            <Text style={styles.rewardStatValue}>{data.betsToday}</Text>
            <Text style={styles.rewardStatLabel}>apostas hoje</Text>
          </View>
          <View style={styles.rewardStatDivider} />
          <View style={styles.rewardStat}>
            <Text style={[styles.rewardStatValue, { color: colors.orange }]}>🔥</Text>
            <Text style={styles.rewardStatLabel}>sequência ativa</Text>
          </View>
          <View style={styles.rewardStatDivider} />
          <View style={styles.rewardStat}>
            <Text style={[styles.rewardStatValue, { color: colors.gold }]}>+20</Text>
            <Text style={styles.rewardStatLabel}>rank pts</Text>
          </View>
        </View>

        {/* Mission progress */}
        {data.missionHint !== '' && (
          <View style={styles.rewardMissionRow}>
            <Text style={styles.rewardMissionText}>{data.missionHint}</Text>
          </View>
        )}

        <Text style={styles.rewardDismissHint}>toque para fechar</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── BetslipPanel ─────────────────────────────────────────────────────────────

interface BetslipPanelProps {
  bet: SelectedBet | null;
  panelY: Animated.Value;
  user: { xp: number; xpToNext: number; level: number };
  missionHint: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function BetslipPanel({ bet, panelY, user, missionHint, onConfirm, onCancel }: BetslipPanelProps) {
  const xpAfterPct = Math.min((user.xp + 20) / user.xpToNext, 1);
  const xpNowPct   = user.xp / user.xpToNext;

  return (
    <Animated.View
      style={[styles.betslip, { transform: [{ translateY: panelY }] }]}
      pointerEvents={bet ? 'auto' : 'none'}
    >
      <View style={styles.betslipHandle} />

      <Text style={styles.betslipTitle}>Confirmar aposta</Text>

      {bet && (
        <View style={styles.betslipPickSection}>
          <Text style={styles.betslipMatch} numberOfLines={1}>
            {bet.homeTeam}  ×  {bet.awayTeam}
          </Text>
          <View style={styles.betslipPickRow}>
            <Text style={styles.betslipSide}>
              {bet.side === 'home' ? bet.homeTeam : bet.side === 'away' ? bet.awayTeam : 'Empate'}
            </Text>
            <Text style={styles.betslipOdds}>@{bet.odds.toFixed(2)}</Text>
          </View>
        </View>
      )}

      {/* XP preview bar */}
      <View style={styles.betslipXPSection}>
        <View style={styles.betslipXPHeader}>
          <Text style={styles.betslipXPLabel}>Nível {user.level}  ·  {user.xp}/{user.xpToNext} XP</Text>
          <Text style={styles.betslipXPGain}>+20 XP ⚡</Text>
        </View>
        <View style={styles.betslipXPTrack}>
          <View style={[styles.betslipXPNow,   { width: `${xpNowPct * 100}%` }]} />
          <View style={[styles.betslipXPGainBar, { width: `${(xpAfterPct - xpNowPct) * 100}%` }]} />
        </View>
      </View>

      {/* Mission hint */}
      {missionHint !== '' && (
        <Text style={styles.betslipMission}>{missionHint}</Text>
      )}

      <TouchableOpacity
        style={styles.betslipConfirm}
        onPress={onConfirm}
        accessibilityLabel="Confirmar aposta"
        activeOpacity={0.85}
      >
        <Text style={styles.betslipConfirmText}>Apostar  ·  +20 XP</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.betslipCancel}
        onPress={onCancel}
        accessibilityLabel="Cancelar"
        activeOpacity={0.7}
      >
        <Text style={styles.betslipCancelText}>Cancelar</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── ApostasScreen ────────────────────────────────────────────────────────────

export default function ApostasScreen() {
  const [activeTab,    setActiveTab]    = useState<ApostasTab>('ao-vivo');
  const [selectedBet,  setSelectedBet]  = useState<SelectedBet | null>(null);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [rewardData,   setRewardData]   = useState<RewardData | null>(null);
  const [extraBettors, setExtraBettors] = useState(0);
  const [socialMsgIdx, setSocialMsgIdx] = useState(0);
  const [refreshing,   setRefreshing]   = useState(false);

  const matches    = useNexaStore(s => s.matches);
  const tipsters   = useNexaStore(s => s.tipsters);
  const user       = useNexaStore(s => s.user);
  const missions   = useNexaStore(s => s.missions);
  const betsPlaced = useNexaStore(s => s.betsPlaced);
  const placeBet   = useNexaStore(s => s.placeBet);
  const liveStats  = useNexaStore(s => s.liveStats);

  const matchChats        = useNexaStore(s => s.matchChats);
  const expandedChat      = useNexaStore(s => s.expandedChat);
  const toggleChat        = useNexaStore(s => s.toggleChat);
  const powerUps          = useNexaStore(s => s.powerUps);
  const activePowerUps    = useNexaStore(s => s.activePowerUps);
  const purchasePowerUp   = useNexaStore(s => s.purchasePowerUp);
  const antiCollapse      = useNexaStore(s => s.antiCollapse);
  const acknowledgeCooldown = useNexaStore(s => s.acknowledgeCooldown);
  const currentSubscription = useNexaStore(s => s.currentSubscription);
  const pushToast           = useNexaStore(s => s.pushToast);

  const navigation = useNavigation<any>();

  const panelY = useRef(new Animated.Value(BETSLIP_HEIGHT)).current;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    hapticLight();
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // Live bettors ticker — increments every 4 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setExtraBettors(n => n + Math.floor(Math.random() * 6 + 1));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Rotate social proof message every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setSocialMsgIdx(i => (i + 1) % SOCIAL_MSGS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Betslip spring animation
  useEffect(() => {
    Animated.spring(panelY, {
      toValue: selectedBet ? 0 : BETSLIP_HEIGHT,
      useNativeDriver: true,
      speed: 22,
      bounciness: 3,
    }).start();
  }, [selectedBet, panelY]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const liveMatches     = useMemo(() => matches.filter(m => m.status === 'live'), [matches]);
  const todayMatches    = useMemo(() => matches.filter(m => m.scheduledDay === 'today'), [matches]);
  const tomorrowMatches = useMemo(() => matches.filter(m => m.scheduledDay === 'tomorrow'), [matches]);

  const tipsterByMatch = useMemo(() => {
    const result: Record<string, Tipster> = {};
    for (const t of tipsters) {
      if (user.following.includes(t.id) && t.recentPick && !result[t.recentPick.matchId]) {
        result[t.recentPick.matchId] = t;
      }
    }
    return result;
  }, [tipsters, user.following]);

  const copyBetTipsters = useMemo(() =>
    tipsters.filter(t => user.following.includes(t.id) && t.recentPick),
    [tipsters, user.following],
  );

  const totalLiveBettors = liveMatches.reduce((s, m) => s + m.bettors, 0) + extraBettors;

  // Active mission hint for betslip / reward
  const missionHint = useMemo(() => {
    const m4 = missions.find(m => m.id === 'm4');
    if (!m4 || m4.revealed) return '';
    return `🎯  Missão oculta: ${betsPlaced + 1}/${m4.target} — ${m4.target - betsPlaced - 1} aposta${m4.target - betsPlaced - 1 !== 1 ? 's' : ''} para revelar`;
  }, [missions, betsPlaced]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSelectOdd = useCallback((match: Match, side: OddSide) => {
    hapticLight();
    setSelectedBet({
      matchId: match.id, homeTeam: match.homeTeam, awayTeam: match.awayTeam,
      side, odds: match.odds[side],
    });
  }, []);

  const handleConfirmBet = useCallback(() => {
    if (!selectedBet) return;
    const matchId    = selectedBet.matchId;
    const xpBefore   = user.xp;
    const xpToNext   = user.xpToNext;
    const level      = user.level;
    const leveledUp  = xpBefore + 20 >= xpToNext;
    const betsToday  = betsPlaced + 1;

    placeBet(); // addXP(20) + betsPlaced++ + maybe reveal mission
    hapticHeavy();
    playBetPlaced();

    setSelectedBet(null);
    setConfirmedIds(prev => new Set(prev).add(matchId));
    setTimeout(() => {
      setConfirmedIds(prev => { const n = new Set(prev); n.delete(matchId); return n; });
    }, 1400);

    setRewardData({ xpBefore, xpToNext, level: leveledUp ? level + 1 : level, leveledUp, betsToday, missionHint });
    setTimeout(() => pushToast('🎯 Confira os torneios para multiplicar seus ganhos!'), 3000);
  }, [selectedBet, user, betsPlaced, placeBet, missionHint, pushToast]);

  const handleCancelBet  = useCallback(() => setSelectedBet(null), []);
  const handleDismissReward = useCallback(() => setRewardData(null), []);

  // ── Render helpers ───────────────────────────────────────────────────────────

  function renderMatch(match: Match, idx: number = 0) {
    return (
      <SmoothEntry key={match.id} delay={idx * 80}>
        <MatchCard
          match={match}
          selectedSide={selectedBet?.matchId === match.id ? selectedBet.side : undefined}
          isConfirmed={confirmedIds.has(match.id)}
          tipsterSuggestion={tipsterByMatch[match.id]}
          onSelectOdd={handleSelectOdd}
        />
        {match.status === 'live' && (
          <LiveChat
            matchId={match.id}
            expanded={expandedChat === match.id}
            onToggle={() => toggleChat(match.id)}
          />
        )}
      </SmoothEntry>
    );
  }

  function renderEmpty(msg: string) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyText}>{msg}</Text>
      </Card>
    );
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'ao-vivo':
        return (
          <>
            {liveMatches.length === 0
              ? renderEmpty('Nenhum jogo ao vivo no momento.')
              : liveMatches.map((m, i) => renderMatch(m, i))}
            <HiddenMissionCard />
          </>
        );
      case 'hoje':
        return (
          <>
            {todayMatches.length === 0
              ? renderEmpty('Nenhum jogo programado para hoje.')
              : todayMatches.map((m, i) => renderMatch(m, i))}
            <HiddenMissionCard />
          </>
        );
      case 'amanha':
        return (
          <>
            {tomorrowMatches.length === 0
              ? renderEmpty('Nenhum jogo programado para amanhã.')
              : tomorrowMatches.map((m, i) => renderMatch(m, i))}
            <HiddenMissionCard />
          </>
        );
      case 'copiar':
        return copyBetTipsters.length === 0
          ? renderEmpty('Siga tipsters para ver as picks deles aqui.')
          : copyBetTipsters.map(t => {
              const match = matches.find(m => m.id === t.recentPick!.matchId);
              if (!match) return null;
              return (
                <CopyBetCard
                  key={t.id}
                  tipster={t}
                  match={match}
                  isConfirmed={confirmedIds.has(match.id)}
                  selectedSide={selectedBet?.matchId === match.id ? selectedBet.side : undefined}
                  onCopy={handleSelectOdd}
                />
              );
            });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <NexaLogo size="small" />
          <LiveBadge />
        </View>
        <LiveActivityBar
          usersOnline={liveStats.usersOnline + extraBettors}
          gamesLive={liveStats.gamesLive}
          recentCopies={liveStats.recentCopies}
          style={{ marginTop: spacing.xs }}
        />
      </View>

      {/* ── Tab bar ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabRow}
      >
        {TABS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabBtn, activeTab === key ? styles.tabBtnActive : null]}
            onPress={() => setActiveTab(key)}
            accessibilityLabel={label}
          >
            <Text style={[styles.tabLabel, activeTab === key ? styles.tabLabelActive : null]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Active Power-Ups row ── */}
      {activePowerUps.length > 0 && (
        <View style={styles.activePowerUpsRow}>
          {activePowerUps.map(pu => (
            <View key={pu.id} style={styles.activePowerUpPill}>
              <Text style={styles.activePowerUpText}>{pu.icon} {pu.name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Match list ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BETSLIP_HEIGHT + spacing.xxl }]}
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
        {/* Power-Up Shop */}
        <PowerUpShop
          powerUps={powerUps}
          activePowerUps={activePowerUps}
          coins={user.coins}
          onPurchase={purchasePowerUp}
        />

        {/* Anti-Collapse: Cooldown mode banner */}
        {antiCollapse.isOnCooldown && (
          <View style={styles.cooldownModeBanner}>
            <Text style={styles.cooldownModeText}>😌  Modo tranquilo ativado</Text>
          </View>
        )}

        {/* Anti-Collapse: Cooldown suggestion */}
        {antiCollapse.showCooldownSuggestion && (
          <Card style={styles.cooldownCard}>
            <Text style={styles.cooldownEmoji}>😮‍💨</Text>
            <Text style={styles.cooldownTitle}>Que tal uma pausa?</Text>
            <Text style={styles.cooldownDesc}>
              Você teve {antiCollapse.consecutiveLosses} resultados negativos seguidos. Sua mente agradece um descanso.
            </Text>
            <View style={styles.cooldownActions}>
              <TapScale onPress={() => { acknowledgeCooldown(); hapticWarning(); }}>
                <View style={styles.cooldownBtn}>
                  <Text style={styles.cooldownBtnText}>Parar por 30min</Text>
                </View>
              </TapScale>
              <TapScale onPress={() => {}}>
                <View style={styles.cooldownBtnSkip}>
                  <Text style={styles.cooldownBtnSkipText}>Continuar</Text>
                </View>
              </TapScale>
            </View>
          </Card>
        )}

        {renderTabContent()}

        {/* ── Pro upsell ── */}
        {currentSubscription === 'free' && (
          <SmoothEntry delay={300}>
            <Card style={styles.upsellCard}>
              <Text style={styles.upsellBadge}>⭐ PRO</Text>
              <Text style={styles.upsellTitle}>Desbloqueie power-ups grátis</Text>
              <Text style={styles.upsellDesc}>Assinantes Pro ganham 1 power-up por semana + feed personalizado</Text>
              <TapScale onPress={() => navigation.navigate('Subscription' as never)}>
                <View style={styles.upsellBtn}>
                  <Text style={styles.upsellBtnText}>Conhecer NEXA Pro →</Text>
                </View>
              </TapScale>
            </Card>
          </SmoothEntry>
        )}
      </ScrollView>

      {/* ── Betslip ── */}
      <BetslipPanel
        bet={selectedBet}
        panelY={panelY}
        user={user}
        missionHint={missionHint}
        onConfirm={handleConfirmBet}
        onCancel={handleCancelBet}
      />

      {/* ── Reward overlay ── */}
      <RewardOverlay data={rewardData} onDismiss={handleDismissReward} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Header
  header: {
    paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm,
    gap: 4, borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { ...typography.display, fontSize: 24, color: colors.textPrimary },
  headerSub:   { ...typography.mono, fontSize: 11, color: colors.textMuted },

  // Tabs
  tabScroll: { borderBottomWidth: 0.5, borderBottomColor: colors.border, flexGrow: 0 },
  tabRow:    { flexDirection: 'row', paddingHorizontal: spacing.sm, gap: spacing.xs, paddingVertical: spacing.xs },
  tabBtn:    { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.full },
  tabBtnActive: { backgroundColor: colors.primary + '22' },
  tabLabel:     { ...typography.bodyMedium, fontSize: 13, color: colors.textMuted },
  tabLabelActive: { color: colors.primary },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md },

  // PulsingDot
  pulsingWrap: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  pulsingRing: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.red + '40',
  },
  pulsingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.red },

  // BetOddsBtn
  betOddsBtn: {
    flex: 1, backgroundColor: colors.bgElevated,
    borderWidth: 0.5, borderColor: colors.border,
    borderRadius: radius.md, paddingVertical: spacing.sm,
    alignItems: 'center', gap: 2,
  },
  betOddsBtnSelected: { backgroundColor: colors.primary + '22', borderColor: colors.primary },
  betOddsBtnLabel: { ...typography.body, fontSize: 10, color: colors.textSecondary },
  betOddsBtnValueRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  betOddsBtnOdds: { ...typography.monoBold, fontSize: 15, color: colors.textPrimary },
  betOddsBtnOddsSelected: { color: colors.primary },
  movementDown: { ...typography.monoBold, fontSize: 10, color: colors.green },
  movementUp:   { ...typography.monoBold, fontSize: 10, color: colors.orange },
  movementLegend: { ...typography.body, fontSize: 9, color: colors.textMuted, textAlign: 'center' },

  // MatchCard
  matchCard: { gap: spacing.sm },
  matchCardLive: { borderColor: colors.red + '55' },
  confirmedOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.green + '20', borderRadius: radius.lg,
    zIndex: 10, alignItems: 'center', justifyContent: 'center',
    gap: 4, borderWidth: 1, borderColor: colors.green + '50',
  },
  confirmedIcon: { fontSize: 28 },
  confirmedText: { ...typography.bodySemiBold, fontSize: 15, color: colors.green },
  confirmedXP:   { ...typography.monoBold, fontSize: 13, color: colors.green },

  mcTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  mcLeague: { ...typography.mono, fontSize: 10, color: colors.textMuted, flex: 1, letterSpacing: 0.3 },
  mcTopRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  mcTime: { ...typography.monoBold, fontSize: 11, color: colors.textSecondary },

  activityBadge: {
    borderWidth: 0.5, borderRadius: radius.full,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  activityText: { ...typography.mono, fontSize: 9, letterSpacing: 0.5 },

  urgentBadge: {
    backgroundColor: colors.orange + '22', borderWidth: 0.5, borderColor: colors.orange + '60',
    borderRadius: radius.full, paddingHorizontal: 7, paddingVertical: 2,
  },
  urgentText: { ...typography.monoBold, fontSize: 10, color: colors.orange },

  mcTeamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs },
  mcTeam:      { ...typography.displayMedium, fontSize: 15, color: colors.textPrimary, flex: 1 },
  mcTeamRight: { textAlign: 'right' },
  mcCenter:    { alignItems: 'center', minWidth: 72 },
  mcScore:     { ...typography.monoBold, fontSize: 22, color: colors.textPrimary },
  mcMinute:    { ...typography.mono, fontSize: 11, color: colors.red, marginTop: 1 },
  mcVs:        { ...typography.mono, fontSize: 16, color: colors.textMuted },

  mcSocialRow: { flexDirection: 'row', alignItems: 'center' },
  mcBettorsLive: { ...typography.bodyMedium, fontSize: 11, color: colors.red },
  mcBettors:     { ...typography.body, fontSize: 11, color: colors.textMuted },

  oddsRow: { flexDirection: 'row', gap: spacing.xs },

  // Tipster suggestion
  tipSuggestion: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.bgElevated, borderRadius: radius.md,
    paddingHorizontal: spacing.sm, paddingVertical: 6,
    borderWidth: 0.5, borderColor: colors.primary + '40',
  },
  tipAvatarRing: { borderWidth: 1.5, borderRadius: radius.full, padding: 1 },
  tipText:    { ...typography.body, fontSize: 12, color: colors.textSecondary, flex: 1 },
  tipTextMid: { color: colors.textMuted },
  tipOdds:    { ...typography.monoBold, color: colors.primary },
  tipTierBadge: { borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  tipTierText:  { ...typography.mono, fontSize: 10 },

  // CopyBetCard
  copyCard:   { gap: spacing.sm },
  copyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  copyAvatarRing: { borderWidth: 2, borderRadius: radius.full, padding: 2 },
  copyTipInfo: { flex: 1, gap: 4 },
  copyNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  copyName: { ...typography.bodySemiBold, fontSize: 15, color: colors.textPrimary },
  copyStatsRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  copyStatGreen: { ...typography.mono, fontSize: 11, color: colors.green },
  copyStatSep:   { ...typography.body, fontSize: 11, color: colors.textMuted },
  copyStatMuted: { ...typography.body, fontSize: 11, color: colors.textMuted },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  confidenceLabel: { ...typography.body, fontSize: 9, color: colors.textMuted, width: 60 },
  confidenceTrack: { flex: 1, height: 3, backgroundColor: colors.bgElevated, borderRadius: radius.full, overflow: 'hidden' },
  confidenceFill:  { height: '100%', backgroundColor: colors.green, borderRadius: radius.full },
  copyMatchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  copyLeague: { ...typography.mono, fontSize: 10, color: colors.textMuted, flex: 1 },
  copyTime:   { ...typography.monoBold, fontSize: 11, color: colors.textSecondary },
  copyTeams:  { ...typography.displayMedium, fontSize: 16, color: colors.textPrimary },
  copyPickRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.primary + '18', borderRadius: radius.md,
    paddingHorizontal: spacing.sm, paddingVertical: 8,
    borderWidth: 0.5, borderColor: colors.primary + '40',
  },
  copyPickEyebrow: { ...typography.mono, fontSize: 9, color: colors.textMuted, letterSpacing: 0.8 },
  copyPickSide:    { ...typography.bodySemiBold, fontSize: 15, color: colors.textPrimary },
  copyPickOdds:    { ...typography.monoBold, fontSize: 22, color: colors.primary },
  copyBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: spacing.sm + 2, alignItems: 'center', marginTop: spacing.xs,
  },
  copyBtnDone:  { backgroundColor: colors.green },
  copyBtnText:  { ...typography.bodySemiBold, fontSize: 14, color: colors.textPrimary },

  // HiddenMissionCard
  hiddenFlash: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.primary + '35', borderRadius: radius.lg, zIndex: 5,
  },
  hiddenCard:     { borderColor: colors.primary + '50', gap: spacing.sm },
  hiddenCardDone: { borderColor: colors.green, borderWidth: 1 },
  hiddenTop:  { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  hiddenEmoji: { fontSize: 30, lineHeight: 38 },
  hiddenInfo:  { flex: 1, gap: 3 },
  hiddenEyebrow: { ...typography.mono, fontSize: 10, color: colors.primary, letterSpacing: 1 },
  hiddenTitle:   { ...typography.displayMedium, fontSize: 15, color: colors.textPrimary },
  hiddenDesc:    { ...typography.body, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  hiddenXP:      { ...typography.monoBold, fontSize: 13, color: colors.gold },
  hiddenProgressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hiddenTrack: { flex: 1, height: 5, backgroundColor: colors.bgElevated, borderRadius: radius.full, overflow: 'hidden' },
  hiddenFill:  { height: '100%', borderRadius: radius.full },
  hiddenProgressLabel: { ...typography.mono, fontSize: 11, color: colors.textMuted, minWidth: 32 },
  hiddenHint:        { ...typography.body, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  hiddenRevealBadge: { ...typography.bodySemiBold, fontSize: 13, color: colors.green, textAlign: 'center' },

  // Betslip
  betslip: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: BETSLIP_HEIGHT,
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    borderTopWidth: 0.5, borderTopColor: colors.border,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.sm,
    gap: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 24,
  },
  betslipHandle: {
    width: 36, height: 4, backgroundColor: colors.border,
    borderRadius: radius.full, alignSelf: 'center', marginBottom: spacing.xs,
  },
  betslipTitle: { ...typography.displayMedium, fontSize: 15, color: colors.textSecondary, textAlign: 'center' },
  betslipPickSection: { gap: 4 },
  betslipMatch: { ...typography.body, fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  betslipPickRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', gap: spacing.sm },
  betslipSide:  { ...typography.display, fontSize: 19, color: colors.textPrimary },
  betslipOdds:  { ...typography.monoBold, fontSize: 22, color: colors.primary },
  betslipXPSection: { gap: 5 },
  betslipXPHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  betslipXPLabel:  { ...typography.body, fontSize: 11, color: colors.textMuted },
  betslipXPGain:   { ...typography.monoBold, fontSize: 11, color: colors.green },
  betslipXPTrack: {
    flexDirection: 'row', height: 5, backgroundColor: colors.bgCard,
    borderRadius: radius.full, overflow: 'hidden',
  },
  betslipXPNow:     { height: '100%', backgroundColor: colors.primary },
  betslipXPGainBar: { height: '100%', backgroundColor: colors.green },
  betslipMission: { ...typography.body, fontSize: 11, color: colors.orange, textAlign: 'center' },
  betslipConfirm: {
    backgroundColor: colors.green, borderRadius: radius.lg,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  betslipConfirmText: { ...typography.bodySemiBold, fontSize: 16, color: colors.textPrimary },
  betslipCancel:      { alignItems: 'center', paddingVertical: 4 },
  betslipCancelText:  { ...typography.body, fontSize: 13, color: colors.textMuted },

  // RewardOverlay
  rewardBackdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  rewardBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000' },
  rewardCard: {
    width: '82%', backgroundColor: colors.bgElevated,
    borderRadius: radius.xl, padding: spacing.lg, gap: spacing.md,
    borderWidth: 1, borderColor: colors.primary + '40',
    alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 30,
  },
  rewardXP: { ...typography.monoBold, fontSize: 42, color: colors.green },
  rewardLevelUpBadge: {
    backgroundColor: colors.gold + '22', borderWidth: 1, borderColor: colors.gold + '60',
    borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  rewardLevelUpText: { ...typography.display, fontSize: 16, color: colors.gold },
  rewardBarSection:  { width: '100%', gap: 6 },
  rewardBarHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  rewardBarLevel: { ...typography.body, fontSize: 12, color: colors.textSecondary },
  rewardBarXP:    { ...typography.mono, fontSize: 11, color: colors.textMuted },
  rewardBarTrack: {
    height: 8, backgroundColor: colors.bgCard, borderRadius: radius.full, overflow: 'hidden',
  },
  rewardBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
  rewardStatsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    width: '100%', paddingVertical: spacing.xs,
    borderTopWidth: 0.5, borderTopColor: colors.border,
    borderBottomWidth: 0.5, borderBottomColor: colors.border,
  },
  rewardStat: { alignItems: 'center', gap: 2 },
  rewardStatValue: { ...typography.monoBold, fontSize: 20, color: colors.textPrimary },
  rewardStatLabel: { ...typography.body, fontSize: 10, color: colors.textMuted },
  rewardStatDivider: { width: 0.5, height: 32, backgroundColor: colors.border },
  rewardMissionRow: {
    backgroundColor: colors.orange + '18', borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderWidth: 0.5, borderColor: colors.orange + '40',
  },
  rewardMissionText: { ...typography.body, fontSize: 12, color: colors.orange, textAlign: 'center' },
  rewardDismissHint: { ...typography.body, fontSize: 10, color: colors.textMuted },

  // Empty
  emptyCard: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { ...typography.body, fontSize: 14, color: colors.textMuted, textAlign: 'center' },

  // Active Power-Ups row
  activePowerUpsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  activePowerUpPill: {
    backgroundColor: colors.primary + '22',
    borderWidth: 0.5,
    borderColor: colors.primary + '50',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  activePowerUpText: {
    ...typography.bodySemiBold,
    fontSize: 11,
    color: colors.primary,
  },

  // Cooldown mode banner
  cooldownModeBanner: {
    backgroundColor: colors.green + '15',
    borderWidth: 0.5,
    borderColor: colors.green + '40',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cooldownModeText: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: colors.green,
  },

  // Cooldown suggestion card
  cooldownCard: {
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.orange + '50',
    borderWidth: 1,
  },
  cooldownEmoji: {
    fontSize: 32,
    lineHeight: 40,
  },
  cooldownTitle: {
    ...typography.displayMedium,
    fontSize: 17,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cooldownDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  cooldownActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cooldownBtn: {
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cooldownBtnText: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  cooldownBtnSkip: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  cooldownBtnSkipText: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },

  upsellCard: { alignItems: 'center' as const, marginTop: spacing.md, borderColor: colors.gold + '40', borderWidth: 1 },
  upsellBadge: { ...typography.monoBold, fontSize: 11, color: colors.gold, backgroundColor: colors.gold + '18', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, marginBottom: spacing.sm, overflow: 'hidden' as const },
  upsellTitle: { ...typography.bodySemiBold, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.xs },
  upsellDesc: { ...typography.body, fontSize: 12, color: colors.textSecondary, textAlign: 'center' as const, marginBottom: spacing.sm, paddingHorizontal: spacing.md },
  upsellBtn: { backgroundColor: colors.gold + '20', borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderWidth: 0.5, borderColor: colors.gold + '50' },
  upsellBtnText: { ...typography.bodySemiBold, fontSize: 13, color: colors.gold },
});
