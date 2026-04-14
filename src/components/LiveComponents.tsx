import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

// ─── TapScale ─────────────────────────────────────────────────────────────────
// Wraps any pressable element with a subtle squeeze animation on press.

interface TapScaleProps {
  children: React.ReactNode;
  onPress?: () => void;
  scale?: number;
  style?: ViewStyle;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function TapScale({
  children,
  onPress,
  scale = 0.96,
  style,
  disabled,
  accessibilityLabel,
}: TapScaleProps) {
  const anim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(anim, { toValue: scale, duration: 80, useNativeDriver: true }).start();
  }, [anim, scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(anim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [anim]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale: anim }] }}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

// ─── FloatingXP ───────────────────────────────────────────────────────────────
// Shows a floating "+X XP" text that rises and fades out.

interface FloatingXPProps {
  amount: number;
  visible: boolean;
  onDone?: () => void;
  color?: string;
  style?: ViewStyle;
}

export function FloatingXP({ amount, visible, onDone, color = colors.green, style }: FloatingXPProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!visible) return;
    translateY.setValue(0);
    opacity.setValue(1);
    scale.setValue(0.5);

    Animated.parallel([
      Animated.timing(translateY, { toValue: -40, duration: 800, useNativeDriver: true }),
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.1, friction: 4, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(() => onDone?.());
  }, [visible, translateY, opacity, scale, onDone]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.floatingXP,
        style,
        { transform: [{ translateY }, { scale }], opacity },
      ]}
    >
      <Text style={[styles.floatingXPText, { color }]}>+{amount} XP</Text>
    </Animated.View>
  );
}

// ─── LiveActivityBar ──────────────────────────────────────────────────────────
// Global bar showing live stats, rotates between messages.

interface LiveActivityBarProps {
  usersOnline: number;
  gamesLive: number;
  recentCopies: number;
  style?: ViewStyle;
}

export function LiveActivityBar({ usersOnline, gamesLive, recentCopies, style }: LiveActivityBarProps) {
  const msgs = [
    `🔴  ${usersOnline} apostando agora`,
    `⚡  ${gamesLive} jogos ao vivo`,
    `📋  ${recentCopies} cópias nos últimos 5min`,
  ];

  const [idx, setIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const iv = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
        setIdx((i) => (i + 1) % msgs.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    }, 3500);
    return () => clearInterval(iv);
  }, [fadeAnim, msgs.length]);

  return (
    <View style={[styles.liveBar, style]}>
      <View style={styles.liveBarDot} />
      <Animated.Text style={[styles.liveBarText, { opacity: fadeAnim }]} numberOfLines={1}>
        {msgs[idx]}
      </Animated.Text>
    </View>
  );
}

// ─── AvatarStack ──────────────────────────────────────────────────────────────
// Overlapping avatar circles showing "N people" social proof.

interface AvatarStackProps {
  count: number;
  max?: number;
  size?: number;
  label?: string;
  style?: ViewStyle;
}

const STACK_COLORS = ['#7C5CFC', '#F5C842', '#00C896', '#FF4D6A', '#FF8C42'];

export const AvatarStack = React.memo(function AvatarStack({ count, max = 4, size = 22, label, style }: AvatarStackProps) {
  const shown = Math.min(count, max);
  const extra = count - shown;

  return (
    <View style={[styles.avatarStack, style]}>
      {Array.from({ length: shown }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.stackCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: STACK_COLORS[i % STACK_COLORS.length],
              marginLeft: i === 0 ? 0 : -(size * 0.35),
              zIndex: shown - i,
            },
          ]}
        >
          <Text style={[styles.stackInitial, { fontSize: size * 0.4 }]}>
            {String.fromCharCode(65 + ((i * 7 + 3) % 26))}
          </Text>
        </View>
      ))}
      {extra > 0 && (
        <View
          style={[
            styles.stackCircle,
            styles.stackExtra,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -(size * 0.35),
              zIndex: 0,
            },
          ]}
        >
          <Text style={[styles.stackExtraText, { fontSize: size * 0.35 }]}>+{extra}</Text>
        </View>
      )}
      {label && <Text style={styles.stackLabel}>{label}</Text>}
    </View>
  );
});

// ─── GlowPulse ────────────────────────────────────────────────────────────────
// Animated glow ring that pulses. Wraps children.

interface GlowPulseProps {
  children: React.ReactNode;
  color?: string;
  active?: boolean;
  intensity?: number;
  style?: ViewStyle;
}

