/**
 * NEXA — Autenticacao via Supabase
 *
 * Fluxos:
 * - Email/senha: signUp, signInWithEmail
 * - Google: Google Sign-In nativo → idToken → Supabase signInWithIdToken
 * - Guest: mock local (sem conta no Supabase)
 * - Logout: limpa sessao Supabase + Google
 */

import { createClient } from '@supabase/supabase-js';
import { ENV, isConfigured } from '../config/env';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'email' | 'google' | 'guest';
}

type AuthCallback = (user: AuthUser | null) => void;

// ─── Supabase Client ─────────────────────────────────────────────────────────

const supabase = isConfigured('SUPABASE_URL')
  ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY)
  : null;

// ─── Guest mock ──────────────────────────────────────────────────────────────

const GUEST_USER: AuthUser = {
  uid: 'guest_local',
  email: null,
  displayName: 'Convidado',
  photoURL: null,
  provider: 'guest',
};

let currentUser: AuthUser | null = null;
let authListeners: AuthCallback[] = [];

function notifyListeners(user: AuthUser | null) {
  currentUser = user;
  authListeners.forEach(cb => cb(user));
}

function supabaseUserToAuth(sbUser: any): AuthUser {
  return {
    uid: sbUser.id,
    email: sbUser.email ?? null,
    displayName: sbUser.user_metadata?.display_name ?? sbUser.user_metadata?.full_name ?? sbUser.email?.split('@')[0] ?? null,
    photoURL: sbUser.user_metadata?.avatar_url ?? null,
    provider: sbUser.app_metadata?.provider === 'google' ? 'google' : 'email',
  };
}

/** Ensure user row exists in public.users table */
async function ensureUserRow(uid: string, email: string | null, username: string | null) {
  if (!supabase) return;
  const { data } = await supabase.from('users').select('id').eq('id', uid).single();
  if (!data) {
    await supabase.from('users').insert({
      id: uid,
      firebase_uid: uid,
      username: username ?? email?.split('@')[0] ?? 'user',
      email: email ?? '',
      level: 1,
      xp: 0,
      xp_to_next: 500,
      coins: 200,
    });
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const supabaseAuth = {

  // ── Email/Password ────────────────────────────────────────────

  signInWithEmail: async (email: string, password: string): Promise<AuthUser> => {
    if (!ENV.USE_REAL_AUTH || !supabase) {
      await new Promise<void>(r => setTimeout(r, 500));
      notifyListeners(GUEST_USER);
      return GUEST_USER;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const user = supabaseUserToAuth(data.user);
    notifyListeners(user);
    return user;
  },

  signUp: async (email: string, password: string, username: string): Promise<AuthUser> => {
    if (!ENV.USE_REAL_AUTH || !supabase) {
      await new Promise<void>(r => setTimeout(r, 500));
      notifyListeners(GUEST_USER);
      return GUEST_USER;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: username } },
    });
    if (error) throw new Error(error.message);

    if (data.user) {
      await ensureUserRow(data.user.id, email, username);
    }

    const user = supabaseUserToAuth(data.user);
    notifyListeners(user);
    return user;
  },

  // ── Google Sign-In (native idToken → Supabase) ───────────────

  signInWithGoogle: async (): Promise<AuthUser> => {
    if (!ENV.USE_REAL_AUTH || !supabase) {
      await new Promise<void>(r => setTimeout(r, 800));
      notifyListeners(GUEST_USER);
      return GUEST_USER;
    }

    try {
      // 1. Get Google ID token via native SDK
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('Google Sign-In: no ID token returned');
      }

      // 2. Exchange Google idToken with Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('No user returned from Supabase');

      // 3. Ensure user row in public.users
      await ensureUserRow(
        data.user.id,
        data.user.email ?? null,
        data.user.user_metadata?.full_name ?? data.user.user_metadata?.display_name ?? null,
      );

      const user = supabaseUserToAuth(data.user);
      notifyListeners(user);
      return user;
    } catch (err: any) {
      // If Google native SDK fails (emulator, no Play Services), log and rethrow
      if (__DEV__) {
        console.warn('[Auth] Google sign-in failed:', err?.message);
      }
      throw err;
    }
  },

  // ── Guest (no account, local only) ────────────────────────────

  signInAsGuest: async (): Promise<AuthUser> => {
    await new Promise<void>(r => setTimeout(r, 300));
    notifyListeners(GUEST_USER);
    return GUEST_USER;
  },

  // ── Logout ────────────────────────────────────────────────────

  signOut: async (): Promise<void> => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      await GoogleSignin.signOut().catch(() => {});
    } catch {}
    notifyListeners(null);
  },

  // ── State ─────────────────────────────────────────────────────

  getCurrentUser: (): AuthUser | null => {
    return currentUser;
  },

  onAuthStateChanged: (callback: AuthCallback): (() => void) => {
    authListeners.push(callback);

    // Subscribe to Supabase auth events
    if (ENV.USE_REAL_AUTH && supabase) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const user = supabaseUserToAuth(session.user);
          currentUser = user;
          callback(user);
        } else if (event === 'SIGNED_OUT') {
          currentUser = null;
          callback(null);
        }
      });

      // Check existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const user = supabaseUserToAuth(session.user);
          currentUser = user;
          callback(user);
        } else {
          callback(currentUser);
        }
      });

      return () => {
        authListeners = authListeners.filter(cb => cb !== callback);
        data.subscription.unsubscribe();
      };
    }

    // No Supabase — just notify current state
    callback(currentUser);
    return () => {
      authListeners = authListeners.filter(cb => cb !== callback);
    };
  },

  // ── Password Reset ────────────────────────────────────────────

  resetPassword: async (email: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
  },
};
