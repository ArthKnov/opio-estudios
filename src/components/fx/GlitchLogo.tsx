import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { fillAbs, colors, images } from '@/constants/theme';

type Props = {
  size: number;
  /** Anima flutuacao + glitch. */
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Logo da ØPIO com respiracao suave e glitch RGB ocasional. */
export function GlitchLogo({ size, animated = true, style }: Props) {
  const reduced = useReducedMotion();
  const float = useSharedValue(0);
  const dx = useSharedValue(0);

  useEffect(() => {
    if (!animated || reduced) return;
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    let timer: ReturnType<typeof setTimeout>;
    const loop = () => {
      timer = setTimeout(
        () => {
          const r = () => (Math.random() * 2 - 1) * size * 0.035;
          dx.value = withSequence(
            withTiming(r(), { duration: 45 }),
            withTiming(r(), { duration: 55 }),
            withTiming(r(), { duration: 45 }),
            withTiming(0, { duration: 80 }),
          );
          loop();
        },
        2200 + Math.random() * 3800,
      );
    };
    loop();
    return () => clearTimeout(timer);
  }, [animated, reduced, size, float, dx]);

  const body = useAnimatedStyle(() => ({
    transform: [{ translateY: (float.value - 0.5) * size * 0.035 }, { scale: 1 + float.value * 0.015 }],
  }));
  const red = useAnimatedStyle(() => ({ opacity: dx.value === 0 ? 0 : 0.9, transform: [{ translateX: dx.value }] }));
  const cyan = useAnimatedStyle(() => ({ opacity: dx.value === 0 ? 0 : 0.9, transform: [{ translateX: -dx.value }] }));

  return (
    <Animated.View style={[{ width: size, height: size }, style, body]}>
      <Image source={images.logo} contentFit="contain" style={styles.fill} />
      <Animated.View pointerEvents="none" style={[styles.fill, red]}>
        <Image source={images.logo} contentFit="contain" tintColor={colors.red} style={styles.fill} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.fill, cyan]}>
        <Image source={images.logo} contentFit="contain" tintColor={colors.cyan} style={styles.fill} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { ...fillAbs },
});

