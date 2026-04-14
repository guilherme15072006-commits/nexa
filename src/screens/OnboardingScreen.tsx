import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, OddsBtn } from '../components/ui';
import { colors, radius, spacing, typography } from '../theme';
import { useNexaStore } from '../store/nexaStore';
import { hapticMedium, hapticSuccess } from '../services/haptics';
import { Assets } from '../assets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OddSide = 'home' | 'draw' | 'away';

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    emoji: '🎯',
    title: 'Bem-vindo\nà NEXA',
    subtitle:
      'A plataforma que une apostas, evolução e comunidade num único ecossistema.',
    cta: 'Vamos lá',
    ctaColor: colors.primary,
    showSkip: true,
  },
  {
    emoji: '⚡',
    title: 'Sua primeira\naposta',
    subtitle: 'Sem risco. Escolha um resultado e ganhe seus primeiros XP.',
    cta: 'Continuar',
    ctaColor: colors.green,
    showSkip: false,
  },
  {
    emoji: '🧬',
    title: 'Seu DNA\napostador',
    subtitle: 'Identificamos seu estilo com base na sua escolha.',
    cta: 'Entendi',
    ctaColor: colors.orange,
    showSkip: false,
  },
  {
    emoji: '🏆',
    title: '+100 XP\nconquistados!',
    subtitle: 'Você já está na frente. Evolua para subir no ranking.',
    cta: 'Incrível!',
    ctaColor: colors.gold,
    showSkip: false,
  },
  {
    emoji: '🚀',
    title: 'Pronto para\ncomperir',
    subtitle: 'Missões, clãs e recompensas te esperam. Seu caminho começa agora.',
    cta: 'Entrar na NEXA',
    ctaColor: colors.primary,
    showSkip: false,
  },
] as const;

// ─── DNA result per pick ──────────────────────────────────────────────────────

const DNA_MAP: Record<OddSide, { style: string; icon: string; desc: string }> = {
  home: {
    style: 'Apostador Favorito',
    icon: '🏠',
    desc: 'Você joga com consistência. Favorece dados sólidos e times confiáveis.',
  },
  draw: {
    style: 'Analista Estratégico',
    icon: '🎲',
    desc: 'Você enxerga onde outros não olham. Um apostador de valor real.',
  },
  away: {
    style: 'Caçador de Valor',
    icon: '💎',
    desc: 'Você corre riscos calculados. Altas odds e retorno máximo.',
  },
};

// ─── Fake match for simulated bet ─────────────────────────────────────────────

