// ═══════════════════════════════════════════════════════════════
// NEXA Design System — Derived from the Torus Knot Logo
// The logo is a purple glowing orb radiating from deep space.
// Every color, shadow, and glow in the app echoes this identity.
// ═══════════════════════════════════════════════════════════════

export const colors = {
  // ── Logo palette (extracted from torus knot) ────────────────
  primary: '#7C5CFC',       // bright purple — the core glow
  primaryLight: '#C084FC',  // pink-purple accent — outer ring
  primaryDark: '#1A0A4A',   // deep purple — inner shadow
  primaryGlow: '#7C5CFC66', // semi-transparent glow

  // ── Semantic ────────────────────────────────────────────────
  gold: '#F5C842',
  green: '#00C896',
  red: '#FF4D6A',
  orange: '#FF8C42',

  // ── Backgrounds (deep space, matching logo bg) ──────────────
  bg: '#0D0B14',            // void black — the space around the orb
  bgCard: '#16131F',        // slightly lifted surface
  bgElevated: '#1E1A2E',   // elevated elements
  bgGlow: '#1A0A4A22',     // subtle purple wash on surfaces

  // ── Text ────────────────────────────────────────────────────
  textPrimary: '#F0EDF8',   // white glow — matching logo highlight
  textSecondary: '#9B95B8',
  textMuted: '#5C5780',
  border: '#2A2545',        // deep purple border

  // ── Gradients (CSS-like stops for reference) ────────────────
  // gradient: ['#1A0A4A', '#7C5CFC', '#C084FC']
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
  // Purple glow shadow — matches logo radiance
  glow: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

const theme = { colors, typography, spacing, radius, shadows };
export default theme;
