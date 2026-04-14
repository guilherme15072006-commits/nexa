import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { colors, typography } from '../theme';
import { Assets } from '../assets';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NexaLogoProps {
  size?: 'small' | 'medium' | 'large' | 'splash';
  showImage?: boolean;
  showText?: boolean;
  spinning?: boolean;  // loading state — slow rotation
  glowIntensity?: 'subtle' | 'normal' | 'intense';
}

// ─── Size config ─────────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  small:  { fontSize: 18, letterSpacing: 1, imageSize: 28, glowSize: 36 },
  medium: { fontSize: 20, letterSpacing: 2, imageSize: 40, glowSize: 52 },
  large:  { fontSize: 32, letterSpacing: 3, imageSize: 64, glowSize: 80 },
  splash: { fontSize: 36, letterSpacing: 4, imageSize: 120, glowSize: 160 },
} as const;

const GLOW_OPACITY = { subtle: 0.15, normal: 0.3, intense: 0.5 } as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function NexaLogo({
  size = 'medium',
  showImage = true,
  showText = true,
  spinning = false,
  glowIntensity = 'normal',
}: NexaLogoProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(GLOW_OPACITY[glowIntensity])).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const config = SIZE_CONFIG[size];

  // Entrance scale
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, [scaleAnim]);

  // Glow pulse
  useEffect(() => {
    const intensity = GLOW_OPACITY[glowIntensity];
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: intensity * 0.4, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: intensity, duration: 1500, useNativeDriver: true }),
      ]),
    );
    const textPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.85, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    textPulse.start();
    return () => { pulse.stop(); textPulse.stop(); };
  }, [glowAnim, pulseAnim, glowIntensity]);

  // Spin (loading)
  useEffect(() => {
    if (!spinning) return;
    const spin = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
    );
    spin.start();
    return () => spin.stop();
  }, [spinning, spinAnim]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const textStyle: TextStyle = {
    ...typography.display,
    fontSize: config.fontSize,
    letterSpacing: config.letterSpacing,
    color: colors.primary,
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {showImage && (
        <View style={[styles.imageWrap, { width: config.glowSize, height: config.glowSize }]}>
          {/* Glow ring behind logo */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                width: config.glowSize,
                height: config.glowSize,
                borderRadius: config.glowSize / 2,
                opacity: glowAnim,
              },
            ]}
          />
          <Animated.Image
            source={Assets.logo}
            style={[
              {
                width: config.imageSize,
                height: config.imageSize,
                borderRadius: config.imageSize / 2,
              },
              spinning && { transform: [{ rotate: spinInterpolate }] },
            ]}
            resizeMode="cover"
          />
        </View>
      )}
      {showText && (
        <Animated.Text style={[textStyle, styles.textShadow, { opacity: pulseAnim }]}>
          NEXA
        </Animated.Text>
      )}
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as ViewStyle,
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  glowRing: {
    position: 'absolute',
    backgroundColor: colors.primary,
  } as ViewStyle,
  textShadow: {
    textShadowColor: colors.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});

export default NexaLogo;
