import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, radius } from '../theme';

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  uri?: string;
  size?: number;
  username?: string;
}

export function Avatar({ uri, size = 40, username }: AvatarProps) {
  const initial = username ? username[0].toUpperCase() : '?';
  return (
    <View
      style={[
        styles.avatarContainer,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      accessibilityLabel={`Avatar de ${username ?? 'usuário'}`}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.avatarInitial, { fontSize: size * 0.4 }]}>{initial}</Text>
      )}
    </View>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────────

interface PillProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}

export function Pill({ label, color = colors.primary, style }: PillProps) {
  return (
    <View style={[styles.pill, { borderColor: color }, style]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

// ─── LiveBadge ────────────────────────────────────────────────────────────────

export function LiveBadge() {
  return (
    <View style={styles.liveBadge}>
      <View style={styles.liveDot} />
      <Text style={styles.liveText}>AO VIVO</Text>
    </View>
  );
}

// ─── OddsBtn ──────────────────────────────────────────────────────────────────

interface OddsBtnProps {
  label: string;
  odds: number;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function OddsBtn({ label, odds, selected, onPress, accessibilityLabel }: OddsBtnProps) {
  return (
    <TouchableOpacity
      style={[styles.oddsBtn, selected && styles.oddsBtnSelected]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? `${label} ${odds}`}
      activeOpacity={0.75}
    >
      <Text style={styles.oddsBtnLabel}>{label}</Text>
      <Text style={[styles.oddsBtnOdds, selected && styles.oddsBtnOddsSelected]}>
        {odds.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  featured?: boolean;
  glow?: boolean;
}

export function Card({ children, style, featured, glow }: CardProps) {
  return (
    <View style={[styles.card, featured && styles.cardFeatured, glow && styles.cardGlow, style]}>
      {children}
    </View>
  );
}

// ─── XPBar ────────────────────────────────────────────────────────────────────

interface XPBarProps {
  xp: number;
  xpToNext: number;
  level: number;
  style?: ViewStyle;
}

export function XPBar({ xp, xpToNext, level, style }: XPBarProps) {
  const progress = Math.min(xp / xpToNext, 1);
  return (
    <View style={[styles.xpBarContainer, style]}>
      <View style={styles.xpBarHeader}>
        <Text style={styles.xpBarLevel}>Nível {level}</Text>
        <Text style={styles.xpBarNumbers}>
          {xp} / {xpToNext} XP
        </Text>
      </View>
      <View style={styles.xpBarTrack}>
        <View style={[styles.xpBarFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({ title, action, onAction, style }: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction} accessibilityLabel={action}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── StatBox ──────────────────────────────────────────────────────────────────

interface StatBoxProps {
  label: string;
  value: string;
  color?: string;
  style?: ViewStyle;
}

export function StatBox({ label, value, color = colors.textPrimary, style }: StatBoxProps) {
  return (
    <View style={[styles.statBox, style]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Avatar
  avatarContainer: {
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: colors.border,
  } as ViewStyle,
  avatarInitial: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  } as TextStyle,

  // Pill
  pill: {
    borderWidth: 0.5,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  } as ViewStyle,
  pillText: {
    ...typography.bodyMedium,
    fontSize: 11,
  } as TextStyle,

  // LiveBadge
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.red,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    gap: 4,
  } as ViewStyle,
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.textPrimary,
  } as ViewStyle,
  liveText: {
    ...typography.monoBold,
    fontSize: 10,
    color: colors.textPrimary,
    letterSpacing: 0.8,
  } as TextStyle,

  // OddsBtn
  oddsBtn: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 2,
  } as ViewStyle,
  oddsBtnSelected: {
    backgroundColor: colors.primary + '22',
    borderColor: colors.primary,
  } as ViewStyle,
  oddsBtnLabel: {
    ...typography.body,
    fontSize: 11,
    color: colors.textSecondary,
  } as TextStyle,
  oddsBtnOdds: {
    ...typography.monoBold,
    fontSize: 15,
    color: colors.textPrimary,
  } as TextStyle,
  oddsBtnOddsSelected: {
    color: colors.primary,
  } as TextStyle,

  // Card
  card: {
    backgroundColor: colors.bgCard,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  } as ViewStyle,
  cardFeatured: {
    borderWidth: 2,
    borderColor: colors.primary,
  } as ViewStyle,
  cardGlow: {
    borderWidth: 1,
    borderColor: colors.primary + '40',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  // XPBar
  xpBarContainer: {} as ViewStyle,
  xpBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  } as ViewStyle,
  xpBarLevel: {
    ...typography.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
  } as TextStyle,
  xpBarNumbers: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  } as TextStyle,
  xpBarTrack: {
    height: 4,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
  } as ViewStyle,
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  } as ViewStyle,

  // SectionHeader
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  } as ViewStyle,
  sectionTitle: {
    ...typography.displayMedium,
    fontSize: 16,
    color: colors.textPrimary,
  } as TextStyle,
  sectionAction: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.primary,
  } as TextStyle,

  // StatBox
  statBox: {
    alignItems: 'center',
    gap: 2,
  } as ViewStyle,
  statValue: {
    ...typography.monoBold,
    fontSize: 18,
  } as TextStyle,
  statLabel: {
    ...typography.body,
    fontSize: 11,
    color: colors.textMuted,
  } as TextStyle,
});
