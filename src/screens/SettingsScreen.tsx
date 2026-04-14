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
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore, AppSettings } from '../store/nexaStore';
import { SmoothEntry, TapScale } from '../components/LiveComponents';
import { Card } from '../components/ui';
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

  const [limitInput, setLimitInput] = useState(
    settings.responsibleGamblingLimit !== null
      ? String(settings.responsibleGamblingLimit)
      : '',
  );

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
            <View style={styles.limitSection}>
              <Text style={styles.settingLabel}>Limite diario de apostas</Text>
              <Text style={styles.settingDesc}>
                {settings.responsibleGamblingLimit !== null
                  ? `R$ ${settings.responsibleGamblingLimit.toFixed(2)}`
                  : 'Sem limite'}
              </Text>
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
});
