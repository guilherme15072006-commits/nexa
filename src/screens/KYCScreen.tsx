import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { IconShield, IconTarget } from '../components/Icons';
import { colors, radius, spacing, typography, typeScale, anim } from '../theme';
import { useNexaStore } from '../store/nexaStore';
import { hapticLight, hapticMedium, hapticSuccess } from '../services/haptics';

// ─── CPF Helpers ─────────────────────────────────────────────────────────────

function formatCPF(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // all same digit

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === parseInt(digits[10]);
}

// ─── Date Helpers ────────────────────────────────────────────────────────────

function formatDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseDate(formatted: string): Date | null {
  const parts = formatted.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) return null;
  return new Date(year, month - 1, day);
}

function getAge(birth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function KYCScreen() {
  const navigation = useNavigation<any>();
  const completeKYC = useNexaStore(s => s.completeKYC);

  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Success animation
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  // Progress bar
  const filledFields = [fullName.length >= 3, cpf.replace(/\D/g, '').length === 11, birthDate.length === 10].filter(Boolean).length;
  const progress = filledFields / 3;

  const progressWidth = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: progress * 100,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleCpfChange = useCallback((text: string) => {
    setCpf(formatCPF(text));
    setErrors(e => ({ ...e, cpf: '' }));
  }, []);

  const handleDateChange = useCallback((text: string) => {
    setBirthDate(formatDate(text));
    setErrors(e => ({ ...e, birthDate: '' }));
  }, []);

  const handleNameChange = useCallback((text: string) => {
    setFullName(text);
    setErrors(e => ({ ...e, fullName: '' }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Name
    if (fullName.trim().length < 3) {
      newErrors.fullName = 'Nome completo obrigatorio';
    } else if (!fullName.trim().includes(' ')) {
      newErrors.fullName = 'Informe nome e sobrenome';
    }

    // CPF
    if (!validateCPF(cpf)) {
      newErrors.cpf = 'CPF invalido';
    }

    // Birth date
    const birth = parseDate(birthDate);
    if (!birth) {
      newErrors.birthDate = 'Data invalida (DD/MM/AAAA)';
    } else if (getAge(birth) < 18) {
      newErrors.birthDate = 'Voce precisa ter 18 anos ou mais';
    } else if (getAge(birth) > 120) {
      newErrors.birthDate = 'Data invalida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fullName, cpf, birthDate]);

  const handleSubmit = useCallback(() => {
    Animated.sequence([
      Animated.timing(ctaScale, { toValue: 0.96, duration: 60, useNativeDriver: true }),
      Animated.spring(ctaScale, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
    ]).start();

    if (!validate()) {
      hapticLight();
      return;
    }

    hapticSuccess();
    setSubmitted(true);

    const birth = parseDate(birthDate)!;
    completeKYC({
      fullName: fullName.trim(),
      cpf: cpf.replace(/\D/g, ''),
      birthDate: birth.toISOString(),
    });

    // Success animation
    Animated.parallel([
      Animated.spring(checkScale, { toValue: 1, tension: 120, friction: 6, useNativeDriver: true }),
      Animated.timing(checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      navigation.goBack();
    }, 1800);
  }, [validate, fullName, cpf, birthDate, completeKYC, navigation, checkScale, checkOpacity, ctaScale]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successCenter}>
          <Animated.View style={[styles.successIcon, { transform: [{ scale: checkScale }], opacity: checkOpacity }]}>
            <IconShield size={48} color={colors.green} />
          </Animated.View>
          <Animated.Text style={[styles.successTitle, { opacity: checkOpacity }]}>
            Verificacao concluida
          </Animated.Text>
          <Animated.Text style={[styles.successSubtitle, { opacity: checkOpacity }]}>
            Sua identidade foi confirmada. Voce pode depositar e apostar.
          </Animated.Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => { hapticLight(); navigation.goBack(); }}
          >
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verificacao de identidade</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Progress */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info banner */}
          <View style={styles.infoBanner}>
            <IconShield size={20} color={colors.green} />
            <Text style={styles.infoText}>
              Seus dados sao criptografados e usados apenas para verificacao legal.
            </Text>
          </View>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={[styles.input, errors.fullName ? styles.inputError : null]}
              value={fullName}
              onChangeText={handleNameChange}
              placeholder="Como no documento"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
          </View>

          {/* CPF */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={[styles.input, errors.cpf ? styles.inputError : null]}
              value={cpf}
              onChangeText={handleCpfChange}
              placeholder="000.000.000-00"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={14}
            />
            {errors.cpf ? <Text style={styles.errorText}>{errors.cpf}</Text> : null}
          </View>

          {/* Birth Date */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Data de nascimento</Text>
            <TextInput
              style={[styles.input, errors.birthDate ? styles.inputError : null]}
              value={birthDate}
              onChangeText={handleDateChange}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={10}
            />
            {errors.birthDate ? <Text style={styles.errorText}>{errors.birthDate}</Text> : null}
          </View>

          {/* Legal notice */}
          <Text style={styles.legalText}>
            Ao continuar, voce confirma que tem 18 anos ou mais e concorda com os Termos de Uso e Politica de Privacidade da NEXA.
          </Text>
        </ScrollView>

        {/* CTA */}
        <View style={styles.footer}>
          <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
            <TouchableOpacity
              style={[styles.cta, progress < 1 && styles.ctaDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>Verificar identidade</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  headerTitle: {
    ...typeScale.h3,
    color: colors.textPrimary,
  },

  // Progress
  progressTrack: {
    height: 3,
    backgroundColor: colors.bgElevated,
    marginHorizontal: spacing.lg,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: radius.full,
  },

  // Scroll
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },

  // Info banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.green + '08',
    borderWidth: 1,
    borderColor: colors.green + '20',
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  infoText: {
    ...typeScale.bodySm,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },

  // Fields
  fieldGroup: {
    gap: spacing.sm,
  },
  label: {
    ...typeScale.label,
    color: colors.textPrimary,
  },
  input: {
    ...typeScale.body,
    color: colors.textPrimary,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: colors.red,
  },
  errorText: {
    ...typeScale.bodySm,
    color: colors.red,
  },

  // Legal
  legalText: {
    ...typeScale.bodySm,
    color: colors.textMuted,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  cta: {
    backgroundColor: colors.green,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.35,
  },
  ctaText: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },

  // Success
  successCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.green + '12',
    borderWidth: 2,
    borderColor: colors.green + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typeScale.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  successSubtitle: {
    ...typeScale.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
