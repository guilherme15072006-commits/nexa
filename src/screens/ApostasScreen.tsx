import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Animated, Easing,
} from 'react-native';
import { colors, spacing, radius, typography, anim, glass } from '../theme';
import { useNexaStore } from '../store/nexaStore';
import {
  Avatar, Pill, LiveBadge, OddsBtn, Card,
  SectionHeader, ProgressBar, PrimaryButton,
  ScalePress, FadeInView, FloatingBar, CelebrationBurst,
  CounterText,
} from '../components/ui';

const TABS = ['Ao vivo', 'Hoje', 'Amanha', 'Copiar aposta'];

// =====================================================
// Match Card — Bet365/Stake: premium live card
// =====================================================
function MatchCard({ match, index }: { match: any; index: number }) {
  const { selectedOdds, selectOdd, tipsters, placeBet, celebrating } = useNexaStore();
  const [betPlaced, setBetPlaced] = useState(false);
  const selected = selectedOdds[match.id];
  const livePulse = useRef(new Animated.Value(0)).current;
  const betSuccessAnim = useRef(new Animated.Value(0)).current;

  const tipster = tipsters.find(t => t.isFollowing && t.recentPick);

  // Twitch: live card border pulse
  useEffect(() => {
    if (match.status === 'live') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(livePulse, { toValue: 1, duration: 2000, useNativeDriver: false, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(livePulse, { toValue: 0, duration: 2000, useNativeDriver: false, easing: Easing.inOut(Easing.sin) }),
        ])
      ).start();
    }
  }, [match.status]);

  const handleBet = () => {
    if (!selected && !tipster) return;
    setBetPlaced(true);
    Animated.sequence([
      Animated.timing(betSuccessAnim, { toValue: 1, duration: anim.normal, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  };

  const liveBorderColor = match.status === 'live'
    ? livePulse.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border, colors.live + '55'],
      })
    : colors.border;

  return (
    <FadeInView delay={index * 100} from={16}>
      <Animated.View style={[
        styles.matchCardWrap,
        { borderColor: liveBorderColor },
      ]}>
        <View style={styles.matchCard}>
          {/* League header */}
          <View style={styles.matchLeagueRow}>
            <View style={styles.leaguePill}>
              <Text style={styles.leagueIcon}>{match.leagueIcon}</Text>
              <Text style={styles.matchLeagueText}>{match.league}</Text>
            </View>
            {match.status === 'live'
              ? <LiveBadge minute={match.minute} />
              : <Text style={styles.matchTime}>{match.startTime}</Text>
            }
          </View>

          {/* Teams — Bet365 layout */}
          <View style={styles.teamsRow}>
            <View style={styles.team}>
              <View style={styles.teamLogo}>
                <Text style={styles.teamLogoText}>{match.homeLogo}</Text>
              </View>
              <Text style={styles.teamName} numberOfLines={1}>{match.homeTeam}</Text>
            </View>
            <View style={styles.scoreBox}>
              {match.status === 'live' && match.score
                ? (
                  <View style={styles.scoreLiveWrap}>
                    <Text style={styles.scoreLive}>{match.score.home}</Text>
                    <Text style={styles.scoreSep}>-</Text>
                    <Text style={styles.scoreLive}>{match.score.away}</Text>
                  </View>
                )
                : <Text style={styles.scoreVs}>VS</Text>
              }
              {match.status === 'live' && (
                <Text style={styles.scoreMinute}>{match.minute}'</Text>
              )}
            </View>
            <View style={styles.team}>
              <View style={styles.teamLogo}>
                <Text style={styles.teamLogoText}>{match.awayLogo}</Text>
              </View>
              <Text style={styles.teamName} numberOfLines={1}>{match.awayTeam}</Text>
            </View>
          </View>

          {/* Bettors social proof — Twitter trending vibe */}
          <View style={styles.bettorsRow}>
            <View style={styles.bettorsDot} />
            <CounterText value={match.bettors} style={styles.bettorsCount} />
            <Text style={styles.bettorsLabel}>apostando agora</Text>
            {match.trending && (
              <View style={styles.trendingPill}>
                <Text style={styles.trendingText}>Tendencia</Text>
              </View>
            )}
          </View>

          {/* Odds — Bet365: flash on change */}
          <View style={styles.oddsRow}>
            <OddsBtn
              label={match.homeLogo} value={match.odds.home}
              prevValue={match.prevOdds?.home}
              selected={selected === 'home'}
              onPress={() => selectOdd(match.id, 'home')}
            />
            <OddsBtn
              label="Empate" value={match.odds.draw}
              prevValue={match.prevOdds?.draw}
              selected={selected === 'draw'}
              onPress={() => selectOdd(match.id, 'draw')}
            />
            <OddsBtn
              label={match.awayLogo} value={match.odds.away}
              prevValue={match.prevOdds?.away}
              selected={selected === 'away'}
              onPress={() => selectOdd(match.id, 'away')}
            />
          </View>

          {/* Sparkline placeholder: odds trend */}
          {match.status === 'live' && (
            <View style={styles.oddsTrendRow}>
              <View style={styles.oddsTrendBar}>
                <View style={[styles.oddsTrendFill, { width: `${(match.odds.home / (match.odds.home + match.odds.away)) * 100}%` }]} />
              </View>
              <Text style={styles.oddsTrendLabel}>
                {Math.round((1 / match.odds.home) * 100)}% - {Math.round((1 / match.odds.away) * 100)}%
              </Text>
            </View>
          )}

          {/* Tipster copy suggestion */}
          {tipster && !betPlaced && (
            <ScalePress onPress={handleBet}>
              <View style={styles.copyRow}>
                <Avatar label={tipster.avatar} size={26} tier={tipster.tier} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.copyUsername}>{tipster.username}</Text>
                  <Text style={styles.copyText}>apostou: {tipster.recentPick}</Text>
                </View>
                <View style={styles.copyBadge}>
                  <Text style={styles.copyBadgeText}>Copiar</Text>
                </View>
              </View>
            </ScalePress>
          )}

          {/* Bet button */}
          {selected && !betPlaced && (
            <PrimaryButton
              label={`Apostar  odds ${match.odds[selected as 'home' | 'draw' | 'away'].toFixed(2)}`}
              onPress={handleBet}
            />
          )}

          {/* Bet placed confirmation */}
          {betPlaced && (
            <Animated.View style={[styles.betPlaced, { opacity: betSuccessAnim }]}>
              <Text style={styles.betPlacedText}>Aposta registrada  +20 XP</Text>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </FadeInView>
  );
}

// =====================================================
// Hidden Mission — Fortnite: mystery reveal
// =====================================================
function HiddenMission() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1, duration: 3000, useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  return (
    <FadeInView delay={300}>
      <Card style={styles.hiddenCard} variant="accent">
        <View style={styles.hiddenTop}>
          <View style={styles.hiddenIconWrap}>
            <Text style={styles.hiddenIcon}>?</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hiddenTitle}>Missao oculta desbloqueada</Text>
            <Text style={styles.hiddenSub}>Faca uma aposta ao vivo para revelar</Text>
          </View>
          <Pill label="+300 XP" color={colors.primary} bg={colors.primary + '18'} size="md" />
        </View>
        <ProgressBar progress={0} target={1} color={colors.primary} />
      </Card>
    </FadeInView>
  );
}

