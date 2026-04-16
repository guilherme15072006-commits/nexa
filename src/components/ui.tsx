import React, { useRef, useEffect, useCallback } from 'react';
import { playCelebration } from '../services/sounds';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, radius, anim, glass } from '../theme';

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  uri?: string;
  size?: number;
  username?: string;
}

export function Avatar({ uri, size = 40, username }: AvatarProps) {
  const initial = username ? username[0].toUpperCase() : '?';
  return (
    <View
      style={[
        styles.avatarContainer,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      accessibilityLabel={`Avatar de ${username ?? 'usuário'}`}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.avatarInitial, { fontSize: size * 0.4 }]}>{initial}</Text>
      )}
    </View>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────

interface PillProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}

export function Pill({ label, color = colors.primary, style }: PillProps) {
  return (
    <View style={[styles.pill, { borderColor: color }, style]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── LiveBadge ────────────────────────────────────────────────────────────────

export function LiveBadge() {
  return (
    <View style={styles.liveBadge}>
      <View style={styles.liveDot} />
      <Text style={styles.liveText}>AO VIVO</Text>
    </View>
  );
}

// ─── OddsBtn — Bet365: flash verde/vermelho quando odds mudam ────────────────

interface OddsBtnProps {
  label: string;
  odds: number;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  movement?: -1 | 0 | 1;  // -1 = desceu, 0 = estavel, 1 = subiu
}

export function OddsBtn({ label, odds, selected, onPress, accessibilityLabel, movement = 0 }: OddsBtnProps) {
  const flashAnim = useRef(new Animated.Value(0)).current;
  const prevOddsRef = useRef(odds);

  useEffect(() => {
    if (prevOddsRef.current !== odds && movement !== 0) {
      // Flash animation: pisca e volta
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
      ]).start();
      prevOddsRef.current = odds;
    }
  }, [odds, movement]);

  // Verde se subiu, vermelho se desceu
  const flashColor = movement > 0 ? colors.green : colors.red;
  const bgColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      selected ? (colors.primary + '22') : colors.bgElevated,
      flashColor + '35',
    ],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.oddsBtnTouchable}
      accessibilityLabel={accessibilityLabel ?? `${label} ${odds}`}
      activeOpacity={0.75}
    >
      <Animated.View style={[styles.oddsBtn, selected && styles.oddsBtnSelected, { backgroundColor: bgColor }]}>
        <Text style={styles.oddsBtnLabel}>{label}</Text>
        <Text style={[styles.oddsBtnOdds, selected && styles.oddsBtnOddsSelected]}>
          {odds.toFixed(2)}
        </Text>
        {movement !== 0 && (
          <Text style={[styles.oddsBtnMovement, { color: flashColor }]}>
            {movement > 0 ? '\u25B2' : '\u25BC'}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  featured?: boolean;
  glow?: boolean;
}

export function Card({ children, style, featured, glow }: CardProps) {
  return (
    <View style={[styles.card, featured && styles.cardFeatured, glow && styles.cardGlow, style]}>
      {children}
    </View>
  );
}

// ─── XPBar ────────────────────────────────────────────────────────────────────

interface XPBarProps {
  xp: number;
  xpToNext: number;
  level: number;
  style?: ViewStyle;
}

export function XPBar({ xp, xpToNext, level, style }: XPBarProps) {
  const progress = Math.min(xp / xpToNext, 1);
  return (
    <View style={[styles.xpBarContainer, style]}>
      <View style={styles.xpBarHeader}>
        <Text style={styles.xpBarLevel}>Nível {level}</Text>
        <Text style={styles.xpBarNumbers}>
          {xp} / {xpToNext} XP
        </Text>
      </View>
      <View style={styles.xpBarTrack}>
        <View style={[styles.xpBarFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({ title, action, onAction, style }: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction} accessibilityLabel={action}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── StatBox ──────────────────────────────────────────────────────────────────

interface StatBoxProps {
  label: string;
  value: string;
  color?: string;
  style?: ViewStyle;
}

export function StatBox({ label, value, color = colors.textPrimary, style }: StatBoxProps) {
  return (
    <View style={[styles.statBox, style]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Avatar
  avatarContainer: {
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.border,
  } as ViewStyle,
  avatarInitial: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  } as TextStyle,

  // Pill
  pill: {
    borderWidth: 0.5,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  } as ViewStyle,
  pillText: {
    ...typography.bodyMedium,
    fontSize: 11,
  } as TextStyle,

  // LiveBadge
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.red,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    gap: 4,
  } as ViewStyle,
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
  } as ViewStyle,
  liveText: {
    ...typography.monoBold,
    fontSize: 10,
    color: colors.textPrimary,
    letterSpacing: 0.8,
  } as TextStyle,

  // OddsBtn
  oddsBtnTouchable: {
    flex: 1,
  } as ViewStyle,
  oddsBtn: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 72,
  } as ViewStyle,
  oddsBtnSelected: {
    backgroundColor: colors.primary + '18',
    borderColor: colors.primary,
    borderWidth: 1.5,
  } as ViewStyle,
  oddsBtnLabel: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  } as TextStyle,
  oddsBtnOdds: {
    ...typography.monoBold,
    fontSize: 18,
    color: colors.textPrimary,
  } as TextStyle,
  oddsBtnOddsSelected: {
    color: colors.primary,
  } as TextStyle,
  oddsBtnMovement: {
    ...typography.mono,
    fontSize: 8,
    marginTop: 1,
  } as TextStyle,

  // Card
  card: {
    backgroundColor: colors.bgCard,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  } as ViewStyle,
  cardFeatured: {
    borderWidth: 2,
    borderColor: colors.primary,
  } as ViewStyle,
  cardGlow: {
    borderWidth: 1,
    borderColor: colors.primary + '40',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  // XPBar
  xpBarContainer: {} as ViewStyle,
  xpBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  } as ViewStyle,
  xpBarLevel: {
    ...typography.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
  } as TextStyle,
  xpBarNumbers: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  } as TextStyle,
  xpBarTrack: {
    height: 4,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
  } as ViewStyle,
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  } as ViewStyle,

  // SectionHeader
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  } as ViewStyle,
  sectionTitle: {
    ...typography.displayMedium,
    fontSize: 16,
    color: colors.textPrimary,
  } as TextStyle,
  sectionAction: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.primary,
  } as TextStyle,

  // StatBox
  statBox: {
    alignItems: 'center',
    gap: 2,
  } as ViewStyle,
  statValue: {
    ...typography.monoBold,
    fontSize: 18,
  } as TextStyle,
  statLabel: {
    ...typography.body,
    fontSize: 11,
    color: colors.textMuted,
  } as TextStyle,
});

