import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SmoothEntry, TapScale } from '../components/LiveComponents';
import { Card } from '../components/ui';
import { SkeletonWallet } from '../components/SkeletonLoader';
import { EmptyState, EMPTY_PRESETS } from '../components/EmptyState';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, Transaction } from '../store/nexaStore';
import { trackDepositFunnel, trackDeposit } from '../services/analytics';
import { hapticLight, hapticMedium, hapticSuccess, hapticError } from '../services/haptics';
import { playXPGain } from '../services/sounds';
import { createPixDeposit, requestWithdraw, checkPaymentStatus, type PixPayment, type WithdrawRequest } from '../services/payment';
import { TrustBadgeRow, SuccessCheckmark } from '../components/MicroInteractions';
import ClipboardNew from '@react-native-clipboard/clipboard';

let QRCodeComponent: any = null;
try { QRCodeComponent = require('react-native-qrcode-svg').default; } catch {}

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

type FlowState = 'idle' | 'deposit_select' | 'deposit_processing' | 'deposit_pix' | 'deposit_success'
  | 'withdraw_select' | 'withdraw_pixkey' | 'withdraw_processing' | 'withdraw_success';

// ─── WalletScreen ─────────────────────────────────────────────────────────────

export default function WalletScreen() {
  const navigation = useNavigation();
  const isLoading = useNexaStore((s) => s.isLoading);
  const user = useNexaStore((s) => s.user);
  const transactions = useNexaStore((s) => s.transactions);
  const deposit = useNexaStore((s) => s.deposit);
  const withdraw = useNexaStore((s) => s.withdraw);
  const convertXPToCoins = useNexaStore((s) => s.convertXPToCoins);

  const [flow, setFlow] = useState<FlowState>('idle');
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [xpInput, setXpInput] = useState(100);
  const [pixPayment, setPixPayment] = useState<PixPayment | null>(null);
  const [withdrawResult, setWithdrawResult] = useState<WithdrawRequest | null>(null);
  const [pixKeyInput, setPixKeyInput] = useState('');
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'email' | 'phone' | 'random'>('cpf');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const maxConvertable = useMemo(
    () => Math.floor(user.xp / 100) * 100,
    [user.xp],
  );

  const handleDeposit = useCallback(async () => {
    if (!user.kycCompleted) {
      hapticLight();
      navigation.navigate('KYC' as never);
      return;
    }
    trackDepositFunnel('amount_selected', 1, selectedAmount);
    setPaymentError(null);
    setFlow('deposit_processing');

    try {
      const payment = await createPixDeposit({
        amount: selectedAmount,
        userId: user.id,
        userName: user.username,
        userCpf: user.kycData?.cpf ?? '',
        userEmail: '',
      });
      setPixPayment(payment);
      hapticSuccess();
      setFlow('deposit_pix');
      trackDepositFunnel('pix_generated', 2, selectedAmount);
    } catch (err: any) {
      hapticError();
      setPaymentError(err?.message ?? 'Erro ao criar deposito');
      setFlow('deposit_select');
      trackDepositFunnel('failed', -1, selectedAmount);
    }
  }, [selectedAmount, user, navigation]);

  const handleConfirmPix = useCallback(async () => {
    if (!pixPayment) return;
    setFlow('deposit_processing');

    try {
      const status = await checkPaymentStatus(pixPayment.externalId);
      if (status === 'confirmed' || status === 'received') {
        deposit(pixPayment.amount);
        hapticSuccess();
        playXPGain();
        setFlow('deposit_success');
        trackDepositFunnel('confirmed', 4, pixPayment.amount);
        trackDeposit(pixPayment.amount);
      } else if (status === 'pending') {
        hapticLight();
        setPaymentError('Pagamento ainda nao confirmado. Tente novamente em alguns segundos.');
        setFlow('deposit_pix');
      } else {
        hapticError();
        setPaymentError('Pagamento falhou ou expirou.');
        setFlow('deposit_select');
      }
    } catch {
      setFlow('deposit_pix');
    }
  }, [pixPayment, deposit]);

  const handleCopyPixCode = useCallback(() => {
    if (!pixPayment) return;
    ClipboardNew.setString(pixPayment.pixCopyPaste);
    hapticSuccess();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackDepositFunnel('pix_copied', 3, pixPayment.amount);
  }, [pixPayment]);

  const handleWithdraw = useCallback(async () => {
    if (!user.kycCompleted) {
      hapticLight();
      navigation.navigate('KYC' as never);
      return;
    }
    if (user.balance < selectedAmount) return;
    if (!pixKeyInput.trim()) {
      setPaymentError('Informe sua chave Pix');
      return;
    }
    setPaymentError(null);
    setFlow('withdraw_processing');

    try {
      const result = await requestWithdraw({
        amount: selectedAmount,
        userId: user.id,
        pixKey: pixKeyInput.trim(),
        pixKeyType,
      });
      setWithdrawResult(result);
      withdraw(selectedAmount);
      hapticSuccess();
      setFlow('withdraw_success');
    } catch (err: any) {
      hapticError();
      setPaymentError(err?.message ?? 'Erro ao solicitar saque');
      setFlow('withdraw_pixkey');
    }
  }, [selectedAmount, user, pixKeyInput, pixKeyType, withdraw, navigation]);

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
        {/* Loading skeleton */}
        {isLoading ? <SkeletonWallet /> : <>

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
        {flow.startsWith('deposit') && flow !== 'idle' && (
          <SmoothEntry delay={0}>
            <View style={styles.flowCard}>
              {/* Error banner */}
              {paymentError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{paymentError}</Text>
                </View>
              )}

              {/* Step 1: Select amount */}
              {flow === 'deposit_select' && (
                <>
                  <Text style={styles.flowTitle}>Escolha o valor</Text>
                  <View style={styles.amountGrid}>
                    {DEPOSIT_AMOUNTS.map((amt) => (
                      <TapScale key={amt} onPress={() => { hapticLight(); setSelectedAmount(amt); }}>
                        <View style={[styles.amountChip, selectedAmount === amt && styles.amountChipActive]}>
                          <Text style={[styles.amountChipText, selectedAmount === amt && styles.amountChipTextActive]}>
                            R$ {amt}
                          </Text>
                        </View>
                      </TapScale>
                    ))}
                  </View>
                  <View style={styles.flowActions}>
                    <TapScale onPress={() => { hapticLight(); setFlow('idle'); setPaymentError(null); }}>
                      <View style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                      </View>
                    </TapScale>
                    <TapScale disabled={selectedAmount === 0} onPress={handleDeposit}>
                      <View style={[styles.confirmBtn, selectedAmount === 0 && styles.btnDisabled]}>
                        <Text style={styles.confirmBtnText}>Gerar Pix</Text>
                      </View>
                    </TapScale>
                  </View>
                </>
              )}

              {/* Step 2: Processing */}
              {flow === 'deposit_processing' && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.processingText}>Gerando pagamento...</Text>
                </View>
              )}

              {/* Step 3: Pix QR + copy-paste */}
              {flow === 'deposit_pix' && pixPayment && (
                <>
                  <Text style={styles.flowTitle}>Pague via Pix</Text>
                  <View style={styles.pixSection}>
                    <View style={styles.qrBox}>
                      {QRCodeComponent && pixPayment.pixCopyPaste ? (
                        <QRCodeComponent value={pixPayment.pixCopyPaste} size={160} color="#F0EDF8" backgroundColor="#16131F" />
                      ) : (
                        <Text style={styles.qrPlaceholder}>[ QR Code Pix ]</Text>
                      )}
                    </View>
                    <Text style={styles.pixAmount}>R$ {pixPayment.amount.toFixed(2)}</Text>

                    {/* Copy-paste code */}
                    <Text style={styles.pixCopyLabel}>Ou copie o codigo Pix:</Text>
                    <TouchableOpacity style={styles.pixCopyBox} onPress={handleCopyPixCode} activeOpacity={0.7}>
                      <Text style={styles.pixCopyCode} numberOfLines={2}>{pixPayment.pixCopyPaste}</Text>
                      <View style={[styles.pixCopyBtn, copied && styles.pixCopyBtnCopied]}>
                        <Text style={styles.pixCopyBtnText}>{copied ? 'Copiado!' : 'Copiar'}</Text>
                      </View>
                    </TouchableOpacity>

                    <Text style={styles.pixExpiry}>
                      Expira em 30 minutos
                    </Text>
                    <TrustBadgeRow />
                  </View>
                  <View style={styles.flowActions}>
                    <TapScale onPress={() => { hapticLight(); setFlow('idle'); setPixPayment(null); setPaymentError(null); }}>
                      <View style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                      </View>
                    </TapScale>
                    <TapScale onPress={handleConfirmPix}>
                      <View style={styles.confirmBtn}>
                        <Text style={styles.confirmBtnText}>Ja paguei</Text>
                      </View>
                    </TapScale>
                  </View>
                </>
              )}

              {/* Step 4: Success */}
              {flow === 'deposit_success' && (
                <View style={styles.successContainer}>
                  <SuccessCheckmark active />
                  <Text style={styles.successTitle}>Deposito confirmado!</Text>
                  <Text style={styles.successAmount}>R$ {pixPayment?.amount.toFixed(2)}</Text>
                  <Text style={styles.successSubtitle}>Saldo atualizado na sua carteira.</Text>
                  <TapScale onPress={() => { setFlow('idle'); setPixPayment(null); setSelectedAmount(0); setPaymentError(null); }}>
                    <View style={styles.confirmBtn}>
                      <Text style={styles.confirmBtnText}>Fechar</Text>
                    </View>
                  </TapScale>
                </View>
              )}
            </View>
          </SmoothEntry>
        )}

        {/* Withdraw Flow */}
        {flow.startsWith('withdraw') && flow !== 'idle' && (
          <SmoothEntry delay={0}>
            <View style={styles.flowCard}>
              {paymentError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{paymentError}</Text>
                </View>
              )}

              {/* Step 1: Select amount */}
              {flow === 'withdraw_select' && (
                <>
                  <Text style={styles.flowTitle}>Valor do saque</Text>
                  <View style={styles.amountGrid}>
                    {WITHDRAW_AMOUNTS.map((amt) => {
                      const disabled = user.balance < amt;
                      return (
                        <TapScale key={amt} disabled={disabled} onPress={() => { hapticLight(); setSelectedAmount(amt); }}>
                          <View style={[styles.amountChip, selectedAmount === amt && styles.amountChipActive, disabled && styles.amountChipDisabled]}>
                            <Text style={[styles.amountChipText, selectedAmount === amt && styles.amountChipTextActive, disabled && styles.amountChipTextDisabled]}>
                              R$ {amt}
                            </Text>
                          </View>
                        </TapScale>
                      );
                    })}
                  </View>
                  <View style={styles.flowActions}>
                    <TapScale onPress={() => { hapticLight(); setFlow('idle'); setPaymentError(null); }}>
                      <View style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                      </View>
                    </TapScale>
                    <TapScale disabled={selectedAmount === 0} onPress={() => { hapticMedium(); setFlow('withdraw_pixkey'); }}>
                      <View style={[styles.confirmBtn, styles.withdrawConfirmBtn, selectedAmount === 0 && styles.btnDisabled]}>
                        <Text style={styles.confirmBtnText}>Continuar</Text>
                      </View>
                    </TapScale>
                  </View>
                </>
              )}

              {/* Step 2: Pix key input */}
              {flow === 'withdraw_pixkey' && (
                <>
                  <Text style={styles.flowTitle}>Chave Pix para saque</Text>
                  <Text style={styles.withdrawSummaryNote}>R$ {selectedAmount.toFixed(2)} serao transferidos para sua chave Pix</Text>

                  {/* Pix key type selector */}
                  <View style={styles.pixKeyTypeRow}>
                    {(['cpf', 'email', 'phone', 'random'] as const).map((type) => (
                      <TapScale key={type} onPress={() => { hapticLight(); setPixKeyType(type); }}>
                        <View style={[styles.pixKeyTypeBtn, pixKeyType === type && styles.pixKeyTypeBtnActive]}>
                          <Text style={[styles.pixKeyTypeText, pixKeyType === type && styles.pixKeyTypeTextActive]}>
                            {type === 'cpf' ? 'CPF' : type === 'email' ? 'Email' : type === 'phone' ? 'Celular' : 'Aleatoria'}
                          </Text>
                        </View>
                      </TapScale>
                    ))}
                  </View>

                  <TextInput
                    style={styles.pixKeyInput}
                    value={pixKeyInput}
                    onChangeText={setPixKeyInput}
                    placeholder={pixKeyType === 'cpf' ? '000.000.000-00' : pixKeyType === 'email' ? 'email@exemplo.com' : pixKeyType === 'phone' ? '(11) 99999-9999' : 'Chave aleatoria'}
                    placeholderTextColor={colors.textMuted}
                    keyboardType={pixKeyType === 'email' ? 'email-address' : pixKeyType === 'phone' ? 'phone-pad' : 'default'}
                    autoCapitalize="none"
                  />

                  <View style={styles.flowActions}>
                    <TapScale onPress={() => { hapticLight(); setFlow('withdraw_select'); setPaymentError(null); }}>
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

              {/* Step 3: Processing */}
              {flow === 'withdraw_processing' && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color={colors.orange} />
                  <Text style={styles.processingText}>Processando saque...</Text>
                </View>
              )}

              {/* Step 4: Success */}
              {flow === 'withdraw_success' && withdrawResult && (
                <View style={styles.successContainer}>
                  <Text style={styles.successIcon}>💸</Text>
                  <Text style={styles.successTitle}>Saque solicitado!</Text>
                  <Text style={styles.successAmount}>R$ {withdrawResult.amount.toFixed(2)}</Text>
                  <Text style={styles.successSubtitle}>
                    Transferencia via Pix para {withdrawResult.pixKey}{'\n'}
                    Previsao: ate 24 horas
                  </Text>
                  <TapScale onPress={() => { setFlow('idle'); setWithdrawResult(null); setSelectedAmount(0); setPixKeyInput(''); setPaymentError(null); }}>
                    <View style={[styles.confirmBtn, styles.withdrawConfirmBtn]}>
                      <Text style={styles.confirmBtnText}>Fechar</Text>
                    </View>
                  </TapScale>
                </View>
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

        {transactions.length === 0 ? (
          <EmptyState {...EMPTY_PRESETS.walletTransactions} />
        ) : (
          transactions.map((tx, index) => (
            <React.Fragment key={tx.id}>
              {renderTransaction({ item: tx, index })}
            </React.Fragment>
          ))
        )}

        <View style={styles.bottomSpacer} />
        </>}
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

  // Error banner
  errorBanner: {
    backgroundColor: colors.red + '15',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.red + '30',
  },
  errorText: {
    ...typography.body,
    fontSize: 12,
    color: colors.red,
    textAlign: 'center' as const,
  },

  // Processing
  processingContainer: {
    alignItems: 'center' as const,
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  processingText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Pix section
  pixSection: {
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  pixCopyLabel: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  pixCopyBox: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.sm,
    width: '100%' as const,
  },
  pixCopyCode: {
    ...typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    flex: 1,
  },
  pixCopyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  pixCopyBtnCopied: {
    backgroundColor: colors.green,
  },
  pixCopyBtnText: {
    ...typography.bodySemiBold,
    fontSize: 11,
    color: '#FFF',
  },
  pixExpiry: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  },

  // Success
  successContainer: {
    alignItems: 'center' as const,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  successTitle: {
    ...typography.display,
    fontSize: 20,
    color: colors.textPrimary,
  },
  successAmount: {
    ...typography.monoBold,
    fontSize: 24,
    color: colors.green,
  },
  successSubtitle: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: spacing.md,
  },

  // Pix key input
  pixKeyTypeRow: {
    flexDirection: 'row' as const,
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  pixKeyTypeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: 'center' as const,
  },
  pixKeyTypeBtnActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary + '40',
  },
  pixKeyTypeText: {
    ...typography.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
  },
  pixKeyTypeTextActive: {
    color: colors.primary,
  },
  pixKeyInput: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.md,
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
