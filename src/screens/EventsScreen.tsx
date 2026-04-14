import React, { useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card, Pill, SectionHeader } from '../components/ui';
import { AnimatedProgress, SmoothEntry, TapScale } from '../components/LiveComponents';
import { hapticLight, hapticMedium, hapticHeavy } from '../services/haptics';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, Tournament, TournamentRound } from '../store/nexaStore';

// ─── Round Item ─────────────────────────────────────────────────────────────

interface RoundItemProps {
  round: TournamentRound;
  onSubmitPick: (pick: string) => void;
}

function RoundItem({ round, onSubmitPick }: RoundItemProps) {
  const statusColor = round.status === 'completed'
    ? (round.result === 'correct' ? colors.green : colors.red)
    : round.status === 'active' ? colors.primary : colors.textMuted;

  const statusIcon = round.status === 'completed'
    ? (round.result === 'correct' ? '✓' : '✕')
    : round.status === 'active' ? '●' : '○';

  return (
    <View style={styles.roundItem}>
      <View style={[styles.roundDot, { backgroundColor: statusColor }]}>
        <Text style={styles.roundDotText}>{statusIcon}</Text>
      </View>
      <View style={styles.roundInfo}>
        <Text style={styles.roundName}>{round.name}</Text>
        {round.userPick ? (
          <Text style={[styles.roundPick, { color: statusColor }]}>
            Pick: {round.userPick}
          </Text>
        ) : round.status === 'active' ? (
          <View style={styles.pickActions}>
            {['home', 'draw', 'away'].map((pick) => (
              <TapScale key={pick} onPress={() => onSubmitPick(pick)}>
                <View style={styles.pickChip}>
                  <Text style={styles.pickChipText}>
                    {pick === 'home' ? 'Casa' : pick === 'draw' ? 'Empate' : 'Fora'}
                  </Text>
                </View>
              </TapScale>
            ))}
          </View>
        ) : (
          <Text style={styles.roundPending}>Aguardando...</Text>
        )}
      </View>
      {round.status === 'completed' && (
        <Text style={[styles.roundResult, { color: statusColor }]}>
          {round.result === 'correct' ? '+100' : '-50'}
        </Text>
      )}
    </View>
  );
}

// ─── Tournament Card ────────────────────────────────────────────────────────

interface TournamentCardProps {
  tournament: Tournament;
  onJoin: () => void;
  onSubmitPick: (roundId: string, pick: string) => void;
}

