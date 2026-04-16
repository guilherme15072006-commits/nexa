import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius } from '../theme';
import { useNexaStore, type Tab as NexaTab } from '../store/nexaStore';
import { hapticSelection } from '../services/haptics';
import { ErrorBoundary } from '../components/ErrorBoundary';

// ─── Eager: Tab screens (always loaded) ─────────────────────────────────────
import FeedScreen from '../screens/FeedScreen';
import ApostasScreen from '../screens/ApostasScreen';
import RankingScreen from '../screens/RankingScreen';
import PerfilScreen from '../screens/PerfilScreen';

// ─── Lazy: Modal/Stack screens (loaded on demand) ───────────────────────────
const WalletScreen = lazy(() => import('../screens/WalletScreen'));
const NotificationsScreen = lazy(() => import('../screens/NotificationsScreen'));
const DashboardScreen = lazy(() => import('../screens/DashboardScreen'));
const TipsterProfileScreen = lazy(() => import('../screens/TipsterProfileScreen'));
const ClanDetailScreen = lazy(() => import('../screens/ClanDetailScreen'));
const SearchScreen = lazy(() => import('../screens/SearchScreen'));
const SettingsScreen = lazy(() => import('../screens/SettingsScreen'));
const BetHistoryScreen = lazy(() => import('../screens/BetHistoryScreen'));
const LivesScreen = lazy(() => import('../screens/LivesScreen'));
const MarketplaceScreen = lazy(() => import('../screens/MarketplaceScreen'));
const NexaPlayScreen = lazy(() => import('../screens/NexaPlayScreen'));
const StoriesScreen = lazy(() => import('../screens/StoriesScreen'));
const ExploreScreen = lazy(() => import('../screens/ExploreScreen'));
const EventsScreen = lazy(() => import('../screens/EventsScreen'));
const CreatorStudioScreen = lazy(() => import('../screens/CreatorStudioScreen'));
const AudioRoomsScreen = lazy(() => import('../screens/AudioRoomsScreen'));
const SubscriptionScreen = lazy(() => import('../screens/SubscriptionScreen'));
const ReferralScreen = lazy(() => import('../screens/ReferralScreen'));
const AdminDashboardScreen = lazy(() => import('../screens/AdminDashboardScreen'));
const KYCScreen = lazy(() => import('../screens/KYCScreen'));
const SeasonScreen = lazy(() => import('../screens/SeasonScreen'));

// ─── Suspense fallback ──────────────────────────────────────────────────────
function LazyFallback() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const BottomTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  name: string,
): React.FC<P> {
  return function BoundedScreen(props: P) {
    return (
      <ErrorBoundary fallbackMessage={`Erro em ${name}`}>
        <Suspense fallback={<LazyFallback />}>
          <WrappedComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

const TABS: { key: string; label: string; icon: string }[] = [
  { key: 'feed',    label: 'Feed',    icon: '◈' },
  { key: 'apostas', label: 'Apostas', icon: '⚡' },
  { key: 'ranking', label: 'Ranking', icon: '◆' },
  { key: 'perfil',  label: 'Perfil',  icon: '◉' },
];

function CustomTabBar({ state, navigation }: any) {
  const setActiveTab = useNexaStore(s => s.setActiveTab);

  return (
    <View style={styles.tabBar}>
      {TABS.map((tab, index) => {
        const focused = state.index === index;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => {
              hapticSelection();
              setActiveTab(tab.key as NexaTab);
              navigation.navigate(tab.key);
            }}
            accessibilityLabel={tab.label}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
              {tab.label}
            </Text>
            {focused && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TabScreens() {
  return (
    <BottomTab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <BottomTab.Screen name="feed" component={withErrorBoundary(FeedScreen, 'Feed')} />
      <BottomTab.Screen name="apostas" component={withErrorBoundary(ApostasScreen, 'Apostas')} />
      <BottomTab.Screen name="ranking" component={withErrorBoundary(RankingScreen, 'Ranking')} />
      <BottomTab.Screen name="perfil" component={withErrorBoundary(PerfilScreen, 'Perfil')} />
    </BottomTab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tabs" component={TabScreens} />
      <Stack.Screen name="Wallet" component={withErrorBoundary(WalletScreen, 'Carteira')} />
      <Stack.Screen name="Notifications" component={withErrorBoundary(NotificationsScreen, 'Notificações')} />
      <Stack.Screen name="Dashboard" component={withErrorBoundary(DashboardScreen, 'Dashboard')} />
      <Stack.Screen name="TipsterProfile" component={withErrorBoundary(TipsterProfileScreen, 'Perfil do Tipster')} />
      <Stack.Screen name="ClanDetail" component={withErrorBoundary(ClanDetailScreen, 'Detalhes do Clã')} />
      <Stack.Screen name="Search" component={withErrorBoundary(SearchScreen, 'Busca')} />
      <Stack.Screen name="Settings" component={withErrorBoundary(SettingsScreen, 'Configurações')} />
      <Stack.Screen name="BetHistory" component={withErrorBoundary(BetHistoryScreen, 'Histórico de Apostas')} />
      <Stack.Screen name="Lives" component={withErrorBoundary(LivesScreen, 'Lives')} />
      <Stack.Screen name="Marketplace" component={withErrorBoundary(MarketplaceScreen, 'Marketplace')} />
      <Stack.Screen name="NexaPlay" component={withErrorBoundary(NexaPlayScreen, 'NexaPlay')} />
      <Stack.Screen name="Stories" component={withErrorBoundary(StoriesScreen, 'Stories')} />
      <Stack.Screen name="Explore" component={withErrorBoundary(ExploreScreen, 'Explorar')} />
      <Stack.Screen name="Events" component={withErrorBoundary(EventsScreen, 'Eventos')} />
      <Stack.Screen name="CreatorStudio" component={withErrorBoundary(CreatorStudioScreen, 'Creator Studio')} />
      <Stack.Screen name="AudioRooms" component={withErrorBoundary(AudioRoomsScreen, 'Salas de Áudio')} />
      <Stack.Screen name="Subscription" component={withErrorBoundary(SubscriptionScreen, 'Assinatura')} />
      <Stack.Screen name="Referral" component={withErrorBoundary(ReferralScreen, 'Convite')} />
      <Stack.Screen name="AdminDashboard" component={withErrorBoundary(AdminDashboardScreen, 'Admin')} />
      <Stack.Screen name="KYC" component={withErrorBoundary(KYCScreen, 'Verificação')} />
      <Stack.Screen name="Season" component={withErrorBoundary(SeasonScreen, 'Temporada')} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
    paddingTop: spacing.xs,
  },
  tabIcon: {
    fontSize: 18,
    color: colors.textMuted,
  },
  tabIconFocused: {
    color: colors.primary,
  },
  tabLabel: {
    ...typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  tabLabelFocused: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
});
