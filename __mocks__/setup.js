// Mock services that use native modules
jest.mock('../src/services/haptics', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
  hapticSuccess: jest.fn(),
  hapticError: jest.fn(),
}));
jest.mock('../src/services/sounds', () => ({
  playCheckin: jest.fn(),
  playXPGain: jest.fn(),
  playSocialAction: jest.fn(),
  playBet: jest.fn(),
  playLevelUp: jest.fn(),
}));
jest.mock('../src/services/analytics', () => ({
  analytics: {
    track: jest.fn(),
    trackScreen: jest.fn(),
    trackScreenView: jest.fn(),
    trackFunnel: jest.fn(),
    trackRevenue: jest.fn(),
    trackTiming: jest.fn(),
    init: jest.fn(),
    identify: jest.fn(),
    identifyFromState: jest.fn(),
    flush: jest.fn(),
    endSession: jest.fn(),
    getEngagementScore: jest.fn(() => 50),
    getRetentionRisk: jest.fn(() => 'low'),
  },
  trackBet: jest.fn(),
  trackXPGain: jest.fn(),
  trackOddsChange: jest.fn(),
  trackUserState: jest.fn(),
  trackOnboardingStep: jest.fn(),
  trackDepositFunnel: jest.fn(),
  trackBetFunnel: jest.fn(),
  trackSubscriptionFunnel: jest.fn(),
  trackDeposit: jest.fn(),
  trackSubscriptionRevenue: jest.fn(),
  trackMarketplaceRevenue: jest.fn(),
  trackSocialAction: jest.fn(),
  trackScreenView: jest.fn(),
}));
jest.mock('../src/services/linear', () => ({
  linear: {
    reportResponsibleGaming: jest.fn(),
    reportBug: jest.fn(),
  },
}));
jest.mock('../src/services/supabaseAuth', () => ({
  supabaseAuth: {
    signInWithEmail: jest.fn(),
    signUp: jest.fn(),
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(() => null),
    onAuthStateChanged: jest.fn((cb) => { cb(null); return () => {}; }),
    resetPassword: jest.fn(),
  },
}));
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({ select: jest.fn(), insert: jest.fn(), update: jest.fn() })),
    auth: { onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })) },
    channel: jest.fn(() => ({ on: jest.fn().mockReturnThis(), subscribe: jest.fn() })),
    removeChannel: jest.fn(),
  })),
}));

// Mock gesture handler for Jest
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
  GestureDetector: ({ children }) => children,
  Gesture: {
    Tap: () => ({ enabled: () => ({ onBegin: () => ({ onFinalize: () => ({ onEnd: () => ({}) }) }) }) }),
    Pan: () => ({ onUpdate: () => ({ onEnd: () => ({}) }) }),
    LongPress: () => ({ enabled: () => ({ minDuration: () => ({ onStart: () => ({}) }) }) }),
    Race: (...args) => args[0],
  },
}));

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: { View, Text: require('react-native').Text, FlatList: require('react-native').FlatList, createAnimatedComponent: (c) => c },
    useSharedValue: jest.fn((v) => ({ value: v })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((v) => v),
    withSpring: jest.fn((v) => v),
    withSequence: jest.fn((...args) => args[0]),
    withRepeat: jest.fn((v) => v),
    FadeIn: { delay: () => ({ duration: () => ({ springify: () => ({}) }) }) },
    FadeInDown: { delay: () => ({ duration: () => ({ springify: () => ({}) }) }) },
    FadeOutRight: { duration: () => ({}) },
    LinearTransition: { springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) },
    Layout: { springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) },
    runOnJS: jest.fn((fn) => fn),
    Easing: { bezier: jest.fn() },
    SharedTransition: {
      custom: () => ({ defaultTransitionType: () => ({}) }),
      duration: () => ({ springify: () => ({ damping: () => ({ stiffness: () => ({ defaultTransitionType: () => ({}) }) }) }) }),
    },
    SharedTransitionType: { ANIMATION: 0 },
  };
});

// New services added in Phases 3-5
jest.mock('../src/services/firebaseAnalytics', () => ({
  initFirebaseServices: jest.fn(() => Promise.resolve()),
  setFirebaseUser: jest.fn(),
  logEvent: jest.fn(),
  logScreenView: jest.fn(),
  recordError: jest.fn(),
  logCrashMessage: jest.fn(),
  setCrashlyticsAttribute: jest.fn(),
}));
jest.mock('../src/services/pushNotifications', () => ({
  setupPushNotifications: jest.fn(() => Promise.resolve()),
  teardownPushNotifications: jest.fn(),
  smartPush: { schedule: jest.fn(), start: jest.fn(), stop: jest.fn() },
  SMART_TEMPLATES: {},
  getPushConfig: jest.fn(() => ({ enabled: false, token: null })),
}));
jest.mock('../src/services/payment', () => ({
  createPixDeposit: jest.fn(() => Promise.resolve({ id: 'mock', externalId: 'mock', amount: 100, status: 'pending', pixQrCode: '', pixCopyPaste: 'PIX_MOCK', expiresAt: '', createdAt: '' })),
  requestWithdraw: jest.fn(() => Promise.resolve({ id: 'mock', externalId: 'mock', amount: 50, status: 'pending', pixKey: '', pixKeyType: 'cpf', estimatedAt: '', createdAt: '', completedAt: null })),
  checkPaymentStatus: jest.fn(() => Promise.resolve('confirmed')),
}));
jest.mock('../src/services/billing', () => ({
  initBilling: jest.fn(() => Promise.resolve(false)),
  endBilling: jest.fn(),
  purchaseSubscription: jest.fn(() => Promise.resolve({ success: true, productId: 'mock' })),
  restorePurchases: jest.fn(() => Promise.resolve({ success: false, productId: '', error: 'No purchases' })),
  getProducts: jest.fn(() => Promise.resolve([])),
  isTrialAvailable: jest.fn(() => true),
  isSubscriptionExpired: jest.fn(() => false),
  getDaysRemaining: jest.fn(() => 30),
  PRODUCT_IDS: { pro: 'nexa_pro_monthly', elite: 'nexa_elite_monthly', proTrial: 'nexa_pro_trial' },
}));
jest.mock('../src/services/share', () => ({
  sharePick: jest.fn(() => Promise.resolve({ shared: false })),
  shareStats: jest.fn(() => Promise.resolve({ shared: false })),
  shareMatch: jest.fn(() => Promise.resolve({ shared: false })),
  shareReferral: jest.fn(() => Promise.resolve({ shared: false })),
  shareStory: jest.fn(() => Promise.resolve({ shared: false })),
}));
jest.mock('@shopify/flash-list', () => ({
  FlashList: 'FlashList',
}));
jest.mock('@d11/react-native-fast-image', () => 'FastImage');
