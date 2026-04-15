/**
 * EmptyState — Stripe/Discord style
 *
 * Componente reutilizavel para telas sem dados.
 * Cada tela mostra icone + titulo + descricao + CTA.
 *
 * Referencia: Stripe dashboard empty states, Discord "no messages"
 */

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, typography, spacing, radius, typeScale } from '../theme';
import { TapScale, SmoothEntry } from './LiveComponents';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  ctaLabel?: string;
  onCTA?: () => void;
  style?: ViewStyle;
}

export function EmptyState({ icon, title, description, ctaLabel, onCTA, style }: EmptyStateProps) {
  return (
    <SmoothEntry delay={200}>
      <View style={[styles.container, style]}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{icon}</Text>
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

// ── Presets por tela ──────────────────────────────────────────

export const EMPTY_STATES = {
  feed: {
    icon: '📡',
    title: 'Feed vazio',
    description: 'Siga tipsters e apostadores para ver picks e analises aqui.',
    ctaLabel: 'Explorar tipsters',
  },
  bets: {
    icon: '🎯',
    title: 'Nenhuma aposta ainda',
    description: 'Escolha um jogo ao vivo ou hoje e faca sua primeira aposta.',
    ctaLabel: 'Ver jogos',
  },
  betHistory: {
    icon: '📋',
    title: 'Historico vazio',
    description: 'Suas apostas vao aparecer aqui conforme voce joga.',
  },
  notifications: {
    icon: '🔔',
    title: 'Tudo em dia',
    description: 'Voce nao tem notificacoes novas. Continue apostando!',
  },
  search: {
    icon: '🔍',
    title: 'Pesquisar',
    description: 'Busque jogos, tipsters, clas ou usuarios.',
  },
  searchEmpty: {
    icon: '😕',
    title: 'Nenhum resultado',
    description: 'Tente buscar com outros termos.',
  },
  clan: {
    icon: '⚔️',
    title: 'Sem cla',
    description: 'Entre em um cla para competir em grupo e ganhar XP extra.',
    ctaLabel: 'Explorar clas',
  },
  marketplace: {
    icon: '🏪',
    title: 'Marketplace vazio',
    description: 'Estrategias e analises de tipsters vao aparecer aqui.',
  },
  lives: {
    icon: '📺',
    title: 'Nenhuma live agora',
    description: 'Tipsters fazem lives durante jogos ao vivo. Volte mais tarde!',
  },
  audioRooms: {
    icon: '🎙️',
    title: 'Sem salas de audio',
    description: 'Salas de discussao abrem antes de jogos grandes.',
  },
  wallet: {
    icon: '💰',
    title: 'Carteira vazia',
    description: 'Deposite para comecar a apostar com dinheiro real.',
    ctaLabel: 'Depositar',
  },
} as const;

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 28,
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
    maxWidth: 280,
    marginBottom: spacing.xl,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
  },
  ctaText: {
    ...typeScale.label,
    color: '#fff',
  },
});
