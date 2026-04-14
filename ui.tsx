import React, { useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, ViewStyle, Animated, Easing,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing, typography, anim, glass } from '../theme';

// =====================================================
// ScalePress — Stripe/Linear: every tap has weight
// Wraps any element with a satisfying press scale
// =====================================================
export function ScalePress({
  children, onPress, onDoublePress, scale = 0.97, style, disabled,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  onDoublePress?: () => void;
  scale?: number;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lastTap = useRef(0);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scale,
      ...anim.springFast,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...anim.springBouncy,
    }).start();
  };

  const handlePress = () => {
    const now = Date.now();
    if (onDoublePress && now - lastTap.current < 300) {
      onDoublePress();
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;
    if (onPress) {
      setTimeout(() => {
        if (lastTap.current === now) onPress();
      }, onDoublePress ? 300 : 0);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

// =====================================================
// FadeInView — TikTok: content slides into existence
// =====================================================
export function FadeInView({
  children, delay = 0, style, from = 20,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  from?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(from)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1, duration: anim.normal, useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(translateY, {
          toValue: 0, ...anim.springGentle,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

// =====================================================
// Avatar — enhanced with tier ring animation
// =====================================================
const TIER_COLORS: Record<string, [string, string]> = {
  elite:   ['#F5C842', '#3A2E00'],
  gold:    ['#FF8C42', '#3A1C00'],
  silver:  ['#9B95B8', '#1E1A2E'],
  bronze:  ['#C08060', '#2E1A10'],
  default: ['#7C5CFC', '#1A1040'],
};

export function Avatar({ label, size = 36, tier = 'default', ring }: {
  label: string; size?: number; tier?: string; ring?: boolean;
}) {
  const [bg, fg] = TIER_COLORS[tier] ?? TIER_COLORS.default;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (ring && (tier === 'elite' || tier === 'gold')) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sine) }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sine) }),
        ])
      ).start();
    }
  }, [ring, tier]);

  return (
    <Animated.View style={[
      styles.avatar,
      {
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: bg,
        transform: ring ? [{ scale: pulseAnim }] : [],
      },
      ring && { borderWidth: 1.5, borderColor: bg },
    ]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.32, color: fg }]}>{label}</Text>
    </Animated.View>
  );
}

// =====================================================
// Pill — compact badge
// =====================================================
interface PillProps { label: string; color?: string; bg?: string; size?: 'sm' | 'md'; }
export function Pill({ label, color = colors.textSecondary, bg = colors.bgElevated, size = 'sm' }: PillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }, size === 'md' && styles.pillMd]}>
      <Text style={[styles.pillText, { color }, size === 'md' && styles.pillTextMd]}>{label}</Text>
    </View>
  );
}

// =====================================================
// LiveBadge — Twitch: pulsing red dot
// =====================================================
export function LiveBadge({ minute }: { minute?: number }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.6, duration: 900, useNativeDriver: true, easing: Easing.out(Easing.sine) }),
          Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true, easing: Easing.in(Easing.sine) }),
        ]),
        Animated.sequence([
          Animated.timing(glow, { toValue: 0.8, duration: 900, useNativeDriver: true, easing: Easing.out(Easing.sine) }),
          Animated.timing(glow, { toValue: 0.4, duration: 900, useNativeDriver: true, easing: Easing.in(Easing.sine) }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.liveBadge}>
      <View style={styles.liveDotWrap}>
        <Animated.View style={[styles.liveDotGlow, { transform: [{ scale: pulse }], opacity: glow }]} />
        <View style={styles.liveDot} />
      </View>
      <Text style={styles.liveText}>{minute ? `${minute}'` : 'AO VIVO'}</Text>
    </View>
  );
}