// ═══════════════════════════════════════════════════════════════
// PREMIUM ANIMATED COMPONENTS — Bet365/Stripe/Duolingo/Fortnite
// ═══════════════════════════════════════════════════════════════

// ─── ScalePress — Stripe: every tap has weight ───────────────

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
    Animated.spring(scaleAnim, { toValue: scale, ...anim.springFast }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, ...anim.springBouncy }).start();
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
      setTimeout(() => { if (lastTap.current === now) onPress(); }, onDoublePress ? 300 : 0);
    }
  };

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} disabled={disabled}>
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>{children}</Animated.View>
    </TouchableWithoutFeedback>
  );
}

// ─── FadeInView — TikTok: content slides in ─────────────────

export function FadeInView({
  children, delay = 0, style, from = 20,
}: {
  children: React.ReactNode; delay?: number; style?: ViewStyle; from?: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(from)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: anim.normal, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.spring(translateY, { toValue: 0, ...anim.springGentle }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>
  );
}

// ─── HeartBurst — Instagram: double-tap like ─────────────────

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
    <Animated.View style={[premiumStyles.heartBurst, { transform: [{ scale }], opacity }]} pointerEvents="none">
      <Text style={premiumStyles.heartBurstIcon}>{'\u2665'}</Text>
    </Animated.View>
  );
}

// ─── CelebrationBurst — Duolingo: confetti ──────────────────

export function CelebrationBurst({ active }: { active: boolean }) {
  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      x: new Animated.Value(0), y: new Animated.Value(0),
      opacity: new Animated.Value(0), scale: new Animated.Value(0),
      angle: (i / 12) * Math.PI * 2,
      color: [colors.primary, colors.gold, colors.green, colors.red, colors.orange][i % 5],
    }))
  ).current;

  useEffect(() => {
    if (!active) return;
    playCelebration();
    const anims = particles.map((p) => {
      p.x.setValue(0); p.y.setValue(0); p.opacity.setValue(1); p.scale.setValue(0.5);
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
    <View style={premiumStyles.celebrationWrap} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View key={i} style={[premiumStyles.particle, {
          backgroundColor: p.color, opacity: p.opacity,
          transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }],
        }]} />
      ))}
    </View>
  );
}

// ─── CounterText — Fortnite: animated numbers ───────────────

