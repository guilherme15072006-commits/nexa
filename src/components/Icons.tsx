/**
 * NEXA Icons — Icones SVG profissionais
 *
 * Substituem emojis por icones vetoriais limpos.
 * Referencia: Bet365 iconografia, Stake UI, Linear icons
 *
 * Todos os icones usam a cor primary (#7C5CFC) por padrao
 * e aceitam props de cor e tamanho.
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../theme';

interface IconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

// ── Apostas / Target ─────────────────────────────────────────
export function IconTarget({ size = 20, color = colors.primary, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
      <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" />
      <Circle cx="12" cy="12" r="2" fill={color} />
    </Svg>
  );
}

// ── Raio / Ao vivo ───────────────────────────────────────────
export function IconBolt({ size = 20, color = colors.gold, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={color} opacity={0.9} />
    </Svg>
  );
}

// ── Trofeu / Ranking ─────────────────────────────────────────
export function IconTrophy({ size = 20, color = colors.gold, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M8 21h8m-4-4v4M6 4H4a2 2 0 00-2 2v1a4 4 0 004 4m12-7h2a2 2 0 012 2v1a4 4 0 01-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M6 4h12v5a6 6 0 01-12 0V4z" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

// ── Grafico / Stats ──────────────────────────────────────────
export function IconChart({ size = 20, color = colors.green, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M3 20h18M6 16l4-6 4 4 4-8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Fogo / Streak ────────────────────────────────────────────
export function IconFlame({ size = 20, color = colors.orange, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M12 2c.5 4-3 6-3 10a5 5 0 006 5c3 0 5-2.5 5-5.5C20 7 16 4 12 2z" fill={color} opacity={0.85} />
      <Path d="M10 15c0 2 1 3 2 3s2-1 2-3-2-4-2-4-2 2-2 4z" fill={colors.gold} />
    </Svg>
  );
}

// ── Usuarios / Social ────────────────────────────────────────
export function IconUsers({ size = 20, color = colors.primary, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.5" />
      <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── Escudo / Seguranca ───────────────────────────────────────
export function IconShield({ size = 20, color = colors.green, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="1.5" />
      <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Seta pra cima / Trending ─────────────────────────────────
export function IconTrending({ size = 20, color = colors.green, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M23 6l-9.5 9.5-5-5L1 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 6h6v6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Carteira / Wallet ────────────────────────────────────────
export function IconWallet({ size = 20, color = colors.primary, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Rect x="2" y="6" width="20" height="14" rx="2" stroke={color} strokeWidth="1.5" />
      <Path d="M2 10h20" stroke={color} strokeWidth="1.5" />
      <Circle cx="17" cy="15" r="1.5" fill={color} />
    </Svg>
  );
}

// ── Sino / Notificacao ───────────────────────────────────────
export function IconBell({ size = 20, color = colors.primary, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── Busca / Search ───────────────────────────────────────────
export function IconSearch({ size = 20, color = colors.textSecondary, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="1.5" />
      <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ── Engrenagem / Settings ────────────────────────────────────
export function IconSettings({ size = 20, color = colors.textSecondary, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

// ── DNA / Perfil ─────────────────────────────────────────────
export function IconDNA({ size = 20, color = colors.primary, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M2 15c6.667-6 13.333 0 20-6M2 9c6.667 6 13.333 0 20 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M7 12h10" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
    </Svg>
  );
}

// ── Copiar / Copy bet ────────────────────────────────────────
export function IconCopy({ size = 20, color = colors.primary, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth="1.5" />
      <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

// ── Missao / Mission ─────────────────────────────────────────
export function IconMission({ size = 20, color = colors.primary, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M22 4L12 14.01l-3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Live / Ao vivo dot ───────────────────────────────────────
export function IconLiveDot({ size = 8, color = colors.red, style }: IconProps) {
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]} />
  );
}

// ── Seta direita ─────────────────────────────────────────────
export function IconArrowRight({ size = 16, color = colors.textSecondary, style }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ── Mapa de emojis para icones (pra substituicao gradual) ────
export const ICON_MAP: Record<string, React.FC<IconProps>> = {
  target: IconTarget,
  bolt: IconBolt,
  trophy: IconTrophy,
  chart: IconChart,
  flame: IconFlame,
  users: IconUsers,
  shield: IconShield,
  trending: IconTrending,
  wallet: IconWallet,
  bell: IconBell,
  search: IconSearch,
  settings: IconSettings,
  dna: IconDNA,
  copy: IconCopy,
  mission: IconMission,
  arrow: IconArrowRight,
};