// =====================================================
// XPBar — Duolingo: animated fill with shimmer feel
// =====================================================
export function XPBar({ current, max, label }: { current: number; max: number; label?: string }) {
  const fillWidth = useRef(new Animated.Value(0)).current;
  const pct = Math.min((current / max) * 100, 100);

  useEffect(() => {
    Animated.spring(fillWidth, {
      toValue: pct,
      tension: 40,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={{ flex: 1 }}>
      {label && <Text style={styles.xpLabel}>{label}</Text>}
      <View style={styles.xpTrack}>
        <Animated.View style={[
          styles.xpFill,
          { width: fillWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) },
        ]} />
      </View>
    </View>
  );
}

// =====================================================
// ProgressBar — animated with color
// =====================================================
export function ProgressBar({ progress, target, color = colors.primary }: {
  progress: number; target: number; color?: string;
}) {
  const fillWidth = useRef(new Animated.Value(0)).current;
  const pct = Math.min((progress / target) * 100, 100);

  useEffect(() => {
    Animated.spring(fillWidth, {
      toValue: pct, tension: 40, friction: 12, useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[
        styles.progressFill,
        {
          backgroundColor: color,
          width: fillWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
        },
      ]} />
    </View>
  );
}

// =====================================================
// OddsBtn — Bet365: flash green/red on odds change
// =====================================================
interface OddsBtnProps {
  label: string;
  value: number;
  prevValue?: number;
  selected?: boolean;
  onPress: () => void;
  locked?: boolean;
}

export function OddsBtn({ label, value, prevValue, selected, onPress, locked }: OddsBtnProps) {
  const flashAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevVal = useRef(value);

  useEffect(() => {
    if (prevVal.current !== value) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(flashAnim, { toValue: 1, duration: anim.fast, useNativeDriver: false }),
          Animated.spring(scaleAnim, { toValue: 1.04, ...anim.springFast }),
        ]),
        Animated.parallel([
          Animated.timing(flashAnim, { toValue: 0, duration: anim.slow, useNativeDriver: false }),
          Animated.spring(scaleAnim, { toValue: 1, ...anim.spring }),
        ]),
      ]).start();
      prevVal.current = value;
    }
  }, [value]);

  const went_up = prevValue !== undefined ? value > prevValue : false;
  const flashColor = went_up ? colors.green : colors.red;

  const bgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      selected ? colors.primary : colors.bgElevated,
      flashColor + '40',
    ],
  });

  return (
    <ScalePress onPress={onPress} style={{ flex: 1 }} disabled={locked}>
      <Animated.View style={[
        styles.oddsBtn,
        selected && styles.oddsBtnSelected,
        { backgroundColor: bgColor, transform: [{ scale: scaleAnim }] },
      ]}>
        <Text style={[styles.oddsBtnLabel, selected && styles.oddsBtnLabelSel]}>{label}</Text>
        <Text style={[styles.oddsBtnVal, selected && styles.oddsBtnValSel]}>{value.toFixed(2)}</Text>
      </Animated.View>
    </ScalePress>
  );
}

// =====================================================
// Card — Stake: glass card with subtle depth
// =====================================================
export function Card({ children, style, variant = 'default' }: {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'accent' | 'live';
}) {
  const glassStyle = variant === 'glass' ? glass.elevated
    : variant === 'accent' ? glass.accent
    : variant === 'live' ? glass.live
    : undefined;

  return (
    <View style={[styles.card, glassStyle, style]}>
      {children}
    </View>
  );
}

// =====================================================
// SectionHeader — Linear: clean typography hierarchy
// =====================================================
export function SectionHeader({ title, action, onAction }: {
  title: string; action?: string; onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <ScalePress onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </ScalePress>
      )}
    </View>
  );
}

// =====================================================
// PrimaryButton — Vercel: confident, bold CTA
// =====================================================
export function PrimaryButton({ label, onPress, loading, style, variant = 'primary' }: {
  label: string; onPress: () => void; loading?: boolean;
  style?: ViewStyle; variant?: 'primary' | 'success' | 'danger';
}) {
  const bgMap = { primary: colors.primary, success: colors.green, danger: colors.red };
  return (
    <ScalePress onPress={onPress} disabled={loading}>
      <View style={[styles.primaryBtn, { backgroundColor: bgMap[variant] }, style]}>
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.primaryBtnText}>{label}</Text>
        }
      </View>
    </ScalePress>
  );
}