export function CounterText({ value, style, prefix = '', suffix = '' }: {
  value: number; style?: TextStyle; prefix?: string; suffix?: string;
}) {
  const [display, setDisplay] = React.useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    const start = displayRef.current;
    const diff = value - start;
    if (diff === 0) return;
    const steps = Math.min(Math.abs(diff), 20);
    const stepDuration = Math.max(anim.fast / steps, 16);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setDisplay(Math.round(start + diff * eased));
      if (step >= steps) { clearInterval(interval); displayRef.current = value; }
    }, stepDuration);
    return () => clearInterval(interval);
  }, [value]);

  return <Text style={style}>{prefix}{display.toLocaleString()}{suffix}</Text>;
}

// ─── TrendingIndicator — Twitter: pulse badge ────────────────

export function TrendingIndicator({ count, label }: { count: number; label: string }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.05, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
    ])).start();
  }, []);
  return (
    <Animated.View style={[premiumStyles.trendingBadge, { transform: [{ scale: pulse }] }]}>
      <Text style={premiumStyles.trendingCount}>{count.toLocaleString()}</Text>
      <Text style={premiumStyles.trendingLabel}>{label}</Text>
    </Animated.View>
  );
}

// ─── FloatingBar — Bet365: sticky bottom bar ─────────────────

export function FloatingBar({ visible, children, style }: {
  visible: boolean; children: React.ReactNode; style?: ViewStyle;
}) {
  const translateY = useRef(new Animated.Value(100)).current;
  useEffect(() => {
    Animated.spring(translateY, { toValue: visible ? 0 : 100, ...anim.spring }).start();
  }, [visible]);
  return (
    <Animated.View style={[premiumStyles.floatingBar, style, { transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

// ─── GlowCard — Fortnite: rarity glow ───────────────────────

export function GlowCard({ children, color, intensity = 'normal', style }: {
  children: React.ReactNode; color: string;
  intensity?: 'subtle' | 'normal' | 'strong'; style?: ViewStyle;
}) {
  const opMap = { subtle: 0.08, normal: 0.14, strong: 0.22 };
  const brMap = { subtle: 0.12, normal: 0.25, strong: 0.4 };
  return (
    <View style={[styles.card, style, {
      backgroundColor: color + Math.round(opMap[intensity] * 255).toString(16).padStart(2, '0'),
      borderColor: color + Math.round(brMap[intensity] * 255).toString(16).padStart(2, '0'),
      borderWidth: intensity === 'strong' ? 1 : 0.5,
    }]}>{children}</View>
  );
}

// ─── PrimaryButton — Vercel: confident CTA ───────────────────

export function PrimaryButton({ label, onPress, loading, style, variant = 'primary' }: {
  label: string; onPress: () => void; loading?: boolean;
  style?: ViewStyle; variant?: 'primary' | 'success' | 'danger';
}) {
  const bgMap = { primary: colors.primary, success: colors.green, danger: colors.red };
  return (
    <ScalePress onPress={onPress} disabled={loading}>
      <View style={[premiumStyles.primaryBtn, { backgroundColor: bgMap[variant] }, style]}>
        {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={premiumStyles.primaryBtnText}>{label}</Text>}
      </View>
    </ScalePress>
  );
}

// ─── Premium Styles ──────────────────────────────────────────

const premiumStyles = StyleSheet.create({
  heartBurst: {
    position: 'absolute', top: '35%' as any, left: '40%' as any, zIndex: 100,
  } as ViewStyle,
  heartBurstIcon: { fontSize: 64, color: colors.red } as TextStyle,

  celebrationWrap: {
    position: 'absolute', top: '50%' as any, left: '50%' as any,
    width: 0, height: 0, zIndex: 200,
  } as ViewStyle,
  particle: { position: 'absolute', width: 6, height: 6, borderRadius: 3 } as ViewStyle,

  trendingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.orange + '18', borderWidth: 0.5,
    borderColor: colors.orange + '44',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full,
  } as ViewStyle,
  trendingCount: { ...typography.monoBold, fontSize: 12, color: colors.orange } as TextStyle,
  trendingLabel: { ...typography.body, fontSize: 11, color: colors.orange } as TextStyle,

  floatingBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.bgCard + 'F5',
    borderTopWidth: 0.5, borderTopColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    paddingBottom: 28,
  } as ViewStyle,

  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: 14, alignItems: 'center',
  } as ViewStyle,
  primaryBtnText: {
    ...typography.bodySemiBold, fontSize: 15, color: '#fff', letterSpacing: 0.3,
  } as TextStyle,
});
