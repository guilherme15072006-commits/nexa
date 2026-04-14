export const colors = {
  primary: '#7C5CFC',
  gold: '#F5C842',
  green: '#00C896',
  red: '#FF4D6A',
  orange: '#FF8C42',

  bg: '#0D0B14',
  bgCard: '#16131F',
  bgElevated: '#1E1A2E',

  textPrimary: '#F0EDF8',
  textSecondary: '#9B95B8',
  textMuted: '#5C5780',
  border: '#2A2545',
} as const;

export const typography = {
  display: {
    fontFamily: 'SpaceGrotesk-Bold',
  },
  displayMedium: {
    fontFamily: 'SpaceGrotesk-Medium',
  },
  body: {
    fontFamily: 'Inter-Regular',
  },
  bodyMedium: {
    fontFamily: 'Inter-Medium',
  },
  bodySemiBold: {
    fontFamily: 'Inter-SemiBold',
  },
  mono: {
    fontFamily: 'JetBrainsMono-Medium',
  },
  monoBold: {
    fontFamily: 'JetBrainsMono-Bold',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

const theme = { colors, typography, spacing, radius, shadows };
export default theme;
