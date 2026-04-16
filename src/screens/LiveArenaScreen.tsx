/**
 * NEXA — Live Arena Screen
 *
 * Layout:
 * ┌─────────────────────────────────────┐
 * │  STREAM VIDEO (aspect 16:9)         │
 * │  [overlay: viewers, streamer info]  │
 * ├────────────────┬────────────────────┤
 * │  BET PANEL     │  CHAT              │
 * │  markets,odds  │  messages          │
 * │  quick bet     │  identity          │
 * │  copy pick     │  reactions         │
 * ├────────────────┴────────────────────┤
 * │  ENGAGEMENT BAR                     │
 * │  XP mult, streak, momentum, missions│
 * └─────────────────────────────────────┘
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing, typography } from '../theme';
import { TapScale, SmoothEntry, PulsingDot } from '../components/LiveComponents';
import { Card, Avatar, Pill } from '../components/ui';
import { hapticLight, hapticMedium, hapticSuccess } from '../services/haptics';
import { liveArena, type LiveBetMarket, type LiveChatMessage, type MomentumState, type ArenaTab } from '../services/live';

// ─── Momentum Colors ────────────────────────────────────────

const MOMENTUM_CONFIG: Record<MomentumState, { label: string; color: string; icon: string }> = {
  cold: { label: 'Frio', color: colors.textMuted, icon: '○' },
  warming: { label: 'Esquentando', color: colors.orange, icon: '◐' },
  hot: { label: 'Quente', color: '#FF6B35', icon: '●' },
  on_fire: { label: 'Em chamas', color: colors.red, icon: '◉' },
};

// ─── Stream Header ──────────────────────────────────────────

function StreamHeader() {
  const state = liveArena.getState();
  const stream = state.stream;
  if (!stream) return null;

  return (
    <View style={styles.streamHeader}>
      {/* Video placeholder */}
      <View style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoPlaceholderText}>LIVE</Text>
        </View>

        {/* Overlay: viewer count + live badge */}
        <View style={styles.videoOverlay}>
          <View style={styles.liveBadge}>
            <PulsingDot color={colors.red} size={8} />
            <Text style={styles.liveBadgeText}>AO VIVO</Text>
          </View>
          <View style={styles.viewerBadge}>
            <Text style={styles.viewerCount}>{state.viewerCount.toLocaleString()}</Text>
            <Text style={styles.viewerLabel}>assistindo</Text>
          </View>
        </View>
      </View>

      {/* Streamer info bar */}
      <View style={styles.streamerBar}>
        <View style={styles.streamerInfo}>
          <Avatar username={stream.streamer.username} size={32} />
          <View>
            <Text style={styles.streamerName}>{stream.streamer.username}</Text>
            <Text style={styles.streamerStats}>ROI {stream.streamer.roi > 0 ? '+' : ''}{Math.round(stream.streamer.roi * 100)}% · WR {Math.round(stream.streamer.winRate * 100)}%</Text>
          </View>
        </View>
        <Pill label={stream.streamer.tier.toUpperCase()} color={colors.gold} />
      </View>

      {/* Match info (if linked) */}
      {stream.match && (
        <View style={styles.matchBar}>
          <Text style={styles.matchTeams}>{stream.match.homeTeam} {stream.match.score.home} - {stream.match.score.away} {stream.match.awayTeam}</Text>
          <View style={styles.matchMinute}>
            <PulsingDot color={colors.green} size={6} />
            <Text style={styles.matchMinuteText}>{stream.match.minute}'</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Bet Panel ──────────────────────────────────────────────

function BetPanel() {
  const [markets, setMarkets] = useState<LiveBetMarket[]>([]);

  useEffect(() => {
    setMarkets(liveArena.getState().activeBets);
    const unsub = liveArena.getState().activeBets.length > 0 ? undefined : undefined;
    const timer = setInterval(() => setMarkets(liveArena.getState().activeBets), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.betPanel}>
      <Text style={styles.panelTitle}>Mercados ao Vivo</Text>
      {markets.map((market) => (
        <View key={market.id} style={styles.marketCard}>
          <View style={styles.marketHeader}>
            <Text style={styles.marketLabel}>{market.label}</Text>
            {market.urgency !== 'normal' && (
              <View style={[styles.urgencyBadge, market.urgency === 'last_chance' && styles.urgencyLastChance, market.urgency === 'locked' && styles.urgencyLocked]}>
                <Text style={styles.urgencyText}>
                  {market.urgency === 'closing_soon' ? 'Fechando' : market.urgency === 'last_chance' ? 'Ultima chance' : market.urgency === 'locked' ? 'Fechado' : ''}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.oddsRow}>
            {market.options.map((opt) => (
              <TapScale
                key={opt.id}
                onPress={() => {
                  hapticMedium();
                  liveArena.quickBet(market.id, opt.id, 25);
                }}
                disabled={market.urgency === 'locked'}
              >
                <View style={[styles.oddBtn, market.urgency === 'locked' && styles.oddBtnLocked]}>
                  <Text style={styles.oddLabel}>{opt.label}</Text>
                  <Text style={[styles.oddValue, opt.movement === 1 && styles.oddUp, opt.movement === -1 && styles.oddDown]}>
                    {opt.odds.toFixed(2)}
                  </Text>
                  {opt.movement !== 0 && (
                    <Text style={[styles.oddArrow, opt.movement === 1 ? styles.oddUp : styles.oddDown]}>
                      {opt.movement === 1 ? '▲' : '▼'}
                    </Text>
                  )}
                </View>
              </TapScale>
            ))}
          </View>
          <Text style={styles.marketBettors}>{market.bettorsCount} apostando</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Chat Panel ─────────────────────────────────────────────

function ChatPanel() {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setMessages(liveArena.getState().messages.slice(-30)), 2000);
    return () => clearInterval(timer);
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    hapticLight();
    liveArena.sendChat(input.trim());
    setInput('');
  }, [input]);

  const tierColors: Record<string, string> = { elite: colors.gold, pro: colors.primary, free: colors.textMuted, system: colors.red };

  return (
    <View style={styles.chatPanel}>
      <Text style={styles.panelTitle}>Chat</Text>
      <ScrollView style={styles.chatScroll} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.chatMsg, msg.highlighted && styles.chatMsgHighlighted, msg.type === 'system' && styles.chatMsgSystem]}>
            {msg.type === 'message' && (
              <>
                <Text style={[styles.chatUsername, { color: tierColors[msg.userTier] ?? colors.textMuted }]}>
                  {msg.userRank && msg.userRank <= 100 ? `#${msg.userRank} ` : ''}{msg.username}
                  {msg.userTier !== 'free' ? ` [${msg.userTier.toUpperCase()}]` : ''}
                </Text>
                <Text style={styles.chatText}>{msg.text}</Text>
              </>
            )}
            {msg.type === 'bet_placed' && <Text style={styles.chatBet}>{msg.text}</Text>}
            {msg.type === 'big_win' && <Text style={styles.chatBigWin}>{msg.text}</Text>}
            {msg.type === 'system' && <Text style={styles.chatSystem}>{msg.text}</Text>}
          </View>
        ))}
      </ScrollView>
      <View style={styles.chatInputBar}>
        <TextInput
          style={styles.chatInput}
          value={input}
          onChangeText={setInput}
          placeholder="Mensagem..."
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          maxLength={300}
        />
        <TouchableOpacity style={styles.chatSendBtn} onPress={handleSend} activeOpacity={0.7}>
          <Text style={styles.chatSendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Engagement Bar ─────────────────────────────────────────

function EngagementBar() {
  const [stats, setStats] = useState(liveArena.getStats());

  useEffect(() => {
    const timer = setInterval(() => setStats(liveArena.getStats()), 5000);
    return () => clearInterval(timer);
  }, []);

  const mom = MOMENTUM_CONFIG[stats.momentum];

  return (
    <View style={styles.engagementBar}>
      <View style={styles.engagementItem}>
        <Text style={styles.engagementValue}>{stats.multiplier.toFixed(1)}x</Text>
        <Text style={styles.engagementLabel}>XP Mult</Text>
      </View>
      <View style={styles.engagementDivider} />
      <View style={styles.engagementItem}>
        <Text style={styles.engagementValue}>{stats.minutesWatched}m</Text>
        <Text style={styles.engagementLabel}>Assistindo</Text>
      </View>
      <View style={styles.engagementDivider} />
      <View style={styles.engagementItem}>
        <Text style={[styles.engagementValue, { color: mom.color }]}>{mom.icon} {mom.label}</Text>
        <Text style={styles.engagementLabel}>Momentum</Text>
      </View>
      <View style={styles.engagementDivider} />
      <View style={styles.engagementItem}>
        <Text style={styles.engagementValue}>+{stats.xpEarned}</Text>
        <Text style={styles.engagementLabel}>XP ganho</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────

export default function LiveArenaScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<ArenaTab>('chat');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Stream + Streamer */}
      <StreamHeader />

      {/* Engagement bar */}
      <EngagementBar />

      {/* Tab toggle */}
      <View style={styles.tabRow}>
        {([
          { key: 'bets' as ArenaTab, label: 'Apostas' },
          { key: 'chat' as ArenaTab, label: 'Chat' },
          { key: 'stats' as ArenaTab, label: 'Stats' },
          { key: 'polls' as ArenaTab, label: 'Polls' },
        ]).map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => { hapticLight(); setTab(t.key); }}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <View style={styles.tabContent}>
        {tab === 'bets' && <BetPanel />}
        {tab === 'chat' && <ChatPanel />}
        {tab === 'stats' && (
          <View style={styles.statsPanel}>
            <Text style={styles.panelTitle}>Streamer Picks</Text>
            {liveArena.getState().stream?.currentPicks.map((pick) => (
              <Card key={pick.id} style={styles.pickCard}>
                <View style={styles.pickHeader}>
                  <Text style={styles.pickMatch}>{pick.matchLabel}</Text>
                  <Pill label={pick.confidence.toUpperCase()} color={pick.confidence === 'high' ? colors.green : pick.confidence === 'medium' ? colors.orange : colors.textMuted} />
                </View>
                <Text style={styles.pickSide}>{pick.side} @ {pick.odds.toFixed(2)}</Text>
                <Text style={styles.pickReason}>{pick.reasoning}</Text>
                <View style={styles.pickFooter}>
                  <Text style={styles.pickCopied}>{pick.copiedBy} copiaram</Text>
                  <TapScale onPress={() => { hapticSuccess(); liveArena.copyPick(pick.id, 25); }}>
                    <View style={styles.copyBtn}>
                      <Text style={styles.copyBtnText}>Copiar R$25</Text>
                    </View>
                  </TapScale>
                </View>
              </Card>
            ))}
          </View>
        )}
        {tab === 'polls' && (
          <View style={styles.pollPanel}>
            <Text style={styles.panelTitle}>Enquete ao Vivo</Text>
            {liveArena.getState().activePoll ? (
              <Card style={styles.pollCard}>
                <Text style={styles.pollQuestion}>{liveArena.getState().activePoll!.question}</Text>
                {liveArena.getState().activePoll!.options.map((opt, i) => (
                  <TapScale key={i} onPress={() => { hapticLight(); liveArena.votePoll(i); }}>
                    <View style={styles.pollOption}>
                      <View style={[styles.pollBar, { width: `${opt.percentage}%` }]} />
                      <Text style={styles.pollOptionLabel}>{opt.label}</Text>
                      <Text style={styles.pollOptionPct}>{opt.percentage}%</Text>
                    </View>
                  </TapScale>
                ))}
                <Text style={styles.pollTotal}>{liveArena.getState().activePoll!.totalVotes} votos</Text>
              </Card>
            ) : (
              <Text style={styles.emptyText}>Nenhuma enquete ativa</Text>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Stream
  streamHeader: {},
  videoContainer: { aspectRatio: 16 / 9, backgroundColor: '#000', position: 'relative' },
  videoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  videoPlaceholderText: { ...typography.monoBold, fontSize: 24, color: colors.textMuted, letterSpacing: 4 },
  videoOverlay: { position: 'absolute', top: spacing.sm, left: spacing.sm, right: spacing.sm, flexDirection: 'row', justifyContent: 'space-between' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: 'rgba(255,77,106,0.9)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  liveBadgeText: { ...typography.monoBold, fontSize: 10, color: '#FFF', letterSpacing: 1 },
  viewerBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  viewerCount: { ...typography.monoBold, fontSize: 12, color: '#FFF' },
  viewerLabel: { ...typography.body, fontSize: 10, color: 'rgba(255,255,255,0.7)' },

  // Streamer bar
  streamerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  streamerInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  streamerName: { ...typography.bodySemiBold, fontSize: 14, color: colors.textPrimary },
  streamerStats: { ...typography.mono, fontSize: 11, color: colors.textMuted },

  // Match bar
  matchBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing.xs, backgroundColor: colors.bgCard },
  matchTeams: { ...typography.monoBold, fontSize: 14, color: colors.textPrimary },
  matchMinute: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  matchMinuteText: { ...typography.mono, fontSize: 12, color: colors.green },

  // Engagement bar
  engagementBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.bgElevated, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  engagementItem: { flex: 1, alignItems: 'center' },
  engagementValue: { ...typography.monoBold, fontSize: 13, color: colors.textPrimary },
  engagementLabel: { ...typography.body, fontSize: 9, color: colors.textMuted, marginTop: 1 },
  engagementDivider: { width: 1, height: 20, backgroundColor: colors.border },

  // Tabs
  tabRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: colors.border },
  tabBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { ...typography.bodySemiBold, fontSize: 12, color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  tabContent: { flex: 1 },

  // Bet panel
  betPanel: { flex: 1, padding: spacing.md },
  panelTitle: { ...typography.bodySemiBold, fontSize: 14, color: colors.textPrimary, marginBottom: spacing.md },
  marketCard: { backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  marketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  marketLabel: { ...typography.bodySemiBold, fontSize: 13, color: colors.textPrimary },
  urgencyBadge: { backgroundColor: colors.orange + '20', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  urgencyLastChance: { backgroundColor: colors.red + '20' },
  urgencyLocked: { backgroundColor: colors.textMuted + '20' },
  urgencyText: { ...typography.monoBold, fontSize: 9, color: colors.orange, letterSpacing: 1 },
  oddsRow: { flexDirection: 'row', gap: spacing.sm },
  oddBtn: { flex: 1, backgroundColor: colors.bgElevated, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.border, paddingVertical: spacing.sm, alignItems: 'center' },
  oddBtnLocked: { opacity: 0.3 },
  oddLabel: { ...typography.body, fontSize: 10, color: colors.textMuted },
  oddValue: { ...typography.monoBold, fontSize: 16, color: colors.textPrimary, marginTop: 2 },
  oddUp: { color: colors.green },
  oddDown: { color: colors.red },
  oddArrow: { ...typography.mono, fontSize: 10, marginTop: 1 },
  marketBettors: { ...typography.mono, fontSize: 10, color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },

  // Chat panel
  chatPanel: { flex: 1, padding: spacing.md },
  chatScroll: { flex: 1 },
  chatMsg: { marginBottom: spacing.xs, paddingVertical: 2 },
  chatMsgHighlighted: { backgroundColor: colors.primary + '08', borderRadius: radius.sm, paddingHorizontal: spacing.xs },
  chatMsgSystem: { paddingVertical: spacing.xs },
  chatUsername: { ...typography.monoBold, fontSize: 11 },
  chatText: { ...typography.body, fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  chatBet: { ...typography.mono, fontSize: 11, color: colors.green },
  chatBigWin: { ...typography.monoBold, fontSize: 12, color: colors.gold },
  chatSystem: { ...typography.mono, fontSize: 10, color: colors.textMuted, fontStyle: 'italic' },
  chatInputBar: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  chatInput: { flex: 1, backgroundColor: colors.bgElevated, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderWidth: 0.5, borderColor: colors.border, ...typography.body, fontSize: 12, color: colors.textPrimary },
  chatSendBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  chatSendIcon: { ...typography.monoBold, fontSize: 14, color: '#FFF' },

  // Stats panel
  statsPanel: { flex: 1, padding: spacing.md },
  pickCard: { padding: spacing.md, marginBottom: spacing.sm },
  pickHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  pickMatch: { ...typography.bodySemiBold, fontSize: 13, color: colors.textPrimary },
  pickSide: { ...typography.monoBold, fontSize: 16, color: colors.green, marginBottom: spacing.xs },
  pickReason: { ...typography.body, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  pickFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 0.5, borderTopColor: colors.border },
  pickCopied: { ...typography.mono, fontSize: 11, color: colors.textMuted },
  copyBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.md },
  copyBtnText: { ...typography.bodySemiBold, fontSize: 12, color: '#FFF' },

  // Poll panel
  pollPanel: { flex: 1, padding: spacing.md },
  pollCard: { padding: spacing.md },
  pollQuestion: { ...typography.bodySemiBold, fontSize: 15, color: colors.textPrimary, marginBottom: spacing.md },
  pollOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgElevated, borderRadius: radius.md, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, marginBottom: spacing.xs, overflow: 'hidden', position: 'relative' },
  pollBar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.primary + '15', borderRadius: radius.md },
  pollOptionLabel: { flex: 1, ...typography.bodySemiBold, fontSize: 13, color: colors.textPrimary, zIndex: 1 },
  pollOptionPct: { ...typography.monoBold, fontSize: 13, color: colors.primary, zIndex: 1 },
  pollTotal: { ...typography.mono, fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  emptyText: { ...typography.body, fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xxl },
});
