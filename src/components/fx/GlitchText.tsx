import { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/theme';

type Props = {
  children: string;
  style?: StyleProp<TextStyle>;
  /** Deslocamento maximo (px) das copias coloridas. */
  intensity?: number;
  /** Intervalo [min, max] (ms) entre glitches automaticos. Use null para so reagir ao hover. */
  interval?: [number, number] | null;
  accessibilityRole?: 'header' | 'text';
};

/** Texto com efeito de glitch RGB (copias vermelha/ciano deslocadas) disparado de tempos em tempos e no hover. */
export function GlitchText({ children, style, intensity = 4, interval = [2600, 6200], accessibilityRole }: Props) {
  const reduced = useReducedMotion();
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);

  const fire = useCallback(() => {
    if (reduced) return;
    const r = () => (Math.random() * 2 - 1) * intensity;
    dx.value = withSequence(
      withTiming(r(), { duration: 40 }),
      withTiming(r(), { duration: 50 }),
      withTiming(r() * 1.4, { duration: 40 }),
      withTiming(r(), { duration: 60 }),
      withTiming(0, { duration: 70 }),
    );
    dy.value = withSequence(
      withTiming(r() * 0.4, { duration: 60 }),
      withTiming(r() * 0.4, { duration: 60 }),
      withTiming(0, { duration: 100 }),
    );
  }, [reduced, intensity, dx, dy]);

  useEffect(() => {
    if (!interval || reduced) return;
    let timer: ReturnType<typeof setTimeout>;
    const loop = () => {
      timer = setTimeout(
        () => {
          fire();
          loop();
        },
        interval[0] + Math.random() * (interval[1] - interval[0]),
      );
    };
    loop();
    return () => clearTimeout(timer);
  }, [interval, reduced, fire]);

  const red = useAnimatedStyle(() => ({
    opacity: dx.value === 0 ? 0 : 0.85,
    transform: [{ translateX: dx.value }, { translateY: dy.value }],
  }));
  const cyan = useAnimatedStyle(() => ({
    opacity: dx.value === 0 ? 0 : 0.85,
    transform: [{ translateX: -dx.value }, { translateY: -dy.value }],
  }));

  return (
    <View onPointerEnter={fire} style={styles.wrap}>
      <Text accessibilityRole={accessibilityRole} style={style}>
        {children}
      </Text>
      <Animated.Text
        aria-hidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={[style, styles.ghost, { color: colors.red, mixBlendMode: 'screen' }, red]}>
        {children}
      </Animated.Text>
      <Animated.Text
        aria-hidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={[style, styles.ghost, { color: colors.cyan, mixBlendMode: 'screen' }, cyan]}>
        {children}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', alignSelf: 'flex-start' },
  ghost: { position: 'absolute', top: 0, left: 0 },
});
