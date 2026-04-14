import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Platform } from 'react-native';
import { useNexaStore } from './src/store/nexaStore';
import OnboardingScreen from './src/screens/OnboardingScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { colors } from './src/theme';
import { analytics } from './src/services/analytics';
import { setupErrorReporting } from './src/services/linear';

export default function App() {
  const isOnboarded = useNexaStore(s => s.isOnboarded);
  const user = useNexaStore(s => s.user);

  // Init analytics + error reporting on mount
  useEffect(() => {
    const deviceId = `${Platform.OS}-${Date.now()}`;
    analytics.init(user.id, deviceId);
    analytics.identify({
      userId: user.id,
      level: user.level,
      tier: 'silver',
      dna: user.dna,
      state: user.state,
      clan: user.clan,
      streak: user.streak,
      winRate: user.winRate,
      roi: user.roi,
      balance: user.balance,
      coins: user.coins,
      rank: user.rank,
      badgesUnlocked: user.badges.filter(b => b.unlocked).length,
      following: user.following.length,
    });

    setupErrorReporting();

    return () => {
      analytics.endSession();
    };
  }, []);

  // Update user properties when they change
  useEffect(() => {
    analytics.identify({
      level: user.level,
      streak: user.streak,
      winRate: user.winRate,
      balance: user.balance,
      coins: user.coins,
      rank: user.rank,
      state: user.state,
    });
  }, [user.level, user.streak, user.winRate, user.balance, user.coins, user.rank, user.state]);

  return (
    <SafeAreaView style={styles.root}>
      {isOnboarded ? <TabNavigator /> : <OnboardingScreen />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
