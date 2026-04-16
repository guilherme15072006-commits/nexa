/**
 * EmptyState — Stripe/Linear style (SVG icons, no emojis)
 *
 * Componente reutilizavel para telas sem dados.
 * Cada tela mostra icone SVG + titulo + descricao + CTA opcional.
 */

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing, radius, typeScale } from '../theme';
import { TapScale, SmoothEntry } from './LiveComponents';
import {
  IconTarget,
  IconBolt,
  IconTrophy,
  IconChart,
  IconUsers,
  IconShield,
  IconWallet,
  IconBell,
  IconSearch,
  IconSettings,
  IconMission,
  IconFlame,
  IconCopy,
} from './Icons';

// ─── Icon registry (SVG, no emojis) ─────────────────────────────────────────

type IconKey =
  | 'target' | 'bolt' | 'trophy' | 'chart' | 'users'
  | 'shield' | 'wallet' | 'bell' | 'search' | 'settings'
  | 'mission' | 'flame' | 'copy';

const ICON_COMPONENTS: Record<IconKey, React.FC<{size?: number; color?: string}>> = {
  target: IconTarget,
  bolt: IconBolt,
  trophy: IconTrophy,
  chart: IconChart,
  users: IconUsers,
  shield: IconShield,
  wallet: IconWallet,
  bell: IconBell,
  search: IconSearch,
  settings: IconSettings,
  mission: IconMission,
  flame: IconFlame,
  copy: IconCopy,
};

// ─── Component ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: IconKey;
  iconColor?: string;
  title: string;
  description: string;
  ctaLabel?: string;
  onCTA?: () => void;
  style?: ViewStyle;
}

export function EmptyState({ icon, iconColor, title, description, ctaLabel, onCTA, style }: EmptyStateProps) {
  const IconComp = ICON_COMPONENTS[icon];
  const color = iconColor ?? colors.textMuted;

  return (
    <SmoothEntry delay={200}>
      <View style={[styles.container, style]}>
        <View style={[styles.iconWrap, { backgroundColor: color + '10', borderColor: color + '20' }]}>
          {IconComp && <IconComp size={28} color={color} />}
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {ctaLabel && onCTA && (
          <TapScale onPress={onCTA}>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaText}>{ctaLabel}</Text>
            </View>
          </TapScale>
        )}
      </View>
    </SmoothEntry>
  );
}

// ─── Presets por tela (SVG icons) ────────────────────────────────────────────

export const EMPTY_PRESETS = {
  feed: {
    icon: 'chart' as IconKey,
    iconColor: colors.primary,
    title: 'Feed vazio',
    description: 'Siga tipsters e apostadores para ver picks e analises aqui.',
    ctaLabel: 'Explorar tipsters',
  },
  bets: {
    icon: 'target' as IconKey,
    iconColor: colors.primary,
    title: 'Nenhuma aposta ainda',
    description: 'Escolha um jogo ao vivo ou hoje e faca sua primeira aposta.',
    ctaLabel: 'Ver jogos',
  },
  betHistory: {
    icon: 'copy' as IconKey,
    iconColor: colors.textMuted,
    title: 'Historico vazio',
    description: 'Suas apostas vao aparecer aqui conforme voce joga.',
  },
  notifications: {
    icon: 'bell' as IconKey,
    iconColor: colors.primary,
    title: 'Tudo em dia',
    description: 'Voce nao tem notificacoes novas. Continue apostando!',
  },
  search: {
    icon: 'search' as IconKey,
    iconColor: colors.textSecondary,
    title: 'Pesquisar',
    description: 'Busque jogos, tipsters, clas ou usuarios.',
  },
  searchEmpty: {
    icon: 'search' as IconKey,
    iconColor: colors.textMuted,
    title: 'Nenhum resultado',
    description: 'Tente buscar com outros termos.',
  },
  clan: {
    icon: 'users' as IconKey,
    iconColor: colors.primary,
    title: 'Sem cla',
    description: 'Entre em um cla para competir em grupo e ganhar XP extra.',
    ctaLabel: 'Explorar clas',
  },
  marketplace: {
    icon: 'shield' as IconKey,
    iconColor: colors.gold,
    title: 'Nenhuma estrategia disponivel',
    description: 'Estrategias e analises de tipsters vao aparecer aqui em breve.',
  },
  lives: {
    icon: 'flame' as IconKey,
    iconColor: colors.red,
    title: 'Nenhuma live agora',
    description: 'Tipsters fazem lives durante jogos ao vivo. Volte mais tarde!',
  },
  audioRooms: {
    icon: 'users' as IconKey,
    iconColor: colors.orange,
    title: 'Sem salas de audio',
    description: 'Salas de discussao abrem antes de jogos grandes.',
  },
  wallet: {
    icon: 'wallet' as IconKey,
    iconColor: colors.primary,
    title: 'Carteira vazia',
    description: 'Deposite para comecar a apostar com dinheiro real.',
    ctaLabel: 'Depositar',
  },
  walletTransactions: {
    icon: 'chart' as IconKey,
    iconColor: colors.textMuted,
    title: 'Nenhuma transacao',
    description: 'Suas transacoes de deposito, saque e bonus aparecem aqui.',
  },
  settings: {
    icon: 'settings' as IconKey,
    iconColor: colors.textSecondary,
    title: 'Sem configuracoes',
    description: 'Ajustes de conta, notificacoes e preferencias.',
  },
} as const;

// Backward compat — old name
export const EMPTY_STATES = EMPTY_PRESETS;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typeScale.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typeScale.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: spacing.xl,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
  },
  ctaText: {
    ...typeScale.label,
    color: colors.textPrimary,
  },
});
