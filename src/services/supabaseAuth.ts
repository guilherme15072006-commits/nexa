/**
 * NEXA — Autenticacao via Supabase
 *
 * O QUE FAZ (explicacao simples):
 * - Permite login com email/senha ou Google
 * - Cria conta de usuario automaticamente
 * - Salva sessao (nao precisa logar de novo)
 * - Quando loga, cria registro na tabela users do banco
 */

import { createClient } from '@supabase/supabase-js';
import { ENV, isConfigured } from '../config/env';

// --- Tipos ---

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'email' | 'google' | 'mock';
}

type AuthCallback = (user: AuthUser | null) => void;

// --- Cliente Supabase ---

const supabase = isConfigured('SUPABASE_URL')
  ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY)
  : null;

// --- Mock (quando USE_REAL_AUTH = false) ---

const MOCK_USER: AuthUser = {
  uid: 'mock_u1',
  email: 'user@nexa.app',
  displayName: 'voce',
  photoURL: null,
  provider: 'mock',
};

let mockLoggedIn = false;
let authListeners: AuthCallback[] = [];

function notifyListeners(user: AuthUser | null) {
  authListeners.forEach(cb => cb(user));
}

function supabaseUserToAuth(sbUser: any): AuthUser {
  return {
    uid: sbUser.id,
    email: sbUser.email ?? null,
    displayName: sbUser.user_metadata?.display_name ?? sbUser.email?.split('@')[0] ?? null,
    photoURL: sbUser.user_metadata?.avatar_url ?? null,
    provider: sbUser.app_metadata?.provider === 'google' ? 'google' : 'email',
  };
}

// --- API Publica ---

export const supabaseAuth = {
  /** Login com email e senha */
  signInWithEmail: async (email: string, password: string): Promise<AuthUser> => {
    if (!ENV.USE_REAL_AUTH || !supabase) {
      await new Promise<void>(r => setTimeout(r, 500));
      mockLoggedIn = true;
      notifyListeners(MOCK_USER);
      return MOCK_USER;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const user = supabaseUserToAuth(data.user);
    notifyListeners(user);
    return user;
  },

  /** Criar conta com email e senha */
  signUp: async (email: string, password: string, username: string): Promise<AuthUser> => {
    if (!ENV.USE_REAL_AUTH || !supabase) {
      await new Promise<void>(r => setTimeout(r, 500));
      mockLoggedIn = true;
      notifyListeners(MOCK_USER);
      return MOCK_USER;
    }

    // 1. Criar conta no auth do Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: username },
      },
    });
    if (error) throw new Error(error.message);

    // 2. Criar registro na tabela users
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        firebase_uid: data.user.id,
        username,
        email,
        level: 1,
        xp: 0,
        xp_to_next: 500,
        coins: 200,
      });
    }

    const user = supabaseUserToAuth(data.user);
    notifyListeners(user);
    return user;
  },

  /** Login com Google */
  signInWithGoogle: async (): Promise<AuthUser> => {
    if (!ENV.USE_REAL_AUTH || !supabase) {
      await new Promise<void>(r => setTimeout(r, 800));
      mockLoggedIn = true;
      notifyListeners(MOCK_USER);
      return MOCK_USER;
    }

    // Supabase OAuth com Google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw new Error(error.message);

    // OAuth redireciona -- o onAuthStateChanged vai pegar o usuario
    // Retorna mock temporario, o listener atualiza
    return MOCK_USER;
  },

  /** Logout */
  signOut: async (): Promise<void> => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    mockLoggedIn = false;
    notifyListeners(null);
  },

  /** Usuario atual */
  getCurrentUser: (): AuthUser | null => {
    if (ENV.USE_REAL_AUTH && supabase) {
      // getUser() e async, mas podemos checar a sessao em cache
      const session = supabase.auth.getSession;
      // Fallback: usar o listener
    }
    return mockLoggedIn ? MOCK_USER : null;
  },

  /** Escutar mudancas no login/logout */
  onAuthStateChanged: (callback: AuthCallback): (() => void) => {
    authListeners.push(callback);

    // Se tem Supabase, escutar eventos reais
    if (ENV.USE_REAL_AUTH && supabase) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const user = supabaseUserToAuth(session.user);
          callback(user);
        } else {
          callback(null);
        }
      });

      return () => {
        authListeners = authListeners.filter(cb => cb !== callback);
        data.subscription.unsubscribe();
      };
    }

    // Mock: notificar estado atual
    callback(mockLoggedIn ? MOCK_USER : null);
    return () => {
      authListeners = authListeners.filter(cb => cb !== callback);
    };
  },

  /** Resetar senha */
  resetPassword: async (email: string): Promise<void> => {
    if (!supabase) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
  },
};
