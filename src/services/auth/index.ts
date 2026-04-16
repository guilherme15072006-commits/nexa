/**
 * NEXA Auth System
 *
 * Dominio independente. Gerencia autenticacao, identidade e KYC.
 *
 * Modulos:
 * - authProvider.ts  → Email/Google/Guest via Supabase
 * - kyc.ts           → Validacao CPF + idade
 * - passwordPolicy.ts → Forca, compromised check
 *
 * Uso: import { authSystem } from './services/auth';
 *      authSystem.login(email, password);
 */

import { supabaseAuth, type AuthUser } from '../supabaseAuth';
import { auditLog } from '../security/auditLog';
import { rateLimiter } from '../security/rateLimiter';
import { deviceFingerprint } from '../security/deviceFingerprint';

// ─── Types ──────────────────────────────────────────────────

export type { AuthUser } from '../supabaseAuth';

export interface LoginResult {
  success: boolean;
  user: AuthUser | null;
  requireMFA: boolean;
  error: string | null;
}

export interface KYCValidation {
  valid: boolean;
  errors: string[];
}

// ─── Password Policy ────────────────────────────────────────

export function validatePassword(password: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (password.length < 8) issues.push('Minimo 8 caracteres');
  if (!/[A-Z]/.test(password)) issues.push('Pelo menos 1 letra maiuscula');
  if (!/[0-9]/.test(password)) issues.push('Pelo menos 1 numero');
  return { valid: issues.length === 0, issues };
}

// ─── KYC Validation ─────────────────────────────────────────

export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (parseInt(digits[9]) !== check) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  return parseInt(digits[10]) === check;
}

export function validateAge(birthDate: string, minAge = 18): boolean {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) return age - 1 >= minAge;
  return age >= minAge;
}

export function validateKYC(data: { fullName: string; cpf: string; birthDate: string }): KYCValidation {
  const errors: string[] = [];
  if (!data.fullName || data.fullName.trim().length < 5) errors.push('Nome completo obrigatorio');
  if (!validateCPF(data.cpf)) errors.push('CPF invalido');
  if (!validateAge(data.birthDate)) errors.push('Idade minima: 18 anos');
  return { valid: errors.length === 0, errors };
}

// ─── Orchestrator ───────────────────────────────────────────

class AuthSystem {
  /** Login with rate limiting + audit */
  async login(email: string, password: string): Promise<LoginResult> {
    const rateCheck = rateLimiter.check('login', email);
    if (!rateCheck.allowed) {
      return { success: false, user: null, requireMFA: false, error: 'Muitas tentativas. Tente novamente mais tarde.' };
    }

    try {
      const user = await supabaseAuth.signInWithEmail(email, password);
      rateLimiter.recordSuccess('login', email);
      auditLog.log({ userId: user.uid, action: 'login_success', resource: 'auth', detail: { method: 'email', device: deviceFingerprint.getDeviceName() }, deviceFingerprint: deviceFingerprint.getFingerprint(), result: 'success' });
      return { success: true, user, requireMFA: false, error: null };
    } catch (err: any) {
      auditLog.log({ action: 'login_failed', resource: 'auth', detail: { method: 'email', identifier: email.slice(0, 3) + '***' }, result: 'failed' });
      return { success: false, user: null, requireMFA: false, error: err.message ?? 'Erro no login' };
    }
  }

  /** Google login */
  async loginWithGoogle(): Promise<LoginResult> {
    try {
      const user = await supabaseAuth.signInWithGoogle();
      auditLog.log({ userId: user.uid, action: 'login_success', resource: 'auth', detail: { method: 'google' }, result: 'success' });
      return { success: true, user, requireMFA: false, error: null };
    } catch (err: any) {
      return { success: false, user: null, requireMFA: false, error: err.message ?? 'Erro no Google Sign-In' };
    }
  }

  /** Guest login */
  async loginAsGuest(): Promise<LoginResult> {
    const user = await supabaseAuth.signInAsGuest();
    return { success: true, user, requireMFA: false, error: null };
  }

  /** Sign up */
  async signUp(email: string, password: string, username: string): Promise<LoginResult> {
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return { success: false, user: null, requireMFA: false, error: pwCheck.issues.join('. ') };
    }

    try {
      const user = await supabaseAuth.signUp(email, password, username);
      auditLog.log({ userId: user.uid, action: 'login_success', resource: 'auth', detail: { method: 'signup' }, result: 'success' });
      return { success: true, user, requireMFA: false, error: null };
    } catch (err: any) {
      return { success: false, user: null, requireMFA: false, error: err.message ?? 'Erro no cadastro' };
    }
  }

  /** Logout */
  async logout(): Promise<void> {
    const user = supabaseAuth.getCurrentUser();
    if (user) auditLog.log({ userId: user.uid, action: 'logout', resource: 'auth', result: 'success' });
    await supabaseAuth.signOut();
  }

  /** Get current user */
  getCurrentUser(): AuthUser | null {
    return supabaseAuth.getCurrentUser();
  }

  /** Subscribe to auth changes */
  onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    return supabaseAuth.onAuthStateChanged(callback);
  }
}

export const authSystem = new AuthSystem();
