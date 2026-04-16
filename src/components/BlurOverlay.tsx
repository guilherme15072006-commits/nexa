/**
 * NEXA — Blur Overlay
 *
 * Real frosted glass using @react-native-community/blur.
 * Falls back to semi-transparent View.
 */

import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors } from '../theme';

let BlurView: any = null;
try { BlurView = require('@react-native-community/blur').BlurView; } catch {}

interface BlurOverlayProps {
  intensity?: number;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function BlurOverlay({ intensity = 20, style, children }: BlurOverlayProps) {
  if (BlurView) {
    return (
      <BlurView blurType="dark" blurAmount={intensity} style={[styles.blur, style]} reducedTransparencyFallbackColor={colors.bgCard}>
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[styles.fallback, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  blur: { overflow: 'hidden' },
  fallback: { backgroundColor: 'rgba(13,11,20,0.85)' },
});
