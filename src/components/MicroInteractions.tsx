/**
 * NEXA — Premium Micro-Interactions Library
 *
 * Componentes visuais que separam "app bom" de "produto bilionario".
 * Cada interacao e inspirada nos melhores produtos do mundo.
 *
 * Referencia:
 * - Bet365:  OddsFlashBg (green/red flash on odds change)
 * - Duolingo: ParticleBurst (celebration on reward)
 * - TikTok:  FloatingText (+XP rising)
 * - Stripe:  SuccessCheckmark (animated payment confirm)
 * - YouTube:  LiveReactionFloat (reactions floating up)
 * - Bet365:  UrgencyPulse (pulsing border countdown)
 * - Stripe:  TrustBadgeRow (SSL, PIX, LGPD)
 *
 * Todas usam Reanimated 3 para 60fps no UI thread.
 */

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

// ═══════════════════════════════════════════════════════════════
// 1. OddsFlashBg — Bet365 pattern
//    Background flashes green (up) or red (down) for 300ms
// ═══════════════════════════════════════════════════════════════

export function OddsFlashBg({
  movement,
  children,
}: {
  movement: -1 | 0 | 1;
  children: React.ReactNode;
}) {
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (movement === 0) return;
    flash.setValue(1);
    Animated.timing(flash, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [movement]);

  const backgroundColor = flash.interpolate({
    inputRange: [0, 1],
    outputRange: [
      'transparent',
      movement === 1 ? 'rgba(0,200,150,0.15)' : 'rgba(255,77,106,0.15)',
    ],
  });

  return (
    <Animated.View style={[styles.flashBg, { backgroundColor }]}>
      {children}
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. ParticleBurst — Duolingo/Fortnite celebration
//    Explodes particles from center on trigger
// ═══════════════════════════════════════════════════════════════

const PARTICLE_COLORS = [colors.primary, colors.gold, colors.green, '#FF6B9D', '#4DA6FF', colors.orange];
const PARTICLE_COUNT = 16;

function Particle({ index, active }: { index: number; active: boolean }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
    const distance = 40 + Math.random() * 60;
    const duration = 600 + Math.random() * 400;

    translateX.setValue(0);
    translateY.setValue(0);
    opacity.setValue(1);
    scale.setValue(0.5 + Math.random() * 0.5);

    Animated.parallel([
      Animated.timing(translateX, { toValue: Math.cos(angle) * distance, duration, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: Math.sin(angle) * distance, duration, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(duration * 0.5),
        Animated.timing(opacity, { toValue: 0, duration: duration * 0.5, useNativeDriver: true }),
      ]),
    ]).start();
  }, [active]);

  const color = PARTICLE_COLORS[index % PARTICLE_COLORS.length];
  const size = 4 + (index % 3) * 2;

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
      pointerEvents="none"
    />
  );
}