const MATCH = {
  home: 'Brasil',
  away: 'Argentina',
  league: '🏆  Copa América',
  odds: { home: 1.85, draw: 3.20, away: 2.10 } as Record<OddSide, number>,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [step, setStep]     = useState(0);
  const [pick, setPick]     = useState<OddSide | null>(null);
  const [betDone, setBetDone] = useState(false);

  const addXP             = useNexaStore(s => s.addXP);
  const completeOnboarding = useNexaStore(s => s.completeOnboarding);

  // Transition
  const opacity = useRef(new Animated.Value(1)).current;
  const slideX  = useRef(new Animated.Value(0)).current;

  // Floating "+100 XP" popup
  const xpPopY     = useRef(new Animated.Value(0)).current;
  const xpPopAlpha = useRef(new Animated.Value(0)).current;

  // XP bar fill (step 4)
  const xpBarProg = useRef(new Animated.Value(0)).current;

  const cur     = STEPS[step];
  const isLast  = step === STEPS.length - 1;
  const ctaDisabled = step === 1 && !betDone;

  // ── Navigation ──────────────────────────────────────────────────────────────

  function transition(next: number, dir: 1 | -1) {
    const outX = -SCREEN_WIDTH * 0.25 * dir;
    const inX  =  SCREEN_WIDTH * 0.25 * dir;

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideX,  { toValue: outX, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideX.setValue(inX);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideX,  { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        // Animate XP bar on step 4
        if (next === 3) {
          xpBarProg.setValue(0);
          Animated.timing(xpBarProg, {
            toValue: 0.2, // 100 / 500 XP
            duration: 900,
            useNativeDriver: false,
          }).start();
        }
      });
    });
  }

  function handleCTA() {
    if (isLast) { hapticSuccess(); completeOnboarding(); return; }
    hapticMedium();
    transition(step + 1, 1);
  }

  function handleBack() {
    transition(step - 1, -1);
  }

  // ── Bet interaction ─────────────────────────────────────────────────────────

  function placeBet(side: OddSide) {
    if (betDone) return;
    hapticSuccess();
    setPick(side);
    setBetDone(true);
    addXP(100);

    // Floating popup
    xpPopY.setValue(0);
    xpPopAlpha.setValue(1);
    Animated.parallel([
      Animated.timing(xpPopY,
        { toValue: -90, duration: 1000, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(350),
        Animated.timing(xpPopAlpha,
          { toValue: 0, duration: 650, useNativeDriver: true }),
      ]),
    ]).start();
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>

      {/* Skip (step 0 only) */}
      {cur.showSkip && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => { hapticSuccess(); completeOnboarding(); }}
          accessibilityLabel="Pular onboarding"
        >
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      )}

      {/* Progress dots */}
      <View style={styles.dots}>
        {STEPS.map((s, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < step  && styles.dotDone,
              i === step && { width: 28, backgroundColor: cur.ctaColor, borderRadius: radius.full },
            ]}
          />
        ))}
      </View>

      {/* ── Animated slide area ── */}
      <Animated.View
        style={[styles.content, { opacity, transform: [{ translateX: slideX }] }]}
      >
        {/* Logo on first step */}
        {step === 0 && (
          <Image source={Assets.logo} style={styles.onboardingLogo} resizeMode="contain" />
        )}

        {/* Big emoji */}
        <Text style={styles.emoji}>{cur.emoji}</Text>

        {/* Title */}
        <Text style={styles.title}>{cur.title}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{cur.subtitle}</Text>

        {/* ── Step 1 — Simulated bet ── */}
        {step === 1 && (
          <View style={styles.betWrapper}>
            <Card style={styles.matchCard}>
              <Text style={styles.matchLeague}>{MATCH.league}</Text>
              <Text style={styles.matchTeams}>
                {MATCH.home}  ×  {MATCH.away}
              </Text>
              <View style={styles.oddsRow}>
                {(['home', 'draw', 'away'] as OddSide[]).map((side) => (
                  <OddsBtn
                    key={side}
                    label={side === 'home' ? 'Casa' : side === 'draw' ? 'Empate' : 'Fora'}
                    odds={MATCH.odds[side]}
                    selected={pick === side}
                    onPress={() => placeBet(side)}
                    accessibilityLabel={`Apostar ${side}`}
                  />
                ))}
              </View>
            </Card>

            {betDone && (
              <Text style={styles.betConfirm}>✓  Aposta registrada!</Text>
            )}

            {/* Floating XP popup */}
            <Animated.Text
              style={[
                styles.xpPop,
                { opacity: xpPopAlpha, transform: [{ translateY: xpPopY }] },
              ]}
            >
              +100 XP ⚡
            </Animated.Text>
          </View>
        )}

        {/* ── Step 2 — DNA result ── */}
        {step === 2 && pick && (
          <Card style={styles.dnaCard}>
            <Text style={styles.dnaIcon}>{DNA_MAP[pick].icon}</Text>
            <Text style={styles.dnaStyle}>{DNA_MAP[pick].style}</Text>
            <Text style={styles.dnaDesc}>{DNA_MAP[pick].desc}</Text>
          </Card>
        )}

        {/* ── Step 3 — XP bar animation ── */}
        {step === 3 && (
          <View style={styles.xpSection}>
            <View style={styles.xpTrack}>
              <Animated.View
                style={[
                  styles.xpFill,
                  {
                    width: xpBarProg.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.xpMeta}>100 / 500 XP  ·  Nível 1</Text>
          </View>
        )}
      </Animated.View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.cta,
            { backgroundColor: cur.ctaColor },
            ctaDisabled && styles.ctaDisabled,
          ]}
          onPress={handleCTA}
          disabled={ctaDisabled}
          accessibilityLabel={cur.cta}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{cur.cta}</Text>
        </TouchableOpacity>

        {step > 0 && !isLast && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleBack}
            accessibilityLabel="Voltar"
          >
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },

  // Skip
  skipBtn: {
    alignSelf: 'flex-end',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  skipText: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
  },

  // Progress dots
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dotDone: {
    backgroundColor: colors.primary + '80',
  },

  // Content
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  onboardingLogo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 80,
    lineHeight: 96,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.display,
    fontSize: 36,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 44,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },

  // Bet step
  betWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  matchCard: {
    width: '100%',
    gap: spacing.sm,
  },
  matchLeague: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  matchTeams: {
    ...typography.display,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  oddsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  betConfirm: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.green,
    marginTop: spacing.sm,
  },
  xpPop: {
    ...typography.monoBold,
    fontSize: 22,
    color: colors.green,
    marginTop: spacing.sm,
  },

  // DNA step
  dnaCard: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dnaIcon: {
    fontSize: 48,
    lineHeight: 58,
  },
  dnaStyle: {
    ...typography.display,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  dnaDesc: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // XP bar step
  xpSection: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  xpTrack: {
    height: 8,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: radius.full,
  },
  xpMeta: {
    ...typography.mono,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  cta: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.35,
  },
  ctaText: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  backText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
  },
});