// =====================================================
// Apostas Screen
// =====================================================
export default function ApostasScreen() {
  const { matches, betslip, betslipVisible, placeBet, clearBetslip, simulateOddsChange, celebrating } = useNexaStore();
  const [activeTab, setActiveTab] = useState(0);

  // Bet365: real-time odds simulation
  useEffect(() => {
    const interval = setInterval(simulateOddsChange, 4000);
    return () => clearInterval(interval);
  }, []);

  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const shown = activeTab === 0 ? liveMatches
    : activeTab === 1 ? upcomingMatches
    : activeTab === 2 ? []
    : liveMatches;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Apostas</Text>
        {liveMatches.length > 0 && (
          <View style={styles.headerLive}>
            <LiveBadge />
          </View>
        )}
      </View>

      {/* Tabs — Stake: clean pill tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
        {TABS.map((t, i) => (
          <ScalePress key={i} onPress={() => setActiveTab(i)}>
            <View style={[styles.tab, i === activeTab && styles.tabActive]}>
              <Text style={[styles.tabText, i === activeTab && styles.tabTextActive]}>{t}</Text>
              {i === 0 && liveMatches.length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{liveMatches.length}</Text>
                </View>
              )}
            </View>
          </ScalePress>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {activeTab === 0 && (
          <>
            <SectionHeader title={`${liveMatches.length} jogos ao vivo`} />
            {liveMatches.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
            <HiddenMission />
          </>
        )}
        {activeTab === 1 && (
          <>
            <SectionHeader title="Jogos de hoje" />
            {upcomingMatches.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
          </>
        )}
        {activeTab === 2 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>C</Text>
            <Text style={styles.emptyText}>Jogos de amanha em breve</Text>
            <Text style={styles.emptySub}>Ative notificacoes para nao perder</Text>
          </View>
        )}
        {activeTab === 3 && (
          <>
            <SectionHeader title="Apostas dos tipsters que voce segue" />
            {liveMatches.map((m, i) => <MatchCard key={m.id} match={m} index={i} />)}
          </>
        )}
        <View style={{ height: betslipVisible ? 160 : 100 }} />
      </ScrollView>

      {/* Bet365: floating betslip */}
      <FloatingBar visible={betslipVisible}>
        <View style={styles.betslipContent}>
          <View style={styles.betslipHeader}>
            <View>
              <Text style={styles.betslipTitle}>{betslip.length} {betslip.length === 1 ? 'selecao' : 'selecoes'}</Text>
              <Text style={styles.betslipOdds}>
                Odds combinada: {betslip.reduce((acc, b) => acc * b.odds, 1).toFixed(2)}
              </Text>
            </View>
            <ScalePress onPress={clearBetslip}>
              <Text style={styles.betslipClear}>Limpar</Text>
            </ScalePress>
          </View>
          <ScalePress onPress={placeBet}>
            <View style={styles.betslipBtn}>
              <Text style={styles.betslipBtnText}>Confirmar aposta</Text>
              <Text style={styles.betslipBtnOdds}>
                {betslip.reduce((acc, b) => acc * b.odds, 1).toFixed(2)}x
              </Text>
            </View>
          </ScalePress>
        </View>
        <CelebrationBurst active={celebrating} />
      </FloatingBar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingTop: 52, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 24, fontFamily: typography.display, color: colors.textPrimary, letterSpacing: -0.3 },
  headerLive: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },

  tabsScroll: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.md },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: radius.full, backgroundColor: colors.bgElevated,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontFamily: typography.bodyMed, color: colors.textSecondary },
  tabTextActive: { color: '#fff' },
  tabBadge: {
    backgroundColor: colors.red, width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  tabBadgeText: { fontSize: 10, fontFamily: typography.bodySemi, color: '#fff' },
  scroll: { paddingBottom: 40 },

  // Match card
  matchCardWrap: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: radius.lg, borderWidth: 0.5,
    backgroundColor: colors.bgCard, overflow: 'hidden',
  },
  matchCard: { padding: spacing.lg, gap: spacing.md },
  matchLeagueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leaguePill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  leagueIcon: { fontSize: 12, fontFamily: typography.mono, color: colors.textMuted },
  matchLeagueText: { fontSize: 12, color: colors.textMuted, fontFamily: typography.bodyMed },
  matchTime: { fontSize: 12, color: colors.textSecondary, fontFamily: typography.mono },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { alignItems: 'center', gap: 6, flex: 1 },
  teamLogo: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.bgHighlight,
    alignItems: 'center', justifyContent: 'center',
  },
  teamLogoText: { fontSize: 12, fontFamily: typography.monoBold, color: colors.textSecondary },
  teamName: { fontSize: 12, fontFamily: typography.bodySemi, color: colors.textPrimary, textAlign: 'center' },
  scoreBox: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: colors.bgHighlight, borderRadius: radius.md,
    alignItems: 'center',
  },
  scoreLiveWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreLive: { fontSize: 22, fontFamily: typography.monoBold, color: colors.textPrimary },
  scoreSep: { fontSize: 16, fontFamily: typography.mono, color: colors.textMuted },
  scoreVs: { fontSize: 13, fontFamily: typography.mono, color: colors.textMuted },
  scoreMinute: { fontSize: 10, fontFamily: typography.mono, color: colors.live, marginTop: 2 },

  bettorsRow: { flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'center' },
  bettorsDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.green },
  bettorsCount: { fontSize: 12, fontFamily: typography.monoBold, color: colors.textSecondary },
  bettorsLabel: { fontSize: 11, color: colors.textMuted, fontFamily: typography.body },
  trendingPill: {
    backgroundColor: colors.orange + '18', borderWidth: 0.5, borderColor: colors.orange + '44',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.full, marginLeft: 4,
  },
  trendingText: { fontSize: 9, fontFamily: typography.bodySemi, color: colors.orange },

  oddsRow: { flexDirection: 'row', gap: spacing.sm },

  // Odds trend bar
  oddsTrendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  oddsTrendBar: {
    flex: 1, height: 3, backgroundColor: colors.bgHighlight, borderRadius: 2,
    overflow: 'hidden',
  },
  oddsTrendFill: { height: '100%' as any, backgroundColor: colors.primary, borderRadius: 2 },
  oddsTrendLabel: { fontSize: 10, fontFamily: typography.mono, color: colors.textMuted },

  // Copy bet
  copyRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    ...glass.elevated,
    padding: spacing.md, borderRadius: radius.md,
  },
  copyUsername: { fontSize: 12, fontFamily: typography.bodySemi, color: colors.textPrimary },
  copyText: { fontSize: 11, color: colors.textMuted, fontFamily: typography.body },
  copyBadge: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  copyBadgeText: { fontSize: 11, fontFamily: typography.bodySemi, color: '#fff' },

  // Bet placed
  betPlaced: {
    backgroundColor: colors.green + '15', borderWidth: 0.5, borderColor: colors.green + '35',
    padding: spacing.md, borderRadius: radius.md, alignItems: 'center',
  },
  betPlacedText: { fontSize: 13, fontFamily: typography.bodySemi, color: colors.green },

  // Hidden mission
  hiddenCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.sm },
  hiddenTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hiddenIconWrap: {
    width: 36, height: 36, borderRadius: radius.md,
    backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center',
  },
  hiddenIcon: { fontSize: 16, fontFamily: typography.display, color: colors.primary },
  hiddenTitle: { fontSize: 13, fontFamily: typography.bodySemi, color: colors.textPrimary },
  hiddenSub: { fontSize: 11, color: colors.textMuted, fontFamily: typography.body, marginTop: 2 },

  // Empty state
  empty: { flex: 1, alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyIcon: { fontSize: 28, fontFamily: typography.display, color: colors.textMuted },
  emptyText: { fontSize: 16, fontFamily: typography.bodyMed, color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textMuted, fontFamily: typography.body },

  // Betslip
  betslipContent: { gap: spacing.md },
  betslipHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  betslipTitle: { fontSize: 14, fontFamily: typography.bodySemi, color: colors.textPrimary },
  betslipOdds: { fontSize: 12, fontFamily: typography.mono, color: colors.textSecondary, marginTop: 2 },
  betslipClear: { fontSize: 13, fontFamily: typography.bodyMed, color: colors.textMuted },
  betslipBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: spacing.sm,
  },
  betslipBtnText: { fontSize: 15, fontFamily: typography.bodySemi, color: '#fff' },
  betslipBtnOdds: { fontSize: 14, fontFamily: typography.monoBold, color: '#fff' },
});