function TournamentCard({ tournament, onJoin, onSubmitPick }: TournamentCardProps) {
  const participantFill = tournament.participants / tournament.maxParticipants;
  const isJoined = tournament.userRank !== null;
  const isFull = tournament.participants >= tournament.maxParticipants;
  const user = useNexaStore((s) => s.user);
  const canAfford = user.coins >= tournament.entryFee;

  const statusColor = tournament.status === 'active' ? colors.green :
    tournament.status === 'upcoming' ? colors.primary : colors.textMuted;
  const statusLabel = tournament.status === 'active' ? 'Em andamento' :
    tournament.status === 'upcoming' ? 'Em breve' : 'Encerrado';

  return (
    <View style={styles.tournamentCard}>
      {/* Header */}
      <View style={styles.tournamentHeader}>
        <Text style={styles.tournamentIcon}>{tournament.icon}</Text>
        <View style={styles.tournamentTitleGroup}>
          <Text style={styles.tournamentName}>{tournament.name}</Text>
          <Pill label={statusLabel} color={statusColor} />
        </View>
      </View>

      {/* Date */}
      <Text style={styles.tournamentDate}>{tournament.startsAt} — {tournament.endsAt}</Text>

      {/* Participants bar */}
      <View style={styles.participantsSection}>
        <View style={styles.participantsRow}>
          <Text style={styles.participantsLabel}>Participantes</Text>
          <Text style={styles.participantsCount}>
            {tournament.participants.toLocaleString()}/{tournament.maxParticipants.toLocaleString()}
          </Text>
        </View>
        <View style={styles.participantsBarBg}>
          <View
            style={[
              styles.participantsBarFill,
              { width: `${Math.min(participantFill * 100, 100)}%` },
              { backgroundColor: participantFill > 0.9 ? colors.red : colors.primary },
            ]}
          />
        </View>
      </View>

      {/* Prize pool */}
      <View style={styles.prizeRow}>
        <View style={styles.prizeItem}>
          <Text style={styles.prizeLabel}>Prêmio total</Text>
          <Text style={styles.prizeValue}>{tournament.prizePool.toLocaleString()} 🪙</Text>
        </View>
        <View style={styles.prizeItem}>
          <Text style={styles.prizeLabel}>Entrada</Text>
          <Text style={styles.prizeValue}>{tournament.entryFee} 🪙</Text>
        </View>
      </View>

      {/* User rank/score if joined */}
      {isJoined && (
        <View style={styles.userRankSection}>
          <View style={styles.userRankItem}>
            <Text style={styles.userRankLabel}>Sua posição</Text>
            <Text style={styles.userRankValue}>#{tournament.userRank}</Text>
          </View>
          <View style={styles.userRankItem}>
            <Text style={styles.userRankLabel}>Pontuação</Text>
            <Text style={styles.userRankValue}>{tournament.userScore.toLocaleString()}</Text>
          </View>
        </View>
      )}

      {/* Rounds */}
      {tournament.rounds.length > 0 && (
        <View style={styles.roundsList}>
          <Text style={styles.roundsTitle}>Rodadas</Text>
          {tournament.rounds.map((round) => (
            <RoundItem
              key={round.id}
              round={round}
              onSubmitPick={(pick) => onSubmitPick(round.id, pick)}
            />
          ))}
        </View>
      )}

      {/* Action button */}
      {tournament.status === 'active' && !isJoined && (
        <TapScale
          onPress={onJoin}
          disabled={isFull || !canAfford}
        >
          <View style={[
            styles.joinButton,
            (isFull || !canAfford) && styles.joinButtonDisabled,
          ]}>
            <Text style={styles.joinButtonText}>
              {isFull ? 'Lotado' : !canAfford ? 'Saldo insuficiente' : `Participar — ${tournament.entryFee} 🪙`}
            </Text>
          </View>
        </TapScale>
      )}

      {tournament.status === 'upcoming' && (
        <TapScale onPress={() => hapticLight()}>
          <View style={styles.remindButton}>
            <Text style={styles.remindButtonText}>🔔 Lembrar</Text>
          </View>
        </TapScale>
      )}

      {tournament.status === 'finished' && isJoined && (
        <View style={styles.finishedBadge}>
          <Text style={styles.finishedBadgeText}>
            Posição final: #{tournament.userRank} · {tournament.userScore.toLocaleString()} pts
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Leaderboard ────────────────────────────────────────────────────────────

function Leaderboard() {
  const leaderboard = useNexaStore((s) => s.leaderboard);
  const top10 = leaderboard.slice(0, 10);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <View style={styles.leaderboardCard}>
      <Text style={styles.leaderboardTitle}>Leaderboard ao vivo</Text>
      {top10.map((user, i) => (
        <View key={user.id} style={styles.leaderboardRow}>
          <Text style={styles.leaderboardRank}>
            {i < 3 ? medals[i] : `#${i + 1}`}
          </Text>
          <Text style={styles.leaderboardName}>{user.username}</Text>
          <Text style={styles.leaderboardScore}>
            {(user.winRate * 100).toFixed(0)}% WR
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Prize Pool Breakdown ───────────────────────────────────────────────────

function PrizeBreakdown() {
  const prizes = [
    { place: '1o lugar', amount: '25.000 🪙', color: colors.gold },
    { place: '2o lugar', amount: '15.000 🪙', color: '#C0C0C0' },
    { place: '3o lugar', amount: '7.500 🪙', color: '#CD7F32' },
    { place: '4o-10o', amount: '350 🪙 cada', color: colors.textMuted },
  ];

  return (
    <View style={styles.prizeBreakdownCard}>
      <Text style={styles.prizeBreakdownTitle}>Distribuição de prêmios</Text>
      {prizes.map((prize) => (
        <View key={prize.place} style={styles.prizeBreakdownRow}>
          <View style={[styles.prizeBreakdownDot, { backgroundColor: prize.color }]} />
          <Text style={styles.prizeBreakdownPlace}>{prize.place}</Text>
          <Text style={[styles.prizeBreakdownAmount, { color: prize.color }]}>{prize.amount}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Events Screen ──────────────────────────────────────────────────────────

export default function EventsScreen() {
  const tournaments = useNexaStore((s) => s.tournaments);
  const joinTournament = useNexaStore((s) => s.joinTournament);
  const submitPick = useNexaStore((s) => s.submitPick);
  const trackEvent = useNexaStore((s) => s.trackEvent);
  const navigation = useNavigation<any>();

  const activeTournaments = useMemo(
    () => tournaments.filter((t) => t.status === 'active'),
    [tournaments],
  );
  const upcomingTournaments = useMemo(
    () => tournaments.filter((t) => t.status === 'upcoming'),
    [tournaments],
  );
  const finishedTournaments = useMemo(
    () => tournaments.filter((t) => t.status === 'finished'),
    [tournaments],
  );

  const handleJoin = useCallback((tournamentId: string) => {
    hapticHeavy();
    joinTournament(tournamentId);
    trackEvent('tournament_join', { tournamentId });
  }, []);

  const handleSubmitPick = useCallback((tournamentId: string, roundId: string, pick: string) => {
    hapticMedium();
    submitPick(tournamentId, roundId, pick);
    trackEvent('tournament_pick', { tournamentId, roundId, pick });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backBtn}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Eventos & Torneios 🏆</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Active */}
        {activeTournaments.length > 0 && (
          <SmoothEntry delay={0}>
            <SectionHeader title="🔥 Em andamento" />
            <View style={styles.tournamentList}>
              {activeTournaments.map((t) => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  onJoin={() => handleJoin(t.id)}
                  onSubmitPick={(roundId, pick) => handleSubmitPick(t.id, roundId, pick)}
                />
              ))}
            </View>
          </SmoothEntry>
        )}

        {/* Upcoming */}
        {upcomingTournaments.length > 0 && (
          <SmoothEntry delay={100}>
            <SectionHeader title="⏳ Em breve" />
            <View style={styles.tournamentList}>
              {upcomingTournaments.map((t) => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  onJoin={() => handleJoin(t.id)}
                  onSubmitPick={(roundId, pick) => handleSubmitPick(t.id, roundId, pick)}
                />
              ))}
            </View>
          </SmoothEntry>
        )}

        {/* Finished */}
        {finishedTournaments.length > 0 && (
          <SmoothEntry delay={200}>
            <SectionHeader title="📜 Encerrados" />
            <View style={styles.tournamentList}>
              {finishedTournaments.map((t) => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  onJoin={() => handleJoin(t.id)}
                  onSubmitPick={(roundId, pick) => handleSubmitPick(t.id, roundId, pick)}
                />
              ))}
            </View>
          </SmoothEntry>
        )}

        {/* Leaderboard */}
        <SmoothEntry delay={300}>
          <SectionHeader title="📊 Leaderboard ao vivo" />
          <View style={styles.sectionPadded}>
            <Leaderboard />
          </View>
        </SmoothEntry>

        {/* Prize breakdown */}
        <SmoothEntry delay={400}>
          <View style={styles.sectionPadded}>
            <PrizeBreakdown />
          </View>
        </SmoothEntry>

        <View style={{ height: spacing.xxl * 2 }} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    ...typography.display,
    color: colors.textPrimary,
    fontSize: 22,
  },
  headerTitle: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    fontSize: 18,
  },

  // Tournament list
  tournamentList: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  sectionPadded: {
    paddingHorizontal: spacing.md,
  },

  // Tournament card
  tournamentCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tournamentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tournamentIcon: {
    fontSize: 28,
  },
  tournamentTitleGroup: {
    flex: 1,
    gap: 4,
  },
  tournamentName: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    fontSize: 16,
  },
  tournamentDate: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: 42,
  },

  // Participants
  participantsSection: {
    marginTop: spacing.md,
  },
  participantsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  participantsLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
  },
  participantsCount: {
    ...typography.mono,
    color: colors.textPrimary,
    fontSize: 12,
  },
  participantsBarBg: {
    height: 6,
    backgroundColor: colors.bgElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  participantsBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Prize
  prizeRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  prizeItem: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  prizeLabel: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
  },
  prizeValue: {
    ...typography.monoBold,
    color: colors.gold,
    fontSize: 16,
    marginTop: 2,
  },

  // User rank
  userRankSection: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  userRankItem: {
    flex: 1,
    backgroundColor: colors.primary + '15',
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  userRankLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 11,
  },
  userRankValue: {
    ...typography.monoBold,
    color: colors.primary,
    fontSize: 18,
    marginTop: 2,
  },

  // Rounds
  roundsList: {
    marginTop: spacing.md,
  },
  roundsTitle: {
    ...typography.bodySemiBold,
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  roundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roundDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundDotText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  roundInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  roundName: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  roundPick: {
    ...typography.mono,
    fontSize: 11,
    marginTop: 2,
  },
  roundPending: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  roundResult: {
    ...typography.monoBold,
    fontSize: 14,
  },
  pickActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 4,
  },
  pickChip: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  pickChipText: {
    ...typography.bodySemiBold,
    color: colors.primary,
    fontSize: 11,
  },

  // Buttons
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  joinButtonDisabled: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  joinButtonText: {
    ...typography.displayMedium,
    color: '#fff',
    fontSize: 15,
  },
  remindButton: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  remindButtonText: {
    ...typography.bodySemiBold,
    color: colors.primary,
    fontSize: 14,
  },
  finishedBadge: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  finishedBadgeText: {
    ...typography.mono,
    color: colors.textSecondary,
    fontSize: 12,
  },

  // Leaderboard
  leaderboardCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leaderboardTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leaderboardRank: {
    width: 36,
    ...typography.monoBold,
    color: colors.gold,
    fontSize: 14,
    textAlign: 'center',
  },
  leaderboardName: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 13,
    flex: 1,
    marginLeft: spacing.sm,
  },
  leaderboardScore: {
    ...typography.mono,
    color: colors.green,
    fontSize: 12,
  },

  // Prize breakdown
  prizeBreakdownCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gold + '30',
  },
  prizeBreakdownTitle: {
    ...typography.bodySemiBold,
    color: colors.gold,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  prizeBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  prizeBreakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  prizeBreakdownPlace: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 13,
    flex: 1,
  },
  prizeBreakdownAmount: {
    ...typography.monoBold,
    fontSize: 13,
  },
});
