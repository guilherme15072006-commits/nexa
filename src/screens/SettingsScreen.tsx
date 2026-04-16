import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing, typography, typeScale } from '../theme';
import { useNexaStore, AppSettings, ExclusionPeriod } from '../store/nexaStore';
import { SmoothEntry, TapScale } from '../components/LiveComponents';
import { Card } from '../components/ui';
import { IconShield } from '../components/Icons';
import { hapticLight, hapticMedium } from '../services/haptics';

// ─── Types ──────────────────────────────────────────────────────────────────

type Language = AppSettings['language'];

const LANGUAGE_OPTIONS: { key: Language; label: string }[] = [
  { key: 'pt', label: 'PT' },
  { key: 'en', label: 'EN' },
  { key: 'es', label: 'ES' },
];

// ─── Toggle Component ───────────────────────────────────────────────────────

function ToggleRow({
  label,
  value,
  onToggle,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={() => {
        if (!disabled) {
          hapticLight();
          onToggle();
        }
      }}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={[styles.settingLabel, disabled && styles.settingLabelDisabled]}>
        {label}
      </Text>
      <View style={[styles.toggle, value && styles.toggleActive, disabled && styles.toggleDisabled]}>
        <View style={[styles.toggleKnob, value && styles.toggleKnobActive]} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const navigation = useNavigation();
  const settings = useNexaStore((s) => s.settings);
  const updateSettings = useNexaStore((s) => s.updateSettings);
  const kycCompleted = useNexaStore((s) => s.user.kycCompleted);
  const responsibleGaming = useNexaStore((s) => s.responsibleGaming);
  const setDepositLimit = useNexaStore((s) => s.setDepositLimit);
  const activateSelfExclusion = useNexaStore((s) => s.activateSelfExclusion);

  const [limitInput, setLimitInput] = useState(
    settings.responsibleGamblingLimit !== null
      ? String(settings.responsibleGamblingLimit)
      : '',
  );
  const [dailyLimitInput, setDailyLimitInput] = useState(
    responsibleGaming.depositLimits.daily !== null ? String(responsibleGaming.depositLimits.daily) : '',
  );
  const [weeklyLimitInput, setWeeklyLimitInput] = useState(
    responsibleGaming.depositLimits.weekly !== null ? String(responsibleGaming.depositLimits.weekly) : '',
  );
  const [monthlyLimitInput, setMonthlyLimitInput] = useState(
    responsibleGaming.depositLimits.monthly !== null ? String(responsibleGaming.depositLimits.monthly) : '',
  );
  const [showExclusionConfirm, setShowExclusionConfirm] = useState<ExclusionPeriod | null>(null);
  const [showComplianceLog, setShowComplianceLog] = useState(false);

  const handleGoBack = useCallback(() => {
    hapticLight();
    navigation.goBack();
  }, [navigation]);

  const handleThemeToggle = useCallback(() => {
    hapticMedium();
    updateSettings({ theme: settings.theme === 'dark' ? 'darker' : 'dark' });
  }, [settings.theme, updateSettings]);

  const handleNotifMaster = useCallback(() => {
    hapticMedium();
    updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  }, [settings.notificationsEnabled, updateSettings]);

  const handleNotifMissions = useCallback(() => {
    hapticLight();
    updateSettings({ notifyMissions: !settings.notifyMissions });
  }, [settings.notifyMissions, updateSettings]);

  const handleNotifRank = useCallback(() => {
    hapticLight();
    updateSettings({ notifyRankChanges: !settings.notifyRankChanges });
  }, [settings.notifyRankChanges, updateSettings]);

  const handleNotifSocial = useCallback(() => {
    hapticLight();
    updateSettings({ notifySocialActions: !settings.notifySocialActions });
  }, [settings.notifySocialActions, updateSettings]);

  const handleNotifStreak = useCallback(() => {
    hapticLight();
    updateSettings({ notifyStreakRisk: !settings.notifyStreakRisk });
  }, [settings.notifyStreakRisk, updateSettings]);

  const handleVisibility = useCallback(() => {
    hapticMedium();
    updateSettings({
      profileVisibility: settings.profileVisibility === 'public' ? 'private' : 'public',
    });
  }, [settings.profileVisibility, updateSettings]);

  const handleLanguage = useCallback(
    (lang: Language) => {
      hapticLight();
      updateSettings({ language: lang });
    },
    [updateSettings],
  );

  const handleLimitSubmit = useCallback(() => {
    const value = limitInput.trim();
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      updateSettings({ responsibleGamblingLimit: null });
      setLimitInput('');
    } else {
      updateSettings({ responsibleGamblingLimit: Number(value) });
    }
  }, [limitInput, updateSettings]);

  const handleClearLimit = useCallback(() => {
    hapticLight();
    updateSettings({ responsibleGamblingLimit: null });
    setLimitInput('');
  }, [updateSettings]);

  const handleDepositLimit = useCallback((period: 'daily' | 'weekly' | 'monthly', input: string) => {
    hapticMedium();
    const val = input.trim();
    if (!val || isNaN(Number(val)) || Number(val) <= 0) {
      setDepositLimit(period, null);
    } else {
      setDepositLimit(period, Number(val));
    }
  }, [setDepositLimit]);

  const handleSelfExclusion = useCallback((period: ExclusionPeriod) => {
    hapticMedium();
    activateSelfExclusion(period);
    setShowExclusionConfirm(null);
  }, [activateSelfExclusion]);

  const notifDisabled = !settings.notificationsEnabled;

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
            <Text style={styles.headerTitle}>Configurações</Text>
            <View style={styles.backButton} />
          </View>
        </SmoothEntry>

        {/* KYC Status */}
        <SmoothEntry delay={50}>
          <TapScale onPress={() => { if (!kycCompleted) { hapticLight(); navigation.navigate('KYC' as never); } }}>
            <View style={[
              kycStyles.banner,
              kycCompleted ? kycStyles.bannerDone : kycStyles.bannerPending,
            ]}>
              <IconShield size={20} color={kycCompleted ? colors.green : colors.orange} />
              <View style={kycStyles.bannerText}>
                <Text style={kycStyles.bannerTitle}>
                  {kycCompleted ? 'Identidade verificada' : 'Verificacao pendente'}
                </Text>
                <Text style={kycStyles.bannerDesc}>
                  {kycCompleted
                    ? 'Sua conta esta aprovada para depositos e saques.'
                    : 'Verifique sua identidade para depositar e sacar.'}
                </Text>
              </View>
              {!kycCompleted && <Text style={kycStyles.bannerArrow}>{'>'}</Text>}
            </View>
          </TapScale>
        </SmoothEntry>

        {/* Aparência */}
        <SmoothEntry delay={100}>
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Aparência</Text>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleThemeToggle}
              activeOpacity={0.7}
            >
              <View>
                <Text style={styles.settingLabel}>Tema</Text>
                <Text style={styles.settingDesc}>
                  {settings.theme === 'dark' ? 'Escuro' : 'Muito Escuro'}
                </Text>
              </View>
              <View style={styles.themeToggle}>
                <View
                  style={[
                    styles.themeOption,
                    settings.theme === 'dark' && styles.themeOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      settings.theme === 'dark' && styles.themeOptionTextActive,
                    ]}
                  >
                    Escuro
                  </Text>
                </View>
                <View
                  style={[
                    styles.themeOption,
                    settings.theme === 'darker' && styles.themeOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.themeOptionText,
                      settings.theme === 'darker' && styles.themeOptionTextActive,
                    ]}
                  >
                    Mais Escuro
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Card>
        </SmoothEntry>

        {/* Notificacoes */}
        <SmoothEntry delay={200}>
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Notificacoes</Text>
            <ToggleRow
              label="Ativar notificacoes"
              value={settings.notificationsEnabled}
              onToggle={handleNotifMaster}
            />
            <View style={styles.divider} />
            <ToggleRow
              label="Missoes"
              value={settings.notifyMissions}
              onToggle={handleNotifMissions}
              disabled={notifDisabled}
            />
            <ToggleRow
              label="Mudancas de rank"
              value={settings.notifyRankChanges}
              onToggle={handleNotifRank}
              disabled={notifDisabled}
            />
            <ToggleRow
              label="Acoes sociais"
              value={settings.notifySocialActions}
              onToggle={handleNotifSocial}
              disabled={notifDisabled}
            />
            <ToggleRow
              label="Risco de streak"
              value={settings.notifyStreakRisk}
              onToggle={handleNotifStreak}
              disabled={notifDisabled}
            />
          </Card>
        </SmoothEntry>

        {/* Privacidade */}
        <SmoothEntry delay={300}>
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Privacidade</Text>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleVisibility}
              activeOpacity={0.7}
            >
              <View>
                <Text style={styles.settingLabel}>Perfil</Text>
                <Text style={styles.settingDesc}>
                  {settings.profileVisibility === 'public' ? 'Publico' : 'Privado'}
                </Text>
              </View>
              <View
                style={[
                  styles.visibilityBadge,
                  settings.profileVisibility === 'private' && styles.visibilityBadgePrivate,
                ]}
              >
                <Text
                  style={[
                    styles.visibilityText,
                    settings.profileVisibility === 'private' && styles.visibilityTextPrivate,
                  ]}
                >
                  {settings.profileVisibility === 'public' ? 'Publico' : 'Privado'}
                </Text>
              </View>
            </TouchableOpacity>
          </Card>
        </SmoothEntry>

        {/* Jogo Responsavel */}
        <SmoothEntry delay={400}>
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Jogo Responsavel</Text>

            {/* Self-Exclusion Status */}
            {responsibleGaming.selfExclusion.active && (
              <View style={styles.exclusionActive}>
                <Text style={styles.exclusionActiveTitle}>Auto-exclusao ativa</Text>
                <Text style={styles.exclusionActiveDesc}>
                  Periodo: {responsibleGaming.selfExclusion.period}{'\n'}
                  Expira em: {responsibleGaming.selfExclusion.expiresAt
                    ? new Date(responsibleGaming.selfExclusion.expiresAt).toLocaleString('pt-BR')
                    : '—'}
                </Text>
                <Text style={styles.exclusionActiveWarn}>
                  Depositos e apostas bloqueados durante este periodo.
                </Text>
              </View>
            )}

            {/* Deposit Limits */}
            <Text style={styles.subsectionTitle}>Limites de deposito</Text>
            {([
              { key: 'daily' as const, label: 'Diario', input: dailyLimitInput, setInput: setDailyLimitInput, current: responsibleGaming.depositLimits.daily, tracked: responsibleGaming.depositTracking.todayTotal },
              { key: 'weekly' as const, label: 'Semanal', input: weeklyLimitInput, setInput: setWeeklyLimitInput, current: responsibleGaming.depositLimits.weekly, tracked: responsibleGaming.depositTracking.weekTotal },
              { key: 'monthly' as const, label: 'Mensal', input: monthlyLimitInput, setInput: setMonthlyLimitInput, current: responsibleGaming.depositLimits.monthly, tracked: responsibleGaming.depositTracking.monthTotal },
            ]).map((item) => (
              <View key={item.key} style={styles.limitSection}>
                <View style={styles.limitHeader}>
                  <Text style={styles.settingLabel}>Limite {item.label}</Text>
                  <Text style={styles.settingDesc}>
                    {item.current !== null
                      ? `R$${item.tracked.toFixed(0)} / R$${item.current}`
                      : 'Sem limite'}
                  </Text>
                </View>
                {item.current !== null && (
                  <View style={styles.limitProgress}>
                    <View style={[styles.limitProgressFill, { width: `${Math.min(100, (item.tracked / item.current) * 100)}%` }]} />
                  </View>
                )}
                <View style={styles.limitInputRow}>
                  <Text style={styles.currencyPrefix}>R$</Text>
                  <TextInput
                    style={styles.limitInput}
                    value={item.input}
                    onChangeText={item.setInput}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    returnKeyType="done"
                    onSubmitEditing={() => handleDepositLimit(item.key, item.input)}
                  />
                  <TapScale onPress={() => handleDepositLimit(item.key, item.input)}>
                    <View style={styles.limitButton}>
                      <Text style={styles.limitButtonText}>Definir</Text>
                    </View>
                  </TapScale>
                  {item.current !== null && (
                    <TapScale onPress={() => { hapticLight(); setDepositLimit(item.key, null); item.setInput(''); }}>
                      <View style={styles.limitClearButton}>
                        <Text style={styles.limitClearText}>Limpar</Text>
                      </View>
                    </TapScale>
                  )}
                </View>
              </View>
            ))}

            <View style={styles.divider} />

            {/* Bet Limit (legacy) */}
            <View style={styles.limitSection}>
              <View style={styles.limitHeader}>
                <Text style={styles.settingLabel}>Limite diario de apostas</Text>
                <Text style={styles.settingDesc}>
                  {settings.responsibleGamblingLimit !== null
                    ? `R$ ${settings.responsibleGamblingLimit.toFixed(2)}`
                    : 'Sem limite'}
                </Text>
              </View>
              <View style={styles.limitInputRow}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.limitInput}
                  value={limitInput}
                  onChangeText={setLimitInput}
                  placeholder="0,00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  onSubmitEditing={handleLimitSubmit}
                  returnKeyType="done"
                />
                <TapScale onPress={handleLimitSubmit}>
                  <View style={styles.limitButton}>
                    <Text style={styles.limitButtonText}>Definir</Text>
                  </View>
                </TapScale>
                {settings.responsibleGamblingLimit !== null && (
                  <TapScale onPress={handleClearLimit}>
                    <View style={styles.limitClearButton}>
                      <Text style={styles.limitClearText}>Limpar</Text>
                    </View>
                  </TapScale>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Self-Exclusion */}
            <Text style={styles.subsectionTitle}>Auto-exclusao temporaria</Text>
            <Text style={styles.exclusionDesc}>
              Bloqueia depositos e apostas por um periodo. Esta acao nao pode ser cancelada antes do prazo.
            </Text>
            <View style={styles.exclusionRow}>
              {(['24h', '7d', '30d'] as ExclusionPeriod[]).map((period) => (
                <TapScale
                  key={period}
                  onPress={() => {
                    hapticMedium();
                    if (responsibleGaming.selfExclusion.active) return;
                    setShowExclusionConfirm(period);
                  }}
                >
                  <View style={[
                    styles.exclusionBtn,
                    responsibleGaming.selfExclusion.active && styles.exclusionBtnDisabled,
                  ]}>
                    <Text style={styles.exclusionBtnText}>{period}</Text>
                  </View>
                </TapScale>
              ))}
            </View>

            {/* Exclusion confirmation modal */}
            {showExclusionConfirm && (
              <View style={styles.exclusionConfirm}>
                <Text style={styles.exclusionConfirmTitle}>
                  Confirmar auto-exclusao de {showExclusionConfirm}?
                </Text>
                <Text style={styles.exclusionConfirmDesc}>
                  Voce nao podera depositar ou apostar durante este periodo. Esta acao e irreversivel.
                </Text>
                <View style={styles.exclusionConfirmRow}>
                  <TapScale onPress={() => handleSelfExclusion(showExclusionConfirm)}>
                    <View style={styles.exclusionConfirmYes}>
                      <Text style={styles.exclusionConfirmYesText}>Confirmar</Text>
                    </View>
                  </TapScale>
                  <TapScale onPress={() => { hapticLight(); setShowExclusionConfirm(null); }}>
                    <View style={styles.exclusionConfirmNo}>
                      <Text style={styles.exclusionConfirmNoText}>Cancelar</Text>
                    </View>
                  </TapScale>
                </View>
              </View>
            )}

            <View style={styles.divider} />

            {/* Compliance Log */}
            <TouchableOpacity onPress={() => { hapticLight(); setShowComplianceLog(!showComplianceLog); }}>
              <View style={styles.complianceHeader}>
                <Text style={styles.subsectionTitle}>Log de auditoria</Text>
                <Text style={styles.complianceCount}>
                  {responsibleGaming.complianceLog.length} registros
                </Text>
              </View>
            </TouchableOpacity>
            {showComplianceLog && (
              <View style={styles.complianceLog}>
                {responsibleGaming.complianceLog.length === 0 ? (
                  <Text style={styles.complianceEmpty}>Nenhum registro ainda.</Text>
                ) : (
                  responsibleGaming.complianceLog.slice(0, 20).map((entry) => (
                    <View key={entry.id} style={styles.complianceEntry}>
                      <View style={[
                        styles.complianceDot,
                        { backgroundColor: entry.action.includes('blocked') ? colors.red
                          : entry.action.includes('exclusion') ? colors.orange
                          : entry.action.includes('allowed') ? colors.green
                          : colors.textMuted },
                      ]} />
                      <View style={styles.complianceEntryText}>
                        <Text style={styles.complianceAction}>{entry.action.replace(/_/g, ' ')}</Text>
                        <Text style={styles.complianceDetail} numberOfLines={2}>{entry.detail}</Text>
                        <Text style={styles.complianceTime}>
                          {new Date(entry.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </Card>
        </SmoothEntry>

        {/* Idioma */}
        <SmoothEntry delay={500}>
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Idioma</Text>
            <View style={styles.languageRow}>
              {LANGUAGE_OPTIONS.map((lang) => (
                <TapScale key={lang.key} onPress={() => handleLanguage(lang.key)}>
                  <View
                    style={[
                      styles.languageOption,
                      settings.language === lang.key && styles.languageOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.languageText,
                        settings.language === lang.key && styles.languageTextActive,
                      ]}
                    >
                      {lang.label}
                    </Text>
                  </View>
                </TapScale>
              ))}
            </View>
          </Card>
        </SmoothEntry>

        {/* Conta */}
        <SmoothEntry delay={600}>
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Conta</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sobre o NEXA</Text>
              <Text style={styles.settingDesc}>Plataforma de apostas sociais</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Versao</Text>
              <Text style={styles.versionText}>1.0.0 (alpha)</Text>
            </View>
          </Card>
        </SmoothEntry>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── KYC Banner Styles ───────────────────────────────────────────────────────

const kycStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  bannerDone: {
    backgroundColor: colors.green + '08',
    borderColor: colors.green + '20',
  },
  bannerPending: {
    backgroundColor: colors.orange + '08',
    borderColor: colors.orange + '20',
  },
  bannerText: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    ...typeScale.label,
    color: colors.textPrimary,
  },
  bannerDesc: {
    ...typeScale.bodySm,
    color: colors.textSecondary,
  },
  bannerArrow: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.textMuted,
  },
});

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

  // Section
  sectionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.displayMedium,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.md,
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingLabel: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  settingLabelDisabled: {
    color: colors.textMuted,
  },
  settingDesc: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },

  // Toggle
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleDisabled: {
    opacity: 0.4,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textMuted,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
  },

  // Theme Toggle
  themeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  themeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  themeOptionActive: {
    backgroundColor: colors.primary,
  },
  themeOptionText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    fontSize: 12,
  },
  themeOptionTextActive: {
    color: '#fff',
  },

  // Visibility
  visibilityBadge: {
    backgroundColor: colors.green + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  visibilityBadgePrivate: {
    backgroundColor: colors.orange + '20',
  },
  visibilityText: {
    ...typography.bodySemiBold,
    color: colors.green,
    fontSize: 12,
  },
  visibilityTextPrivate: {
    color: colors.orange,
  },

  // Limit
  limitSection: {
    gap: spacing.sm,
  },
  limitInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  currencyPrefix: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 14,
  },
  limitInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    ...typography.mono,
    color: colors.textPrimary,
    fontSize: 14,
  },
  limitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  limitButtonText: {
    ...typography.bodySemiBold,
    color: '#fff',
    fontSize: 12,
  },
  limitClearButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  limitClearText: {
    ...typography.bodyMedium,
    color: colors.red,
    fontSize: 12,
  },

  // Language
  languageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  languageOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  languageOptionActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  languageText: {
    ...typography.bodySemiBold,
    color: colors.textMuted,
    fontSize: 14,
  },
  languageTextActive: {
    color: colors.primary,
  },

  // Version
  versionText: {
    ...typography.mono,
    color: colors.textMuted,
    fontSize: 12,
  },

  // Responsible Gaming
  subsectionTitle: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  limitHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  limitProgress: {
    height: 4,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    overflow: 'hidden' as const,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  limitProgressFill: {
    height: '100%' as const,
    backgroundColor: colors.green,
    borderRadius: radius.full,
  },

  // Self-exclusion
  exclusionDesc: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  exclusionRow: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
  },
  exclusionBtn: {
    flex: 1,
    backgroundColor: colors.red + '15',
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.red + '30',
    paddingVertical: spacing.sm + 2,
    alignItems: 'center' as const,
  },
  exclusionBtnDisabled: {
    opacity: 0.3,
  },
  exclusionBtnText: {
    ...typography.monoBold,
    fontSize: 13,
    color: colors.red,
  },
  exclusionActive: {
    backgroundColor: colors.red + '10',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.red + '30',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  exclusionActiveTitle: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.red,
    marginBottom: spacing.xs,
  },
  exclusionActiveDesc: {
    ...typography.mono,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  exclusionActiveWarn: {
    ...typography.bodySemiBold,
    fontSize: 11,
    color: colors.red,
    marginTop: spacing.sm,
  },
  exclusionConfirm: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.red + '40',
  },
  exclusionConfirmTitle: {
    ...typography.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  exclusionConfirmDesc: {
    ...typography.body,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  exclusionConfirmRow: {
    flexDirection: 'row' as const,
    gap: spacing.md,
  },
  exclusionConfirmYes: {
    flex: 1,
    backgroundColor: colors.red,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center' as const,
  },
  exclusionConfirmYesText: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: '#FFF',
  },
  exclusionConfirmNo: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center' as const,
  },
  exclusionConfirmNoText: {
    ...typography.bodySemiBold,
    fontSize: 13,
    color: colors.textMuted,
  },

  // Compliance log
  complianceHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  complianceCount: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  },
  complianceLog: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  complianceEmpty: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center' as const,
    paddingVertical: spacing.md,
  },
  complianceEntry: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
    alignItems: 'flex-start' as const,
  },
  complianceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  complianceEntryText: {
    flex: 1,
  },
  complianceAction: {
    ...typography.bodySemiBold,
    fontSize: 12,
    color: colors.textPrimary,
    textTransform: 'capitalize' as const,
  },
  complianceDetail: {
    ...typography.body,
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  complianceTime: {
    ...typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});
