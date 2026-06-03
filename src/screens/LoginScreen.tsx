import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, StatusBar,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { colors, spacing, radius, typography } from '../theme';
import { useNexaStore } from '../store/nexaStore';
import { Logo } from '../components/Logo';
import { PrimaryButton, GhostButton, ScalePress } from '../components/ui';

type Mode = 'login' | 'signup';

export default function LoginScreen() {
  const signIn = useNexaStore(s => s.signIn);
  const signUp = useNexaStore(s => s.signUp);
  const continueAsDemo = useNexaStore(s => s.continueAsDemo);
  const demoUsername = useNexaStore(s => s.user.username);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = useCallback(async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, username.trim() || undefined);
        // Se o projeto exigir confirmacao de e-mail, nao ha sessao ainda
        if (useNexaStore.getState().authStatus === 'guest') {
          setInfo('Conta criada! Confirme seu e-mail para entrar.');
        }
      }
    } catch (e: any) {
      setError(e?.message ?? 'Nao foi possivel autenticar.');
    } finally {
      setLoading(false);
    }
  }, [mode, email, password, username, signIn, signUp]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <Logo size={96} />
          <Text style={styles.brand}>NEXA</Text>
          <Text style={styles.tagline}>Aposte. Compita. Domine.</Text>
        </View>

        <View style={styles.tabs}>
          {(['login', 'signup'] as Mode[]).map(m => (
            <ScalePress key={m} onPress={() => { setMode(m); setError(null); setInfo(null); }}>
              <View style={[styles.tab, mode === m && styles.tabActive]}>
                <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                  {m === 'login' ? 'Entrar' : 'Criar conta'}
                </Text>
              </View>
            </ScalePress>
          ))}
        </View>

        <View style={styles.form}>
          {mode === 'signup' && (
            <TextInput
              style={styles.input}
              placeholder="Nome de usuario (opcional)"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              accessibilityLabel="Nome de usuario"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            accessibilityLabel="E-mail"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            accessibilityLabel="Senha"
          />

          {error && <Text style={styles.error}>{error}</Text>}
          {info && <Text style={styles.info}>{info}</Text>}

          <PrimaryButton
            label={mode === 'login' ? 'Entrar' : 'Criar conta'}
            onPress={submit}
            loading={loading}
            style={styles.cta}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.line} />
        </View>

        <GhostButton label="Continuar como demo" onPress={continueAsDemo} />
        {demoUsername && demoUsername !== 'NEXA' && (
          <Text style={styles.demoHint}>Explore com o perfil de demonstracao ({demoUsername})</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  logoWrap: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md },
  brand: { fontFamily: typography.display, fontSize: 28, color: colors.textPrimary, letterSpacing: 6 },
  tagline: { fontFamily: typography.body, fontSize: 13, color: colors.textSecondary },

  tabs: { flexDirection: 'row', gap: spacing.sm, alignSelf: 'center' },
  tab: { paddingVertical: 8, paddingHorizontal: 22, borderRadius: radius.full, backgroundColor: colors.bgElevated },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontFamily: typography.bodyMed, fontSize: 14, color: colors.textSecondary },
  tabTextActive: { color: '#fff' },

  form: { gap: spacing.sm },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 0.5, borderColor: colors.border, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    fontFamily: typography.body, fontSize: 15, color: colors.textPrimary,
  },
  error: { color: colors.red, fontFamily: typography.bodyMed, fontSize: 13, paddingHorizontal: spacing.xs },
  info: { color: colors.green, fontFamily: typography.bodyMed, fontSize: 13, paddingHorizontal: spacing.xs },
  cta: { marginTop: spacing.xs },

  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { flex: 1, height: 0.5, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontFamily: typography.body, fontSize: 12 },

  demoHint: { textAlign: 'center', color: colors.textMuted, fontFamily: typography.body, fontSize: 11, marginTop: -spacing.sm },
});
