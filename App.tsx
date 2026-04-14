import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Image, StatusBar, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNexaStore } from './src/store/nexaStore';
import { useLiveEngine } from './src/hooks/useLiveEngine';
import { LevelUpOverlay, StreakCelebration } from './src/components/Celebrations';
import { colors } from './src/theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import TabNavigator from './src/navigation/TabNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import NexaLogo from './src/components/NexaLogo';
import { Assets } from './src/assets';
import { auth, AuthUser } from './src/services/firebase';
import { ENV } from './src/config/env';
import LoginScreen from './src/screens/LoginScreen';

function AppContent() {
  const hasCompletedOnboarding = useNexaStore(s => s.user.hasCompletedOnboarding);
  const pendingLevelUp = useNexaStore(s => s.pendingLevelUp);
  const pendingStreak = useNexaStore(s => s.pendingStreak);
  const dismissLevelUp = useNexaStore(s => s.dismissLevelUp);
  const dismissStreak = useNexaStore(s => s.dismissStreak);
  useLiveEngine();

  const handleDismissLevel = useCallback(() => dismissLevelUp(), [dismissLevelUp]);
  const handleDismissStreak = useCallback(() => dismissStreak(), [dismissStreak]);

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
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
    // Phase 1: Glow appears
    Animated.parallel([
      Animated.timing(glowOpacity, { toValue: 0.4, duration: 400, useNativeDriver: true }),
      Animated.timing(glowScale, { toValue: 1.5, duration: 800, useNativeDriver: true }),
    ]).start();

    // Phase 2: Logo scales in
    const t1 = setTimeout(() => {
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    }, 200);

    // Phase 3: Text fades in
    const t2 = setTimeout(() => {
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 800);

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
          width: 140,
          height: 140,
          borderRadius: 70,
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

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(ENV.USE_REAL_AUTH);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ENV.USE_REAL_AUTH) {
      setAuthUser({ uid: 'mock', email: null, displayName: 'você', photoURL: null, provider: 'mock' });
      setAuthLoading(false);
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthUser(user);
      setAuthLoading(false);
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
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <AppContent />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
