// ═══════════════════════════════════════════════════════════════
// NEXA — Environment Configuration
// Replace placeholder values with your real credentials.
// This file is gitignored in production; use .env in CI/CD.
// ═══════════════════════════════════════════════════════════════

export const ENV = {
  // ── Supabase ────────────────────────────────────────────────
  SUPABASE_URL: 'https://ymuziccgrqjbugsdwgjo.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_lqe_c_pFLJqKprdsRhnt0w_PNIPLjkg',

  // ── Firebase (configured via google-services.json) ──────────
  // No keys needed here — Firebase reads from native config.
  // Place google-services.json in android/app/

  // ── TheOddsAPI ──────────────────────────────────────────────
  ODDS_API_KEY: 'YOUR_ODDS_API_KEY',
  ODDS_API_BASE: 'https://api.the-odds-api.com/v4',

  // ── Feature Flags ───────────────────────────────────────────
  USE_REAL_AUTH: true,       // Supabase Auth (URL polyfill instalado)
  USE_REAL_DATABASE: true,   // Supabase real data
  USE_REAL_ODDS: false,      // true = TheOddsAPI, false = mock odds

  // ── App Config ──────────────────────────────────────────────
  APP_NAME: 'NEXA',
  APP_VERSION: '1.0.0',
  REFERRAL_BASE_URL: 'https://nexa.app/ref/',
} as const;

/** Check if a real service is configured (not placeholder) */
export function isConfigured(key: keyof typeof ENV): boolean {
  const val = ENV[key];
  return typeof val === 'string' && !val.includes('YOUR_');
}
