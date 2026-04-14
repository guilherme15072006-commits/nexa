import React, { useCallback } from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNexaStore } from './src/store/nexaStore';
import { useLiveEngine } from './src/hooks/useLiveEngine';
import { LevelUpOverlay, StreakCelebration } from './src/components/Celebrations';
import { colors } from './src/theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import TabNavigator from './src/navigation/TabNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';

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
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <AppContent />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
