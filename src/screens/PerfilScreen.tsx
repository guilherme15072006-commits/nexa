import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Avatar, Card, SectionHeader, XPBar } from '../components/ui';
import { GlowPulse, PulsingDot, SmoothEntry, TapScale } from '../components/LiveComponents';
import { colors, radius, spacing, typography } from '../theme';
import { hapticLight } from '../services/haptics';
import {
  Badge,
  BadgeProgress,
  BadgeTier,
  SocialStats,
  Transaction,
  UserDNA,
  UserState,
  useNexaStore,
} from '../store/nexaStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_COLOR: Record<BadgeTier, string> = {
  common: colors.textSecondary,
  rare: '#4DA6FF',
  epic: '#B44DFF',
  legendary: colors.gold,
};

const TIER_LABEL: Record<BadgeTier, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
};

const RISK_CONFIG: Record<UserDNA['riskProfile'], { emoji: string; label: string; color: string; desc: string }> = {
  conservative: { emoji: '🛡️', label: 'Conservador', color: '#4DA6FF', desc: 'Prefere apostas seguras com odds baixas. Gestão de banca exemplar.' },
  moderate:     { emoji: '⚖️', label: 'Analítico',     color: colors.primary, desc: 'Equilibra risco e retorno. Analisa dados antes de apostar.' },
  aggressive:   { emoji: '🔥', label: 'Agressivo',    color: colors.red, desc: 'Busca odds altas e alto retorno. Apetite por risco elevado.' },
};

const STATE_CONFIG: Record<UserState, { emoji: string; label: string; color: string; message: string; cta: string }> = {
  motivated:   { emoji: '🚀', label: 'Motivado',    color: colors.green,   message: 'Você está em boa fase! Continue assim.',                      cta: 'Ver picks do dia' },
  frustrated:  { emoji: '😤', label: 'Frustrado',   color: colors.red,     message: 'Fase ruim? Respire fundo. Revise sua estratégia.',             cta: 'Dicas de recuperação' },
  impulsive:   { emoji: '⚡', label: 'Impulsivo',   color: colors.orange,  message: 'Cuidado com apostas por impulso. Siga seu método.',            cta: 'Ver análises' },
  disengaged:  { emoji: '😴', label: 'Desconectado', color: colors.textMuted, message: 'Sentimos sua falta! Volte ao jogo com missões fáceis.', cta: 'Missões do dia' },
};

const TX_ICON: Record<Transaction['type'], string> = {
  bet_win: '✅',
  bet_loss: '❌',
  deposit: '💳',
  withdrawal: '💸',
  bonus: '🎁',
  coins_earned: '🪙',
};

// ─── GlowBadge ───────────────────────────────────────────────────────────────

function GlowBadge({ badge }: { badge: Badge }) {
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isRare = badge.tier === 'epic' || badge.tier === 'legendary';

  useEffect(() => {
    if (!isRare) return;
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ]),
    );
    glow.start();
    return () => glow.stop();
  }, [isRare, glowAnim]);

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim]);

  const tierColor = TIER_COLOR[badge.tier];

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
      <Animated.View style={[styles.badgeItem, { transform: [{ scale: scaleAnim }] }]}>
        {isRare && (
          <Animated.View
            style={[
              styles.badgeGlow,
              { backgroundColor: tierColor + '30', opacity: glowAnim },
            ]}
          />
        )}
        <View style={[styles.badgeIconWrap, { borderColor: tierColor + '60' }]}>
          <Text style={styles.badgeIcon}>{badge.icon}</Text>
        </View>
        <Text style={styles.badgeTitle} numberOfLines={1}>{badge.title}</Text>
        <Text style={[styles.badgeTier, { color: tierColor }]}>{TIER_LABEL[badge.tier]}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── DNACard ──────────────────────────────────────────────────────────────────

