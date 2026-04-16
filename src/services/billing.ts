/**
 * NEXA — In-App Billing Service
 *
 * Integrates with:
 * - Google Play Billing (Android) via react-native-iap
 * - App Store (iOS) via react-native-iap
 * - Mock fallback for development
 *
 * Product IDs:
 * - nexa_pro_monthly:  R$29.90/month
 * - nexa_elite_monthly: R$79.90/month
 * - nexa_pro_trial:    7-day free trial → R$29.90/month
 *
 * Reference: YouTube Premium, Spotify subscription flow
 */

import { Platform } from 'react-native';
import { useNexaStore, type SubscriptionTier } from '../store/nexaStore';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface Product {
  id: string;
  title: string;
  price: string;
  currency: string;
  tier: SubscriptionTier;
  hasTrial: boolean;
  trialDays: number;
}

export interface PurchaseResult {
  success: boolean;
  productId: string;
  transactionId?: string;
  expiresAt?: string;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT IDS
// ═══════════════════════════════════════════════════════════════

export const PRODUCT_IDS = {
  pro: Platform.select({
    android: 'nexa_pro_monthly',
    ios: 'nexa_pro_monthly',
    default: 'nexa_pro_monthly',
  })!,
  elite: Platform.select({
    android: 'nexa_elite_monthly',
    ios: 'nexa_elite_monthly',
    default: 'nexa_elite_monthly',
  })!,
  proTrial: Platform.select({
    android: 'nexa_pro_trial',
    ios: 'nexa_pro_trial',
    default: 'nexa_pro_trial',
  })!,
};

const PRODUCT_TO_TIER: Record<string, SubscriptionTier> = {
  [PRODUCT_IDS.pro]: 'pro',
  [PRODUCT_IDS.elite]: 'elite',
  [PRODUCT_IDS.proTrial]: 'pro',
};

// ═══════════════════════════════════════════════════════════════
// IAP WRAPPER (lazy-load react-native-iap)
// ═══════════════════════════════════════════════════════════════

function getIAP() {
  try {
    return require('react-native-iap');
  } catch {
    return null;
  }
}

let initialized = false;

/** Initialize IAP connection — call once in App.tsx */
export async function initBilling(): Promise<boolean> {
  const iap = getIAP();
  if (!iap) {
    if (__DEV__) console.log('[Billing] react-native-iap not available, using mock');
    return false;
  }

  try {
    await iap.initConnection();
    initialized = true;

    // Listen for purchase updates
    iap.purchaseUpdatedListener(async (purchase: any) => {
      if (purchase.transactionReceipt) {
        // Acknowledge the purchase
        if (Platform.OS === 'android') {
          await iap.acknowledgePurchaseAndroid({ token: purchase.purchaseToken });
        }
        await iap.finishTransaction({ purchase, isConsumable: false });

        // Apply to store
        const tier = PRODUCT_TO_TIER[purchase.productId] ?? 'pro';
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        useNexaStore.getState().restorePurchase(
          tier,
          expiresAt,
          purchase.productId,
          Platform.OS as 'google' | 'apple',
        );
      }
    });

    iap.purchaseErrorListener((error: any) => {
      if (error.code !== 'E_USER_CANCELLED') {
        console.warn('[Billing] Purchase error:', error);
      }
    });

    return true;
  } catch (err) {
    console.warn('[Billing] Init failed:', err);
    return false;
  }
}

/** Cleanup — call on app close */
export async function endBilling(): Promise<void> {
  const iap = getIAP();
  if (iap && initialized) {
    await iap.endConnection().catch(() => {});
    initialized = false;
  }
}

// ═══════════════════════════════════════════════════════════════
// GET PRODUCTS
// ═══════════════════════════════════════════════════════════════

export async function getProducts(): Promise<Product[]> {
  const iap = getIAP();
  if (!iap || !initialized) return getMockProducts();

  try {
    const subs = await iap.getSubscriptions({
      skus: [PRODUCT_IDS.pro, PRODUCT_IDS.elite, PRODUCT_IDS.proTrial],
    });

    return subs.map((sub: any) => ({
      id: sub.productId,
      title: sub.title ?? sub.productId,
      price: sub.localizedPrice ?? `R$${sub.price}`,
      currency: sub.currency ?? 'BRL',
      tier: PRODUCT_TO_TIER[sub.productId] ?? 'pro',
      hasTrial: sub.productId === PRODUCT_IDS.proTrial || (sub.introductoryPrice != null),
      trialDays: sub.productId === PRODUCT_IDS.proTrial ? 7 : (sub.freeTrialPeriod ? 7 : 0),
    }));
  } catch {
    return getMockProducts();
  }
}

function getMockProducts(): Product[] {
  return [
    { id: PRODUCT_IDS.proTrial, title: 'Pro (7 dias gratis)', price: 'R$ 29,90/mes', currency: 'BRL', tier: 'pro', hasTrial: true, trialDays: 7 },
    { id: PRODUCT_IDS.pro, title: 'Pro Mensal', price: 'R$ 29,90/mes', currency: 'BRL', tier: 'pro', hasTrial: false, trialDays: 0 },
    { id: PRODUCT_IDS.elite, title: 'Elite Mensal', price: 'R$ 79,90/mes', currency: 'BRL', tier: 'elite', hasTrial: false, trialDays: 0 },
  ];
}

// ═══════════════════════════════════════════════════════════════
// PURCHASE
// ═══════════════════════════════════════════════════════════════

export async function purchaseSubscription(productId: string): Promise<PurchaseResult> {
  const iap = getIAP();
  if (!iap || !initialized) return mockPurchase(productId);

  try {
    await iap.requestSubscription({ sku: productId });
    // Actual result comes through purchaseUpdatedListener
    return { success: true, productId };
  } catch (err: any) {
    if (err.code === 'E_USER_CANCELLED') {
      return { success: false, productId, error: 'Compra cancelada pelo usuario' };
    }
    return { success: false, productId, error: err.message ?? 'Erro na compra' };
  }
}

async function mockPurchase(productId: string): Promise<PurchaseResult> {
  await new Promise<void>(r => setTimeout(r, 1500));
  const tier = PRODUCT_TO_TIER[productId] ?? 'pro';
  const isTrial = productId === PRODUCT_IDS.proTrial;

  if (isTrial) {
    useNexaStore.getState().startTrial();
  } else {
    useNexaStore.getState().upgradeTier(tier);
  }

  return {
    success: true,
    productId,
    transactionId: `mock_tx_${Date.now()}`,
    expiresAt: new Date(Date.now() + (isTrial ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════
// RESTORE PURCHASES
// ═══════════════════════════════════════════════════════════════

export async function restorePurchases(): Promise<PurchaseResult> {
  const iap = getIAP();
  if (!iap || !initialized) {
    return { success: false, productId: '', error: 'Nenhuma compra encontrada' };
  }

  try {
    const purchases = await iap.getAvailablePurchases();
    if (purchases.length === 0) {
      return { success: false, productId: '', error: 'Nenhuma assinatura ativa encontrada' };
    }

    // Find the most recent active subscription
    const latest = purchases.sort((a: any, b: any) =>
      (b.transactionDate ?? 0) - (a.transactionDate ?? 0),
    )[0];

    const tier = PRODUCT_TO_TIER[latest.productId] ?? 'pro';
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    useNexaStore.getState().restorePurchase(
      tier,
      expiresAt,
      latest.productId,
      Platform.OS as 'google' | 'apple',
    );

    return {
      success: true,
      productId: latest.productId,
      transactionId: latest.transactionId,
      expiresAt,
    };
  } catch (err: any) {
    return { success: false, productId: '', error: err.message ?? 'Erro ao restaurar' };
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/** Check if trial is still available (never trialed before) */
export function isTrialAvailable(): boolean {
  return useNexaStore.getState().userSubscription.trialEndsAt === null;
}

/** Check if subscription is expired */
export function isSubscriptionExpired(): boolean {
  const sub = useNexaStore.getState().userSubscription;
  if (sub.tier === 'free') return false;
  if (!sub.expiresAt) return false;
  return new Date(sub.expiresAt).getTime() < Date.now();
}

/** Get days remaining on subscription or trial */
export function getDaysRemaining(): number {
  const sub = useNexaStore.getState().userSubscription;
  if (!sub.expiresAt) return 0;
  const ms = new Date(sub.expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}
