/**
 * NEXA — Chart Components (Victory Native)
 *
 * Charts animados nível trading platform.
 * Falls back to simple bars se Victory não disponível.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, radius } from '../theme';

let VictoryLine: any = null;
let VictoryBar: any = null;
let VictoryChart: any = null;
let VictoryAxis: any = null;
try {
  const V = require('victory-native');
  VictoryLine = V.VictoryLine;
  VictoryBar = V.VictoryBar;
  VictoryChart = V.VictoryChart;
  VictoryAxis = V.VictoryAxis;
} catch {}

// ─── NEXA Dark Theme for Victory ────────────────────────────

const NEXA_CHART_THEME = {
  axis: {
    style: {
      axis: { stroke: colors.border },
      grid: { stroke: colors.border, strokeDasharray: '4,4' },
      tickLabels: { fill: colors.textMuted, fontSize: 10, fontFamily: 'JetBrainsMono-Medium' },
    },
  },
};

// ─── ROI Line Chart ─────────────────────────────────────────

export function ROILineChart({ data }: { data: number[] }) {
  if (VictoryChart && VictoryLine && VictoryAxis) {
    const chartData = data.map((y, i) => ({ x: i + 1, y }));

    return (
      <View style={styles.chartWrap}>
        <VictoryChart height={180} padding={{ top: 20, bottom: 30, left: 40, right: 20 }} theme={NEXA_CHART_THEME}>
          <VictoryAxis dependentAxis style={NEXA_CHART_THEME.axis.style} />
          <VictoryAxis style={NEXA_CHART_THEME.axis.style} />
          <VictoryLine
            data={chartData}
            style={{ data: { stroke: colors.primary, strokeWidth: 2 } }}
            animate={{ duration: 500 }}
          />
        </VictoryChart>
      </View>
    );
  }

  // Fallback: simple bars
  const maxAbs = Math.max(...data.map(Math.abs), 1);
  return (
    <View style={styles.fallbackChart}>
      {data.slice(-14).map((val, i) => (
        <View key={i} style={styles.fallbackBarCol}>
          <View style={[styles.fallbackBar, { height: Math.max((Math.abs(val) / maxAbs) * 80, 2), backgroundColor: val >= 0 ? colors.green : colors.red }]} />
        </View>
      ))}
    </View>
  );
}

// ─── Win/Loss Bar Chart ─────────────────────────────────────

export function WinLossChart({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses || 1;

  if (VictoryChart && VictoryBar) {
    return (
      <View style={styles.chartWrap}>
        <VictoryChart height={120} padding={{ top: 10, bottom: 30, left: 40, right: 20 }} domainPadding={{ x: 20 }}>
          <VictoryBar
            data={[{ x: 'Wins', y: wins }, { x: 'Losses', y: losses }]}
            style={{ data: { fill: ({ datum }: any) => datum.x === 'Wins' ? colors.green : colors.red } }}
            cornerRadius={4}
            animate={{ duration: 500 }}
          />
        </VictoryChart>
      </View>
    );
  }

  // Fallback
  return (
    <View style={styles.winLossRow}>
      <View style={[styles.winBar, { flex: wins / total }]}>
        <Text style={styles.winText}>{wins}W</Text>
      </View>
      <View style={[styles.lossBar, { flex: losses / total }]}>
        <Text style={styles.lossText}>{losses}L</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrap: { marginVertical: spacing.sm },
  fallbackChart: { flexDirection: 'row', alignItems: 'flex-end', height: 80, gap: 2, paddingVertical: spacing.sm },
  fallbackBarCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  fallbackBar: { width: '80%', borderRadius: 2 },
  winLossRow: { flexDirection: 'row', height: 24, borderRadius: radius.sm, overflow: 'hidden' },
  winBar: { backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  lossBar: { backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  winText: { ...typography.monoBold, fontSize: 10, color: '#FFF' },
  lossText: { ...typography.monoBold, fontSize: 10, color: '#FFF' },
});
