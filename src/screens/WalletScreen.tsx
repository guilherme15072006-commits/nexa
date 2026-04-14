import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SmoothEntry, TapScale } from '../components/LiveComponents';
import { Card } from '../components/ui';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, Transaction } from '../store/nexaStore';
import { hapticLight, hapticMedium, hapticSuccess } from '../services/haptics';
import { playXPGain } from '../services/sounds';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPOSIT_AMOUNTS = [25, 50, 100, 200];
const WITHDRAW_AMOUNTS = [25, 50, 100, 200];
const XP_TO_COINS_RATE = 50; // 100 XP = 50 coins

const TX_ICON: Record<Transaction['type'], string> = {
  bet_win: '✅',
  bet_loss: '❌',
  deposit: '💳',
  withdrawal: '💸',
  bonus: '🎁',
  coins_earned: '🪙',
};

type FlowState = 'idle' | 'deposit_select' | 'deposit_confirm' | 'withdraw_select' | 'withdraw_confirm';

// ─── WalletScreen ─────────────────────────────────────────────────────────────

export default function WalletScreen() {
  const navigation = useNavigation();
  const user = useNexaStore((s) => s.user);
  const transactions = useNexaStore((s) => s.transactions);
  const deposit = useNexaStore((s) => s.deposit);
  const withdraw = useNexaStore((s) => s.withdraw);
  const convertXPToCoins = useNexaStore((s) => s.convertXPToCoins);

  const [flow, setFlow] = useState<FlowState>('idle');
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [xpInput, setXpInput] = useState(100);

  const maxConvertable = useMemo(
    () => Math.floor(user.xp / 100) * 100,
    [user.xp],
  );

  const handleDeposit = useCallback(() => {
    hapticSuccess();
    playXPGain();
    deposit(selectedAmount);
    setFlow('idle');
    setSelectedAmount(0);
  }, [selectedAmount, deposit]);

  const handleWithdraw = useCallback(() => {
    if (user.balance < selectedAmount) return;
    hapticSuccess();
    withdraw(selectedAmount);
    setFlow('idle');
    setSelectedAmount(0);
  }, [selectedAmount, user.balance, withdraw]);

  const handleConvert = useCallback(() => {
    if (maxConvertable <= 0) return;
    const amount = Math.min(xpInput, maxConvertable);
    hapticSuccess();
    playXPGain();
    convertXPToCoins(amount);
  }, [xpInput, maxConvertable, convertXPToCoins]);

  const renderTransaction = useCallback(
    ({ item, index }: { item: Transaction; index: number }) => {
      const isPositive = item.amount > 0;
      const amountColor = isPositive ? colors.green : colors.red;
      const prefix = item.currency === 'BRL' ? 'R$ ' : '';
      const suffix = item.currency === 'coins' ? ' 🪙' : '';
      const sign = isPositive ? '+' : '';
      const display =
        item.currency === 'BRL'
          ? `${sign}${prefix}${Math.abs(item.amount).toFixed(2)}`
          : `${sign}${item.amount}${suffix}`;

      return (
        <SmoothEntry delay={index * 50}>
          <View style={styles.txRow}>
            <Text style={styles.txIcon}>{TX_ICON[item.type]}</Text>
            <View style={styles.txInfo}>
              <Text style={styles.txLabel} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={styles.txDate}>{item.createdAt}</Text>
            </View>
            <Text style={[styles.txAmount, { color: amountColor }]}>
              {display}
            </Text>
          </View>
        </SmoothEntry>
      );
    },
    [],
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
        <Text style={styles.headerTitle}>Carteira</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <SmoothEntry delay={0}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <Text style={styles.balanceValue}>
              R$ {user.balance.toFixed(2)}
            </Text>
            <View style={styles.coinsRow}>
              <Text style={styles.coinsIcon}>🪙</Text>
              <Text style={styles.coinsValue}>{user.coins} NEXA coins</Text>
            </View>
          </View>
        </SmoothEntry>

        {/* Quick Actions */}
        <SmoothEntry delay={100}>
          <View style={styles.quickActions}>
            <TapScale
              style={styles.actionBtnWrap}
              onPress={() => {
                hapticLight();
                setFlow('deposit_select');
                setSelectedAmount(0);
              }}
            >
              <View style={[styles.actionBtn, styles.depositBtn]}>
                <Text style={styles.actionBtnIcon}>💳</Text>
                <Text style={styles.actionBtnText}>Depositar</Text>
              </View>
            </TapScale>
            <TapScale
              style={styles.actionBtnWrap}
              onPress={() => {
                hapticLight();
                setFlow('withdraw_select');
                setSelectedAmount(0);
              }}
            >
              <View style={[styles.actionBtn, styles.withdrawBtn]}>
                <Text style={styles.actionBtnIcon}>💸</Text>
                <Text style={styles.actionBtnText}>Sacar</Text>
              </View>
            </TapScale>
          </View>
        </SmoothEntry>

        {/* Deposit Flow */}
        {(flow === 'deposit_select' || flow === 'deposit_confirm') && (
          <SmoothEntry delay={0}>
            <View style={styles.flowCard}>
              <Text style={styles.flowTitle}>
                {flow === 'deposit_select' ? 'Escolha o valor' : 'Confirmar depósito'}
              </Text>

              {flow === 'deposit_select' && (
                <>
                  <View style={styles.amountGrid}>
                    {DEPOSIT_AMOUNTS.map((amt) => (
                      <TapScale
                        key={amt}
                        onPress={() => {
                          hapticLight();
                          setSelectedAmount(amt);
                        }}
                      >
                        <View
                          style={[
                            styles.amountChip,
                            selectedAmount === amt && styles.amountChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.amountChipText,
                              selectedAmount === amt && styles.amountChipTextActive,
                            ]}
                          >
                            R$ {amt}
                          </Text>
                        </View>
                      </TapScale>
                    ))}
                  </View>
                  <View style={styles.flowActions}>
                    <TapScale
                      onPress={() => {
                        hapticLight();
                        setFlow('idle');
                      }}
                    >
                      <View style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                      </View>
                    </TapScale>
                    <TapScale
                      disabled={selectedAmount === 0}
                      onPress={() => {
                        hapticMedium();
                        setFlow('deposit_confirm');
                      }}
                    >
                      <View
                        style={[
                          styles.confirmBtn,
                          selectedAmount === 0 && styles.btnDisabled,
                        ]}
                      >
                        <Text style={styles.confirmBtnText}>Continuar</Text>
                      </View>
                    </TapScale>
                  </View>
                </>
              )}

              {flow === 'deposit_confirm' && (
                <>
                  <View style={styles.pixPlaceholder}>
                    <Text style={styles.pixIcon}>📱</Text>
                    <Text style={styles.pixLabel}>QR Code Pix</Text>
                    <View style={styles.qrBox}>
                      <Text style={styles.qrPlaceholder}>[ QR Code ]</Text>
                    </View>
                    <Text style={styles.pixAmount}>R$ {selectedAmount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.flowActions}>
                    <TapScale
                      onPress={() => {
                        hapticLight();
                        setFlow('deposit_select');
                      }}
                    >
                      <View style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Voltar</Text>
                      </View>
                    </TapScale>
                    <TapScale onPress={handleDeposit}>
                      <View style={styles.confirmBtn}>
                        <Text style={styles.confirmBtnText}>Confirmar Pix</Text>
                      </View>
                    </TapScale>
                  </View>
                </>
              )}
            </View>
          </SmoothEntry>
        )}

        {/* Withdraw Flow */}
        {(flow === 'withdraw_select' || flow === 'withdraw_confirm') && (
          <SmoothEntry delay={0}>
            <View style={styles.flowCard}>
              <Text style={styles.flowTitle}>
                {flow === 'withdraw_select' ? 'Valor do saque' : 'Confirmar saque'}
              </Text>

              {flow === 'withdraw_select' && (
                <>
                  <View style={styles.amountGrid}>
                    {WITHDRAW_AMOUNTS.map((amt) => {
                      const disabled = user.balance < amt;
                      return (
                        <TapScale
                          key={amt}
                          disabled={disabled}
                          onPress={() => {
                            hapticLight();
                            setSelectedAmount(amt);
                          }}
                        >
                          <View
                            style={[
                              styles.amountChip,
                              selectedAmount === amt && styles.amountChipActive,
                              disabled && styles.amountChipDisabled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.amountChipText,
                                selectedAmount === amt && styles.amountChipTextActive,
                                disabled && styles.amountChipTextDisabled,
                              ]}
                            >
                              R$ {amt}
                            </Text>
                          </View>
                        </TapScale>
                      );
                    })}
                  </View>
                  <View style={styles.flowActions}>
                    <TapScale
                      onPress={() => {
                        hapticLight();
                        setFlow('idle');
                      }}
                    >
                      <View style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                      </View>
                    </TapScale>
                    <TapScale
                      disabled={selectedAmount === 0}
                      onPress={() => {
                        hapticMedium();
                        setFlow('withdraw_confirm');
                      }}
                    >
                      <View
                        style={[
                          styles.confirmBtn,
                          styles.withdrawConfirmBtn,
                          selectedAmount === 0 && styles.btnDisabled,
                        ]}
                      >
                        <Text style={styles.confirmBtnText}>Continuar</Text>
                      </View>
                    </TapScale>
                  </View>
                </>
              )}

              {flow === 'withdraw_confirm' && (
                <>
                  <View style={styles.withdrawSummary}>
                    <Text style={styles.withdrawSummaryLabel}>Valor do saque</Text>
                    <Text style={styles.withdrawSummaryValue}>
                      R$ {selectedAmount.toFixed(2)}
                    </Text>
                    <Text style={styles.withdrawSummaryNote}>
                      Transferência via Pix em até 1 hora
                    </Text>
                  </View>
                  <View style={styles.flowActions}>
                    <TapScale
                      onPress={() => {
                        hapticLight();
                        setFlow('withdraw_select');
                      }}
                    >
                      <View style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Voltar</Text>
                      </View>
                    </TapScale>
                    <TapScale onPress={handleWithdraw}>
                      <View style={[styles.confirmBtn, styles.withdrawConfirmBtn]}>
                        <Text style={styles.confirmBtnText}>Confirmar Saque</Text>
                      </View>
                    </TapScale>
                  </View>
                </>
              )}
            </View>
          </SmoothEntry>
        )}

        {/* XP to Coins Converter */}
        <SmoothEntry delay={200}>
          <View style={styles.converterCard}>
            <Text style={styles.sectionTitle}>Converter XP em Coins</Text>
            <View style={styles.rateRow}>
              <Text style={styles.rateText}>100 XP = 50 🪙</Text>
            </View>
            <View style={styles.converterInfo}>
              <Text style={styles.converterLabel}>Seu XP disponível</Text>
              <Text style={styles.converterXP}>{user.xp} XP</Text>
            </View>
            <View style={styles.converterAmounts}>
              {[100, 200, 500].map((amt) => {
                const disabled = user.xp < amt;
                return (
                  <TapScale
                    key={amt}
                    disabled={disabled}
                    onPress={() => {
                      hapticLight();
                      setXpInput(amt);
                    }}
                  >
                    <View
                      style={[
                        styles.amountChip,
                        xpInput === amt && styles.amountChipActive,
                        disabled && styles.amountChipDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.amountChipText,
                          xpInput === amt && styles.amountChipTextActive,
                          disabled && styles.amountChipTextDisabled,
                        ]}
                      >
                        {amt} XP
                      </Text>
                    </View>
                  </TapScale>
                );
              })}
            </View>
            <View style={styles.converterResult}>
              <Text style={styles.converterResultLabel}>Você recebe</Text>
              <Text style={styles.converterResultValue}>
                {Math.floor(Math.min(xpInput, maxConvertable) / 100) * XP_TO_COINS_RATE} 🪙
              </Text>
            </View>
            <TapScale
              disabled={maxConvertable <= 0}
              onPress={handleConvert}
            >
              <View
                style={[
                  styles.convertBtn,
                  maxConvertable <= 0 && styles.btnDisabled,
                ]}
              >
                <Text style={styles.convertBtnText}>Converter</Text>
              </View>
            </TapScale>
          </View>
        </SmoothEntry>

        {/* Transaction History */}
        <SmoothEntry delay={300}>
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Histórico</Text>
          </View>
        </SmoothEntry>

        {transactions.map((tx, index) => (
          <React.Fragment key={tx.id}>
            {renderTransaction({ item: tx, index })}
          </React.Fragment>
        ))}

        <View style={styles.bottomSpacer} />
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
  headerTitle: {
    ...typography.display,
    fontSize: 20,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    ...typography.display,
    fontSize: 36,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  coinsIcon: {
    fontSize: 18,
  },
  coinsValue: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.gold,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionBtnWrap: {
    flex: 1,
  },
  actionBtn: {
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  depositBtn: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  withdrawBtn: {
    backgroundColor: colors.green + '20',
    borderWidth: 1,
    borderColor: colors.green + '40',
  },
  actionBtnIcon: {
    fontSize: 24,
  },
  actionBtnText: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },

  // Flow Card
  flowCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flowTitle: {
    ...typography.display,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  amountChip: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  amountChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  amountChipDisabled: {
    opacity: 0.35,
  },
  amountChipText: {
    ...typography.bodySemiBold,
    fontSize: 15,
    color: colors.textSecondary,
  },
  amountChipTextActive: {
    color: colors.primary,
  },
  amountChipTextDisabled: {
    color: colors.textMuted,
  },
  flowActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  confirmBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
  },
  withdrawConfirmBtn: {
    backgroundColor: colors.green,
  },
  confirmBtnText: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.4,
  },

  // Pix Placeholder
  pixPlaceholder: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pixIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  pixLabel: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  qrBox: {
    width: 160,
    height: 160,
    borderRadius: radius.lg,
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  qrPlaceholder: {
    ...typography.mono,
    fontSize: 14,
    color: colors.textMuted,
  },
  pixAmount: {
    ...typography.display,
    fontSize: 20,
    color: colors.primary,
  },

  // Withdraw Summary
  withdrawSummary: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
  },
  withdrawSummaryLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  withdrawSummaryValue: {
    ...typography.display,
    fontSize: 28,
    color: colors.green,
    marginBottom: spacing.sm,
  },
  withdrawSummaryNote: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },

  // XP Converter
  converterCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rateRow: {
    backgroundColor: colors.gold + '15',
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rateText: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.gold,
  },
  converterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  converterLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  converterXP: {
    ...typography.monoBold,
    fontSize: 16,
    color: colors.primary,
  },
  converterAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  converterResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  converterResultLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  converterResultValue: {
    ...typography.display,
    fontSize: 20,
    color: colors.gold,
  },
  convertBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    alignItems: 'center',
  },
  convertBtnText: {
    ...typography.bodySemiBold,
    fontSize: 15,
    color: '#0D0B14',
  },

  // Section
  sectionTitle: {
    ...typography.display,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Transaction History
  historySection: {
    marginTop: spacing.sm,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  txIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  txInfo: {
    flex: 1,
  },
  txLabel: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  txDate: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  txAmount: {
    ...typography.monoBold,
    fontSize: 14,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
