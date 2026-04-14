import React, { useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TapScale, SmoothEntry, PulsingDot, AvatarStack } from '../components/LiveComponents';
import { Card, SectionHeader, Avatar, Pill } from '../components/ui';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, type AudioRoom } from '../store/nexaStore';
import { hapticLight, hapticMedium } from '../services/haptics';

// ─── Tier Ring Color ─────────────────────────────────────────────────────────

function getTierColor(tier?: string): string {
  switch (tier) {
    case 'elite': return colors.primary;
    case 'gold':  return colors.gold;
    case 'silver': return '#C0C0C0';
    default:       return colors.textMuted;
  }
}

// ─── Live Room Card ──────────────────────────────────────────────────────────

function LiveRoomCard({ room, index }: { room: AudioRoom; index: number }) {
  const handleJoin = useCallback(() => {
    hapticMedium();
  }, []);

  return (
    <SmoothEntry delay={index * 80}>
      <Card>
        <View style={styles.roomHeader}>
          <View style={styles.roomLiveBadge}>
            <PulsingDot color={colors.red} size={8} />
            <Text style={styles.roomLiveText}>AO VIVO</Text>
          </View>
          <Pill label={room.topic} color={colors.primary} />
        </View>

        <Text style={styles.roomTitle}>{room.title}</Text>

        {/* Host */}
        <View style={styles.hostRow}>
          <View
            style={[
              styles.hostAvatarRing,
              { borderColor: getTierColor(room.host.tier) },
            ]}
          >
            <Avatar size={36} username={room.host.username} />
          </View>
          <View style={styles.hostInfo}>
            <Text style={styles.hostName}>{room.host.username}</Text>
            <Text style={styles.hostLabel}>Host</Text>
          </View>
        </View>

        {/* Speakers */}
        {room.speakers.length > 0 && (
          <View style={styles.speakersRow}>
            <Text style={styles.speakersLabel}>Speakers:</Text>
            <View style={styles.speakerAvatars}>
              {room.speakers.slice(0, 5).map(s => (
                <Avatar key={s.id} size={24} username={s.username} />
              ))}
              {room.speakers.length > 5 && (
                <Text style={styles.speakersMore}>+{room.speakers.length - 5}</Text>
              )}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.roomFooter}>
          <View style={styles.listenersRow}>
            <PulsingDot color={colors.green} size={6} />
            <Text style={styles.listenersText}>
              {room.listeners} ouvindo
            </Text>
          </View>
          <TapScale onPress={handleJoin} accessibilityLabel={`Ouvir ${room.title}`}>
            <View style={styles.joinButton}>
              <Text style={styles.joinButtonText}>🎧 Ouvir</Text>
            </View>
          </TapScale>
        </View>
      </Card>
    </SmoothEntry>
  );
}

// ─── Scheduled Room Card ─────────────────────────────────────────────────────

function ScheduledRoomCard({
  room,
  index,
}: {
  room: AudioRoom;
  index: number;
}) {
  const handleReminder = useCallback(() => {
    hapticLight();
  }, []);

  return (
    <SmoothEntry delay={index * 80 + 200}>
      <Card>
        <View style={styles.roomHeader}>
          <Pill label="Agendado" color={colors.orange} />
          <Pill label={room.topic} color={colors.primary} />
        </View>

        <Text style={styles.roomTitle}>{room.title}</Text>

        <View style={styles.hostRow}>
          <Avatar size={28} username={room.host.username} />
          <Text style={styles.hostName}>{room.host.username}</Text>
        </View>

        <View style={styles.roomFooter}>
          <AvatarStack count={room.listeners} max={3} size={20} label="interessados" />
          <TapScale onPress={handleReminder} accessibilityLabel="Lembrar">
            <View style={styles.remindButton}>
              <Text style={styles.remindButtonText}>🔔 Lembrar</Text>
            </View>
          </TapScale>
        </View>
      </Card>
    </SmoothEntry>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AudioRoomsScreen() {
  const navigation = useNavigation();
  const audioRooms = useNexaStore(s => s.audioRooms);
  const currentSubscription = useNexaStore(s => s.currentSubscription);

  const liveRooms = audioRooms?.filter(r => r.isLive) ?? [];
  const scheduledRooms = audioRooms?.filter(r => !r.isLive) ?? [];
  const canCreate = currentSubscription === 'pro' || currentSubscription === 'elite';

  const handleBack = useCallback(() => {
    hapticLight();
    navigation.goBack();
  }, [navigation]);

  const handleCreate = useCallback(() => {
    hapticMedium();
    if (!canCreate) {
      (navigation as any).navigate('Subscription');
    }
  }, [canCreate, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TapScale onPress={handleBack} accessibilityLabel="Voltar">
          <Text style={styles.backButton}>←</Text>
        </TapScale>
        <Text style={styles.headerTitle}>🎧 Audio Rooms</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Rooms */}
        <SectionHeader title="Ao Vivo Agora" />
        {liveRooms.length > 0 ? (
          <View style={styles.roomsList}>
            {liveRooms.map((room, i) => (
              <LiveRoomCard key={room.id} room={room} index={i} />
            ))}
          </View>
        ) : (
          <SmoothEntry delay={0}>
            <Card>
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🎙️</Text>
                <Text style={styles.emptyTitle}>Nenhum room ao vivo</Text>
                <Text style={styles.emptyText}>
                  Quando um tipster iniciar um Audio Room, ele aparecerá aqui.
                </Text>
              </View>
            </Card>
          </SmoothEntry>
        )}

        {/* Scheduled Rooms */}
        {scheduledRooms.length > 0 && (
          <>
            <SectionHeader title="Agendados" />
            <View style={styles.roomsList}>
              {scheduledRooms.map((room, i) => (
                <ScheduledRoomCard key={room.id} room={room} index={i} />
              ))}
            </View>
          </>
        )}

        {/* Create Room CTA */}
        <SmoothEntry delay={400}>
          <TapScale onPress={handleCreate} accessibilityLabel="Criar Audio Room">
            <View style={styles.createCta}>
              <Text style={styles.createCtaIcon}>🎙️</Text>
              <Text style={styles.createCtaTitle}>Criar seu próprio Audio Room</Text>
              {canCreate ? (
                <Text style={styles.createCtaDesc}>
                  Compartilhe análises ao vivo com seus seguidores.
                </Text>
              ) : (
                <View style={styles.upgradeRow}>
                  <Pill label="PRO / ELITE" color={colors.gold} />
                  <Text style={styles.createCtaDesc}>
                    Faça upgrade para criar rooms.
                  </Text>
                </View>
              )}
            </View>
          </TapScale>
        </SmoothEntry>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
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
  backButton: {
    ...typography.display,
    fontSize: 22,
    color: colors.textPrimary,
    paddingRight: spacing.sm,
  },
  headerTitle: {
    ...typography.displayMedium,
    fontSize: 20,
    color: colors.textPrimary,
    flex: 1,
  },
  headerSpacer: {
    width: 30,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  roomsList: {
    gap: spacing.sm,
  },

  // Room Card
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  roomLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 77, 106, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  roomLiveText: {
    ...typography.bodySemiBold,
    fontSize: 11,
    color: colors.red,
    letterSpacing: 1,
  },
  roomTitle: {
    ...typography.displayMedium,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  // Host
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  hostAvatarRing: {
    padding: 2,
    borderWidth: 2,
    borderRadius: radius.full,
  },
  hostInfo: {
    gap: 1,
  },
  hostName: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  hostLabel: {
    ...typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },

  // Speakers
  speakersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  speakersLabel: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  speakerAvatars: {
    flexDirection: 'row',
    gap: -4,
  },
  speakersMore: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: spacing.xs,
    alignSelf: 'center',
  },

  // Footer
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listenersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listenersText: {
    ...typography.mono,
    fontSize: 12,
    color: colors.textSecondary,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  joinButtonText: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  remindButton: {
    backgroundColor: colors.bgElevated,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  remindButtonText: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.displayMedium,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Create CTA
  createCta: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  createCtaIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  createCtaTitle: {
    ...typography.displayMedium,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  createCtaDesc: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  upgradeRow: {
    alignItems: 'center',
    gap: spacing.xs,
  },
});
