import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { auth, AuthUser } from '../services/firebase';
import { hapticLight, hapticMedium, hapticSuccess } from '../services/haptics';
import { TapScale, SmoothEntry } from '../components/LiveComponents';
import NexaLogo from '../components/NexaLogo';

// ─── Types ──────────────────────────────────────────────────────────────────

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'google' | 'guest' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Logo pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    setLoadingType('google');
    setError(null);
    hapticMedium();

    try {
      const user = await auth.signInWithGoogle();
      hapticSuccess();
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao entrar com Google. Tente novamente.');
      setLoading(false);
      setLoadingType(null);
    }
  }, [onLoginSuccess]);

  const handleGuestSignIn = useCallback(async () => {
    setLoading(true);
    setLoadingType('guest');
    setError(null);
    hapticLight();

    try {
      const user = await auth.signInWithGoogle(); // Falls through to mock
      hapticSuccess();
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao entrar como convidado.');
      setLoading(false);
      setLoadingType(null);
    }
  }, [onLoginSuccess]);

  const handleRetry = useCallback(() => {
    setError(null);
    hapticLight();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <SmoothEntry delay={0}>
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
            <NexaLogo size="large" />
          </Animated.View>
        </SmoothEntry>

        {/* Title */}
        <SmoothEntry delay={200}>
          <Text style={styles.title}>Bem-vindo ao NEXA</Text>
        </SmoothEntry>

        {/* Subtitle */}
        <SmoothEntry delay={400}>
          <Text style={styles.subtitle}>
            A plataforma definitiva de apostas esportivas
          </Text>
        </SmoothEntry>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Error state */}
        {error && (
          <SmoothEntry delay={0}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TapScale onPress={handleRetry}>
                <View style={styles.retryButton}>
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </View>
              </TapScale>
            </View>
          </SmoothEntry>
        )}

        {/* Google Sign-In button */}
        {!error && (
          <SmoothEntry delay={600}>
            <TapScale onPress={handleGoogleSignIn} disabled={loading}>
              <View style={styles.googleButton}>
                {loading && loadingType === 'google' ? (
                  <ActivityIndicator size="small" color="#4285F4" />
                ) : (
                  <>
                    <View style={styles.googleIconContainer}>
                      <Text style={styles.googleIcon}>G</Text>
                    </View>
                    <Text style={styles.googleText}>Entrar com Google</Text>
                  </>
                )}
              </View>
            </TapScale>
          </SmoothEntry>
        )}

        {/* Divider */}
        {!error && (
          <SmoothEntry delay={800}>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>
          </SmoothEntry>
        )}

        {/* Guest button */}
        {!error && (
          <SmoothEntry delay={1000}>
            <TapScale onPress={handleGuestSignIn} disabled={loading}>
              <View style={styles.guestButton}>
                {loading && loadingType === 'guest' ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.guestText}>Entrar como convidado</Text>
                )}
              </View>
            </TapScale>
          </SmoothEntry>
        )}

        {/* Terms */}
        <SmoothEntry delay={1200}>
          <Text style={styles.termsText}>
            Ao entrar, você concorda com os Termos de Uso
          </Text>
        </SmoothEntry>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.display,
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  spacer: {
    height: 48,
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.red,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontSize: 14,
  },
  retryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.red,
  },
  retryText: {
    ...typography.bodyMedium,
    color: colors.red,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    width: '100%',
    minHeight: 52,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  googleIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  googleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.body,
    color: colors.textMuted,
    marginHorizontal: spacing.md,
    fontSize: 14,
  },
  guestButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    width: '100%',
    minHeight: 52,
  },
  guestText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontSize: 16,
  },
  termsText: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
