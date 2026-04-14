import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { hapticHeavy, hapticSuccess } from '../services/haptics';
import { playMissionComplete } from '../services/sounds';

const { width: W, height: H } = Dimensions.get('window');

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LootReward {
  type: 'coins' | 'xp' | 'badge' | 'powerup';
  label: string;
  amount: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface LootBoxProps {
  visible: boolean;
  reward: LootReward;
  onDismiss: () => void;
}

// ─── Rarity Colors ──────────────────────────────────────────────────────────

const RARITY_COLORS: Record<LootReward['rarity'], string> = {
  common: '#8B8B9E',
  rare: '#4DA6FF',
  epic: colors.primary,
  legendary: colors.gold,
};

const RARITY_LABELS: Record<LootReward['rarity'], string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: '\u00C9pico',
  legendary: 'Lend\u00E1rio',
};

// ─── Burst Particle ─────────────────────────────────────────────────────────

interface BurstParticle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
}

function createBurstParticles(count: number, rarityColor: string): BurstParticle[] {
  const particleColors = [rarityColor, colors.gold, colors.primary, '#FFFFFF'];
  return Array.from({ length: count }, () => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    opacity: new Animated.Value(1),
    scale: new Animated.Value(0),
    color: particleColors[Math.floor(Math.random() * particleColors.length)],
  }));
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function LootBox({ visible, reward, onDismiss }: LootBoxProps) {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'revealed'>('closed');

  // Animations
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const boxScale = useRef(new Animated.Value(0)).current;
  const boxRotate = useRef(new Animated.Value(0)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const explodeScale = useRef(new Animated.Value(1)).current;
  const explodeOpacity = useRef(new Animated.Value(1)).current;
  const rewardScale = useRef(new Animated.Value(0)).current;
  const rewardOpacity = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.4)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  const rarityColor = RARITY_COLORS[reward.rarity];
  const [particles] = useState(() => createBurstParticles(16, rarityColor));

  const wobbleRef = useRef<Animated.CompositeAnimation | null>(null);
  const autoDismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Enter animation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setPhase('closed');
      overlayOpacity.setValue(0);
      boxScale.setValue(0);
      boxRotate.setValue(0);
      wobbleAnim.setValue(0);
      explodeScale.setValue(1);
      explodeOpacity.setValue(1);
      rewardScale.setValue(0);
      rewardOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(boxScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start(() => {
        startWobble();
        startGlowPulse();
      });
    } else {
      if (wobbleRef.current) wobbleRef.current.stop();
      if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
    }

    return () => {
      if (wobbleRef.current) wobbleRef.current.stop();
      if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // ── Wobble loop ─────────────────────────────────────────────────────────
  const startWobble = useCallback(() => {
    const seq = Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleAnim, {
          toValue: 1,
          duration: 120,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnim, {
          toValue: -1,
          duration: 120,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnim, {
          toValue: 0.7,
          duration: 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnim, {
          toValue: -0.5,
          duration: 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(wobbleAnim, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.delay(400),
      ]),
    );
    wobbleRef.current = seq;
    seq.start();
  }, [wobbleAnim]);

  // ── Glow pulse ──────────────────────────────────────────────────────────
  const startGlowPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 0.8,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.4,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [glowPulse]);

  // ── Open box ────────────────────────────────────────────────────────────
  const handleOpen = useCallback(() => {
    if (phase !== 'closed') return;
    setPhase('opening');
    hapticHeavy();

    if (wobbleRef.current) wobbleRef.current.stop();

    // Explode box
    Animated.parallel([
      Animated.timing(explodeScale, {
        toValue: 3,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(explodeOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Burst particles
    const burstAnims = particles.map((p, i) => {
      const angle = (i / particles.length) * Math.PI * 2;
      const dist = 80 + Math.random() * 60;
      return Animated.parallel([
        Animated.timing(p.x, {
          toValue: Math.cos(angle) * dist,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: Math.sin(angle) * dist,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(p.scale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(p.scale, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(20, burstAnims).start();

    // Reveal reward after explosion
    setTimeout(() => {
      setPhase('revealed');
      hapticSuccess();
      playMissionComplete();

      // Shimmer animation
      Animated.loop(
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      Animated.spring(rewardScale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }).start();

      Animated.timing(rewardOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Auto-dismiss after 3 seconds
      autoDismissRef.current = setTimeout(() => {
        handleDismiss();
      }, 3000);
    }, 450);
  }, [phase, particles, explodeScale, explodeOpacity, rewardScale, rewardOpacity, shimmer]);

  // ── Dismiss ─────────────────────────────────────────────────────────────
  const handleDismiss = useCallback(() => {
    if (autoDismissRef.current) clearTimeout(autoDismissRef.current);

    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  }, [overlayOpacity, onDismiss]);

  if (!visible) return null;

  const wobbleRotate = wobbleAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={phase === 'revealed' ? handleDismiss : undefined}
      />

      {/* Burst particles */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: p.scale },
              ],
            },
          ]}
        />
      ))}

      {/* Box (closed phase) */}
      {phase !== 'revealed' && (
        <Animated.View
          style={[
            styles.boxContainer,
            {
              opacity: explodeOpacity,
              transform: [
                { scale: Animated.multiply(boxScale, explodeScale) },
                { rotate: wobbleRotate },
              ],
            },
          ]}
        >
          {/* Glow behind box */}
          <Animated.View
            style={[
              styles.boxGlow,
              {
                backgroundColor: rarityColor,
                opacity: glowPulse,
              },
            ]}
          />
          <View style={[styles.box, { borderColor: rarityColor }]}>
            <Text style={styles.boxEmoji}>{'\uD83D\uDCE6'}</Text>
          </View>
          <Text style={[styles.rarityBadge, { color: rarityColor }]}>
            {RARITY_LABELS[reward.rarity]}
          </Text>
        </Animated.View>
      )}

      {/* Open Button (closed phase) */}
      {phase === 'closed' && (
        <Animated.View style={[styles.openBtnContainer, { opacity: boxScale }]}>
          <TouchableOpacity
            style={[styles.openBtn, { backgroundColor: rarityColor }]}
            onPress={handleOpen}
            activeOpacity={0.8}
          >
            <Text style={styles.openBtnText}>Abrir</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Reward card (revealed phase) */}
      {phase === 'revealed' && (
        <Animated.View
          style={[
            styles.rewardContainer,
            {
              opacity: rewardOpacity,
              transform: [{ scale: rewardScale }],
            },
          ]}
        >
          <View style={[styles.rewardGlow, { backgroundColor: rarityColor + '30' }]} />
          <View style={[styles.rewardCard, { borderColor: rarityColor }]}>
            <View style={[styles.rewardRarityStrip, { backgroundColor: rarityColor }]}>
              <Text style={styles.rewardRarityText}>
                {RARITY_LABELS[reward.rarity].toUpperCase()}
              </Text>
            </View>
            <Text style={styles.rewardIcon}>{reward.icon}</Text>
            <Text style={styles.rewardLabel}>{reward.label}</Text>
            <Text style={[styles.rewardAmount, { color: rarityColor }]}>
              +{reward.amount}
            </Text>
            <Text style={styles.rewardType}>
              {reward.type === 'coins'
                ? 'moedas'
                : reward.type === 'xp'
                ? 'XP'
                : reward.type === 'badge'
                ? 'badge'
                : 'powerup'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={handleDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissBtnText}>Fechar</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },

  // Particles
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Box
  boxContainer: {
    alignItems: 'center',
  },
  boxGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -20,
  },
  box: {
    width: 120,
    height: 120,
    borderRadius: radius.xl,
    backgroundColor: colors.bgElevated,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxEmoji: {
    fontSize: 56,
  },
  rarityBadge: {
    ...typography.monoBold,
    fontSize: 12,
    marginTop: spacing.sm,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Open button
  openBtnContainer: {
    position: 'absolute',
    bottom: H * 0.25,
  },
  openBtn: {
    paddingHorizontal: spacing.lg * 2,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  openBtnText: {
    ...typography.display,
    fontSize: 18,
    color: '#FFFFFF',
  },

  // Reward
  rewardContainer: {
    alignItems: 'center',
  },
  rewardGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  rewardCard: {
    width: 200,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  rewardRarityStrip: {
    width: '100%',
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rewardRarityText: {
    ...typography.monoBold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  rewardIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  rewardLabel: {
    ...typography.displayMedium,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  rewardAmount: {
    ...typography.display,
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  rewardType: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Dismiss
  dismissBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  dismissBtnText: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
  },
});
