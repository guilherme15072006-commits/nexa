import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme';
import { useNexaStore, type LiveStream, type TipsterTier } from '../store/nexaStore';
import { Card, SectionHeader, Avatar, Pill } from '../components/ui';
import { TapScale, PulsingDot, SmoothEntry } from '../components/LiveComponents';
import { hapticLight, hapticMedium } from '../services/haptics';

// ─── Tier Colors ──────────────────────────────────────────────────────────────

const TIER_RING: Record<TipsterTier, string> = {
  elite: colors.gold,
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
};

// ─── Animated Viewer Count ────────────────────────────────────────────────────

function AnimatedViewers({ count }: { count: number }) {
  const [display, setDisplay] = useState(count);
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count !== display) {
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.6, duration: 120, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start(() => setDisplay(count));
    }
  }, [count]);

  return (
    <View style={styles.viewerRow}>
      <View style={styles.viewerDot} />
      <Animated.Text style={[styles.viewerCount, { opacity: anim }]}>
        {display.toLocaleString()} assistindo
      </Animated.Text>
    </View>
  );
}

// ─── Live Stream Card ─────────────────────────────────────────────────────────

function LiveStreamCard({
  stream,
  index,
  onWatch,
}: {
  stream: LiveStream;
  index: number;
  onWatch: (s: LiveStream) => void;
}) {
  const tierColor = TIER_RING[stream.tipster.tier];

  return (
    <SmoothEntry delay={index * 100}>
      <Card style={styles.liveCard}>
        {/* Header row */}
        <View style={styles.liveCardHeader}>
          <View style={[styles.avatarRing, { borderColor: tierColor }]}>
            <Avatar username={stream.tipster.username} size={44} />
          </View>
          <View style={styles.liveCardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.tipsterName}>{stream.tipster.username}</Text>
              <Pill label={stream.tipster.tier.toUpperCase()} color={tierColor} />
            </View>
            <Text style={styles.streamTitle} numberOfLines={2}>
              {stream.title}
            </Text>
          </View>
        </View>

        {/* Live badge + viewers */}
        <View style={styles.liveMetaRow}>
          <View style={styles.liveBadge}>
            <PulsingDot color={colors.red} size={8} />
            <Text style={styles.liveBadgeText}>AO VIVO</Text>
          </View>
          <AnimatedViewers count={stream.viewers} />
        </View>

        {/* Match link */}
        {stream.matchId && (
          <View style={styles.matchLink}>
            <Text style={styles.matchLinkIcon}>⚽</Text>
            <Text style={styles.matchLinkText}>Jogo vinculado</Text>
          </View>
        )}

        {/* Watch button */}
        <TapScale onPress={() => onWatch(stream)}>
          <View style={styles.watchBtn}>
            <Text style={styles.watchBtnText}>Assistir</Text>
          </View>
        </TapScale>
      </Card>
    </SmoothEntry>
  );
}

// ─── Scheduled Stream Card ────────────────────────────────────────────────────

function ScheduledCard({
  stream,
  index,
}: {
  stream: LiveStream;
  index: number;
}) {
  const tierColor = TIER_RING[stream.tipster.tier];

  return (
    <SmoothEntry delay={index * 100 + 200}>
      <Card style={styles.scheduledCard}>
        <View style={styles.scheduledRow}>
          <View style={[styles.avatarRingSmall, { borderColor: tierColor }]}>
            <Avatar username={stream.tipster.username} size={36} />
          </View>
          <View style={styles.scheduledInfo}>
            <Text style={styles.scheduledName}>{stream.tipster.username}</Text>
            <Text style={styles.scheduledTitle} numberOfLines={1}>
              {stream.title}
            </Text>
          </View>
          <View style={styles.scheduledTime}>
            <Text style={styles.scheduledTimeIcon}>🕐</Text>
            <Text style={styles.scheduledTimeText}>{stream.scheduledAt}</Text>
          </View>
        </View>
      </Card>
    </SmoothEntry>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📡</Text>
      <Text style={styles.emptyTitle}>Nenhuma live no momento</Text>
      <Text style={styles.emptySubtitle}>
        Volte mais tarde para assistir análises ao vivo dos melhores tipsters
      </Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LivesScreen() {
  const navigation = useNavigation();
  const liveStreams = useNexaStore((s) => s.liveStreams);
  const tickViewers = useNexaStore((s) => s.tickViewers);

  const liveNow = liveStreams.filter((s) => s.isLive);
  const scheduled = liveStreams.filter((s) => !s.isLive);

  // Tick viewers periodically
  useEffect(() => {
    const interval = setInterval(tickViewers, 6000);
    return () => clearInterval(interval);
  }, [tickViewers]);

  const handleWatch = useCallback((stream: LiveStream) => {
    hapticMedium();
    // Navigation to stream player would go here
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { hapticLight(); navigation.goBack(); }} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Lives</Text>
            <PulsingDot color={colors.red} size={10} />
          </View>
          <Text style={styles.headerSubtitle}>
            {liveNow.length > 0
              ? `${liveNow.length} ao vivo agora`
              : 'Nenhuma transmissão ativa'}
          </Text>
        </View>

        {/* Live NOW Section */}
        {liveNow.length > 0 ? (
          <>
            <SectionHeader title="Ao Vivo Agora" />
            {liveNow.map((stream, i) => (
              <LiveStreamCard
                key={stream.id}
                stream={stream}
                index={i}
                onWatch={handleWatch}
              />
            ))}
          </>
        ) : (
          <EmptyState />
        )}

        {/* Scheduled Section */}
        {scheduled.length > 0 && (
          <>
            <SectionHeader title="Programadas" style={styles.scheduledHeader} />
            {scheduled.map((stream, i) => (
              <ScheduledCard key={stream.id} stream={stream} index={i} />
            ))}
          </>
        )}

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
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
  scroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    padding: spacing.xs,
  },
  backBtnText: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.display,
    fontSize: 28,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Live Card
  liveCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  liveCardHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveCardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  tipsterName: {
    ...typography.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  streamTitle: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Meta row
  liveMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,77,106,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  liveBadgeText: {
    ...typography.monoBold,
    fontSize: 11,
    color: colors.red,
    letterSpacing: 1,
  },
  viewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  viewerCount: {
    ...typography.mono,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Match link
  matchLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  matchLinkIcon: {
    fontSize: 12,
  },
  matchLinkText: {
    ...typography.body,
    fontSize: 12,
    color: colors.primary,
  },

  // Watch button
  watchBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  watchBtnText: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Scheduled
  scheduledHeader: {
    marginTop: spacing.lg,
  },
  scheduledCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  scheduledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarRingSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduledInfo: {
    flex: 1,
  },
  scheduledName: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  scheduledTitle: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scheduledTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  scheduledTimeIcon: {
    fontSize: 12,
  },
  scheduledTimeText: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.displayMedium,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 20,
  },

  bottomSpacer: {
    height: spacing.xxl,
  },
});
