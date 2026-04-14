import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { TapScale } from './LiveComponents';
import { hapticSuccess } from '../services/haptics';

// ─── Types ───────────────────────────────────────────────────────────────────

type PowerUpType = 'xp_boost' | 'odds_shield' | 'lucky_streak';

interface PowerUp {
  id: string;
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
  cost: number;
  duration: number;
  active: boolean;
  expiresAt: number | null;
}

interface PowerUpShopProps {
  powerUps: PowerUp[];
  activePowerUps: PowerUp[];
  coins: number;
  onPurchase: (type: PowerUpType) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    return `${h} hora${h > 1 ? 's' : ''}`;
  }
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

function formatCountdown(expiresAt: number): string {
  const remaining = Math.max(0, expiresAt - Date.now());
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

// ─── GlowBorder ──────────────────────────────────────────────────────────────

function GlowBorder({ children, active }: { children: React.ReactNode; active: boolean }) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      glowAnim.setValue(0);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: false }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [active, glowAnim]);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary + '40', colors.primary],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  if (!active) return <>{children}</>;

  return (
    <Animated.View style={[styles.glowWrap, { borderColor, shadowOpacity }]}>
      {children}
    </Animated.View>
  );
}

// ─── PowerUpCard ─────────────────────────────────────────────────────────────

function PowerUpCard({
  powerUp,
  isActive,
  canAfford,
  onPurchase,
}: {
  powerUp: PowerUp;
  isActive: boolean;
  canAfford: boolean;
  onPurchase: () => void;
}) {
  const disabled = !canAfford && !isActive;

  function handlePurchase() {
    hapticSuccess();
    onPurchase();
  }

  return (
    <GlowBorder active={isActive}>
      <View style={[styles.card, disabled && styles.cardDisabled]}>
        {/* Icon */}
        <Text style={styles.cardIcon}>{powerUp.icon}</Text>

        {/* Name */}
        <Text style={[styles.cardName, disabled && styles.textDisabled]} numberOfLines={1}>
          {powerUp.name}
        </Text>

        {/* Description */}
        <Text style={[styles.cardDesc, disabled && styles.textDisabled]} numberOfLines={2}>
          {powerUp.description}
        </Text>

        {/* Duration */}
        <Text style={styles.cardDuration}>{formatDuration(powerUp.duration)}</Text>

        {/* Cost */}
        <Text style={[styles.cardCost, disabled && styles.textDisabled]}>
          {powerUp.cost} <Text style={styles.coinEmoji}>🪙</Text>
        </Text>

        {/* Action */}
        {isActive ? (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ATIVO</Text>
            {powerUp.expiresAt && (
              <Text style={styles.activeCountdown}>{formatCountdown(powerUp.expiresAt)}</Text>
            )}
          </View>
        ) : disabled ? (
          <View style={styles.disabledBadge}>
            <Text style={styles.disabledBadgeText}>Sem moedas</Text>
          </View>
        ) : (
          <TapScale onPress={handlePurchase}>
            <View style={styles.buyBtn}>
              <Text style={styles.buyBtnText}>Comprar</Text>
            </View>
          </TapScale>
        )}
      </View>
    </GlowBorder>
  );
}

// ─── PowerUpShop Component ───────────────────────────────────────────────────

export default function PowerUpShop({ powerUps, activePowerUps, coins, onPurchase }: PowerUpShopProps) {
  const activeIds = new Set(activePowerUps.map(p => p.id));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>⚡ Power-Ups</Text>
        <Text style={styles.coinBalance}>{coins} 🪙</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {powerUps.map(pu => (
          <PowerUpCard
            key={pu.id}
            powerUp={pu}
            isActive={activeIds.has(pu.id) || pu.active}
            canAfford={coins >= pu.cost}
            onPurchase={() => onPurchase(pu.type)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    ...typography.displayMedium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  coinBalance: {
    ...typography.monoBold,
    fontSize: 13,
    color: colors.gold,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },

  // Glow wrapper
  glowWrap: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 8,
  },

  // Card
  card: {
    width: 140,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.sm + 2,
    gap: 6,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardIcon: {
    fontSize: 32,
    lineHeight: 40,
  },
  cardName: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cardDesc: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 28,
  },
  cardDuration: {
    ...typography.mono,
    fontSize: 10,
    color: colors.textSecondary,
  },
  cardCost: {
    ...typography.monoBold,
    fontSize: 14,
    color: colors.gold,
  },
  coinEmoji: {
    fontSize: 12,
  },
  textDisabled: {
    color: colors.textMuted,
  },

  // Active badge
  activeBadge: {
    backgroundColor: colors.green + '22',
    borderWidth: 0.5,
    borderColor: colors.green + '60',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    gap: 2,
  },
  activeBadgeText: {
    ...typography.monoBold,
    fontSize: 10,
    color: colors.green,
    letterSpacing: 0.8,
  },
  activeCountdown: {
    ...typography.mono,
    fontSize: 9,
    color: colors.green,
  },

  // Disabled badge
  disabledBadge: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  disabledBadgeText: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },

  // Buy button
  buyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
  },
  buyBtnText: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: colors.textPrimary,
  },
});
