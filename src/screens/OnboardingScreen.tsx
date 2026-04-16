import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, OddsBtn, CelebrationBurst } from '../components/ui';
import {
  IconTarget, IconBolt, IconDNA, IconTrophy, IconChart,
  IconMission, IconShield,
} from '../components/Icons';
import { colors, radius, spacing, typography, typeScale, anim } from '../theme';
import { useNexaStore } from '../store/nexaStore';
import { hapticMedium, hapticSuccess, hapticLight } from '../services/haptics';
import { playCelebrationPop, playOnboardingComplete, playXPGain } from '../services/sounds';
import { Assets } from '../assets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 5;

type OddSide = 'home' | 'draw' | 'away';

// ─── DNA result per pick ─────────────────────────────────────────────────────

const DNA_MAP: Record<OddSide, { style: string; icon: string; color: string; desc: string }> = {
  home: {
    style: 'Apostador Favorito',
    icon: 'shield',
    color: colors.green,
    desc: 'Consistencia e analise. Voce favorece dados solidos e times confiaveis.',
  },
  draw: {
    style: 'Analista Estrategico',
    icon: 'chart',
    color: colors.primary,
    desc: 'Visao unica. Voce enxerga valor onde outros nao olham.',
  },
  away: {
    style: 'Cacador de Valor',
    icon: 'bolt',
    color: colors.gold,
    desc: 'Risco calculado. Altas odds e retorno maximo e seu jogo.',
  },
};

const DNA_ICONS: Record<string, React.FC<{size?: number; color?: string}>> = {
  shield: IconShield,
  chart: IconChart,
  bolt: IconBolt,
};

// ─── Fake match for simulated bet ────────────────────────────────────────────

const MATCH = {
  home: 'Brasil',
  away: 'Argentina',
  league: 'Copa America  ·  Final',
  odds: { home: 1.85, draw: 3.20, away: 2.10 } as Record<OddSide, number>,
};

// ─── Animated progress bar (Duolingo style) ──────────────────────────────────

function ProgressBar({ step, color }: { step: number; color: string }) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: ((step + 1) / TOTAL_STEPS) * 100,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [step]);

  return (
    <View style={barStyles.track}>
      <Animated.View
        style={[
          barStyles.fill,
          {
            backgroundColor: color,
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});

// ─── Pulse ring animation (guides user attention) ────────────────────────────

function PulseRing({ color, active }: { color: string; active: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.5, duration: 1200, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
          Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active]);

  if (!active) return null;
  return (
    <Animated.View
      style={[
        pulseStyles.ring,
        {
          borderColor: color,
          opacity,
          transform: [{ scale }],
        },
      ]}
      pointerEvents="none"
    />
  );
}

const pulseStyles = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
});

