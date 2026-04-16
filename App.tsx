import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, InteractionManager, Platform, StatusBar, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNexaStore } from './src/store/nexaStore';
import { analytics } from './src/services/analytics';
import { useLiveEngine } from './src/hooks/useLiveEngine';
import { LevelUpOverlay, StreakCelebration } from './src/components/Celebrations';
import { colors } from './src/theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import TabNavigator from './src/navigation/TabNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import NexaLogo from './src/components/NexaLogo';
import { Assets } from './src/assets';
import { supabaseAuth, AuthUser } from './src/services/supabaseAuth';
import { ENV } from './src/config/env';
import { useSupabaseSync } from './src/hooks/useSupabaseSync';
import { useOddsEngine } from './src/hooks/useOddsEngine';
import { setupPushNotifications, teardownPushNotifications } from './src/services/pushNotifications';
import { initFirebaseServices, setFirebaseUser } from './src/services/firebaseAnalytics';
import { initErrorTracking } from './src/services/errorTracking';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/services/queryClient';
import LoginScreen from './src/screens/LoginScreen';

let ToastMessage: any = null;
try { ToastMessage = require('react-native-toast-message').default; } catch {}

function AppContent() {
  const hasCompletedOnboarding = useNexaStore(s => s.user.hasCompletedOnboarding);
  const pendingLevelUp = useNexaStore(s => s.pendingLevelUp);
  const pendingStreak = useNexaStore(s => s.pendingStreak);
  const dismissLevelUp = useNexaStore(s => s.dismissLevelUp);
  const dismissStreak = useNexaStore(s => s.dismissStreak);
  useLiveEngine();

  // Carrega dados reais do Supabase (se USE_REAL_DATABASE = true)
  useSupabaseSync();

  // Motor de odds ao vivo (atualiza a cada 360s)
  useOddsEngine();

  // Analytics: init + sync user properties
  useEffect(() => {
    const state = useNexaStore.getState();
    analytics.init(state.user.id, `device_${Platform.OS}_${Date.now()}`);
    analytics.identifyFromState(state as any);
    return () => analytics.endSession();
  }, []);

  // Defer heavy services to after first render (startup perf)
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      initFirebaseServices().catch(() => {});
      setupPushNotifications().catch(() => {});
    });
    return () => { handle.cancel(); teardownPushNotifications(); };
  }, []);

  const handleDismissLevel = useCallback(() => dismissLevelUp(), [dismissLevelUp]);
  const handleDismissStreak = useCallback(() => dismissStreak(), [dismissStreak]);

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer
        onStateChange={(state) => {
          const route = state?.routes[state.index];
          if (route?.name) analytics.trackScreen(route.name);
        }}
      >
        <TabNavigator />
      </NavigationContainer>

      {/* Global celebration overlays */}
      <LevelUpOverlay
        visible={pendingLevelUp !== null}
        level={pendingLevelUp ?? 1}
        onDismiss={handleDismissLevel}
      />
      <StreakCelebration
        visible={pendingStreak !== null}
        streak={pendingStreak ?? 0}
        onDismiss={handleDismissStreak}
      />
    </View>
  );
}

function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.5)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Phase 1: Glow appears (fast)
    Animated.parallel([
      Animated.timing(glowOpacity, { toValue: 0.4, duration: 250, useNativeDriver: true }),
      Animated.timing(glowScale, { toValue: 1.5, duration: 500, useNativeDriver: true }),
    ]).start();

    // Phase 2: Logo scales in (overlap)
    const t1 = setTimeout(() => {
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, 100);

    // Phase 3: Text fades in
    const t2 = setTimeout(() => {
      Animated.timing(textOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, 500);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [logoScale, logoOpacity, textOpacity, glowScale, glowOpacity]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background glow */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: colors.primary,
          opacity: glowOpacity,
          transform: [{ scale: glowScale }],
        }}
      />
      {/* Logo */}
      <Animated.Image
        source={Assets.logo}
        style={{
          width: 160,
          height: 160,
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
          marginBottom: 20,
        }}
        resizeMode="cover"
      />
      {/* Text */}
      <Animated.Text
        style={{
          fontFamily: 'SpaceGrotesk-Bold',
          fontSize: 36,
          letterSpacing: 4,
          color: colors.primary,
          opacity: textOpacity,
          textShadowColor: colors.primaryGlow,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 16,
        }}
      >
        NEXA
      </Animated.Text>
      <Animated.Text
        style={{
          fontFamily: 'Inter-Regular',
          fontSize: 12,
          color: colors.textMuted,
          marginTop: 12,
          opacity: textOpacity,
        }}
      >
        Carregando...
      </Animated.Text>
    </View>
  );
}

// Initialize error tracking (Sentry)
initErrorTracking();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(ENV.USE_REAL_AUTH);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ENV.USE_REAL_AUTH) {
      setAuthUser({ uid: 'guest_local', email: null, displayName: 'Convidado', photoURL: null, provider: 'guest' });
      setAuthLoading(false);
      return;
    }
    const unsubscribe = supabaseAuth.onAuthStateChanged((user) => {
      setAuthUser(user as AuthUser | null);
      setAuthLoading(false);
      if (user) {
        setFirebaseUser(user.uid, { provider: user.provider });
      }
    });
    return unsubscribe;
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <NexaLogo size="large" spinning showText={false} glowIntensity="intense" />
      </View>
    );
  }

  if (!authUser) {
    return <LoginScreen onLoginSuccess={(user) => setAuthUser(user)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ErrorBoundary>
          <SafeAreaProvider>
            <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
            <AppContent />
            {ToastMessage && <ToastMessage />}
          </SafeAreaProvider>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
