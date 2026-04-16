/**
 * NEXA — Gradient Card
 *
 * Wraps content with real LinearGradient from theme.gradients.
 * Falls back to solid color if package unavailable.
 */

import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { gradients, radius } from '../theme';

let LinearGradient: any = null;
try { LinearGradient = require('react-native-linear-gradient').default; } catch {}

type GradientName = keyof typeof gradients;

interface GradientCardProps {
  gradient?: GradientName;
  colors?: readonly string[];
  style?: ViewStyle;
  children: React.ReactNode;
}

export function GradientCard({ gradient = 'primary', colors: customColors, style, children }: GradientCardProps) {
  const gradientColors = customColors ?? [...gradients[gradient]];

  if (LinearGradient) {
    return (
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, style]}>
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: gradientColors[1] + '20' }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, overflow: 'hidden' },
});
