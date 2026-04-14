import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, Text, View } from 'react-native';
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

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <NexaLogo size="large" />
        <Text style={{ color: colors.textMuted, fontFamily: 'Inter-Regular', fontSize: 12, marginTop: 16 }}>
          Carregando...
        </Text>
      </View>
    );
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