// =====================================================
// GhostButton
// =====================================================
export function GhostButton({ label, onPress, style }: {
  label: string; onPress: () => void; style?: ViewStyle;
}) {
  return (
    <ScalePress onPress={onPress}>
      <View style={[styles.ghostBtn, style]}>
        <Text style={styles.ghostBtnText}>{label}</Text>
      </View>
    </ScalePress>
  );
}

// =====================================================
// HeartBurst — Instagram: double-tap like animation
// =====================================================
export function HeartBurst({ visible }: { visible: boolean }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.2);
      opacity.setValue(1);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.heartBurst, { transform: [{ scale }], opacity }]} pointerEvents="none">
      <Text style={styles.heartBurstIcon}>&#9829;</Text>
    </Animated.View>
  );
}

// =====================================================
// CounterText — Fortnite: animated number transitions
// =====================================================
export function CounterText({ value, style, prefix = '', suffix = '' }: {
  value: number; style?: any; prefix?: string; suffix?: string;
}) {
  const animVal = useRef(new Animated.Value(value)).current;
  const displayRef = useRef(value);
  const [display, setDisplay] = React.useState(value);

  useEffect(() => {
    const start = displayRef.current;
    const diff = value - start;
    if (diff === 0) return;

    const steps = Math.min(Math.abs(diff), 20);
    const stepDuration = Math.max(anim.fast / steps, 16);
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      if (step >= steps) {
        clearInterval(interval);
        displayRef.current = value;
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [value]);

  return <Text style={style}>{prefix}{display.toLocaleString()}{suffix}</Text>;
}

// =====================================================
// TrendingIndicator — Twitter: pulsing trend badge
// =====================================================
export function TrendingIndicator({ count, label }: { count: number; label: string }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sine) }),
        Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sine) }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.trendingBadge, { transform: [{ scale: pulse }] }]}>
      <Text style={styles.trendingCount}>{count.toLocaleString()}</Text>
      <Text style={styles.trendingLabel}>{label}</Text>
    </Animated.View>
  );
}

// =====================================================
// FloatingBar — Bet365: sticky bottom action bar
// =====================================================
export function FloatingBar({ visible, children, style }: {
  visible: boolean; children: React.ReactNode; style?: ViewStyle;
}) {
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : 100,
      ...anim.spring,
    }).start();
  }, [visible]);

  return (
    <Animated.View style={[styles.floatingBar, style, { transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

// =====================================================
// Confetti — Duolingo: celebration burst
// =====================================================
export function CelebrationBurst({ active }: { active: boolean }) {
  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      angle: (i / 12) * Math.PI * 2,
      color: [colors.primary, colors.gold, colors.green, colors.red, colors.orange][i % 5],
    }))
  ).current;

  useEffect(() => {
    if (!active) return;
    const anims = particles.map((p) => {
      p.x.setValue(0);
      p.y.setValue(0);
      p.opacity.setValue(1);
      p.scale.setValue(0.5);
      const dist = 50 + Math.random() * 40;
      return Animated.parallel([
        Animated.timing(p.x, { toValue: Math.cos(p.angle) * dist, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(p.y, { toValue: Math.sin(p.angle) * dist - 20, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.sequence([
          Animated.spring(p.scale, { toValue: 1, tension: 200, friction: 6, useNativeDriver: true }),
          Animated.timing(p.scale, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(p.opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ]);
    });
    Animated.stagger(30, anims).start();
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.celebrationWrap} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }],
            },
          ]}
        />
      ))}
    </View>
  );
}

