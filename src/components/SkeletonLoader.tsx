import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

// ─── SkeletonPulse ───────────────────────────────────────────────────────────

interface SkeletonPulseProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
  delay?: number;
}

export function SkeletonPulse({
  width,
  height,
  borderRadius = radius.sm,
  style,
  delay = 0,
}: SkeletonPulseProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 600,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, delay]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.bgElevated,
          opacity,
        },
        style,
      ]}
    />
  );
}

// ─── SkeletonCard ────────────────────────────────────────────────────────────

interface SkeletonCardProps {
  delay?: number;
}

export function SkeletonCard({ delay = 0 }: SkeletonCardProps) {
  return (
    <View style={styles.card}>
      {/* Avatar row */}
      <View style={styles.row}>
        <SkeletonPulse width={38} height={38} borderRadius={19} delay={delay} />
        <View style={styles.headerLines}>
          <SkeletonPulse width={80} height={12} delay={delay} />
          <SkeletonPulse width={120} height={10} delay={delay} />
        </View>
      </View>

      {/* Content lines */}
      <View style={styles.contentLines}>
        <SkeletonPulse width="100%" height={12} delay={delay} />
        <SkeletonPulse width="90%" height={12} delay={delay} />
        <SkeletonPulse width="60%" height={12} delay={delay} />
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <SkeletonPulse width={60} height={24} borderRadius={radius.md} delay={delay} />
        <SkeletonPulse width={60} height={24} borderRadius={radius.md} delay={delay} />
        <SkeletonPulse width={60} height={24} borderRadius={radius.md} delay={delay} />
      </View>
    </View>
  );
}

// ─── SkeletonMatchCard ───────────────────────────────────────────────────────

interface SkeletonMatchCardProps {
  delay?: number;
}

export function SkeletonMatchCard({ delay = 0 }: SkeletonMatchCardProps) {
  return (
    <View style={styles.card}>
      {/* League + status */}
      <View style={styles.row}>
        <SkeletonPulse width={90} height={20} borderRadius={radius.full} delay={delay} />
        <SkeletonPulse width={20} height={20} borderRadius={10} delay={delay} />
      </View>

      {/* Teams + score */}
      <View style={styles.matchRow}>
        <SkeletonPulse width={100} height={16} delay={delay} />
        <SkeletonPulse width={40} height={24} borderRadius={radius.sm} delay={delay} />
        <SkeletonPulse width={100} height={16} delay={delay} />
      </View>

      {/* Odds buttons */}
      <View style={styles.oddsRow}>
        <SkeletonPulse width={0} height={36} borderRadius={radius.md} delay={delay} style={styles.oddsFlex} />
        <SkeletonPulse width={0} height={36} borderRadius={radius.md} delay={delay} style={styles.oddsFlex} />
        <SkeletonPulse width={0} height={36} borderRadius={radius.md} delay={delay} style={styles.oddsFlex} />
      </View>
    </View>
  );
}

// ─── SkeletonDashboard ───────────────────────────────────────────────────────

