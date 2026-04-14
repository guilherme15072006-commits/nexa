import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SmoothEntry, TapScale } from '../components/LiveComponents';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, AppNotification, NotificationType } from '../store/nexaStore';
import { hapticLight, hapticMedium } from '../services/haptics';

// ─── Constants ────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'social' | 'bets' | 'system';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tudo' },
  { key: 'social', label: 'Social' },
  { key: 'bets', label: 'Apostas' },
  { key: 'system', label: 'Sistema' },
];

const FILTER_MAP: Record<FilterTab, NotificationType[]> = {
  all: [],
  social: ['social'],
  bets: ['bet_result'],
  system: ['system', 'season', 'mission', 'streak'],
};

const TYPE_ICON: Record<NotificationType, string> = {
  bet_result: '🎯',
  social: '👤',
  system: '⚙️',
  season: '🏆',
  mission: '🎯',
  streak: '🔥',
};

// ─── NotificationRow ──────────────────────────────────────────────────────────

function NotificationRow({
  item,
  index,
  onPress,
}: {
  item: AppNotification;
  index: number;
  onPress: () => void;
}) {
  return (
    <SmoothEntry delay={index * 40}>
      <TapScale onPress={onPress}>
        <View
          style={[
            styles.notifRow,
            !item.read && styles.notifRowUnread,
          ]}
        >
          {!item.read && <View style={styles.unreadIndicator} />}
          <View style={styles.notifIcon}>
            <Text style={styles.notifIconText}>{item.icon || TYPE_ICON[item.type]}</Text>
          </View>
          <View style={styles.notifContent}>
            <View style={styles.notifHeader}>
              <Text
                style={[
                  styles.notifTitle,
                  !item.read && styles.notifTitleUnread,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={styles.notifTime}>{item.createdAt}</Text>
            </View>
            <Text style={styles.notifMessage} numberOfLines={2}>
              {item.message}
            </Text>
          </View>
        </View>
      </TapScale>
    </SmoothEntry>
  );
}

// ─── NotificationsScreen ──────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const notifications = useNexaStore((s) => s.notifications);
  const unreadCount = useNexaStore((s) => s.unreadCount);
  const markNotificationRead = useNexaStore((s) => s.markNotificationRead);
  const markAllRead = useNexaStore((s) => s.markAllRead);

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    const types = FILTER_MAP[activeFilter];
    return notifications.filter((n) => types.includes(n.type));
  }, [notifications, activeFilter]);

  const handleTapNotification = useCallback(
    (id: string) => {
      hapticLight();
      markNotificationRead(id);
    },
    [markNotificationRead],
  );

  const handleMarkAll = useCallback(() => {
    hapticMedium();
    markAllRead();
  }, [markAllRead]);

  const renderItem = useCallback(
    ({ item, index }: { item: AppNotification; index: number }) => (
      <NotificationRow
        item={item}
        index={index}
        onPress={() => handleTapNotification(item.id)}
      />
    ),
    [handleTapNotification],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🔔</Text>
        <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
        <Text style={styles.emptyMessage}>
          {activeFilter === 'all'
            ? 'Você está em dia! Novas notificações aparecerão aqui.'
            : `Nenhuma notificação de "${FILTER_TABS.find((t) => t.key === activeFilter)?.label}" no momento.`}
        </Text>
      </View>
    ),
    [activeFilter],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TapScale onPress={() => navigation.goBack()}>
          <View style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </View>
        </TapScale>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notificações</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TapScale onPress={handleMarkAll}>
            <View style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Marcar tudo</Text>
            </View>
          </TapScale>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Filter Tabs */}
      <SmoothEntry delay={0}>
        <View style={styles.filterRow}>
          {FILTER_TABS.map((tab) => {
            const active = activeFilter === tab.key;
            return (
              <TapScale
                key={tab.key}
                onPress={() => {
                  hapticLight();
                  setActiveFilter(tab.key);
                }}
              >
                <View style={[styles.filterTab, active && styles.filterTabActive]}>
                  <Text
                    style={[
                      styles.filterTabText,
                      active && styles.filterTabTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </View>
              </TapScale>
            );
          })}
        </View>
      </SmoothEntry>

      {/* Notification List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    ...typography.display,
    fontSize: 18,
    color: colors.textPrimary,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.display,
    fontSize: 20,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 80,
  },
  badge: {
    backgroundColor: colors.red,
    borderRadius: radius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs + 2,
  },
  badgeText: {
    ...typography.bodySemiBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  markAllBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  markAllText: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: colors.primary,
  },

  // Filter Tabs
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  filterTabText: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  filterTabTextActive: {
    color: colors.primary,
  },

  // List
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Notification Row
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  notifRowUnread: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.primary + '30',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  notifIconText: {
    fontSize: 18,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notifTitle: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  notifTitleUnread: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  notifTime: {
    ...typography.body,
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  notifMessage: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.display,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
