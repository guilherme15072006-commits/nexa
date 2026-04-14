import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, spacing, radius, typography, anim } from '../theme';
import { useNexaStore } from '../store/nexaStore';
import { ScalePress } from '../components/ui';

import FeedScreen from '../screens/FeedScreen';
import ApostasScreen from '../screens/ApostasScreen';
import RankingScreen from '../screens/RankingScreen';
import PerfilScreen from '../screens/PerfilScreen';

const TABS = [
  { id: 'feed',    label: 'Inicio',   icon: 'H' },
  { id: 'apostas', label: 'Apostas',  icon: 'A' },
  { id: 'ranking', label: 'Ranking',  icon: 'R' },
  { id: 'perfil',  label: 'Perfil',   icon: 'P' },
];

function TabItem({ tab, active, onPress }: {
  tab: typeof TABS[0]; active: boolean; onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(active ? 1 : 0)).current;
  const dotWidth = useRef(new Animated.Value(active ? 16 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: active ? 1 : 0,
        ...anim.springFast,
      }),
      Animated.spring(dotWidth, {
        toValue: active ? 16 : 0,
        ...anim.spring,
      }),
    ]).start();
  }, [active]);

  const iconScale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <ScalePress onPress={onPress} style={styles.tabItem}>
      <Animated.View style={[
        styles.tabIcon,
        active && styles.tabIconActive,
        { transform: [{ scale: iconScale }] },
      ]}>
        <Text style={[styles.tabIconText, active && styles.tabIconTextActive]}>{tab.icon}</Text>
      </Animated.View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
      {/* Active indicator dot — Linear precision */}
      <Animated.View style={[styles.tabDot, { width: dotWidth, opacity: scaleAnim }]} />
    </ScalePress>
  );
}

export default function TabNavigator() {
  const { activeTab, setActiveTab } = useNexaStore();

  const renderScreen = () => {
    switch (activeTab) {
      case 'feed':    return <FeedScreen />;
      case 'apostas': return <ApostasScreen />;
      case 'ranking': return <RankingScreen />;
      case 'perfil':  return <PerfilScreen />;
      default:        return <FeedScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenArea}>{renderScreen()}</View>

      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TabItem
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onPress={() => setActiveTab(tab.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  screenArea: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingBottom: 26,
    paddingTop: 10,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  tabIcon: {
    width: 38, height: 30, alignItems: 'center', justifyContent: 'center',
    borderRadius: radius.md,
  },
  tabIconActive: { backgroundColor: colors.primary + '18' },
  tabIconText: {
    fontSize: 14, fontFamily: typography.display,
    color: colors.textMuted,
  },
  tabIconTextActive: { color: colors.primary },
  tabLabel: { fontSize: 10, fontFamily: typography.body, color: colors.textMuted },
  tabLabelActive: { color: colors.primary, fontFamily: typography.bodyMed },
  tabDot: {
    height: 2, borderRadius: 1, backgroundColor: colors.primary,
    marginTop: 2,
  },
});
