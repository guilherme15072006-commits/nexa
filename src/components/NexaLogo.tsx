import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TextStyle } from 'react-native';
import { colors, typography } from '../theme';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NexaLogoProps {
  size?: 'small' | 'medium' | 'large';
}

// ─── Size config ─────────────────────────────────────────────────────────────

const SIZE_CONFIG: Record<
  NonNullable<NexaLogoProps['size']>,
  { fontSize: number; letterSpacing: number }
> = {
  small:  { fontSize: 18, letterSpacing: 1 },
  medium: { fontSize: 20, letterSpacing: 2 },
  large:  { fontSize: 32, letterSpacing: 3 },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function NexaLogo({ size = 'medium' }: NexaLogoProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const config = SIZE_CONFIG[size];

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  const textStyle: TextStyle = {
    ...typography.display,
    fontSize: config.fontSize,
    letterSpacing: config.letterSpacing,
    color: colors.primary,
  };

  return (
    <Animated.Text style={[textStyle, styles.shadow, { opacity }]}>
      NEXA
    </Animated.Text>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shadow: {
    textShadowColor: colors.primary + '66',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default NexaLogo;
