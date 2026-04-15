import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Platform, View, Animated } from 'react-native';
import { useNexaStore } from './src/store/nexaStore';
import OnboardingScreen from './src/screens/OnboardingScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { Logo } from './src/components/Logo';
import { colors } from './src/theme';
import { analytics } from './src/services/analytics';
import { setupErrorReporting } from './src/services/linear';

function SplashScreen({ onDone }: { onDone: () => void }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(onDone);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.splash}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Logo size={150} />
      </Animated.View>
    </View>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
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

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaView style={styles.root}>
      {isOnboarded ? <TabNavigator /> : <OnboardingScreen />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
