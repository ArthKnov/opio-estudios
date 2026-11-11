import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, {
  measure,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { fillAbs, colors } from '@/constants/theme';

import { useScrollContext } from './scroll-context';

type Props = {
  source: ImageSource | number;
  /** 0 a 1. */
  opacity?: number;
  /** Intensidade do parallax (fracao do deslocamento da secao). */
  speed?: number;
  /** Desvanece topo/base para o preto da pagina. */
  fade?: boolean;
  position?: 'center' | 'left' | 'right' | 'top' | 'bottom';
};

/** Fundo de secao (halftone) com parallax baseado na posicao da secao na tela. */
export function ParallaxImage({ source, opacity = 0.7, speed = 0.18, fade = true, position = 'center' }: Props) {
  const { scrollY, viewportH } = useScrollContext();
  const ref = useAnimatedRef<Animated.View>();
  const offset = useSharedValue(0);

  useAnimatedReaction(
    () => scrollY.value,
    () => {
      const m = measure(ref);
      if (!m) return;
      const center = m.pageY + m.height / 2;
      const delta = center - viewportH.value / 2;
      // Suaviza o alvo: measure() entrega posicoes arredondadas, e usar o valor
      // cru fazia a imagem "pular" alguns pixels a cada quadro durante o scroll.
      const target = Math.max(-140, Math.min(140, -delta * speed));
      offset.value += (target - offset.value) * 0.35;
    },
  );

  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));

  return (
    <View pointerEvents="none" style={styles.clip}>
      <Animated.View ref={ref} collapsable={false} style={styles.frame}>
        <Animated.View style={[styles.over, animated]}>
          <Image source={source} contentFit="cover" contentPosition={position} style={[StyleSheet.absoluteFill, { opacity }]} />
        </Animated.View>
      </Animated.View>
      {fade ? (
        <>
          <LinearGradient colors={[colors.bg, 'rgba(5,7,7,0)']} style={[styles.fade, { top: 0 }]} />
          <LinearGradient colors={['rgba(5,7,7,0)', colors.bg]} style={[styles.fade, { bottom: 0 }]} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { ...fillAbs, overflow: 'hidden' },
  frame: { ...fillAbs },
  over: { position: 'absolute', top: -150, bottom: -150, left: 0, right: 0 },
  fade: { position: 'absolute', left: 0, right: 0, height: 140 },
});