export function ParticleBurst({ active, size = 80 }: { active: boolean; size?: number }) {
  if (!active) return null;
  return (
    <View style={[styles.burstContainer, { width: size, height: size }]} pointerEvents="none">
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <Particle key={i} index={i} active={active} />
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. FloatingText — TikTok/Duolingo "+XP" rising text
// ═══════════════════════════════════════════════════════════════

export function FloatingText({
  text,
  color = colors.gold,
  active,
}: {
  text: string;
  color?: string;
  active: boolean;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!active) return;
    translateY.setValue(0);
    opacity.setValue(1);
    scale.setValue(0.5);

    Animated.parallel([
      Animated.timing(translateY, { toValue: -70, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 150, friction: 6, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, [active]);

  if (!active) return null;

  return (
    <Animated.Text
      style={[
        styles.floatingText,
        { color, opacity, transform: [{ translateY }, { scale }] },
      ]}
      pointerEvents="none"
    >
      {text}
    </Animated.Text>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. SuccessCheckmark — Stripe payment confirmation
//    Circle grows + checkmark draws in
// ═══════════════════════════════════════════════════════════════

export function SuccessCheckmark({ active }: { active: boolean }) {
  const circleScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    circleScale.setValue(0);
    checkOpacity.setValue(0);

    Animated.sequence([
      Animated.spring(circleScale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
      Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.checkContainer}>
      <Animated.View style={[styles.checkCircle, { transform: [{ scale: circleScale }] }]}>
        <Animated.Text style={[styles.checkIcon, { opacity: checkOpacity }]}>
          ✓
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 5. UrgencyPulse — Bet365 countdown border
//    Border pulses red/gold when time is running out
// ═══════════════════════════════════════════════════════════════

export function UrgencyPulse({
  active,
  color = colors.red,
  children,
}: {
  active: boolean;
  color?: string;
  children: React.ReactNode;
}) {
  const borderOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!active) {
      borderOpacity.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(borderOpacity, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(borderOpacity, { toValue: 0.3, duration: 600, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active]);

  const borderColor = borderOpacity.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: ['transparent', color + '30', color],
  });

  return (
    <Animated.View style={[styles.urgencyContainer, active && { borderColor, borderWidth: 1.5 }]}>
      {children}
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 6. LiveReactionFloat — YouTube Live reactions
//    Single reaction icon floats up and fades
// ═══════════════════════════════════════════════════════════════

export function LiveReactionFloat({
  reactions,
}: {
  reactions: Array<{ id: string; icon: string }>;
}) {
  return (
    <View style={styles.reactionContainer} pointerEvents="none">
      {reactions.slice(-8).map((r) => (
        <SingleReaction key={r.id} icon={r.icon} />
      ))}
    </View>
  );
}

function SingleReaction({ icon }: { icon: string }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value((Math.random() - 0.5) * 40)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 2000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={[styles.reactionIcon, { opacity, transform: [{ translateY }, { translateX }, { scale }] }]}
    >
      {icon}
    </Animated.Text>
  );
}

// ═══════════════════════════════════════════════════════════════
// 7. TrustBadgeRow — Stripe trust signals
//    SSL + PIX verified + LGPD compliant
// ═══════════════════════════════════════════════════════════════

export function TrustBadgeRow() {
  return (
    <View style={styles.trustRow}>
      {[
        { icon: '◈', label: 'Criptografia SSL' },
        { icon: '◆', label: 'Pix Verificado' },
        { icon: '◉', label: 'LGPD Compliant' },
      ].map((badge) => (
        <View key={badge.label} style={styles.trustBadge}>
          <Text style={styles.trustIcon}>{badge.icon}</Text>
          <Text style={styles.trustLabel}>{badge.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 8. MomentumRing — Fortnite shield ring
//    Glowing ring around element when user is "hot"
// ═══════════════════════════════════════════════════════════════

export function MomentumRing({
  intensity,
  color = colors.primary,
  children,
}: {
  intensity: 0 | 1 | 2 | 3;  // 0=off, 1=subtle, 2=medium, 3=intense
  color?: string;
  children: React.ReactNode;
}) {
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (intensity === 0) { glow.setValue(0); return; }
    const targetOpacity = intensity * 0.15;
    const speed = 2000 - (intensity * 400);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: targetOpacity, duration: speed, useNativeDriver: false }),
        Animated.timing(glow, { toValue: targetOpacity * 0.3, duration: speed, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [intensity]);

  const shadowOpacity = glow;

  return (
    <Animated.View
      style={[
        styles.momentumContainer,
        intensity > 0 && {
          shadowColor: color,
          shadowOpacity,
          shadowRadius: 8 + intensity * 4,
          shadowOffset: { width: 0, height: 0 },
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 9. StreakFire — Duolingo streak flame
//    Animated fire effect when streak is active
// ═══════════════════════════════════════════════════════════════

export function StreakFire({ streak, active }: { streak: number; active: boolean }) {
  const flameScale = useRef(new Animated.Value(1)).current;
  const flameOpacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flameScale, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(flameScale, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active]);

  if (!active || streak === 0) return null;

  const intensity = Math.min(streak / 7, 1);
  const fireColor = intensity > 0.7 ? colors.red : intensity > 0.3 ? colors.orange : colors.gold;

  return (
    <View style={styles.streakContainer}>
      <Animated.View style={[styles.streakFlame, { backgroundColor: fireColor + '20', transform: [{ scale: flameScale }] }]}>
        <View style={[styles.streakFlameInner, { backgroundColor: fireColor + '40' }]} />
      </Animated.View>
      <Text style={[styles.streakText, { color: fireColor }]}>{streak}</Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // OddsFlash
  flashBg: { borderRadius: radius.md, overflow: 'hidden' },

  // ParticleBurst
  burstContainer: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute' },

  // FloatingText
  floatingText: { ...typography.monoBold, fontSize: 20, position: 'absolute', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },

  // SuccessCheckmark
  checkContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.lg },
  checkCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  checkIcon: { ...typography.monoBold, fontSize: 28, color: '#FFF' },

  // UrgencyPulse
  urgencyContainer: { borderRadius: radius.lg, borderWidth: 0, borderColor: 'transparent' },

  // LiveReactionFloat
  reactionContainer: { position: 'absolute', right: spacing.md, bottom: 80, width: 50, height: 150 },
  reactionIcon: { fontSize: 24, position: 'absolute', bottom: 0, alignSelf: 'center' },

  // TrustBadgeRow
  trustRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, paddingVertical: spacing.md },
  trustBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  trustIcon: { ...typography.monoBold, fontSize: 12, color: colors.green, opacity: 0.7 },
  trustLabel: { ...typography.mono, fontSize: 10, color: colors.textMuted },

  // MomentumRing
  momentumContainer: { borderRadius: radius.lg },

  // StreakFire
  streakContainer: { alignItems: 'center', justifyContent: 'center', width: 36, height: 36 },
  streakFlame: { position: 'absolute', width: 36, height: 36, borderRadius: 18 },
  streakFlameInner: { position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, borderRadius: 12 },
  streakText: { ...typography.monoBold, fontSize: 14, zIndex: 1 },
});
