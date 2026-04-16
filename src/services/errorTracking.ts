/**
 * NEXA — Error Tracking (Sentry)
 *
 * Crash reporting + performance monitoring em produção.
 * Sentry mostra EXATAMENTE onde o erro aconteceu com:
 * - Stack trace completo
 * - Breadcrumbs (últimas ações do user antes do crash)
 * - Device info, OS version, app version
 * - User context (ID, tier, level)
 */

function getSentry() {
  try {
    return require('@sentry/react-native');
  } catch {
    return null;
  }
}

/** Initialize Sentry (call once in App.tsx) */
export function initErrorTracking(): void {
  const Sentry = getSentry();
  if (!Sentry) return;

  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN', // Replace with real DSN
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    profilesSampleRate: __DEV__ ? 1.0 : 0.1,
    environment: __DEV__ ? 'development' : 'production',
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    attachStacktrace: true,
    enableNativeCrashHandling: true,
  });
}

/** Set user context (call after login) */
export function setErrorTrackingUser(userId: string, tier: string, level: number): void {
  const Sentry = getSentry();
  if (!Sentry) return;

  Sentry.setUser({ id: userId });
  Sentry.setTag('tier', tier);
  Sentry.setTag('level', String(level));
}

/** Log a breadcrumb (manual event) */
export function addBreadcrumb(category: string, message: string, data?: Record<string, any>): void {
  const Sentry = getSentry();
  if (!Sentry) return;

  Sentry.addBreadcrumb({ category, message, data, level: 'info' });
}

/** Capture error manually */
export function captureError(error: Error, context?: Record<string, any>): void {
  const Sentry = getSentry();
  if (!Sentry) return;

  if (context) {
    Sentry.setExtras(context);
  }
  Sentry.captureException(error);
}

/** Wrap a component with Sentry error boundary */
export function wrapWithSentry(component: React.ComponentType): React.ComponentType {
  const Sentry = getSentry();
  if (!Sentry?.wrap) return component;
  return Sentry.wrap(component);
}
