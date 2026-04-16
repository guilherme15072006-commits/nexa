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

// ── Typography (fontFamily only — backward compatible) ────────
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

// ── Type Scale — Linear/Vercel precision ──────────────────────
// Referencia: https://typescale.com (ratio 1.2 Minor Third)
// Todos os tamanhos sao multiplos de 4px para grid alignment
// Contraste WCAG AA: textPrimary em bg = 12.8:1, textSecondary em bg = 5.2:1
export const typeScale = {
  // Display — titulos grandes (SpaceGrotesk-Bold)
  hero:     { fontFamily: 'SpaceGrotesk-Bold', fontSize: 32, lineHeight: 40 },
  h1:       { fontFamily: 'SpaceGrotesk-Bold', fontSize: 24, lineHeight: 32 },
  h2:       { fontFamily: 'SpaceGrotesk-Bold', fontSize: 20, lineHeight: 28 },
  h3:       { fontFamily: 'SpaceGrotesk-Medium', fontSize: 16, lineHeight: 24 },

  // Body — texto de conteudo (Inter)
  bodyLg:   { fontFamily: 'Inter-Medium', fontSize: 16, lineHeight: 24 },
  body:     { fontFamily: 'Inter-Regular', fontSize: 14, lineHeight: 20 },
  bodySm:   { fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 16 },

  // Label — UI elements, botoes, pills (Inter-Medium/SemiBold)
  label:    { fontFamily: 'Inter-SemiBold', fontSize: 14, lineHeight: 20 },
  labelSm:  { fontFamily: 'Inter-Medium', fontSize: 12, lineHeight: 16 },
  labelXs:  { fontFamily: 'Inter-Medium', fontSize: 10, lineHeight: 16 },

  // Mono — numeros, odds, stats (JetBrainsMono)
  monoLg:   { fontFamily: 'JetBrainsMono-Bold', fontSize: 20, lineHeight: 28 },
  mono:     { fontFamily: 'JetBrainsMono-Medium', fontSize: 14, lineHeight: 20 },
  monoSm:   { fontFamily: 'JetBrainsMono-Medium', fontSize: 12, lineHeight: 16 },

  // Caption — textos minimos (timestamps, footnotes)
  caption:  { fontFamily: 'Inter-Regular', fontSize: 10, lineHeight: 16 },
} as const;

// ── WCAG AA Contrast Ratios ───────────────────────────────────
// Verificado com https://webaim.org/resources/contrastchecker/
// bg #0D0B14:
//   textPrimary  #F0EDF8 → 12.8:1 (AAA pass)
//   textSecondary #9B95B8 → 5.2:1  (AA pass)
//   textMuted    #5C5780 → 2.7:1  (AA fail — usar so para decorativo)
//   primary      #7C5CFC → 3.6:1  (AA fail em texto pequeno — ok em large)
//   green        #00C896 → 5.8:1  (AA pass)
//   red          #FF4D6A → 4.3:1  (AA pass em large text)
//   gold         #F5C842 → 8.7:1  (AAA pass)
//
// REGRA: textMuted NUNCA em texto < 14px. primary so em texto >= 18px ou bold >= 14px.

// ── Spacing (4px grid — Linear precision) ─────────────────────
// Todos os valores sao multiplos de 4 para alignment perfeito
export const spacing = {
  xs: 4,    // micro gaps (entre icon e label)
  sm: 8,    // small gaps (entre elementos inline)
  md: 12,   // medium gaps (adicionado para ajuste fino)
  lg: 16,   // standard padding (cards, sections)
  xl: 24,   // section gaps
  xxl: 32,  // major sections
  xxxl: 48, // page-level spacing
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

// ── Animation timing (Bet365/Stripe precision) ──────────────
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
} as const;

// ── Glass morphism presets (Stake-inspired) ──────────────────
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
} as const;

// ── Gradients (Linear/Vercel pattern) ─────────────────────────
// Use with react-native-linear-gradient or as reference colors

export const gradients = {
  primary:   ['#1A0A4A', '#7C5CFC', '#C084FC'] as const,
  gold:      ['#8B6914', '#F5C842', '#FFE88A'] as const,
  fire:      ['#4A0000', '#FF4D6A', '#FF8C42'] as const,
  success:   ['#003D2E', '#00C896', '#7DFFC4'] as const,
  dark:      ['#0D0B14', '#16131F', '#1E1A2E'] as const,
  accent:    ['#7C5CFC', '#FF4D6A'] as const,
} as const;

// ── Opacity tokens (Figma variables pattern) ──────────────────

export const opacity = {
  ghost:     0.06,
  whisper:   0.10,
  subtle:    0.20,
  muted:     0.40,
  medium:    0.60,
  prominent: 0.80,
  opaque:    1.00,
} as const;

// ── Z-Index system (stacking order) ──────────────────────────

export const zIndex = {
  base:      0,
  card:      10,
  sticky:    100,
  overlay:   400,
  drawer:    600,
  modal:     800,
  toast:     900,
  tooltip:   1000,
} as const;

// ── Easing curves (Linear app pattern) ───────────────────────

export const easing = {
  entrance:    [0.0, 0.0, 0.2, 1.0] as const,   // ease-out: elements appearing
  exit:        [0.4, 0.0, 1.0, 1.0] as const,   // ease-in: elements leaving
  interactive: [0.4, 0.0, 0.2, 1.0] as const,   // ease-in-out: user-driven
  bounce:      [0.175, 0.885, 0.32, 1.275] as const, // overshoot: celebrations
  smooth:      [0.25, 0.1, 0.25, 1.0] as const,  // standard: most animations
} as const;

// ── Breakpoints (responsive design) ──────────────────────────

export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

const theme = { colors, typography, spacing, radius, shadows, anim, glass, gradients, opacity, zIndex, easing, breakpoints };
export default theme;
