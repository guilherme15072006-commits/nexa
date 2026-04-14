import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, StatusBar, Easing,
} from 'react-native';
import { colors, spacing, radius, typography, anim } from '../theme';
import { useNexaStore } from '../store/nexaStore';
import { ScalePress, CelebrationBurst } from '../components/ui';

const { width, height } = Dimensions.get('window');

const STEPS = [
  {
    id: 0,
    icon: 'N',
    title: 'Bem-vindo a NEXA',
    subtitle: 'A plataforma onde voce aposta, compete, evolui e domina.',
    cta: 'Comecar',
    color: colors.primary,
  },
  {
    id: 1,
    icon: 'A',
    title: 'Sua primeira aposta',
    subtitle: 'Sem risco. Aposte com moedas NEXA e aprenda como funciona.',
    cta: 'Fazer aposta simulada',
    color: colors.green,
  },
  {
    id: 2,
    icon: 'X',
    title: 'Missao desbloqueada',
    subtitle: 'Voce acabou de ganhar 100 XP. Complete missoes para evoluir.',
    cta: 'Ver missoes',
    color: colors.gold,
  },
  {
    id: 3,
    icon: 'T',
    title: 'Siga tipsters elite',
    subtitle: 'Copie apostas de quem ja sabe. Aprenda e ganhe junto.',
    cta: 'Explorar tipsters',
    color: colors.orange,
  },
  {
    id: 4,
    icon: 'R',
    title: 'Tudo pronto',
    subtitle: 'Feed personalizado, ranking ao vivo, clas e muito mais te esperam.',
    cta: 'Entrar na NEXA',
    color: colors.primary,
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const [showCelebration, setShowCelebration] = useState(false);

  const completeOnboarding = useNexaStore(s => s.completeOnboarding);
  const addXP = useNexaStore(s => s.addXP);
  const current = STEPS[step];

  // Vercel: logo fade in on mount
  useEffect(() => {
    Animated.timing(logoOpacity, {
      toValue: 1, duration: anim.emphasis, useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  // Fortnite: ambient glow pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 0.6, duration: 2400, useNativeDriver: true, easing: Easing.inOut(Easing.sine) }),
        Animated.timing(glowPulse, { toValue: 0.3, duration: 2400, useNativeDriver: true, easing: Easing.inOut(Easing.sine) }),
      ])
    ).start();
  }, []);

  // Duolingo: icon entrance animation per step
  useEffect(() => {
    iconScale.setValue(0.4);
    iconRotate.setValue(0);
    Animated.parallel([
      Animated.spring(iconScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
      Animated.timing(iconRotate, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.back(1.5)) }),
    ]).start();
  }, [step]);

  const goNext = () => {
    if (step === 1) {
      addXP(100);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1200);
    }
    if (step >= STEPS.length - 1) {
      completeOnboarding();
      return;
    }
    // Smooth transition between steps
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -24, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setStep(s => s + 1);
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 240, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.spring(slideAnim, { toValue: 0, ...anim.springGentle }),
      ]).start();
    });
  };

  const spin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Ambient glow — Fortnite item shop vibe */}
      <Animated.View style={[
        styles.glow,
        { backgroundColor: current.color, opacity: glowPulse },
      ]} />

      {/* Logo — Vercel-level entrance */}
      <Animated.View style={[styles.logoRow, { opacity: logoOpacity }]}>
        <Text style={styles.logo}>NEXA</Text>
      </Animated.View>

      {/* Step dots — Linear precision */}
      <View style={styles.dotsRow}>
        {STEPS.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              i === step && [styles.dotActive, { backgroundColor: current.color }],
              i < step && { backgroundColor: current.color + '60' },
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Icon — Duolingo-style bouncy entrance */}
        <Animated.View style={[
          styles.iconWrap,
          {
            borderColor: current.color + '35',
            backgroundColor: current.color + '12',
            transform: [{ scale: iconScale }, { rotate: spin }],
          },
        ]}>
          <Text style={[styles.iconText, { color: current.color }]}>{current.icon}</Text>
        </Animated.View>

        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.subtitle}>{current.subtitle}</Text>

        {/* XP reward — Duolingo celebration */}
        {step === 2 && (
          <View style={styles.xpGained}>
            <Text style={styles.xpGainedText}>+100 XP ganhos</Text>
          </View>
        )}

        <CelebrationBurst active={showCelebration} />
      </Animated.View>

      {/* CTA — Stripe confidence */}
      <View style={styles.bottom}>
        <ScalePress onPress={goNext}>
          <View style={[styles.ctaBtn, { backgroundColor: current.color }]}>
            <Text style={styles.ctaText}>{current.cta}</Text>
          </View>
        </ScalePress>

        {step < STEPS.length - 1 && (
          <TouchableOpacity onPress={completeOnboarding} style={styles.skip}>
            <Text style={styles.skipText}>Pular</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  glow: {
    position: 'absolute', top: -160, left: -80, right: -80,
    height: height * 0.45, borderRadius: 999,
  },
  logoRow: { paddingTop: 60, alignItems: 'center' },
  logo: {
    fontSize: 28, fontFamily: typography.display,
    color: colors.textPrimary, letterSpacing: 6,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 40 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.bgHighlight },
  dotActive: { width: 20, borderRadius: 3 },
  content: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 96, height: 96, borderRadius: radius.xxl,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  iconText: { fontSize: 36, fontFamily: typography.display },
  title: {
    fontSize: 26, fontFamily: typography.display,
    color: colors.textPrimary, textAlign: 'center',
    marginBottom: spacing.md, letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16, fontFamily: typography.body,
    color: colors.textSecondary, textAlign: 'center',
    lineHeight: 24, maxWidth: 300,
  },
  xpGained: {
    marginTop: spacing.xl,
    backgroundColor: colors.green + '18',
    borderWidth: 0.5, borderColor: colors.green + '44',
    paddingHorizontal: 18, paddingVertical: 9,
    borderRadius: radius.full,
  },
  xpGainedText: { fontFamily: typography.bodySemi, fontSize: 14, color: colors.green },
  bottom: { paddingBottom: 48, gap: spacing.md },
  ctaBtn: {
    borderRadius: radius.xl, paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { fontFamily: typography.bodySemi, fontSize: 16, color: '#fff', letterSpacing: 0.3 },
  skip: { alignItems: 'center', paddingVertical: spacing.sm },
  skipText: { fontFamily: typography.body, fontSize: 14, color: colors.textMuted },
});
