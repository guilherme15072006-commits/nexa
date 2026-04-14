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

// ─── SkeletonList ────────────────────────────────────────────────────────────

interface SkeletonListProps {
  count?: number;
  type?: 'card' | 'match';
}

export function SkeletonList({ count = 3, type = 'card' }: SkeletonListProps) {
  const Component = type === 'match' ? SkeletonMatchCard : SkeletonCard;

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
});
