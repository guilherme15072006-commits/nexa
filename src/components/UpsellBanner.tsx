/**
 * NEXA — Contextual Upsell Banner
 *
 * Reusable component that shows when a user tries to access
 * a feature locked behind Pro or Elite tier.
 *
 * Usage:
 *   <UpsellBanner
 *     feature="elite_tipsters"
 *     message="Pro desbloqueia tipsters elite"
 *   />
 *
 * Shows nothing if user already has the required tier.
 */

import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TapScale } from './LiveComponents';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, TIER_FEATURES, type SubscriptionTier } from '../store/nexaStore';
import { hapticMedium } from '../services/haptics';
import { isTrialAvailable } from '../services/billing';

interface UpsellBannerProps {
  feature: string;
  message?: string;
  compact?: boolean;
}

const TIER_LABELS: Record<SubscriptionTier, string> = {
  free: 'Free',
  pro: 'Pro',
  elite: 'Elite',
};

const TIER_COLORS: Record<SubscriptionTier, string> = {
  free: colors.textMuted,
  pro: colors.primary,
  elite: colors.gold,
};

export function UpsellBanner({ feature, message, compact }: UpsellBannerProps) {
  const navigation = useNavigation();
  const isLocked = useNexaStore(s => s.isFeatureLocked(feature));
  const requiredTier = TIER_FEATURES[feature] ?? 'pro';
  const trialAvailable = isTrialAvailable();

  const handlePress = useCallback(() => {
    hapticMedium();
    navigation.navigate('Subscription' as never);
  }, [navigation]);

  if (!isLocked) return null;

  const tierColor = TIER_COLORS[requiredTier];
  const tierLabel = TIER_LABELS[requiredTier];
  const defaultMsg = `${tierLabel} desbloqueia este recurso`;
  const displayMsg = message ?? defaultMsg;

  if (compact) {
    return (
      <TapScale onPress={handlePress}>
        <View style={[styles.compactBanner, { borderColor: tierColor + '40' }]}>
          <Text style={[styles.compactBadge, { backgroundColor: tierColor }]}>{tierLabel}</Text>
          <Text style={styles.compactText} numberOfLines={1}>{displayMsg}</Text>
          <Text style={[styles.compactCta, { color: tierColor }]}>
            {trialAvailable ? '7 dias gratis' : 'Ver planos'}
          </Text>
        </View>
      </TapScale>
    );
  }

  return (
    <TapScale onPress={handlePress}>
      <View style={[styles.banner, { borderColor: tierColor + '30' }]}>
        <View style={styles.bannerTop}>
          <View style={[styles.tierBadge, { backgroundColor: tierColor + '15' }]}>
            <Text style={[styles.tierIcon, { color: tierColor }]}>
              {requiredTier === 'elite' ? '👑' : '⚡'}
            </Text>
            <Text style={[styles.tierText, { color: tierColor }]}>{tierLabel}</Text>
          </View>
          {trialAvailable && (
            <View style={styles.trialBadge}>
              <Text style={styles.trialText}>7 DIAS GRATIS</Text>
            </View>
          )}
        </View>
        <Text style={styles.bannerMessage}>{displayMsg}</Text>
        <View style={[styles.ctaButton, { backgroundColor: tierColor }]}>
          <Text style={styles.ctaText}>
            {trialAvailable ? 'Comecar trial gratis' : `Assinar ${tierLabel}`}
          </Text>
        </View>
      </View>
    </TapScale>
  );
}

const styles = StyleSheet.create({
  // Full banner
  banner: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
    marginVertical: spacing.sm,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  tierIcon: { fontSize: 14 },
  tierText: {
    ...typography.monoBold,
    fontSize: 12,
    letterSpacing: 1,
  },
  trialBadge: {
    backgroundColor: colors.green + '20',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  trialText: {
    ...typography.monoBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 1,
  },
  bannerMessage: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  ctaButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  ctaText: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: '#FFF',
  },

  // Compact banner (inline)
  compactBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 0.5,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginVertical: spacing.xs,
  },
  compactBadge: {
    ...typography.monoBold,
    fontSize: 10,
    color: '#FFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  compactText: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  compactCta: {
    ...typography.bodySemiBold,
    fontSize: 12,
  },
});