function DNACard({ dna }: { dna: UserDNA }) {
  const config = RISK_CONFIG[dna.riskProfile];
  const barAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(barAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
    ]).start();
  }, [barAnim, fadeAnim]);

  // Risk meter position: conservative=20%, moderate=50%, aggressive=85%
  const meterPct = dna.riskProfile === 'conservative' ? 20 : dna.riskProfile === 'moderate' ? 50 : 85;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Card style={styles.dnaCard}>
        <View style={styles.dnaHeader}>
          <Text style={styles.dnaEmoji}>{config.emoji}</Text>
          <View style={styles.dnaHeaderText}>
            <Text style={[styles.dnaStyle, { color: config.color }]}>{dna.style}</Text>
            <Text style={styles.dnaLabel}>{config.label}</Text>
          </View>
        </View>

        <Text style={styles.dnaDesc}>{config.desc}</Text>

        {/* Risk meter */}
        <View style={styles.riskMeterContainer}>
          <Text style={styles.riskMeterLabel}>Perfil de risco</Text>
          <View style={styles.riskMeterTrack}>
            <View style={[styles.riskMeterGradient, { backgroundColor: '#4DA6FF' }]} />
            <View style={[styles.riskMeterGradient, { backgroundColor: colors.primary }]} />
            <View style={[styles.riskMeterGradient, { backgroundColor: colors.red }]} />
            <Animated.View
              style={[
                styles.riskMeterIndicator,
                {
                  left: barAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', `${meterPct}%`],
                  }),
                  backgroundColor: config.color,
                },
              ]}
            />
          </View>
          <View style={styles.riskMeterLabels}>
            <Text style={styles.riskMeterEndLabel}>Conservador</Text>
            <Text style={styles.riskMeterEndLabel}>Agressivo</Text>
          </View>
        </View>

        {/* Strengths */}
        {dna.strengths.length > 0 && (
          <View style={styles.strengthsContainer}>
            <Text style={styles.strengthsTitle}>Pontos fortes</Text>
            <View style={styles.strengthsRow}>
              {dna.strengths.map((s) => (
                <View key={s} style={styles.strengthPill}>
                  <Text style={styles.strengthText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Card>
    </Animated.View>
  );
}

// ─── ROIChart (simplified bar chart) ──────────────────────────────────────────

function ROIChart({ data }: { data: number[] }) {
  const barAnims = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      40,
      barAnims.map((anim) =>
        Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: false }),
      ),
    ).start();
  }, [barAnims]);

  const maxVal = Math.max(...data.map(Math.abs), 1);
  const latest = data[data.length - 1];
  const prev = data[data.length - 2] ?? 0;
  const trend = latest >= prev;

  return (
    <Card style={styles.roiCard}>
      <View style={styles.roiHeader}>
        <View>
          <Text style={styles.roiTitle}>Evolução ROI</Text>
          <Text style={styles.roiSubtitle}>Últimos 14 dias</Text>
        </View>
        <View style={styles.roiCurrentWrap}>
          <Text style={[styles.roiCurrent, { color: latest >= 0 ? colors.green : colors.red }]}>
            {latest >= 0 ? '+' : ''}{latest}%
          </Text>
          <Text style={[styles.roiTrend, { color: trend ? colors.green : colors.red }]}>
            {trend ? '▲' : '▼'} {trend ? 'subindo' : 'caindo'}
          </Text>
        </View>
      </View>

      <View style={styles.roiBars}>
        {data.map((val, i) => {
          const pct = Math.abs(val) / maxVal;
          const positive = val >= 0;
          return (
            <View key={i} style={styles.roiBarCol}>
              <Animated.View
                style={[
                  styles.roiBar,
                  {
                    backgroundColor: positive ? colors.green : colors.red,
                    height: barAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, pct * 60],
                    }),
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.roiBaseline} />
    </Card>
  );
}

// ─── SocialStatsCard ──────────────────────────────────────────────────────────

function SocialStatsCard({ stats }: { stats: SocialStats }) {
  const pickRate = stats.totalPicks > 0 ? Math.round((stats.greenPicks / stats.totalPicks) * 100) : 0;

  return (
    <Card style={styles.socialCard}>
      <View style={styles.socialRow}>
        <View style={styles.socialItem}>
          <Text style={styles.socialValue}>{stats.followers}</Text>
          <Text style={styles.socialLabel}>Seguidores</Text>
        </View>
        <View style={styles.socialDivider} />
        <View style={styles.socialItem}>
          <Text style={styles.socialValue}>{stats.following}</Text>
          <Text style={styles.socialLabel}>Seguindo</Text>
        </View>
        <View style={styles.socialDivider} />
        <View style={styles.socialItem}>
          <Text style={styles.socialValue}>{stats.copiesReceived}</Text>
          <Text style={styles.socialLabel}>Cópias</Text>
        </View>
        <View style={styles.socialDivider} />
        <View style={styles.socialItem}>
          <Text style={[styles.socialValue, { color: colors.green }]}>{pickRate}%</Text>
          <Text style={styles.socialLabel}>Acerto</Text>
        </View>
      </View>
    </Card>
  );
}

// ─── BadgeProgressCard (near-win) ─────────────────────────────────────────────

function BadgeProgressCard({ bp }: { bp: BadgeProgress }) {
  const tierColor = TIER_COLOR[bp.tier];
  const pct = bp.target > 0 ? bp.progress / bp.target : 0;
  const remaining = bp.target - bp.progress;
  const isAlmostThere = pct >= 0.6 && !isComplete(bp);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, { toValue: pct, duration: 700, useNativeDriver: false }).start();
  }, [fillAnim, pct]);

  useEffect(() => {
    if (!isAlmostThere) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [isAlmostThere, pulseAnim]);

  return (
    <Animated.View style={[styles.bpCard, isAlmostThere ? styles.bpCardNearWin : null, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.bpLeft}>
        <Text style={styles.bpIcon}>{bp.icon}</Text>
      </View>
      <View style={styles.bpInfo}>
        <View style={styles.bpNameRow}>
          <Text style={styles.bpTitle}>{bp.title}</Text>
          <Text style={[styles.bpTier, { color: tierColor }]}>{TIER_LABEL[bp.tier]}</Text>
        </View>
        <Text style={styles.bpDesc}>{bp.description}</Text>
        <View style={styles.bpBarTrack}>
          <Animated.View
            style={[
              styles.bpBarFill,
              {
                backgroundColor: tierColor,
                width: fillAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <View style={styles.bpProgressRow}>
          <Text style={styles.bpProgressText}>{bp.progress}/{bp.target}</Text>
          {isAlmostThere && (
            <Text style={[styles.bpNearWinText, { color: tierColor }]}>
              Quase lá! Falta {remaining}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

function isComplete(bp: BadgeProgress): boolean {
  return bp.progress >= bp.target;
}

// ─── WalletCard ───────────────────────────────────────────────────────────────

function WalletCard({
  balance,
  coins,
  transactions,
}: {
  balance: number;
  coins: number;
  transactions: Transaction[];
}) {
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;

  const toggle = useCallback(() => {
    Animated.timing(heightAnim, {
      toValue: expanded ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setExpanded((e) => !e);
  }, [expanded, heightAnim]);

  const recent = transactions.slice(0, 6);

  return (
    <Card style={styles.walletCard}>
      <View style={styles.walletHeader}>
        <View style={styles.walletBalances}>
          <View style={styles.walletItem}>
            <Text style={styles.walletLabel}>Saldo</Text>
            <Text style={styles.walletValue}>R$ {balance.toFixed(2)}</Text>
          </View>
          <View style={styles.walletDivider} />
          <View style={styles.walletItem}>
            <Text style={styles.walletLabel}>Moedas NEXA</Text>
            <Text style={[styles.walletValue, { color: colors.gold }]}>{coins} 🪙</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.walletToggle} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.walletToggleText}>
          {expanded ? 'Esconder transações' : 'Ver transações recentes'}
        </Text>
        <Text style={styles.walletToggleArrow}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.walletTxList,
          {
            maxHeight: heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 300],
            }),
            opacity: heightAnim,
          },
        ]}
      >
        {recent.map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <Text style={styles.txIcon}>{TX_ICON[tx.type]}</Text>
            <View style={styles.txInfo}>
              <Text style={styles.txLabel}>{tx.label}</Text>
              <Text style={styles.txDate}>{tx.createdAt}</Text>
            </View>
            <Text
              style={[
                styles.txAmount,
                { color: tx.amount >= 0 ? colors.green : colors.red },
              ]}
            >
              {tx.amount >= 0 ? '+' : ''}
              {tx.currency === 'BRL' ? `R$ ${tx.amount.toFixed(2)}` : `${tx.amount} 🪙`}
            </Text>
          </View>
        ))}
      </Animated.View>
    </Card>
  );
}

// ─── StateCard (adaptive UI) ──────────────────────────────────────────────────

function StateCard({ state }: { state: UserState }) {
  const config = STATE_CONFIG[state];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'frustrated' || state === 'impulsive') {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    }
  }, [state, pulseAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <Card style={[styles.stateCard, { borderColor: config.color + '40' }]}>
        <View style={styles.stateHeader}>
          <Text style={styles.stateEmoji}>{config.emoji}</Text>
          <View>
            <Text style={[styles.stateLabel, { color: config.color }]}>{config.label}</Text>
            <Text style={styles.stateMessage}>{config.message}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.stateCta, { backgroundColor: config.color + '20', borderColor: config.color + '50' }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.stateCtaText, { color: config.color }]}>{config.cta}</Text>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );
}

