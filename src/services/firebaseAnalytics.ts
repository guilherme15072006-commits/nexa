/**
 * NEXA — Firebase Analytics + Crashlytics
 *
 * Complementa o Amplitude (analytics.ts) com:
 * - Firebase Analytics: eventos nativos do Google (funil, atribuicao, audience)
 * - Crashlytics: crash reports automaticos + logs customizados
 *
 * Chamado no App.tsx junto com setupPushNotifications.
 */

import { Platform } from 'react-native';

// ─── Lazy imports (avoid crash if packages not linked) ──────

function getAnalytics() {
  try {
    return require('@react-native-firebase/analytics').default();
  } catch {
    return null;
  }
}

function getCrashlytics() {
  try {
    return require('@react-native-firebase/crashlytics').default();
  } catch {
    return null;
  }
}

// ─── Init ───────────────────────────────────────────────────

export async function initFirebaseServices(userId?: string): Promise<void> {
  const analytics = getAnalytics();
  const crashlytics = getCrashlytics();

  // Enable collection
  if (analytics) {
    await analytics.setAnalyticsCollectionEnabled(true).catch(() => {});
  }

  if (crashlytics) {
    await crashlytics.setCrashlyticsCollectionEnabled(true).catch(() => {});
  }

  // Set user context
  if (userId) {
    setFirebaseUser(userId);
  }
}

// ─── User Identity ──────────────────────────────────────────

export function setFirebaseUser(userId: string, props?: Record<string, string>): void {
  const analytics = getAnalytics();
  const crashlytics = getCrashlytics();

  if (analytics) {
    analytics.setUserId(userId).catch(() => {});
    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        analytics.setUserProperty(key, value).catch(() => {});
      });
    }
  }

  if (crashlytics) {
    crashlytics.setUserId(userId).catch(() => {});
    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        crashlytics.setAttribute(key, value).catch(() => {});
      });
    }
  }
}

// ─── Analytics Events ───────────────────────────────────────

export function logEvent(name: string, params?: Record<string, string | number>): void {
  const analytics = getAnalytics();
  if (analytics) {
    analytics.logEvent(name, params).catch(() => {});
  }
}

export function logScreenView(screenName: string): void {
  const analytics = getAnalytics();
  if (analytics) {
    analytics.logScreenView({ screen_name: screenName, screen_class: screenName }).catch(() => {});
  }
}

// ─── Crashlytics ────────────────────────────────────────────

export function logCrashMessage(message: string): void {
  const crashlytics = getCrashlytics();
  if (crashlytics) {
    crashlytics.log(message);
  }
}

export function recordError(error: Error, context?: string): void {
  const crashlytics = getCrashlytics();
  if (crashlytics) {
    if (context) {
      crashlytics.log(context);
    }
    crashlytics.recordError(error);
  }
}

export function setCrashlyticsAttribute(key: string, value: string): void {
  const crashlytics = getCrashlytics();
  if (crashlytics) {
    crashlytics.setAttribute(key, value).catch(() => {});
  }
}
