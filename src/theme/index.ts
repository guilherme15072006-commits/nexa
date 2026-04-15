export const colors = {
  // Brand
  primary: '#7C5CFC',
  primaryLight: '#9B7FFF',
  primaryDark: '#5A3DD8',
  primarySurface: '#1A1040',

  // Accent
  gold: '#F5C842',
  goldDark: '#C9A020',
  green: '#00C896',
  greenDark: '#009970',
  red: '#FF4D6A',
  redDark: '#CC2044',
  orange: '#FF8C42',

  // Neutral dark theme
  bg: '#0D0B14',
  bgCard: '#16131F',
  bgElevated: '#1E1A2E',
  bgHighlight: '#252038',

  // Text
  textPrimary: '#F0EDF8',
  textSecondary: '#9B95B8',
  textMuted: '#5C5780',

  // Border
  border: '#2A2545',
  borderLight: '#362F5A',

  // Live
  live: '#FF4D6A',
  liveGlow: 'rgba(255,77,106,0.15)',

  // Status
  success: '#00C896',
  warning: '#F5C842',
  danger: '#FF4D6A',
  info: '#7C5CFC',
};

export const typography = {
  display: 'SpaceGrotesk-Bold',
  displayMed: 'SpaceGrotesk-Medium',
  body: 'Inter-Regular',
  bodyMed: 'Inter-Medium',
  bodySemi: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
  mono: 'JetBrainsMono-Medium',
  monoBold: 'JetBrainsMono-Bold',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 999,
};

export const shadow = {
  purple: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  }),
};

// --- Bet365/Stake: animation timing ---
export const anim = {
  spring: { tension: 120, friction: 8, useNativeDriver: true },
  springFast: { tension: 200, friction: 14, useNativeDriver: true },
  springBouncy: { tension: 80, friction: 5, useNativeDriver: true },
  springGentle: { tension: 60, friction: 10, useNativeDriver: true },
  micro: 80,
  fast: 150,
  normal: 280,
  slow: 450,
  emphasis: 700,
};

// --- Stake: glass morphism presets ---
export const glass = {
  card: {
    backgroundColor: 'rgba(22, 19, 31, 0.88)',
    borderWidth: 0.5,
    borderColor: 'rgba(42, 37, 69, 0.9)',
  },
  elevated: {
    backgroundColor: 'rgba(30, 26, 46, 0.78)',
    borderWidth: 0.5,
    borderColor: 'rgba(124, 92, 252, 0.1)',
  },
  accent: {
    backgroundColor: 'rgba(124, 92, 252, 0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(124, 92, 252, 0.2)',
  },
  live: {
    backgroundColor: 'rgba(255, 77, 106, 0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 77, 106, 0.2)',
  },
};