export function GlowPulse({
  children,
  color = colors.primary,
  active = true,
  intensity = 0.2,
  style,
}: GlowPulseProps) {
  const pulseAnim = useRef(new Animated.Value(active ? intensity : 0)).current;

  useEffect(() => {
    if (!active) {
      Animated.timing(pulseAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: intensity, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: intensity * 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [active, intensity, pulseAnim]);

  return (
    <View style={[{ position: 'relative' }, style]}>
      <Animated.View
        style={[
          styles.glowRing,
          { backgroundColor: color, opacity: pulseAnim },
        ]}
      />
      {children}
    </View>
  );
}

// ─── SmoothEntry ──────────────────────────────────────────────────────────────
// Animate children in with fade + slide.

interface SmoothEntryProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  style?: ViewStyle;
}

export function SmoothEntry({
  children,
  delay = 0,
  direction = 'up',
  distance = 16,
  duration = 350,
  style,
}: SmoothEntryProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(translate, { toValue: 0, duration, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, [opacity, translate, delay, duration]);

  const transform =
    direction === 'up' || direction === 'down'
      ? [{ translateY: direction === 'up' ? translate : Animated.multiply(translate, -1) }]
      : [{ translateX: direction === 'left' ? Animated.multiply(translate, -1) : translate }];

  return (
    <Animated.View style={[style, { opacity, transform }]}>{children}</Animated.View>
  );
}

// ─── LiveToast ────────────────────────────────────────────────────────────────
// Toast notification that slides in from top and auto-dismisses.

interface LiveToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  icon?: string;
  color?: string;
}

export function LiveToast({ message, visible, onDismiss, icon = '⚡', color = colors.primary }: LiveToastProps) {
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, friction: 6, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -60, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(onDismiss);
    }, 2500);
    return () => clearTimeout(t);
  }, [visible, translateY, opacity, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { borderColor: color + '40', transform: [{ translateY }], opacity }]}>
      <Text style={styles.toastIcon}>{icon}</Text>
      <Text style={styles.toastText} numberOfLines={1}>{message}</Text>
    </Animated.View>
  );
}

// ─── AnimatedProgress ─────────────────────────────────────────────────────────
// Animated progress bar that smoothly fills.

interface AnimatedProgressProps {
  progress: number; // 0-1
  color?: string;
  height?: number;
  style?: ViewStyle;
  showLabel?: boolean;
}

