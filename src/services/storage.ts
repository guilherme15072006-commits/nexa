/**
 * NEXA — Storage Service (MMKV)
 *
 * 10x mais rápido que AsyncStorage.
 * Usado por: Zustand persist, session cache, offline data.
 * Referência: Discord, Facebook Messenger usam MMKV.
 */

let mmkvInstance: any = null;

function getMMKV() {
  if (mmkvInstance) return mmkvInstance;
  try {
    const { MMKV } = require('react-native-mmkv');
    mmkvInstance = new MMKV({ id: 'nexa-store' });
    return mmkvInstance;
  } catch {
    return null;
  }
}

/** Zustand storage adapter for MMKV */
export const mmkvStorage = {
  getItem: (name: string): string | null => {
    const mmkv = getMMKV();
    if (!mmkv) return null;
    return mmkv.getString(name) ?? null;
  },
  setItem: (name: string, value: string): void => {
    const mmkv = getMMKV();
    if (mmkv) mmkv.set(name, value);
  },
  removeItem: (name: string): void => {
    const mmkv = getMMKV();
    if (mmkv) mmkv.delete(name);
  },
};

/** Secure storage for tokens/keys (uses Keychain) */
export const secureStorage = {
  set: async (key: string, value: string): Promise<void> => {
    try {
      const Keychain = require('react-native-keychain');
      await Keychain.setGenericPassword(key, value, { service: `nexa.${key}` });
    } catch {
      /* fallback: use MMKV */ mmkvStorage.setItem(`secure_${key}`, value);
    }
  },
  get: async (key: string): Promise<string | null> => {
    try {
      const Keychain = require('react-native-keychain');
      const result = await Keychain.getGenericPassword({ service: `nexa.${key}` });
      return result ? result.password : null;
    } catch {
      return mmkvStorage.getItem(`secure_${key}`);
    }
  },
  remove: async (key: string): Promise<void> => {
    try {
      const Keychain = require('react-native-keychain');
      await Keychain.resetGenericPassword({ service: `nexa.${key}` });
    } catch {
      mmkvStorage.removeItem(`secure_${key}`);
    }
  },
};

/** Simple cache with TTL */
export const cache = {
  set: (key: string, value: any, ttlMs: number): void => {
    const mmkv = getMMKV();
    if (!mmkv) return;
    mmkv.set(`cache_${key}`, JSON.stringify({ value, expiresAt: Date.now() + ttlMs }));
  },
  get: <T>(key: string): T | null => {
    const mmkv = getMMKV();
    if (!mmkv) return null;
    const raw = mmkv.getString(`cache_${key}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.expiresAt < Date.now()) {
        mmkv.delete(`cache_${key}`);
        return null;
      }
      return parsed.value as T;
    } catch {
      return null;
    }
  },
  clear: (): void => {
    const mmkv = getMMKV();
    if (mmkv) mmkv.clearAll();
  },
};
