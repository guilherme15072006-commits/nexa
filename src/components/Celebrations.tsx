import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography, shadows } from '../theme';
import { hapticHeavy, hapticSuccess } from '../services/haptics';
import { playLevelUp, playStreakFire } from '../services/sounds';

const { width: W, height: H } = Dimensions.get('window');

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  colors.primary, colors.gold, colors.green, colors.red,
  colors.orange, '#4DA6FF', '#B44DFF', '#FF69B4',
];
const PARTICLE_COUNT = 40;

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
  shape: 'rect' | 'circle';
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: new Animated.Value(W / 2 + (Math.random() - 0.5) * 60),
    y: new Animated.Value(-20),
    rotate: new Animated.Value(0),
    opacity: new Animated.Value(1),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 6,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

export function Confetti({ active, duration = 2200 }: ConfettiProps) {
  const [particles] = useState(() => createParticles());

  useEffect(() => {
    if (!active) return;

    const anims = particles.map((p, i) => {
      const targetX = (Math.random() - 0.5) * W * 1.2 + W / 2;
      const targetY = H * 0.6 + Math.random() * H * 0.4;
      const delay = i * 25;

      p.x.setValue(W / 2 + (Math.random() - 0.5) * 80);
      p.y.setValue(-20 - Math.random() * 40);
      p.rotate.setValue(0);
      p.opacity.setValue(1);

      return Animated.parallel([
        Animated.timing(p.x, {
          toValue: targetX,
          duration: duration - delay,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: targetY,
          duration: duration - delay,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: 360 * (2 + Math.random() * 3),
          duration: duration - delay,
          delay,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(delay + (duration - delay) * 0.7),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: (duration - delay) * 0.3,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(anims).start();
  }, [active, particles, duration]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.shape === 'rect' ? p.size * 0.6 : p.size,
            borderRadius: p.shape === 'circle' ? p.size / 2 : 2,
            backgroundColor: p.color,
            transform: [
              { translateX: p.x },
              { translateY: p.y },
              {
                rotate: p.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
            opacity: p.opacity,
          }}
        />
      ))}
    </View>
  );
}

// ─── LevelUpOverlay ───────────────────────────────────────────────────────────

interface LevelUpOverlayProps {
  visible: boolean;
  level: number;
  onDismiss: () => void;
}

export function LevelUpOverlay({ visible, level, onDismiss }: LevelUpOverlayProps) {
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.6)).current;
  const levelScale = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.5)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!visible) {
      bgOpacity.setValue(0);
      cardScale.setValue(0.6);
      levelScale.setValue(0);
      ringScale.setValue(0.5);
      ringOpacity.setValue(0);
      setShowConfetti(false);
      return;
    }

    hapticHeavy();
    playLevelUp();
    setShowConfetti(true);

    // Phase 1: bg + card
    Animated.parallel([
      Animated.timing(bgOpacity, { toValue: 0.85, duration: 250, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    // Phase 2: level number with ring burst
    const t1 = setTimeout(() => {
      Animated.parallel([
        Animated.spring(levelScale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: 2.5, duration: 500, useNativeDriver: true }),
      ]).start();
      hapticSuccess();
    }, 300);

    // Phase 3: ring fades
    const t2 = setTimeout(() => {
      Animated.timing(ringOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    }, 700);

    // Auto dismiss
    const t3 = setTimeout(() => {
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(cardScale, { toValue: 0.8, duration: 300, useNativeDriver: true }),
      ]).start(onDismiss);
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible, bgOpacity, cardScale, levelScale, ringScale, ringOpacity, onDismiss]);

  if (!visible) return null;

  return (
    <View style={styles.overlayWrap}>
      <Confetti active={showConfetti} />

      <Animated.View style={[styles.overlayBg, { opacity: bgOpacity }]} />

      <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} onPress={onDismiss}>
        <Animated.View style={[styles.levelCard, { transform: [{ scale: cardScale }] }]}>
          {/* Ring burst */}
          <Animated.View
            style={[
              styles.levelRing,
              { transform: [{ scale: ringScale }], opacity: ringOpacity },
            ]}
          />

          <Text style={styles.levelEyebrow}>PARABENS!</Text>

          <Animated.View style={{ transform: [{ scale: levelScale }] }}>
            <Text style={styles.levelNumber}>{level}</Text>
          </Animated.View>

          <Text style={styles.levelTitle}>Nivel {level} Alcancado</Text>

          <View style={styles.levelRewards}>
            <View style={styles.levelRewardItem}>
              <Text style={styles.levelRewardIcon}>🎁</Text>
              <Text style={styles.levelRewardText}>+500 XP bonus</Text>
            </View>
            <View style={styles.levelRewardItem}>
              <Text style={styles.levelRewardIcon}>🪙</Text>
              <Text style={styles.levelRewardText}>+200 moedas</Text>
            </View>
          </View>

          <Text style={styles.levelDismiss}>toque para continuar</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

// ─── StreakCelebration ─────────────────────────────────────────────────────────

interface StreakCelebrationProps {
  visible: boolean;
  streak: number;
  onDismiss: () => void;
}

export function StreakCelebration({ visible, streak, onDismiss }: StreakCelebrationProps) {
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.6)).current;
  const fireScale = useRef(new Animated.Value(0)).current;
  const [showConfetti, setShowConfetti] = useState(false);

  const isMilestone = streak > 0 && (streak % 3 === 0 || streak === 1 || streak >= 7);

  useEffect(() => {
    if (!visible || !isMilestone) {
      onDismiss();
      return;
    }

    hapticSuccess();
    playStreakFire();
    setShowConfetti(streak >= 7);

    Animated.parallel([
      Animated.timing(bgOpacity, { toValue: 0.8, duration: 250, useNativeDriver: true }),
      Animated.spring(cardScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    const t1 = setTimeout(() => {
      Animated.spring(fireScale, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }).start();
    }, 200);

    const t2 = setTimeout(() => {
      Animated.parallel([
        Animated.timing(bgOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(cardScale, { toValue: 0.8, duration: 300, useNativeDriver: true }),
      ]).start(onDismiss);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [visible, isMilestone, streak, bgOpacity, cardScale, fireScale, onDismiss]);

  if (!visible || !isMilestone) return null;

  const streakMsg =
    streak >= 7 ? 'Lendario!' :
    streak >= 6 ? 'Imparavel!' :
    streak >= 3 ? 'Em chamas!' :
    'Sequencia!';

  return (
    <View style={styles.overlayWrap}>
      {showConfetti && <Confetti active={showConfetti} />}

      <Animated.View style={[styles.overlayBg, { opacity: bgOpacity }]} />

      <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} onPress={onDismiss}>
        <Animated.View style={[styles.streakCard, { transform: [{ scale: cardScale }] }]}>
          <Animated.Text style={[styles.streakFire, { transform: [{ scale: fireScale }] }]}>
            🔥
          </Animated.Text>
          <Text style={styles.streakCount}>{streak} dias</Text>
          <Text style={styles.streakMsg}>{streakMsg}</Text>
          <Text style={styles.streakReward}>+50 XP  ·  +100 🪙  ·  Streak bonus</Text>
          <Text style={styles.levelDismiss}>toque para continuar</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlayWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  } as ViewStyle,
  overlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  } as ViewStyle,
  overlayTouch: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Level Up
  levelCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    width: 280,
    borderWidth: 2,
    borderColor: colors.gold + '60',
    ...shadows.md,
    overflow: 'visible',
  } as ViewStyle,
  levelRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.gold,
    top: '50%',
    marginTop: -60,
  } as ViewStyle,
  levelEyebrow: {
    ...typography.monoBold,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  levelNumber: {
    ...typography.display,
    fontSize: 72,
    color: colors.gold,
    lineHeight: 80,
  },
  levelTitle: {
    ...typography.display,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  levelRewards: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  } as ViewStyle,
  levelRewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  } as ViewStyle,
  levelRewardIcon: { fontSize: 18 },
  levelRewardText: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  levelDismiss: {
    ...typography.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Streak
  streakCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    width: 260,
    borderWidth: 2,
    borderColor: colors.orange + '60',
    ...shadows.md,
  } as ViewStyle,
  streakFire: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  streakCount: {
    ...typography.display,
    fontSize: 32,
    color: colors.orange,
  },
  streakMsg: {
    ...typography.displayMedium,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  streakReward: {
    ...typography.mono,
    fontSize: 12,
    color: colors.green,
    marginBottom: spacing.sm,
  },
});
