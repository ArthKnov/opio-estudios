import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  measure,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useScrollContext } from './scroll-context';

type Props = {
  children: ReactNode;
  delay?: number;
  from?: 'up' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

/** Revela o conteudo (fade + deslocamento) quando ele entra na tela. */
export function Reveal({ children, delay = 0, from = 'up', distance = 38, duration = 850, style }: Props) {
  const { scrollY, viewportH, active } = useScrollContext();
  const reduced = useReducedMotion();
  const ref = useAnimatedRef<Animated.View>();
  const progress = useSharedValue(reduced ? 1 : 0);
  const started = useSharedValue(reduced ? 1 : 0);
  const tick = useSharedValue(0);

  useAnimatedReaction(
    () => scrollY.value + tick.value + active.value * 100000,
    () => {
      if (started.value === 1 || active.value === 0) return;
      const m = measure(ref);
      if (!m || m.height === 0) return;
      if (m.pageY < viewportH.value * 0.93) {
        started.value = 1;
        progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
      }
    },
  );

  const animated = useAnimatedStyle(() => {
    const rest = (1 - progress.value) * distance;
    return {
      opacity: progress.value,
      transform: [
        { translateY: from === 'up' ? rest : 0 },
        { translateX: from === 'left' ? -rest : from === 'right' ? rest : 0 },
      ],
    };
  });

  return (
    <Animated.View
      ref={ref}
      collapsable={false}
      onLayout={() => {
        tick.value = tick.value + 1;
      }}
      style={[style, animated]}>
      {children}
    </Animated.View>
  );
}
