// ═══════════════════════════════════════════════════════════════
// NEXA — Image Assets Registry
// logo.png is the single source of truth for the NEXA brand.
// ═══════════════════════════════════════════════════════════════

const nexaLogo = require('./logo.png');

export const Assets = {
  logo: nexaLogo,
  logoSmall: nexaLogo,
  logoSplash: nexaLogo,
  onboardingHero: nexaLogo,
} as const;

export type AssetKey = keyof typeof Assets;
