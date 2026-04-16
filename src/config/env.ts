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
  ODDS_API_KEY: 'b0cbafc7fa1b819cde43e08b05ba08ba',
  ODDS_API_BASE: 'https://api.the-odds-api.com/v4',

  // ── Analytics (Amplitude) ────────────────────────────────────
  AMPLITUDE_API_KEY: 'YOUR_AMPLITUDE_API_KEY',

  // ── Payment Gateway (Asaas) ──────────────────────────────────
  ASAAS_API_KEY: 'YOUR_ASAAS_API_KEY',
  ASAAS_API_BASE: 'https://sandbox.asaas.com/api/v3',  // sandbox; prod: https://api.asaas.com/v3
  ASAAS_WEBHOOK_TOKEN: 'YOUR_WEBHOOK_TOKEN',

  // ── Feature Flags ───────────────────────────────────────────
  USE_REAL_AUTH: true,       // Supabase Auth (URL polyfill instalado)
  USE_REAL_DATABASE: true,   // Supabase real data
  USE_REAL_ODDS: true,       // true = TheOddsAPI, false = mock odds
  USE_REAL_PAYMENTS: false,  // true = Asaas API, false = mock payments

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
