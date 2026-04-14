import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors, typography, spacing, radius } from '../theme';
import { TapScale, SmoothEntry, GlowPulse, FloatingXP, AnimatedProgress } from './LiveComponents';
import { hapticSuccess } from '../services/haptics';
import type { DailyLoginDay } from '../store/nexaStore';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DailyLoginCalendarProps {
  calendar: DailyLoginDay[];
  onClaim: (day: number) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COLS = 7;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CALENDAR_PADDING = spacing.md * 2;
const GAP = spacing.xs;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - CALENDAR_PADDING - GAP * (COLS - 1)) / COLS);

// ─── Day Cell ────────────────────────────────────────────────────────────────

function DayCell({
  day,
  onClaim,
}: {
  day: DailyLoginDay;
  onClaim: (d: number) => void;
}) {
  const [showXP, setShowXP] = useState(false);
  const isMilestone = day.day % 7 === 0;
  const isMega = day.day === 30;

  const handlePress = useCallback(() => {
    if (!day.isToday || day.claimed) return;
    hapticSuccess();
    setShowXP(true);
    onClaim(day.day);
  }, [day, onClaim]);

  const cellStyle = [
    styles.cell,
    day.claimed && styles.cellClaimed,
    day.isToday && !day.claimed && styles.cellToday,
    day.isFuture && styles.cellFuture,
    isMilestone && styles.cellMilestone,
  ];

  const inner = (
    <View style={cellStyle}>
      {/* Day number */}
      <Text
        style={[
          styles.dayNumber,
          day.claimed && styles.dayNumberClaimed,
          day.isFuture && styles.dayNumberFuture,
          day.isToday && !day.claimed && styles.dayNumberToday,
        ]}
      >
        {day.day}
      </Text>

      {/* Reward */}
      <Text
        style={[
          styles.reward,
          day.claimed && styles.rewardClaimed,
          day.isFuture && styles.rewardFuture,
          isMilestone && !day.claimed && !day.isFuture && styles.rewardMilestone,
        ]}
      >
        {'🪙'}{day.reward}
      </Text>

      {/* Claimed check */}
      {day.claimed && <Text style={styles.checkMark}>{'✓'}</Text>}

      {/* MEGA badge for day 30 */}
      {isMega && !day.claimed && (
        <View style={styles.megaBadge}>
          <Text style={styles.megaText}>MEGA</Text>
        </View>
      )}

      {/* FloatingXP animation */}
      <FloatingXP
        amount={day.reward}
        visible={showXP}
        onDone={() => setShowXP(false)}
        color={colors.gold}
      />
    </View>
  );

  // Today's cell: pulsing gold border + tappable
  if (day.isToday && !day.claimed) {
    return (
      <TapScale onPress={handlePress}>
        <GlowPulse color={colors.gold} >
          {inner}
        </GlowPulse>
      </TapScale>
    );
  }

  // Mega day (day 30, not yet claimed, future) with glow
  if (isMega && !day.claimed && day.isFuture) {
    return (
      <GlowPulse color={colors.gold} >
        {inner}
      </GlowPulse>
    );
  }

  return inner;
}

// ─── Calendar Component ──────────────────────────────────────────────────────

export default function DailyLoginCalendar({ calendar, onClaim }: DailyLoginCalendarProps) {
  const claimedCount = calendar.filter((d) => d.claimed).length;
  const todayDay = calendar.find((d) => d.isToday)?.day ?? 0;
  const totalDays = calendar.length;

  // Build rows of 7
  const rows: DailyLoginDay[][] = [];
  for (let i = 0; i < calendar.length; i += COLS) {
    rows.push(calendar.slice(i, i + COLS));
  }

  return (
    <SmoothEntry delay={0}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Calendario de Login
          </Text>
          <Text style={styles.headerDay}>
            Dia {todayDay}/{totalDays}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          <AnimatedProgress
            progress={claimedCount / totalDays}
            color={colors.green}
            height={6}
          />
          <Text style={styles.progressLabel}>
            {claimedCount}/{totalDays} dias
          </Text>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {rows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.gridRow}>
              {row.map((day) => (
                <DayCell key={day.day} day={day} onClaim={onClaim} />
              ))}
              {/* Fill empty cells in last row */}
              {row.length < COLS &&
                Array.from({ length: COLS - row.length }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.cellEmpty} />
                ))}
            </View>
          ))}
        </View>
      </View>
    </SmoothEntry>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  headerDay: {
    ...typography.mono,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressLabel: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
    minWidth: 60,
  },

  // Grid
  grid: {
    gap: GAP,
  },
  gridRow: {
    flexDirection: 'row',
    gap: GAP,
  },

  // Cell base
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  cellEmpty: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },

  // Cell states
  cellClaimed: {
    backgroundColor: 'rgba(0,200,150,0.1)',
    borderColor: 'rgba(0,200,150,0.3)',
    opacity: 0.7,
  },
  cellToday: {
    backgroundColor: 'rgba(245,200,66,0.15)',
    borderColor: colors.gold,
    borderWidth: 2,
  },
  cellFuture: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.border,
    opacity: 0.5,
  },
  cellMilestone: {
    borderColor: colors.gold,
    borderWidth: 1.5,
  },

  // Day number
  dayNumber: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  dayNumberClaimed: {
    color: colors.green,
  },
  dayNumberToday: {
    color: colors.gold,
  },
  dayNumberFuture: {
    color: colors.textMuted,
  },

  // Reward
  reward: {
    ...typography.mono,
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 1,
  },
  rewardClaimed: {
    color: colors.green,
  },
  rewardFuture: {
    color: colors.textMuted,
  },
  rewardMilestone: {
    color: colors.gold,
  },

  // Check mark
  checkMark: {
    position: 'absolute',
    top: 1,
    right: 3,
    fontSize: 10,
    color: colors.green,
  },

  // MEGA badge
  megaBadge: {
    position: 'absolute',
    bottom: 1,
    backgroundColor: colors.gold,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  megaText: {
    ...typography.monoBold,
    fontSize: 7,
    color: colors.bg,
  },
});