// ─── Component ───────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState<OddSide | null>(null);
  const [betDone, setBetDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const addXP = useNexaStore(s => s.addXP);
  const completeOnboarding = useNexaStore(s => s.completeOnboarding);

  // Shared transition anims
  const opacity = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;

  // Floating "+100 XP" popup
  const xpPopY = useRef(new Animated.Value(0)).current;
  const xpPopAlpha = useRef(new Animated.Value(0)).current;
  const xpPopScale = useRef(new Animated.Value(0.5)).current;

  // XP bar fill (step 3)
  const xpBarProg = useRef(new Animated.Value(0)).current;
  const xpCounterVal = useRef(new Animated.Value(0)).current;

  // DNA reveal scale
  const dnaScale = useRef(new Animated.Value(0.8)).current;
  const dnaOpacity = useRef(new Animated.Value(0)).current;

  // Preview cards stagger
  const previewAnims = useRef([0, 1, 2].map(() => ({
    translateY: new Animated.Value(30),
    opacity: new Animated.Value(0),
  }))).current;

  // Logo entrance
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // CTA scale feedback
  const ctaScale = useRef(new Animated.Value(1)).current;

  const STEP_COLORS = [colors.primary, colors.green, colors.orange, colors.gold, colors.primary];
  const curColor = STEP_COLORS[step];
  const isLast = step === TOTAL_STEPS - 1;
  const ctaDisabled = step === 1 && !betDone;

  // ── Logo entrance on mount ─────────────────────────────────────────────────

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, ...anim.spring }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Step-specific entrance animations ──────────────────────────────────────

  const runStepEntrance = useCallback((nextStep: number) => {
    // DNA reveal
    if (nextStep === 2) {
      dnaScale.setValue(0.8);
      dnaOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(dnaScale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
        Animated.timing(dnaOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    }
    // XP bar fill
    if (nextStep === 3) {
      xpBarProg.setValue(0);
      xpCounterVal.setValue(0);
      Animated.parallel([
        Animated.timing(xpBarProg, { toValue: 0.2, duration: 1200, useNativeDriver: false, easing: Easing.out(Easing.cubic) }),
        Animated.timing(xpCounterVal, { toValue: 100, duration: 1200, useNativeDriver: false }),
      ]).start();
    }
    // Staggered preview cards
    if (nextStep === 4) {
      previewAnims.forEach((a, i) => {
        a.translateY.setValue(30);
        a.opacity.setValue(0);
        Animated.parallel([
          Animated.timing(a.translateY, { toValue: 0, duration: 350, delay: i * 120, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
          Animated.timing(a.opacity, { toValue: 1, duration: 300, delay: i * 120, useNativeDriver: true }),
        ]).start();
      });
    }
  }, [dnaScale, dnaOpacity, xpBarProg, xpCounterVal, previewAnims]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const transition = useCallback((next: number, dir: 1 | -1) => {
    const outX = -SCREEN_WIDTH * 0.2 * dir;
    const inX = SCREEN_WIDTH * 0.2 * dir;

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideX, { toValue: outX, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideX.setValue(inX);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(slideX, { toValue: 0, duration: 250, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]).start(() => {
        runStepEntrance(next);
      });
    });
  }, [opacity, slideX, runStepEntrance]);

  const handleCTA = useCallback(() => {
    // CTA press feedback
    Animated.sequence([
      Animated.timing(ctaScale, { toValue: 0.96, duration: 60, useNativeDriver: true }),
      Animated.spring(ctaScale, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
    ]).start();

    if (isLast) {
      hapticSuccess();
      playOnboardingComplete();
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        completeOnboarding();
      }, 1800);
      return;
    }
    hapticMedium();
    transition(step + 1, 1);

    // Confetti + sound on XP step
    if (step + 1 === 3) {
      setTimeout(() => {
        setShowConfetti(true);
        hapticSuccess();
        playXPGain();
        setTimeout(() => setShowConfetti(false), 1400);
      }, 500);
    }
  }, [isLast, step, transition, ctaScale, completeOnboarding]);

  // ── Bet interaction ────────────────────────────────────────────────────────

  const placeBet = useCallback((side: OddSide) => {
    if (betDone) return;
    hapticSuccess();
    playCelebrationPop();
    setPick(side);
    setBetDone(true);
    addXP(100);

    // Confetti burst on bet
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);

    // Floating "+100 XP" popup with scale
    xpPopY.setValue(0);
    xpPopAlpha.setValue(1);
    xpPopScale.setValue(0.5);
    Animated.parallel([
      Animated.timing(xpPopY, { toValue: -80, duration: 1000, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.spring(xpPopScale, { toValue: 1, tension: 150, friction: 6, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(xpPopAlpha, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    // Auto-advance after bet (Duolingo pattern — keep momentum)
    setTimeout(() => {
      hapticLight();
      transition(2, 1);
    }, 1800);
  }, [betDone, addXP, transition, xpPopY, xpPopAlpha, xpPopScale]);

  // ── Step content config ────────────────────────────────────────────────────

  const STEP_CTA = ['Vamos la', 'Escolha um resultado', 'Continuar', 'Incrivel!', 'Entrar na NEXA'];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>

      {/* Skip (step 0 only) */}
      {step === 0 && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => { hapticLight(); completeOnboarding(); }}
          accessibilityLabel="Pular onboarding"
        >
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
      )}

      {/* Progress bar (Duolingo style) */}
      <ProgressBar step={step} color={curColor} />

      {/* Step counter */}
      <Text style={styles.stepCounter}>
        {step + 1} / {TOTAL_STEPS}
      </Text>

      {/* ── Animated slide area ── */}
      <Animated.View
        style={[styles.content, { opacity, transform: [{ translateX: slideX }] }]}
      >

        {/* ── STEP 0 — Welcome ── */}
        {step === 0 && (
          <>
            <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity }}>
              <Image source={Assets.logo} style={styles.heroLogo} resizeMode="contain" />
            </Animated.View>
            <Text style={styles.heroTitle}>
              {'Bem-vindo\na NEXA'}
            </Text>
            <Text style={styles.heroSubtitle}>
              Apostas, evolucao e comunidade{'\n'}num unico ecossistema.
            </Text>
            <View style={styles.heroFeatures}>
              {[
                { Icon: IconTarget, label: 'Apostas inteligentes', color: colors.primary },
                { Icon: IconTrophy, label: 'Ranking competitivo', color: colors.gold },
                { Icon: IconMission, label: 'Missoes diarias', color: colors.green },
              ].map((f, i) => (
                <View key={i} style={styles.heroFeatureRow}>
                  <View style={[styles.heroFeatureIcon, { backgroundColor: f.color + '12' }]}>
                    <f.Icon size={16} color={f.color} />
                  </View>
                  <Text style={styles.heroFeatureLabel}>{f.label}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── STEP 1 — Simulated bet ── */}
        {step === 1 && (
          <>
            <View style={styles.betHeader}>
              <View style={[styles.stepIconSmall, { backgroundColor: colors.green + '12', borderColor: colors.green + '30' }]}>
                <IconBolt size={24} color={colors.green} />
              </View>
              <Text style={styles.sectionTitle}>Sua primeira aposta</Text>
              <Text style={styles.sectionSubtitle}>
                Sem risco. Escolha um resultado e ganhe XP.
              </Text>
            </View>

            <View style={styles.betWrapper}>
              <Card style={styles.matchCard}>
                <Text style={styles.matchLeague}>{MATCH.league}</Text>

                <View style={styles.matchTeamsRow}>
                  <View style={styles.teamCol}>
                    <View style={[styles.teamBadge, { backgroundColor: colors.green + '10' }]}>
                      <Text style={styles.teamFlag}>BR</Text>
                    </View>
                    <Text style={styles.teamName}>{MATCH.home}</Text>
                  </View>
                  <Text style={styles.matchVs}>VS</Text>
                  <View style={styles.teamCol}>
                    <View style={[styles.teamBadge, { backgroundColor: colors.primary + '10' }]}>
                      <Text style={styles.teamFlag}>AR</Text>
                    </View>
                    <Text style={styles.teamName}>{MATCH.away}</Text>
                  </View>
                </View>

                {!betDone && (
                  <Text style={styles.betHint}>Toque para apostar</Text>
                )}

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
                <View style={styles.betConfirmRow}>
                  <IconShield size={16} color={colors.green} />
                  <Text style={styles.betConfirm}>Aposta registrada</Text>
                </View>
              )}

              {/* Floating XP popup */}
              <Animated.Text
                style={[
                  styles.xpPop,
                  {
                    opacity: xpPopAlpha,
                    transform: [{ translateY: xpPopY }, { scale: xpPopScale }],
                  },
                ]}
              >
                +100 XP
              </Animated.Text>
            </View>
          </>
        )}

        {/* ── STEP 2 — DNA reveal ── */}
        {step === 2 && pick && (
          <>
            <View style={[styles.stepIconSmall, { backgroundColor: colors.orange + '12', borderColor: colors.orange + '30' }]}>
              <IconDNA size={24} color={colors.orange} />
            </View>
            <Text style={styles.sectionTitle}>Seu DNA apostador</Text>
            <Text style={styles.sectionSubtitle}>
              Baseado na sua escolha, identificamos seu perfil.
            </Text>

            <Animated.View style={[styles.dnaReveal, { transform: [{ scale: dnaScale }], opacity: dnaOpacity }]}>
              <Card style={styles.dnaCard}>
                <View style={[styles.dnaIconRing, { borderColor: DNA_MAP[pick].color + '40' }]}>
                  <View style={[styles.dnaIconInner, { backgroundColor: DNA_MAP[pick].color + '15' }]}>
                    {(DNA_ICONS[DNA_MAP[pick].icon] as React.FC<{size?: number; color?: string}>)?.({ size: 32, color: DNA_MAP[pick].color }) as React.ReactNode}
                  </View>
                  <PulseRing color={DNA_MAP[pick].color} active />
                </View>

                <Text style={[styles.dnaStyle, { color: DNA_MAP[pick].color }]}>
                  {DNA_MAP[pick].style}
                </Text>
                <View style={[styles.dnaDivider, { backgroundColor: DNA_MAP[pick].color + '20' }]} />
                <Text style={styles.dnaDesc}>{DNA_MAP[pick].desc}</Text>
              </Card>
            </Animated.View>
          </>
        )}

        {/* ── STEP 3 — XP celebration ── */}
        {step === 3 && (
          <>
            <View style={[styles.stepIconSmall, { backgroundColor: colors.gold + '12', borderColor: colors.gold + '30' }]}>
              <IconTrophy size={24} color={colors.gold} />
            </View>
            <Text style={styles.heroTitle}>+100 XP</Text>
            <Text style={styles.sectionSubtitle}>
              Voce ja esta na frente. Continue evoluindo.
            </Text>

            <View style={styles.xpSection}>
              <View style={styles.xpLevelRow}>
                <Text style={styles.xpLevelLabel}>Nivel 1</Text>
                <Text style={styles.xpLevelValue}>100 / 500 XP</Text>
              </View>
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
              <View style={styles.xpStatsRow}>
                {[
                  { label: 'Apostas', value: '1' },
                  { label: 'Acertos', value: '--' },
                  { label: 'Ranking', value: '#--' },
                ].map((stat, i) => (
                  <View key={i} style={styles.xpStat}>
                    <Text style={styles.xpStatValue}>{stat.value}</Text>
                    <Text style={styles.xpStatLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* ── STEP 4 — Progressive disclosure ── */}
        {step === 4 && (
          <>
            <View style={[styles.stepIconSmall, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
              <IconChart size={24} color={colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>Pronto para competir</Text>
            <Text style={styles.sectionSubtitle}>
              Seu caminho comeca agora.
            </Text>

            <View style={styles.previewSection}>
              {[
                { Icon: IconChart, color: colors.green, label: 'Feed personalizado', desc: 'Picks e analises da comunidade' },
                { Icon: IconTrophy, color: colors.gold, label: 'Ranking ao vivo', desc: 'Compita e suba de nivel' },
                { Icon: IconMission, color: colors.primary, label: 'Missoes diarias', desc: 'Ganhe XP e recompensas' },
              ].map((item, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.previewCard,
                    {
                      opacity: previewAnims[i].opacity,
                      transform: [{ translateY: previewAnims[i].translateY }],
                    },
                  ]}
                >
                  <View style={[styles.previewIconWrap, { backgroundColor: item.color + '12' }]}>
                    <item.Icon size={20} color={item.color} />
                  </View>
                  <View style={styles.previewText}>
                    <Text style={styles.previewLabel}>{item.label}</Text>
                    <Text style={styles.previewDesc}>{item.desc}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </>
        )}
      </Animated.View>

      {/* Confetti celebration */}
      <CelebrationBurst active={showConfetti} />

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
          <TouchableOpacity
            style={[
              styles.cta,
              { backgroundColor: curColor },
              ctaDisabled && styles.ctaDisabled,
            ]}
            onPress={handleCTA}
            disabled={ctaDisabled}
            accessibilityLabel={STEP_CTA[step]}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {step === 1 && betDone ? 'Continuar' : STEP_CTA[step]}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {step > 0 && step < 4 && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => { hapticLight(); transition(step - 1, -1); }}
            accessibilityLabel="Voltar"
          >
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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
    paddingBottom: spacing.xs,
  },
  skipText: {
    ...typeScale.labelSm,
    color: colors.textMuted,
  },

  // Step counter
  stepCounter: {
    ...typeScale.monoSm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Content
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.md,
  },

  // Shared step icon (small)
  stepIconSmall: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },

  // Section titles (steps 1-4)
  sectionTitle: {
    ...typeScale.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typeScale.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: spacing.lg,
  },

  // ── Step 0 — Hero ──
  heroLogo: {
    width: 88,
    height: 88,
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.display,
    fontSize: 34,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typeScale.bodyLg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  heroFeatures: {
    gap: spacing.md,
    width: '100%',
    maxWidth: 280,
  },
  heroFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroFeatureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFeatureLabel: {
    ...typeScale.label,
    color: colors.textPrimary,
  },

  // ── Step 1 — Bet ──
  betHeader: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  betWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  matchCard: {
    width: '100%',
    padding: spacing.lg,
    gap: spacing.md,
  },
  matchLeague: {
    ...typeScale.labelXs,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  matchTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.sm,
  },
  teamCol: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  teamBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamFlag: {
    ...typography.monoBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  teamName: {
    ...typeScale.label,
    color: colors.textPrimary,
  },
  matchVs: {
    ...typography.monoBold,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  betHint: {
    ...typeScale.bodySm,
    color: colors.primary,
    textAlign: 'center',
  },
  oddsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  betConfirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  betConfirm: {
    ...typeScale.label,
    color: colors.green,
  },
  xpPop: {
    ...typography.monoBold,
    fontSize: 24,
    color: colors.gold,
    position: 'absolute',
    bottom: -10,
  },

  // ── Step 2 — DNA ──
  dnaReveal: {
    width: '100%',
  },
  dnaCard: {
    width: '100%',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  dnaIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  dnaIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dnaStyle: {
    ...typeScale.h1,
    textAlign: 'center',
  },
  dnaDivider: {
    width: 40,
    height: 2,
    borderRadius: 1,
  },
  dnaDesc: {
    ...typeScale.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },

  // ── Step 3 — XP ──
  xpSection: {
    width: '100%',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  xpLevelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLevelLabel: {
    ...typeScale.label,
    color: colors.textPrimary,
  },
  xpLevelValue: {
    ...typeScale.monoSm,
    color: colors.textMuted,
  },
  xpTrack: {
    height: 10,
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
  xpStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  xpStat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  xpStatValue: {
    ...typeScale.monoLg,
    color: colors.textPrimary,
  },
  xpStatLabel: {
    ...typeScale.bodySm,
    color: colors.textMuted,
  },

  // ── Step 4 — Preview ──
  previewSection: {
    width: '100%',
    gap: spacing.md,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  previewIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    flex: 1,
  },
  previewLabel: {
    ...typeScale.label,
    color: colors.textPrimary,
  },
  previewDesc: {
    ...typeScale.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // ── Footer ──
  footer: {
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  cta: {
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.3,
  },
  ctaText: {
    ...typography.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  backText: {
    ...typeScale.bodySm,
    color: colors.textMuted,
  },
});
