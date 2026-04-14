import React, { useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore } from '../store/nexaStore';
import { SmoothEntry, TapScale } from '../components/LiveComponents';
import { Card, SectionHeader } from '../components/ui';
import LiveChat from '../components/LiveChat';
import { hapticLight } from '../services/haptics';

// ─── Types ──────────────────────────────────────────────────────────────────

type RouteParams = { ClanDetail: { clanId: string } };

// ─── Component ──────────────────────────────────────────────────────────────

export default function ClanDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ClanDetail'>>();
  const { clanId } = route.params;

  const clan = useNexaStore((s) => s.clans.find((c) => c.id === clanId));
  const leaderboard = useNexaStore((s) => s.leaderboard);
  const expandedChat = useNexaStore((s) => s.expandedChat);
  const toggleChat = useNexaStore((s) => s.toggleChat);

  const handleGoBack = useCallback(() => {
    hapticLight();
    navigation.goBack();
  }, [navigation]);

  if (!clan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Cla nao encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get clan members from leaderboard
  const clanMembers = useMemo(
    () => leaderboard.filter((u) => u.clan === clanId).slice(0, 10),
    [leaderboard, clanId],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <SmoothEntry delay={0}>
          <View style={styles.header}>
            <TapScale onPress={handleGoBack}>
              <View style={styles.backButton}>
                <Text style={styles.backIcon}>{'<'}</Text>
              </View>
            </TapScale>
            <Text style={styles.headerTitle}>Detalhe do Cla</Text>
            <View style={styles.backButton} />
          </View>
        </SmoothEntry>

        {/* Clan Badge + Info */}
        <SmoothEntry delay={100}>
          <View style={styles.clanHeader}>
            <View style={styles.clanBadge}>
              <Text style={styles.clanBadgeEmoji}>{clan.badge}</Text>
            </View>
            <Text style={styles.clanName}>{clan.name}</Text>
            <Text style={styles.clanTag}>[{clan.tag}]</Text>
          </View>
        </SmoothEntry>

        {/* Stats */}
        <SmoothEntry delay={200}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>#{clan.rank}</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{clan.members}</Text>
              <Text style={styles.statLabel}>Membros</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.gold }]}>
                {(clan.xp / 1000).toFixed(1)}k
              </Text>
              <Text style={styles.statLabel}>XP Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.green }]}>
                {(clan.weeklyXp / 1000).toFixed(1)}k
              </Text>
              <Text style={styles.statLabel}>XP Semanal</Text>
            </View>
          </View>
        </SmoothEntry>

        {/* Members */}
        <SmoothEntry delay={300}>
          <Card style={styles.membersCard}>
            <Text style={styles.sectionTitle}>
              Membros ({clanMembers.length})
            </Text>
            {clanMembers.map((member, index) => (
              <View key={member.id} style={styles.memberRow}>
                <Text style={styles.memberRank}>#{index + 1}</Text>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {member.username.charAt(0)}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.username}</Text>
                  <Text style={styles.memberStats}>
                    Lv.{member.level} · {(member.winRate * 100).toFixed(0)}% WR
                  </Text>
                </View>
                <Text style={styles.memberXp}>{member.xp} XP</Text>
              </View>
            ))}
            {clanMembers.length === 0 && (
              <Text style={styles.emptyText}>Nenhum membro encontrado</Text>
            )}
          </Card>
        </SmoothEntry>

        {/* Clan Chat */}
        <SmoothEntry delay={400}>
          <SectionHeader title="Chat do Cl\u00e3" style={styles.section} />
          <LiveChat
            matchId={`clan_${clan.id}`}
            expanded={expandedChat === `clan_${clan.id}`}
            onToggle={() => toggleChat(`clan_${clan.id}`)}
          />
        </SmoothEntry>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  headerTitle: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    fontSize: 17,
  },

  // Clan Header
  clanHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  clanBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  clanBadgeEmoji: {
    fontSize: 36,
  },
  clanName: {
    ...typography.display,
    color: colors.textPrimary,
    fontSize: 22,
    marginBottom: spacing.xs,
  },
  clanTag: {
    ...typography.mono,
    color: colors.primary,
    fontSize: 14,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.monoBold,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },

  // Members
  membersCard: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  memberRank: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 12,
    width: 28,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  memberAvatarText: {
    ...typography.display,
    color: colors.primary,
    fontSize: 14,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  memberStats: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  memberXp: {
    ...typography.mono,
    color: colors.gold,
    fontSize: 12,
  },

  // Section
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});