// =====================================================
// GlowCard — Fortnite: rarity border glow
// =====================================================
export function GlowCard({ children, color, intensity = 'normal', style }: {
  children: React.ReactNode; color: string;
  intensity?: 'subtle' | 'normal' | 'strong'; style?: ViewStyle;
}) {
  const opacityMap = { subtle: 0.08, normal: 0.14, strong: 0.22 };
  const borderMap = { subtle: 0.12, normal: 0.25, strong: 0.4 };

  return (
    <View style={[
      styles.card, style,
      {
        backgroundColor: color + Math.round(opacityMap[intensity] * 255).toString(16).padStart(2, '0'),
        borderColor: color + Math.round(borderMap[intensity] * 255).toString(16).padStart(2, '0'),
        borderWidth: intensity === 'strong' ? 1 : 0.5,
      },
    ]}>
      {children}
    </View>
  );
}

// =====================================================
// tierColor helper
// =====================================================
export function tierColor(tier: string): string {
  const map: Record<string, string> = { elite: colors.gold, gold: colors.orange, silver: '#9B95B8', bronze: '#C08060' };
  return map[tier] ?? colors.primary;
}

// =====================================================
// Styles
// =====================================================
const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: typography.bodySemi },

  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  pillMd: { paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontSize: 10, fontFamily: typography.bodyMed },
  pillTextMd: { fontSize: 12 },

  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.liveGlow,
    borderWidth: 0.5, borderColor: colors.live + '55',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full,
  },
  liveDotWrap: { width: 8, height: 8, alignItems: 'center', justifyContent: 'center' },
  liveDotGlow: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.live },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.live },
  liveText: { fontSize: 10, fontFamily: typography.bodySemi, color: colors.live },

  xpLabel: { fontSize: 11, color: colors.textMuted, fontFamily: typography.body, marginBottom: 4 },
  xpTrack: { height: 4, backgroundColor: colors.bgHighlight, borderRadius: radius.full, overflow: 'hidden' },
  xpFill: { height: '100%' as any, borderRadius: radius.full, backgroundColor: colors.primary },

  progressTrack: { height: 5, backgroundColor: colors.bgHighlight, borderRadius: radius.full, overflow: 'hidden' },
  progressFill: { height: '100%' as any, borderRadius: radius.full },

  oddsBtn: {
    alignItems: 'center', paddingVertical: 10,
    backgroundColor: colors.bgElevated, borderRadius: radius.md,
    borderWidth: 0.5, borderColor: colors.border,
  },
  oddsBtnSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  oddsBtnLabel: { fontSize: 10, color: colors.textMuted, fontFamily: typography.body },
  oddsBtnVal: { fontSize: 16, fontFamily: typography.monoBold, color: colors.textPrimary, marginTop: 2 },
  oddsBtnLabelSel: { color: 'rgba(255,255,255,0.7)' },
  oddsBtnValSel: { color: '#fff' },

  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 0.5, borderColor: colors.border,
    padding: spacing.lg,
  },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  sectionTitle: { fontSize: 13, fontFamily: typography.bodySemi, color: colors.textSecondary, letterSpacing: 0.2 },
  sectionAction: { fontSize: 12, fontFamily: typography.bodyMed, color: colors.primary },

  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { fontFamily: typography.bodySemi, fontSize: 15, color: '#fff', letterSpacing: 0.3 },

  ghostBtn: { borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.lg, paddingVertical: 12, alignItems: 'center' },
  ghostBtnText: { fontFamily: typography.bodyMed, fontSize: 14, color: colors.textSecondary },

  heartBurst: {
    position: 'absolute', top: '35%' as any, left: '40%' as any,
    zIndex: 100,
  },
  heartBurstIcon: { fontSize: 64, color: colors.red },

  trendingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.orange + '18',
    borderWidth: 0.5, borderColor: colors.orange + '44',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full,
  },
  trendingCount: { fontSize: 12, fontFamily: typography.monoBold, color: colors.orange },
  trendingLabel: { fontSize: 11, fontFamily: typography.body, color: colors.orange },

  floatingBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bgCard + 'F5',
    borderTopWidth: 0.5, borderTopColor: colors.border,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    paddingBottom: 28,
  },

  celebrationWrap: {
    position: 'absolute', top: '50%' as any, left: '50%' as any,
    width: 0, height: 0, zIndex: 200,
  },
  particle: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
});