export function SkeletonDashboard({ delay = 0 }: { delay?: number }) {
  return (
    <View style={styles.dashSection}>
      {/* Stats grid 2x2 */}
      <View style={styles.statsGrid}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={styles.statBox}>
            <SkeletonPulse width={40} height={20} delay={delay + i * 80} />
            <SkeletonPulse width={64} height={10} delay={delay + i * 80} />
          </View>
        ))}
      </View>
      {/* Chart placeholder */}
      <View style={styles.card}>
        <SkeletonPulse width={100} height={14} delay={delay + 100} />
        <SkeletonPulse width="100%" height={120} borderRadius={radius.md} delay={delay + 200} />
      </View>
      {/* List rows */}
      {[0, 1, 2].map(i => (
        <View key={i} style={styles.row}>
          <SkeletonPulse width={32} height={32} borderRadius={16} delay={delay + 300 + i * 100} />
          <View style={styles.headerLines}>
            <SkeletonPulse width={100} height={12} delay={delay + 300 + i * 100} />
            <SkeletonPulse width={60} height={10} delay={delay + 300 + i * 100} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── SkeletonRanking ─────────────────────────────────────────────────────────

export function SkeletonRanking({ delay = 0 }: { delay?: number }) {
  return (
    <View style={styles.rankSection}>
      {/* Podium */}
      <View style={styles.podiumRow}>
        {[0, 1, 2].map(i => (
          <View key={i} style={styles.podiumItem}>
            <SkeletonPulse width={i === 1 ? 56 : 44} height={i === 1 ? 56 : 44} borderRadius={28} delay={delay + i * 120} />
            <SkeletonPulse width={48} height={10} delay={delay + i * 120 + 60} />
            <SkeletonPulse width={32} height={8} delay={delay + i * 120 + 60} />
          </View>
        ))}
      </View>
      {/* Rows */}
      {[0, 1, 2, 3, 4].map(i => (
        <View key={i} style={styles.rankRow}>
          <SkeletonPulse width={20} height={14} delay={delay + 400 + i * 80} />
          <SkeletonPulse width={36} height={36} borderRadius={18} delay={delay + 400 + i * 80} />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <SkeletonPulse width={90} height={12} delay={delay + 400 + i * 80} />
            <SkeletonPulse width={50} height={8} delay={delay + 400 + i * 80} />
          </View>
          <SkeletonPulse width={48} height={20} borderRadius={radius.sm} delay={delay + 400 + i * 80} />
        </View>
      ))}
    </View>
  );
}

// ─── SkeletonNotification ────────────────────────────────────────────────────

export function SkeletonNotification({ delay = 0 }: { delay?: number }) {
  return (
    <View style={styles.notifRow}>
      <SkeletonPulse width={40} height={40} borderRadius={12} delay={delay} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <SkeletonPulse width="80%" height={12} delay={delay} />
        <SkeletonPulse width="50%" height={10} delay={delay} />
      </View>
      <SkeletonPulse width={6} height={6} borderRadius={3} delay={delay} />
    </View>
  );
}

// ─── SkeletonWallet ──────────────────────────────────────────────────────────

export function SkeletonWallet({ delay = 0 }: { delay?: number }) {
  return (
    <View style={styles.dashSection}>
      {/* Balance card */}
      <View style={[styles.card, { alignItems: 'center' as const, paddingVertical: spacing.xl }]}>
        <SkeletonPulse width={120} height={28} delay={delay} />
        <SkeletonPulse width={80} height={12} delay={delay + 100} />
      </View>
      {/* Action buttons */}
      <View style={styles.oddsRow}>
        <SkeletonPulse width={0} height={44} borderRadius={radius.md} delay={delay + 200} style={styles.oddsFlex} />
        <SkeletonPulse width={0} height={44} borderRadius={radius.md} delay={delay + 200} style={styles.oddsFlex} />
      </View>
      {/* Transactions */}
      {[0, 1, 2, 3].map(i => (
        <View key={i} style={styles.row}>
          <SkeletonPulse width={36} height={36} borderRadius={10} delay={delay + 300 + i * 100} />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <SkeletonPulse width={100} height={12} delay={delay + 300 + i * 100} />
            <SkeletonPulse width={60} height={10} delay={delay + 300 + i * 100} />
          </View>
          <SkeletonPulse width={50} height={14} delay={delay + 300 + i * 100} />
        </View>
      ))}
    </View>
  );
}

// ─── SkeletonList ────────────────────────────────────────────────────────────

interface SkeletonListProps {
  count?: number;
  type?: 'card' | 'match' | 'notification';
}

export function SkeletonList({ count = 3, type = 'card' }: SkeletonListProps) {
  const Component = type === 'match'
    ? SkeletonMatchCard
    : type === 'notification'
      ? SkeletonNotification
      : SkeletonCard;

  return (
    <View>
      {Array.from({ length: count }, (_, i) => (
        <Component key={i} delay={i * 150} />
      ))}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerLines: {
    gap: spacing.xs + 2,
  },
  contentLines: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  oddsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  oddsFlex: {
    flex: 1,
  },
  // Dashboard
  dashSection: {
    gap: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  // Ranking
  rankSection: {
    gap: spacing.md,
  },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: spacing.xl,
    paddingVertical: spacing.lg,
  },
  podiumItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  // Notifications
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
});
