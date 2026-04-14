import { ENV } from '../config/env';

// Types
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: 'google' | 'apple' | 'phone' | 'mock';
}

type AuthCallback = (user: AuthUser | null) => void;

// ── Mock Auth (when USE_REAL_AUTH = false) ──────────────────────

const MOCK_USER: AuthUser = {
  uid: 'mock_u1',
  email: 'user@nexa.app',
  displayName: 'você',
  photoURL: null,
  provider: 'mock',
};

let mockLoggedIn = false;
let authListeners: AuthCallback[] = [];

function notifyListeners(user: AuthUser | null) {
  authListeners.forEach(cb => cb(user));
}

// ── Public API ─────────────────────────────────────────────────

export const auth = {
  /** Sign in with Google */
  signInWithGoogle: async (): Promise<AuthUser> => {
    if (ENV.USE_REAL_AUTH) {
      try {
        const { GoogleSignin } = require('@react-native-google-signin/google-signin');
        const { default: firebaseAuth } = require('@react-native-firebase/auth');

        await GoogleSignin.hasPlayServices();
        const signInResult = await GoogleSignin.signIn();
        const idToken = signInResult.data?.idToken;
        if (!idToken) throw new Error('No ID token');

        const googleCredential = firebaseAuth.GoogleAuthProvider.credential(idToken);
        const result = await firebaseAuth().signInWithCredential(googleCredential);

        const user: AuthUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          provider: 'google',
        };
        notifyListeners(user);
        return user;
      } catch (error) {
        console.warn('Firebase Google sign-in failed, using mock:', error);
        // Fall through to mock
      }
    }

    // Mock sign-in
    await new Promise<void>(r => setTimeout(r, 800));
    mockLoggedIn = true;
    notifyListeners(MOCK_USER);
    return MOCK_USER;
  },

  /** Sign out */
  signOut: async (): Promise<void> => {
    if (ENV.USE_REAL_AUTH) {
      try {
        const { default: firebaseAuth } = require('@react-native-firebase/auth');
        const { GoogleSignin } = require('@react-native-google-signin/google-signin');
        await firebaseAuth().signOut();
        await GoogleSignin.signOut();
      } catch {}
    }
    mockLoggedIn = false;
    notifyListeners(null);
  },

  /** Get current user */
  getCurrentUser: (): AuthUser | null => {
    if (ENV.USE_REAL_AUTH) {
      try {
        const { default: firebaseAuth } = require('@react-native-firebase/auth');
        const fbUser = firebaseAuth().currentUser;
        if (fbUser) {
          return {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            provider: 'google',
          };
        }
      } catch {}
    }
    return mockLoggedIn ? MOCK_USER : null;
  },

  /** Subscribe to auth state changes */
  onAuthStateChanged: (callback: AuthCallback): (() => void) => {
    authListeners.push(callback);
    // Immediate callback with current state
    callback(auth.getCurrentUser());
    return () => {
      authListeners = authListeners.filter(cb => cb !== callback);
    };
  },
};