export function AnimatedProgress({
  progress,
  color = colors.primary,
  height = 4,
  style,
  showLabel,
}: AnimatedProgressProps) {
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, { toValue: progress, duration: 600, useNativeDriver: false }).start();
  }, [fillAnim, progress]);

  return (
    <View style={[styles.progTrack, { height }, style]}>
      <Animated.View
        style={[
          styles.progFill,
          {
            backgroundColor: color,
            width: fillAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
      {showLabel && (
        <Text style={styles.progLabel}>{Math.round(progress * 100)}%</Text>
      )}
    </View>
  );
}

// ─── BetDistribution ──────────────────────────────────────────────────────────
// Shows percentage breakdown of bets (home/draw/away) as colored segments.

interface BetDistributionProps {
  home: number;
  draw: number;
  away: number;
  homeTeam: string;
  awayTeam: string;
  style?: ViewStyle;
}

export const BetDistribution = React.memo(function BetDistribution({ home, draw, away, homeTeam, awayTeam, style }: BetDistributionProps) {
  const total = home + draw + away || 1;
  const hPct = Math.round((home / total) * 100);
  const dPct = Math.round((draw / total) * 100);
  const aPct = 100 - hPct - dPct;

  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, { toValue: 1, duration: 700, useNativeDriver: false }).start();
  }, [barAnim]);

  return (
    <View style={[styles.distContainer, style]}>
      <View style={styles.distLabels}>
        <Text style={styles.distLabel}>{homeTeam} {hPct}%</Text>
        <Text style={styles.distLabel}>Empate {dPct}%</Text>
        <Text style={styles.distLabel}>{awayTeam} {aPct}%</Text>
      </View>
      <View style={styles.distBar}>
        <Animated.View
          style={[
            styles.distSegment,
            {
              backgroundColor: colors.primary,
              flex: hPct,
              opacity: barAnim,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.distSegment,
            {
              backgroundColor: colors.textMuted,
              flex: dPct,
              opacity: barAnim,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.distSegment,
            {
              backgroundColor: colors.orange,
              flex: aPct,
              opacity: barAnim,
            },
          ]}
        />
      </View>
    </View>
  );
});

// ─── RankChange ───────────────────────────────────────────────────────────────
// Shows animated rank change indicator (▲2 or ▼1)

interface RankChangeProps {
  delta: number;
  style?: ViewStyle;
}

export function RankChange({ delta, style }: RankChangeProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (delta === 0) return;
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  }, [delta, scaleAnim]);

  if (delta === 0) return null;

  const positive = delta > 0;

  return (
    <Animated.View
      style={[
        styles.rankChange,
        positive ? styles.rankChangeUp : styles.rankChangeDown,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      <Text style={[styles.rankChangeText, { color: positive ? colors.green : colors.red }]}>
        {positive ? '▲' : '▼'}{Math.abs(delta)}
      </Text>
    </Animated.View>
  );
}

// ─── PulsingDot ───────────────────────────────────────────────────────────────
// Simple pulsing dot for "live" indicators.

interface PulsingDotProps {
  color?: string;
  size?: number;
}

export function PulsingDot({ color = colors.red, size = 6 }: PulsingDotProps) {
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale, { toValue: 2, duration: 800, useNativeDriver: true }),
          Animated.timing(ringScale, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [ringScale, ringOpacity]);

  return (
    <View style={[styles.pulsingDotWrap, { width: size * 3, height: size * 3 }]}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

// ─── CountBadge ───────────────────────────────────────────────────────────────
// Animated counter that bumps on change.

interface CountBadgeProps {
  count: number;
  icon: string;
  style?: ViewStyle;
}

export const CountBadge = React.memo(function CountBadge({ count, icon, style }: CountBadgeProps) {
  const bumpAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);

  useEffect(() => {
    if (count !== prevCount.current) {
      prevCount.current = count;
      Animated.sequence([
        Animated.timing(bumpAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
        Animated.spring(bumpAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [count, bumpAnim]);

  return (
    <Animated.View style={[styles.countBadge, style, { transform: [{ scale: bumpAnim }] }]}>
      <Text style={styles.countBadgeIcon}>{icon}</Text>
      <Text style={styles.countBadgeNum}>{count}</Text>
    </Animated.View>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // FloatingXP
  floatingXP: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 50,
  } as ViewStyle,
  floatingXPText: {
    ...typography.monoBold,
    fontSize: 16,
    textShadowColor: '#00000080',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // LiveActivityBar
  liveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 0.5,
    borderColor: colors.border,
  } as ViewStyle,
  liveBarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  } as ViewStyle,
  liveBarText: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },

  // AvatarStack
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  stackCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bgCard,
  } as ViewStyle,
  stackInitial: {
    ...typography.bodySemiBold,
    color: '#fff',
  },
  stackExtra: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.border,
  } as ViewStyle,
  stackExtraText: {
    ...typography.monoBold,
    color: colors.textMuted,
  },
  stackLabel: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: 4,
  },

  // GlowPulse
  glowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: radius.lg,
  } as ViewStyle,

  // Toast
  toast: {
    position: 'absolute',
    top: 8,
    left: spacing.md,
    right: spacing.md,
    zIndex: 200,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 6,
    borderWidth: 0.5,
  } as ViewStyle,
  toastIcon: { fontSize: 16 },
  toastText: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
  },

  // AnimatedProgress
  progTrack: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
    position: 'relative',
  } as ViewStyle,
  progFill: {
    height: '100%',
    borderRadius: radius.full,
  } as ViewStyle,
  progLabel: {
    position: 'absolute',
    right: 4,
    ...typography.mono,
    fontSize: 8,
    color: colors.textPrimary,
  },

  // BetDistribution
  distContainer: {
    gap: 4,
  } as ViewStyle,
  distLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,
  distLabel: {
    ...typography.mono,
    fontSize: 9,
    color: colors.textMuted,
  },
  distBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: radius.full,
    overflow: 'hidden',
    gap: 1,
  } as ViewStyle,
  distSegment: {
    height: '100%',
    borderRadius: radius.full,
  } as ViewStyle,

  // RankChange
  rankChange: {
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  } as ViewStyle,
  rankChangeUp: {
    backgroundColor: colors.green + '18',
  } as ViewStyle,
  rankChangeDown: {
    backgroundColor: colors.red + '18',
  } as ViewStyle,
  rankChangeText: {
    ...typography.monoBold,
    fontSize: 10,
  },

  // PulsingDot
  pulsingDotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // CountBadge
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  } as ViewStyle,
  countBadgeIcon: { fontSize: 11 },
  countBadgeNum: {
    ...typography.monoBold,
    fontSize: 11,
    color: colors.textPrimary,
  },
});
