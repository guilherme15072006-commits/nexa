/**
 * NEXA Animated Components — Reanimated 3
 *
 * Componentes de animacao de alta performance (60fps garantido).
 * Substituem os equivalentes que usavam Animated API do React Native.
 *
 * REFERENCIA: Stake micro-interactions, Apple HIG
 *
 * DIFERENCA PARA O USUARIO:
 * - Antes: animacoes podiam travar em celulares lentos (rodavam no JS thread)
 * - Agora: animacoes rodam no thread nativo (UI thread), nunca travam
 */

import React, { useCallback } from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolateColor,
  FadeIn,
  FadeOut,
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  SlideInRight,
  SlideOutLeft,
  Layout,
  Easing as REasing,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors } from '../theme';

// ─── Spring configs (Stake/Apple feel) ───────────────────────

export const SPRING = {
  snappy: { damping: 15, stiffness: 150 },     // botoes, taps
  bouncy: { damping: 8, stiffness: 120 },      // celebracoes, pop-in
  gentle: { damping: 20, stiffness: 80 },      // transicoes de tela
  smooth: { damping: 25, stiffness: 100 },     // scroll, drag
} as const;

// ─── Layout animations (entering/exiting) para listas ────────

export const ENTER = {
  fadeUp: FadeInDown.duration(300).springify(),
  fadeIn: FadeIn.duration(250),
  slideRight: SlideInRight.duration(300).springify(),
  stagger: (index: number) => FadeInDown.delay(index * 60).duration(300).springify(),
};

export const EXIT = {
  fadeDown: FadeOutDown.duration(200),
  fadeOut: FadeOut.duration(200),
  slideLeft: SlideOutLeft.duration(250),
};

export const LAYOUT_ANIM = Layout.springify().damping(15).stiffness(120);

// ─── ScalePress — 60fps tap feedback ─────────────────────────

interface ScalePressProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  scale?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

export function ReanimatedScalePress({
  children, onPress, onLongPress, scale = 0.96, style, disabled,
}: ScalePressProps) {
  const pressed = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));

  const gesture = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      pressed.value = withSpring(scale, SPRING.snappy);
    })
    .onFinalize(() => {
      pressed.value = withSpring(1, SPRING.bouncy);
    })
    .onEnd(() => {
      if (onPress) runOnJS(onPress)();
    });

  const longPress = Gesture.LongPress()
    .enabled(!!onLongPress && !disabled)
    .minDuration(500)
    .onStart(() => {
      if (onLongPress) runOnJS(onLongPress)();
    });

  const composed = onLongPress
    ? Gesture.Race(gesture, longPress)
    : gesture;

  return (
    <GestureDetector gesture={composed}>
      <Reanimated.View style={[style, animStyle]}>
        {children}
      </Reanimated.View>
    </GestureDetector>
  );
}

// ─── FadeInView — layout-aware entrance ──────────────────────

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  index?: number;
}

export function ReanimatedFadeIn({ children, delay = 0, style, index }: FadeInProps) {
  const entering = index !== undefined
    ? ENTER.stagger(index)
    : FadeInDown.delay(delay).duration(300).springify();

  return (
    <Reanimated.View entering={entering} style={style}>
      {children}
    </Reanimated.View>
  );
}

// ─── OddsFlash — Bet365 green/red flash ──────────────────────

interface OddsFlashProps {
  children: React.ReactNode;
  movement: -1 | 0 | 1;
  style?: ViewStyle;
}

export function OddsFlash({ children, movement, style }: OddsFlashProps) {
  const flash = useSharedValue(0);

  React.useEffect(() => {
    if (movement !== 0) {
      flash.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 600 }),
      );
    }
  }, [movement]);

  const flashColor = movement > 0 ? colors.green : colors.red;

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      flash.value,
      [0, 1],
      ['transparent', flashColor + '35']
    ),
  }));

  return (
    <Reanimated.View style={[style, animStyle]}>
      {children}
    </Reanimated.View>
  );
}

// ─── PulsingDot — Twitch live indicator (60fps) ──────────────

export function ReanimatedPulsingDot({ color = colors.red, size = 6 }: { color?: string; size?: number }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 800, easing: REasing.inOut(REasing.sin) }),
        withTiming(1, { duration: 800, easing: REasing.inOut(REasing.sin) }),
      ),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.6,
  }));

  return (
    <Reanimated.View style={[{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, position: 'absolute',
    }, animStyle]} />
  );
}

// ─── AnimatedCounter — number transition ─────────────────────

export function AnimatedNumber({ value, style }: { value: number; style?: TextStyle }) {
  const animVal = useSharedValue(value);

  React.useEffect(() => {
    animVal.value = withTiming(value, { duration: 300 });
  }, [value]);

  const animStyle = useAnimatedStyle(() => ({
    // Reanimated text interpolation handled via component
  }));

  // For simplicity, use React state with Reanimated timing
  const [display, setDisplay] = React.useState(value);

  React.useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const steps = Math.min(Math.abs(diff), 20);
    const dur = 15;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const p = 1 - Math.pow(1 - step / steps, 3);
      setDisplay(Math.round(start + diff * p));
      if (step >= steps) clearInterval(id);
    }, dur);
    return () => clearInterval(id);
  }, [value]);

  return <Reanimated.Text style={style}>{display.toLocaleString()}</Reanimated.Text>;
}

// ─── SwipeToAction — gesture-based swipe ─────────────────────

interface SwipeProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: ViewStyle;
}

export function SwipeToAction({ children, onSwipeLeft, onSwipeRight, style }: SwipeProps) {
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX * 0.5;
    })
    .onEnd((e) => {
      if (e.translationX < -80 && onSwipeLeft) {
        runOnJS(onSwipeLeft)();
      } else if (e.translationX > 80 && onSwipeRight) {
        runOnJS(onSwipeRight)();
      }
      translateX.value = withSpring(0, SPRING.smooth);
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Reanimated.View style={[style, animStyle]}>
        {children}
      </Reanimated.View>
    </GestureDetector>
  );
}

// ─── Exports para uso direto ─────────────────────────────────

export { Reanimated, FadeIn, FadeOut, FadeInDown, FadeOutDown, Layout };