// ─── ProgressionPath ──────────────────────────────────────────────────────────

function ProgressionPath({ level, xp, xpToNext }: { level: number; xp: number; xpToNext: number }) {
  const levels = [
    { lv: 1, title: 'Novato',     emoji: '🌱', unlocks: 'Feed + Apostas' },
    { lv: 2, title: 'Aprendiz',   emoji: '📚', unlocks: 'Copy Bet' },
    { lv: 3, title: 'Apostador',  emoji: '🎲', unlocks: 'Ranking Semanal' },
    { lv: 5, title: 'Veterano',   emoji: '⚔️', unlocks: 'Criar Clã' },
    { lv: 8, title: 'Mestre',     emoji: '🏅', unlocks: 'Desafios PvP' },
    { lv: 12, title: 'Lenda',     emoji: '👑', unlocks: 'Badge Lendário' },
  ];

  return (
    <View style={styles.progContainer}>
      {levels.map((lv, i) => {
        const unlocked = level >= lv.lv;
        const isCurrent = level >= lv.lv && (i === levels.length - 1 || level < levels[i + 1].lv);
        const isNext = !unlocked && (i === 0 || level >= levels[i - 1].lv);

        return (
          <View key={lv.lv} style={styles.progRow}>
            {/* Connector line */}
            {i > 0 && (
              <View style={[styles.progLine, unlocked ? styles.progLineActive : null]} />
            )}
            <View style={styles.progNodeRow}>
              <View
                style={[
                  styles.progNode,
                  unlocked ? styles.progNodeUnlocked : null,
                  isCurrent ? styles.progNodeCurrent : null,
                ]}
              >
                <Text style={styles.progEmoji}>{lv.emoji}</Text>
              </View>
              <View style={styles.progTextCol}>
                <View style={styles.progNameRow}>
                  <Text style={[styles.progTitle, unlocked ? styles.progTitleUnlocked : null]}>
                    Nível {lv.lv} — {lv.title}
                  </Text>
                  {isCurrent && <Text style={styles.progCurrentBadge}>VOCÊ</Text>}
                  {isNext && <Text style={styles.progNextBadge}>PRÓXIMO</Text>}
                </View>
                <Text style={styles.progUnlocks}>Desbloqueia: {lv.unlocks}</Text>
                {isNext && (
                  <Text style={styles.progXPNeeded}>
                    Faltam {xpToNext - xp} XP para o próximo nível
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── PerfilScreen ─────────────────────────────────────────────────────────────

export default function PerfilScreen() {
  const navigation = useNavigation<any>();
  const user = useNexaStore((s) => s.user);
  const missions = useNexaStore((s) => s.missions);
  const socialStats = useNexaStore((s) => s.socialStats);
  const transactions = useNexaStore((s) => s.transactions);
  const badgeProgress = useNexaStore((s) => s.badgeProgress);
  const roiHistory = useNexaStore((s) => s.roiHistory);
  const creatorStats = useNexaStore((s) => s.creatorStats);
  const streakAtRisk = useNexaStore((s) => s.streakAtRisk);
  const daysSinceLastVisit = useNexaStore((s) => s.daysSinceLastVisit);
  const antiCollapse = useNexaStore((s) => s.antiCollapse);
  const currentSubscription = useNexaStore((s) => s.currentSubscription);

  // Compute influence score
  const influenceScore = useMemo(() => {
    return Math.round(socialStats.copiesReceived * (user.winRate || 0.5) * 10);
  }, [socialStats.copiesReceived, user.winRate]);

  // Entrance animation
  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [headerFade]);

  // Sort badge progress: near-win first
  const sortedBP = useMemo(() => {
    return [...badgeProgress].sort((a, b) => {
      const pctA = a.progress / a.target;
      const pctB = b.progress / b.target;
      // Near-win (>=60%) first, then by progress %
      const nearA = pctA >= 0.6 ? 1 : 0;
      const nearB = pctB >= 0.6 ? 1 : 0;
      if (nearB !== nearA) return nearB - nearA;
      return pctB - pctA;
    });
  }, [badgeProgress]);

  // Completed missions count
  const completedMissions = useMemo(
    () => missions.filter((m) => m.completed).length,
    [missions],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Streak Risk Banner ───────────────────────────────────────── */}
        {streakAtRisk && (
          <Card style={styles.streakRiskCard}>
            <Text style={styles.streakRiskIcon}>⚠️</Text>
            <View>
              <Text style={styles.streakRiskTitle}>Sua sequência está em risco!</Text>
              <Text style={styles.streakRiskDesc}>Faça check-in hoje para manter seu streak de {user.streak} dias</Text>
            </View>
          </Card>
        )}

        {/* ── Reactivation Banner ─────────────────────────────────────── */}
        {daysSinceLastVisit > 1 && (
          <Card style={styles.reactivationCard}>
            <Text style={styles.reactivationEmoji}>👋</Text>
            <Text style={styles.reactivationTitle}>Bem-vindo de volta!</Text>
            <Text style={styles.reactivationDesc}>
              Você ficou {daysSinceLastVisit} dias fora. Missão especial: +300 XP de bônus!
            </Text>
          </Card>
        )}

        {/* ── Profile Header ──────────────────────────────────────────── */}
        <Animated.View style={[styles.profileHeader, { opacity: headerFade }]}>
          <View style={styles.avatarWrap}>
            <Avatar username={user.username} size={72} />
            <View style={[styles.levelBadge]}>
              <Text style={styles.levelBadgeText}>{user.level}</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={[styles.dnaStyleText, { color: RISK_CONFIG[user.dna.riskProfile].color }]}>
              {user.dna.style}
            </Text>
            <View style={styles.profileMeta}>
              <Text style={styles.metaText}>Rank #{user.rank}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>🔥 {user.streak}d streak</Text>
            </View>
          </View>
        </Animated.View>

        {/* XP Bar */}
        <XPBar xp={user.xp} xpToNext={user.xpToNext} level={user.level} style={styles.xpBar} />

        {/* ── User State Card ─────────────────────────────────────────── */}
        <SmoothEntry delay={100}>
          <StateCard state={user.state} />
        </SmoothEntry>

        {/* ── Social Stats ────────────────────────────────────────────── */}
        <SmoothEntry delay={200}>
          <SectionHeader title="Social" style={styles.section} />
          <SocialStatsCard stats={socialStats} />
        </SmoothEntry>

        {/* ── Influence Rank ─────────────────────────────────────────── */}
        <SmoothEntry delay={250}>
          <Card style={styles.influenceCard}>
            <View style={styles.influenceRow}>
              <View>
                <Text style={styles.influenceLabel}>Influence Score</Text>
                <Text style={styles.influenceValue}>{influenceScore}</Text>
              </View>
              <View style={styles.influenceBadge}>
                <Text style={styles.influenceBadgeText}>
                  {influenceScore >= 80 ? '🌟 Alta' : influenceScore >= 40 ? '📊 Média' : '🌱 Crescendo'}
                </Text>
              </View>
            </View>
            <Text style={styles.influenceDesc}>
              {socialStats.copiesReceived} pessoas copiaram suas apostas esta semana
            </Text>
          </Card>
        </SmoothEntry>

        {/* ── Creator Economy ────────────────────────────────────────── */}
        <SmoothEntry delay={280}>
          <SectionHeader title="Seus Ganhos" style={styles.section} />
          <Card style={styles.creatorCard}>
            <View style={styles.creatorRow}>
              <View style={styles.creatorStat}>
                <Text style={styles.creatorValue}>R$ {creatorStats.weeklyEarnings.toFixed(2)}</Text>
                <Text style={styles.creatorLabel}>Esta semana</Text>
              </View>
              <View style={styles.creatorDivider} />
              <View style={styles.creatorStat}>
                <Text style={styles.creatorValue}>R$ {creatorStats.totalEarnings.toFixed(2)}</Text>
                <Text style={styles.creatorLabel}>Total</Text>
              </View>
              <View style={styles.creatorDivider} />
              <View style={styles.creatorStat}>
                <Text style={styles.creatorValue}>{creatorStats.totalCopies}</Text>
                <Text style={styles.creatorLabel}>Cópias</Text>
              </View>
            </View>
            {creatorStats.isTopTipster && (
              <View style={styles.topTipsterBadge}>
                <Text style={styles.topTipsterText}>🏆 Top Tipster da Semana</Text>
              </View>
            )}
          </Card>
        </SmoothEntry>

        {/* ── Performance Stats ───────────────────────────────────────── */}
        <SmoothEntry delay={300}>
          <SectionHeader title="Performance" style={styles.section} />
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.green }]}>
                  {Math.round(user.winRate * 100)}%
                </Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: user.roi >= 0 ? colors.green : colors.red }]}>
                  {user.roi >= 0 ? '+' : ''}{Math.round(user.roi * 100)}%
                </Text>
                <Text style={styles.statLabel}>ROI</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.gold }]}>{user.streak}d</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completedMissions}</Text>
                <Text style={styles.statLabel}>Missões</Text>
              </View>
            </View>
          </Card>
          <TapScale onPress={() => { hapticLight(); navigation.navigate('Dashboard' as never); }} scale={0.97}>
            <View style={styles.navButton}>
              <Text style={styles.navButtonText}>📊 Dashboard Pro →</Text>
            </View>
          </TapScale>
          <TapScale onPress={() => { hapticLight(); navigation.navigate('CreatorStudio' as never); }} scale={0.97}>
            <View style={styles.navButton}>
              <Text style={styles.navButtonText}>🎬 Creator Studio →</Text>
            </View>
          </TapScale>
          <TapScale onPress={() => { hapticLight(); navigation.navigate('BetHistory' as never); }} scale={0.97}>
            <View style={styles.navButton}>
              <Text style={styles.navButtonText}>📋 Histórico de Apostas →</Text>
            </View>
          </TapScale>
          <TapScale onPress={() => { hapticLight(); navigation.navigate('Subscription' as never); }} scale={0.97}>
            <View style={styles.navButton}>
              <Text style={styles.navButtonText}>⭐ NEXA Pro →</Text>
            </View>
          </TapScale>
          <TapScale onPress={() => { hapticLight(); navigation.navigate('Marketplace' as never); }} scale={0.97}>
            <View style={styles.navButton}>
              <Text style={styles.navButtonText}>🛒 Marketplace →</Text>
            </View>
          </TapScale>
          <TapScale onPress={() => { hapticLight(); navigation.navigate('NexaPlay' as never); }} scale={0.97}>
            <View style={styles.navButton}>
              <Text style={styles.navButtonText}>🎮 NEXA Play →</Text>
            </View>
          </TapScale>
          <TapScale onPress={() => { hapticLight(); navigation.navigate('AudioRooms' as never); }} scale={0.97}>
            <View style={styles.navButton}>
              <Text style={styles.navButtonText}>🎙️ Audio Rooms →</Text>
            </View>
          </TapScale>
          <TapScale onPress={() => { hapticLight(); navigation.navigate('Referral' as never); }} scale={0.97}>
            <View style={styles.navButton}>
              <Text style={styles.navButtonText}>👥 Convide Amigos →</Text>
            </View>
          </TapScale>
          <TapScale onPress={() => { hapticLight(); navigation.navigate('Settings' as never); }} scale={0.97}>
            <View style={styles.navButton}>
              <Text style={styles.navButtonText}>⚙️ Configurações →</Text>
            </View>
          </TapScale>
        </SmoothEntry>

        {/* ── ROI Chart ───────────────────────────────────────────────── */}
        <SmoothEntry delay={400}>
          <ROIChart data={roiHistory} />
        </SmoothEntry>

        {/* ── DNA do Apostador ────────────────────────────────────────── */}
        <SectionHeader title="DNA do Apostador" style={styles.section} />
        <DNACard dna={user.dna} />

        {/* ── Badges (unlocked) ───────────────────────────────────────── */}
        <SectionHeader title="Conquistas" action={`${user.badges.length} desbloqueadas`} style={styles.section} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgesScroll}
        >
          {user.badges.map((b) => (
            <GlowBadge key={b.id} badge={b} />
          ))}
        </ScrollView>

        {/* ── Badge Progress (next unlocks) ───────────────────────────── */}
        <SectionHeader title="Próximas conquistas" style={styles.section} />
        {sortedBP.map((bp) => (
          <BadgeProgressCard key={bp.id} bp={bp} />
        ))}

        {/* ── Progression Path ────────────────────────────────────────── */}
        <SectionHeader title="Caminho de evolução" style={styles.section} />
        <Card style={styles.progCard}>
          <ProgressionPath level={user.level} xp={user.xp} xpToNext={user.xpToNext} />
        </Card>

        {/* ── Wallet ──────────────────────────────────────────────────── */}
        <SectionHeader title="Carteira" style={styles.section} />
        <WalletCard balance={user.balance} coins={user.coins} transactions={transactions} />
        <TapScale onPress={() => { hapticLight(); navigation.navigate('Wallet'); }} scale={0.97}>
          <View style={styles.navButton}>
            <Text style={styles.navButtonText}>Ver carteira →</Text>
          </View>
        </TapScale>

        {currentSubscription === 'free' && (
          <View style={styles.proPromoBanner}>
            <Text style={styles.proPromoText}>⭐ Assine o NEXA Pro e ganhe cashback em todas as apostas</Text>
          </View>
        )}

        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg } as ViewStyle,
  scroll: { flex: 1 } as ViewStyle,
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl } as ViewStyle,
  section: { marginTop: spacing.lg, marginBottom: spacing.sm } as ViewStyle,

  // ── Profile Header ───────────────────────────────────────────────────────
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  } as ViewStyle,
  avatarWrap: { position: 'relative' } as ViewStyle,
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  } as ViewStyle,
  levelBadgeText: {
    ...typography.monoBold,
    fontSize: 11,
    color: colors.textPrimary,
  },
  profileInfo: { flex: 1, gap: 3 } as ViewStyle,
  username: {
    ...typography.display,
    fontSize: 22,
    color: colors.textPrimary,
  },
  dnaStyleText: {
    ...typography.bodyMedium,
    fontSize: 13,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as ViewStyle,
  metaText: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  },
  metaDot: {
    ...typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  xpBar: { marginBottom: spacing.md } as ViewStyle,

  // ── State Card ───────────────────────────────────────────────────────────
  stateCard: {
    borderWidth: 1,
    marginBottom: spacing.sm,
  } as ViewStyle,
  stateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  } as ViewStyle,
  stateEmoji: { fontSize: 28 },
  stateLabel: {
    ...typography.bodySemiBold,
    fontSize: 14,
  },
  stateMessage: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stateCta: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 0.5,
  } as ViewStyle,
  stateCtaText: {
    ...typography.bodyMedium,
    fontSize: 13,
  },

  // ── Social Stats ─────────────────────────────────────────────────────────
  socialCard: {} as ViewStyle,
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  } as ViewStyle,
  socialItem: { alignItems: 'center', gap: 2 } as ViewStyle,
  socialValue: {
    ...typography.monoBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  socialLabel: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  socialDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: colors.border,
  } as ViewStyle,

  // ── Stats Card ───────────────────────────────────────────────────────────
  statsCard: { marginBottom: spacing.sm } as ViewStyle,
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  } as ViewStyle,
  statItem: { alignItems: 'center', gap: 2 } as ViewStyle,
  statValue: {
    ...typography.monoBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  statDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: colors.border,
  } as ViewStyle,

  // ── ROI Chart ────────────────────────────────────────────────────────────
  roiCard: { marginTop: spacing.sm } as ViewStyle,
  roiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  } as ViewStyle,
  roiTitle: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  roiSubtitle: {
    ...typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  roiCurrentWrap: { alignItems: 'flex-end' } as ViewStyle,
  roiCurrent: {
    ...typography.monoBold,
    fontSize: 20,
  },
  roiTrend: {
    ...typography.mono,
    fontSize: 10,
  },
  roiBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 64,
    gap: 3,
  } as ViewStyle,
  roiBarCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  } as ViewStyle,
  roiBar: {
    width: '100%',
    borderRadius: 2,
    minHeight: 2,
  } as ViewStyle,
  roiBaseline: {
    height: 0.5,
    backgroundColor: colors.border,
    marginTop: 2,
  } as ViewStyle,

  // ── DNA Card ─────────────────────────────────────────────────────────────
  dnaCard: {} as ViewStyle,
  dnaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  } as ViewStyle,
  dnaEmoji: { fontSize: 36 },
  dnaHeaderText: { gap: 2 } as ViewStyle,
  dnaStyle: {
    ...typography.display,
    fontSize: 16,
  },
  dnaLabel: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  },
  dnaDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  riskMeterContainer: { marginBottom: spacing.md } as ViewStyle,
  riskMeterLabel: {
    ...typography.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  riskMeterTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
    position: 'relative',
  } as ViewStyle,
  riskMeterGradient: {
    flex: 1,
    opacity: 0.4,
  } as ViewStyle,
  riskMeterIndicator: {
    position: 'absolute',
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.bg,
    marginLeft: -6,
  } as ViewStyle,
  riskMeterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  } as ViewStyle,
  riskMeterEndLabel: {
    ...typography.body,
    fontSize: 9,
    color: colors.textMuted,
  },
  strengthsContainer: { marginTop: spacing.xs } as ViewStyle,
  strengthsTitle: {
    ...typography.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  strengthsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  } as ViewStyle,
  strengthPill: {
    backgroundColor: colors.primary + '18',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: colors.primary + '40',
  } as ViewStyle,
  strengthText: {
    ...typography.bodyMedium,
    fontSize: 11,
    color: colors.primary,
  },

  // ── Badges ───────────────────────────────────────────────────────────────
  badgesScroll: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  } as ViewStyle,
  badgeItem: {
    width: 88,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  } as ViewStyle,
  badgeGlow: {
    position: 'absolute',
    top: -4,
    left: 4,
    right: 4,
    bottom: 20,
    borderRadius: radius.lg,
  } as ViewStyle,
  badgeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  } as ViewStyle,
  badgeIcon: { fontSize: 26 },
  badgeTitle: {
    ...typography.bodyMedium,
    fontSize: 10,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  badgeTier: {
    ...typography.mono,
    fontSize: 9,
  },

  // ── Badge Progress ───────────────────────────────────────────────────────
  bpCard: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
  } as ViewStyle,
  bpCardNearWin: {
    borderColor: colors.gold + '60',
    backgroundColor: colors.gold + '06',
  } as ViewStyle,
  bpLeft: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  bpIcon: { fontSize: 24 },
  bpInfo: { flex: 1 } as ViewStyle,
  bpNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  } as ViewStyle,
  bpTitle: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  bpTier: {
    ...typography.mono,
    fontSize: 9,
  },
  bpDesc: {
    ...typography.body,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  bpBarTrack: {
    height: 4,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
  } as ViewStyle,
  bpBarFill: {
    height: '100%',
    borderRadius: radius.full,
  } as ViewStyle,
  bpProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  } as ViewStyle,
  bpProgressText: {
    ...typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  bpNearWinText: {
    ...typography.monoBold,
    fontSize: 10,
  },

  // ── Progression Path ─────────────────────────────────────────────────────
  progCard: {} as ViewStyle,
  progContainer: {} as ViewStyle,
  progRow: { position: 'relative' } as ViewStyle,
  progLine: {
    position: 'absolute',
    left: 19,
    top: -12,
    width: 2,
    height: 12,
    backgroundColor: colors.border,
  } as ViewStyle,
  progLineActive: { backgroundColor: colors.primary } as ViewStyle,
  progNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  } as ViewStyle,
  progNode: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  } as ViewStyle,
  progNodeUnlocked: {
    borderColor: colors.primary + '60',
    backgroundColor: colors.primary + '15',
  } as ViewStyle,
  progNodeCurrent: {
    borderColor: colors.primary,
    borderWidth: 2,
  } as ViewStyle,
  progEmoji: { fontSize: 18 },
  progTextCol: { flex: 1 } as ViewStyle,
  progNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as ViewStyle,
  progTitle: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  progTitleUnlocked: { color: colors.textPrimary },
  progCurrentBadge: {
    ...typography.monoBold,
    fontSize: 9,
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  progNextBadge: {
    ...typography.monoBold,
    fontSize: 9,
    color: colors.gold,
    backgroundColor: colors.gold + '20',
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  progUnlocks: {
    ...typography.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  progXPNeeded: {
    ...typography.mono,
    fontSize: 10,
    color: colors.gold,
    marginTop: 2,
  },

  // ── Wallet ───────────────────────────────────────────────────────────────
  walletCard: {} as ViewStyle,
  walletHeader: { marginBottom: spacing.sm } as ViewStyle,
  walletBalances: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  } as ViewStyle,
  walletItem: { alignItems: 'center', gap: 4 } as ViewStyle,
  walletLabel: {
    ...typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  walletValue: {
    ...typography.monoBold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  walletDivider: {
    width: 0.5,
    height: 32,
    backgroundColor: colors.border,
  } as ViewStyle,
  walletToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  } as ViewStyle,
  walletToggleText: {
    ...typography.bodyMedium,
    fontSize: 12,
    color: colors.primary,
  },
  walletToggleArrow: {
    fontSize: 10,
    color: colors.primary,
  },
  walletTxList: { overflow: 'hidden' } as ViewStyle,
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  } as ViewStyle,
  txIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  txInfo: { flex: 1 } as ViewStyle,
  txLabel: {
    ...typography.bodyMedium,
    fontSize: 12,
    color: colors.textPrimary,
  },
  txDate: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  txAmount: {
    ...typography.monoBold,
    fontSize: 13,
  },

  // ── Streak Risk Banner ──────────────────────────────────────────────────
  streakRiskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.orange + '60',
    backgroundColor: colors.orange + '10',
    marginTop: spacing.md,
  } as ViewStyle,
  streakRiskIcon: { fontSize: 28 },
  streakRiskTitle: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.orange,
  },
  streakRiskDesc: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ── Reactivation Banner ─────────────────────────────────────────────────
  reactivationCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
    backgroundColor: colors.primary + '08',
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  } as ViewStyle,
  reactivationEmoji: { fontSize: 32, marginBottom: spacing.xs },
  reactivationTitle: {
    ...typography.display,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  reactivationDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ── Influence Card ──────────────────────────────────────────────────────
  influenceCard: {
    marginTop: spacing.sm,
  } as ViewStyle,
  influenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  } as ViewStyle,
  influenceLabel: {
    ...typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  influenceValue: {
    ...typography.display,
    fontSize: 28,
    color: colors.primary,
  },
  influenceBadge: {
    backgroundColor: colors.primary + '18',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 0.5,
    borderColor: colors.primary + '40',
  } as ViewStyle,
  influenceBadgeText: {
    ...typography.bodyMedium,
    fontSize: 12,
    color: colors.primary,
  },
  influenceDesc: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // ── Creator Economy Card ────────────────────────────────────────────────
  creatorCard: {} as ViewStyle,
  creatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  } as ViewStyle,
  creatorStat: { alignItems: 'center', gap: 2 } as ViewStyle,
  creatorValue: {
    ...typography.monoBold,
    fontSize: 16,
    color: colors.green,
  },
  creatorLabel: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  creatorDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: colors.border,
  } as ViewStyle,
  topTipsterBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.gold + '18',
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.gold + '40',
  } as ViewStyle,
  topTipsterText: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: colors.gold,
  },

  // ── Navigation Buttons ──────────────────────────────────────────────────
  navButton: {
    backgroundColor: colors.primary + '15',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.primary + '40',
  } as ViewStyle,
  navButtonText: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.primary,
  },

  proPromoBanner: { backgroundColor: colors.gold + '10', borderRadius: radius.md, padding: spacing.sm, marginTop: spacing.xs, borderWidth: 0.5, borderColor: colors.gold + '30' } as ViewStyle,
  proPromoText: { ...typography.bodyMedium, fontSize: 12, color: colors.gold, textAlign: 'center' as const },
});
