import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { NarrativeCard } from '../store/nexaStore';

// ─── Types ───────────────────────────────────────────────────────────────────

interface NarrativeCardComponentProps {
  card: NarrativeCard;
  onDismiss: (id: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

function NarrativeCardComponent({ card, onDismiss }: NarrativeCardComponentProps) {
  const entryAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth entry
    Animated.spring(entryAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 12,
      bounciness: 6,
    }).start();

    // Shimmer glow loop on border
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]),
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [entryAnim, shimmerAnim]);

  const borderColor = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary, colors.primary + 'AA'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: entryAnim,
          transform: [
            { translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
            { scale: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
          ],
        },
      ]}
    >
      <Animated.View style={[styles.borderAccent, { backgroundColor: borderColor }]} />

      <View style={styles.content}>
        {/* Icon */}
        <Text style={styles.icon}>{card.icon}</Text>

        {/* Text */}
        <Text style={styles.text} numberOfLines={3}>
          {card.content}
        </Text>

        {/* Dismiss */}
        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={() => onDismiss(card.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Fechar narrativa"
          activeOpacity={0.6}
        >
          <Text style={styles.dismissIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  borderAccent: {
    width: 2,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  text: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 19,
  },
  dismissBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.border + '60',
  },
  dismissIcon: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 14,
  },
});

export default NarrativeCardComponent;
