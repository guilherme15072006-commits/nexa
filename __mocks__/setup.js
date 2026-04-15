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
    trackScreenView: jest.fn(),
    init: jest.fn(),
    identify: jest.fn(),
    flush: jest.fn(),
    endSession: jest.fn(),
    getEngagementScore: jest.fn(() => 50),
    getRetentionRisk: jest.fn(() => 'low'),
  },
  trackBet: jest.fn(),
  trackXPGain: jest.fn(),
  trackOddsChange: jest.fn(),
  trackUserState: jest.fn(),
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
