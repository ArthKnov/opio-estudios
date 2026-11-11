import { useEffect } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { fillAbs, images } from '@/constants/theme';

const webBackground = [
  // vinheta suave nas bordas
  'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
  // scanlines horizontais (id visual: linhas do logo / VHS)
  'repeating-linear-gradient(to bottom, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)',
].join(', ');

/** Camada global de scanlines + vinheta + leve flicker (desligada com "reduzir movimento"). */
export function Scanlines() {
  const reduced = useReducedMotion();
  const flicker = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    flicker.value = withRepeat(
      withSequence(
        withTiming(0.82, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.9, { duration: 90 }),
        withTiming(1, { duration: 90 }),
        withTiming(1, { duration: 3200 }),
      ),
      -1,
    );
  }, [reduced, flicker]);

  const animated = useAnimatedStyle(() => ({ opacity: flicker.value }));

  if (Platform.OS === 'web') {
    return (
      <Animated.View
        pointerEvents="none"
        style={[styles.overlay, animated, { backgroundImage: webBackground } as object]}
      />
    );
  }

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, animated]}>
      <Image source={images.scanline} resizeMode="repeat" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.04)' }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...fillAbs,
    zIndex: 900,
    ...(Platform.OS === 'web' ? ({ position: 'fixed' } as object) : null),
  },
});


