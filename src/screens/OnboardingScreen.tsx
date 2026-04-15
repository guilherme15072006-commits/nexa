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
import { CelebrationBurst } from '../components/ui';
import { IconTarget, IconBolt, IconDNA, IconTrophy, IconChart, IconMission } from '../components/Icons';
import { colors, radius, spacing, typography, typeScale } from '../theme';
import { useNexaStore } from '../store/nexaStore';
import { hapticMedium, hapticSuccess, hapticLight } from '../services/haptics';
import { Assets } from '../assets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OddSide = 'home' | 'draw' | 'away';

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  {
    icon: 'target' as const,
    iconColor: colors.primary,
    title: 'Bem-vindo\na NEXA',
    subtitle:
      'A plataforma que une apostas, evolucao e comunidade num unico ecossistema.',
    cta: 'Vamos la',
    ctaColor: colors.primary,
    showSkip: true,
  },
  {
    icon: 'bolt' as const,
    iconColor: colors.green,
    title: 'Sua primeira\naposta',
    subtitle: 'Sem risco. Escolha um resultado e ganhe seus primeiros XP.',
    cta: 'Continuar',
    ctaColor: colors.green,
    showSkip: false,
  },
  {
    icon: 'dna' as const,
    iconColor: colors.orange,
    title: 'Seu DNA\napostador',
    subtitle: 'Identificamos seu estilo com base na sua escolha.',
    cta: 'Entendi',
    ctaColor: colors.orange,
    showSkip: false,
  },
  {
    icon: 'trophy' as const,
    iconColor: colors.gold,
    title: '+100 XP\nconquistados!',
    subtitle: 'Voce ja esta na frente. Evolua para subir no ranking.',
    cta: 'Incrivel!',
    ctaColor: colors.gold,
    showSkip: false,
  },
  {
    icon: 'trending' as const,
    iconColor: colors.primary,
    title: 'Pronto para\ncompetir',
    subtitle: 'Missoes, clas e recompensas te esperam. Seu caminho comeca agora.',
    cta: 'Entrar na NEXA',
    ctaColor: colors.primary,
    showSkip: false,
  },
] as const;

// Mapa de icone por nome
const STEP_ICONS: Record<string, React.FC<{size?: number; color?: string}>> = {
  target: IconTarget,
  bolt: IconBolt,
  dna: IconDNA,
  trophy: IconTrophy,
  trending: IconChart,
};

// ─── DNA result per pick ──────────────────────────────────────────────────────

const DNA_MAP: Record<OddSide, { style: string; color: string; desc: string }> = {
  home: {
    style: 'Apostador Favorito',
    color: colors.green,
    desc: 'Voce joga com consistencia. Favorece dados solidos e times confiaveis.',
  },
  draw: {
    style: 'Analista Estrategico',
    color: colors.primary,
    desc: 'Voce enxerga onde outros nao olham. Um apostador de valor real.',
  },
  away: {
    style: 'Cacador de Valor',
    color: colors.gold,
    desc: 'Voce corre riscos calculados. Altas odds e retorno maximo.',
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
  const [showConfetti, setShowConfetti] = useState(false);

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
    if (isLast) {
      hapticSuccess();
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        completeOnboarding();
      }, 1500);
      return;
    }
    hapticMedium();
    transition(step + 1, 1);

    // Confetti no step de XP
    if (step + 1 === 3) {
      setTimeout(() => {
        setShowConfetti(true);
        hapticSuccess();
        setTimeout(() => setShowConfetti(false), 1200);
      }, 400);
    }
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

        {/* Step icon (SVG, nao emoji) */}
        <View style={[styles.iconContainer, { borderColor: cur.iconColor + '30', backgroundColor: cur.iconColor + '10' }]}>
          {STEP_ICONS[cur.icon]?.({ size: 40, color: cur.iconColor })}
        </View>

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
            <View style={[styles.dnaIconWrap, { backgroundColor: DNA_MAP[pick].color + '15', borderColor: DNA_MAP[pick].color + '30' }]}>
              <IconDNA size={32} color={DNA_MAP[pick].color} />
            </View>
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
            <Text style={styles.xpMeta}>100 / 500 XP  ·  Nivel 1</Text>
          </View>
        )}

        {/* ── Step 4 — Progressive disclosure: o que espera ── */}
        {step === 4 && (
          <View style={styles.previewSection}>
            {[
              { IconComp: IconChart, color: colors.green, label: 'Feed personalizado', desc: 'Picks e analises da comunidade' },
              { IconComp: IconTrophy, color: colors.gold, label: 'Ranking ao vivo', desc: 'Compita e suba de nivel' },
              { IconComp: IconMission, color: colors.primary, label: 'Missoes diarias', desc: 'Ganhe XP e recompensas' },
            ].map((item, i) => (
              <View key={i} style={styles.previewCard}>
                <View style={[styles.previewIconWrap, { backgroundColor: item.color + '15' }]}>
                  <item.IconComp size={20} color={item.color} />
                </View>
                <View style={styles.previewText}>
                  <Text style={styles.previewLabel}>{item.label}</Text>
                  <Text style={styles.previewDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Confetti celebration */}
      <CelebrationBurst active={showConfetti} />

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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
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
  dnaIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Preview cards (progressive disclosure)
  previewSection: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.lg,
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
    width: 36,
    height: 36,
    borderRadius: 10,
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
