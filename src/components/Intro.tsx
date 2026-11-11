import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { fillAbs, colors, fonts, images } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

type Props = {
  /** Fontes e imagens principais ja carregadas. */
  assetsReady: boolean;
  /** Chamado no meio da transicao (o site comeca a animar). */
  onStart: () => void;
  /** Chamado ao fim da transicao (a intro e desmontada). */
  onDone: () => void;
};

const BLOCKS = 28;

/** Tela de entrada: logo "escaneado" linha a linha + contador, e "clique para entrar". */
export function Intro({ assetsReady, onStart, onDone }: Props) {
  const reduced = useReducedMotion();
  const { width, height, isMobile } = useLayout();
  const size = Math.round(Math.min(width * 0.64, height * 0.4, 360));

  const [pct, setPct] = useState(0);
  const [entering, setEntering] = useState(false);
  const pctRef = useRef(0);
  const readyRef = useRef(assetsReady);
  useEffect(() => {
    readyRef.current = assetsReady;
  }, [assetsReady]);

  const jitter = useSharedValue(0);
  const blink = useSharedValue(1);
  const exit = useSharedValue(0);

  // Progresso "irregular" (parece carregamento real) e so chega a 100 quando os assets estiverem prontos.
  useEffect(() => {
    const id = setInterval(() => {
      const cur = pctRef.current;
      if (cur >= 100) return;
      const cap = readyRef.current ? 100 : 94;
      let next = cur + (Math.random() < 0.1 ? 0 : 2 + Math.random() * 5);
      next = Math.min(cap, next);
      pctRef.current = next;
      setPct(next);
      if (!reduced && Math.random() < 0.22) {
        const r = (Math.random() * 2 - 1) * size * 0.04;
        jitter.value = withSequence(withTiming(r, { duration: 40 }), withTiming(0, { duration: 90 }));
      }
    }, 45);
    return () => clearInterval(id);
  }, [reduced, size, jitter]);

  const ready = pct >= 100;

  useEffect(() => {
    if (!ready || reduced) return;
    blink.value = withRepeat(
      withSequence(withTiming(0.25, { duration: 650 }), withTiming(1, { duration: 650 })),
      -1,
    );
  }, [ready, reduced, blink]);

  const enter = useCallback(() => {
    if (!ready || entering) return;
    setEntering(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    const total = reduced ? 350 : 1250;
    exit.value = withTiming(1, { duration: total, easing: Easing.inOut(Easing.cubic) });
    setTimeout(onStart, total * 0.5);
    setTimeout(onDone, total + 60);
  }, [ready, entering, reduced, exit, onStart, onDone]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enter]);

  const frac = Math.min(1, pct / 100);

  const logoStyle = useAnimatedStyle(() => {
    const e = exit.value;
    return {
      opacity: e < 0.75 ? 1 : 1 - (e - 0.75) / 0.25,
      transform: [{ scale: 1 + Math.pow(e, 2.4) * 22 }],
    };
  });
  const rootStyle = useAnimatedStyle(() => {
    const e = exit.value;
    return { opacity: e < 0.55 ? 1 : Math.max(0, 1 - (e - 0.55) / 0.45) };
  });
  const flashStyle = useAnimatedStyle(() => {
    const e = exit.value;
    const o = e < 0.3 ? 0 : e < 0.5 ? (e - 0.3) / 0.2 : Math.max(0, 1 - (e - 0.5) / 0.3);
    return { opacity: o * 0.92 };
  });
  const uiStyle = useAnimatedStyle(() => ({ opacity: Math.max(0, 1 - exit.value * 3.5) }));
  const jitterStyle = useAnimatedStyle(() => ({ transform: [{ translateX: jitter.value }] }));
  const jitterNeg = useAnimatedStyle(() => ({ transform: [{ translateX: -jitter.value }] }));
  const blinkStyle = useAnimatedStyle(() => ({ opacity: blink.value }));

  const litBlocks = Math.floor(frac * BLOCKS);

  return (
    <Animated.View style={[styles.root, rootStyle]} pointerEvents={entering ? 'none' : 'auto'}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={ready ? 'Entrar no site' : 'Carregando'}
        disabled={!ready}
        onPress={enter}
        style={styles.press}>
        <Image source={images.fundo03} contentFit="cover" style={[StyleSheet.absoluteFill, { opacity: 0.55 }]} />

        <Animated.View style={[styles.top, { paddingHorizontal: isMobile ? 22 : 48 }, uiStyle]}>
          <Text style={styles.small}>ØPIO ESTÚDIOS</Text>
          <Text style={styles.small}>SÃO PAULO / BR</Text>
        </Animated.View>

        <Animated.View style={[{ width: size, height: size }, logoStyle]}>
          {/* silhueta fantasma */}
          <Image source={images.logo} contentFit="contain" style={[StyleSheet.absoluteFill, { opacity: 0.07 }]} />
          {/* camadas RGB durante o scan */}
          <Animated.View style={[StyleSheet.absoluteFill, jitterStyle]}>
            <RevealedLogo size={size} frac={frac} tint={colors.red} opacity={0.75} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, jitterNeg]}>
            <RevealedLogo size={size} frac={frac} tint={colors.cyan} opacity={0.6} />
          </Animated.View>
          <RevealedLogo size={size} frac={frac} />
          {/* linha de scan */}
          {!ready ? (
            <View
              pointerEvents="none"
              style={[styles.scan, { top: size * frac, boxShadow: `0 0 14px 2px ${colors.red}` } as object]}
            />
          ) : null}
        </Animated.View>

        <Animated.View style={[styles.bottom, uiStyle]}>
          <Text style={styles.counter}>{`${String(Math.floor(pct)).padStart(3, '0')}%`}</Text>
          <View style={styles.blocks}>
            {Array.from({ length: BLOCKS }).map((_, i) => (
              <View key={i} style={[styles.block, i < litBlocks && styles.blockOn]} />
            ))}
          </View>
          <View style={styles.cta}>
            {ready ? (
              <Animated.View style={blinkStyle}>
                <Text style={styles.enter}>{isMobile ? 'TOQUE PARA ENTRAR' : 'CLIQUE PARA ENTRAR'}</Text>
              </Animated.View>
            ) : (
              <Text style={styles.loading}>CARREGANDO...</Text>
            )}
          </View>
        </Animated.View>

        <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />
      </Pressable>
    </Animated.View>
  );
}

function RevealedLogo({ size, frac, tint, opacity = 1 }: { size: number; frac: number; tint?: string; opacity?: number }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, width: size, height: size * frac, overflow: 'hidden', opacity }}>
      <Image source={images.logo} contentFit="contain" tintColor={tint} style={{ width: size, height: size }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...fillAbs, zIndex: 800, backgroundColor: colors.bg },
  press: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  top: { position: 'absolute', top: 26, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' },
  small: { fontFamily: fonts.mono, fontSize: 12, color: colors.textDim, letterSpacing: 3 },
  scan: { position: 'absolute', left: -12, right: -12, height: 2, backgroundColor: colors.red },
  bottom: { position: 'absolute', bottom: 56, left: 0, right: 0, alignItems: 'center', gap: 16, paddingHorizontal: 24 },
  counter: { fontFamily: fonts.display, fontSize: 44, color: colors.text, letterSpacing: 4 },
  blocks: { flexDirection: 'row', gap: 3 },
  block: { width: 7, height: 12, backgroundColor: 'rgba(255,255,255,0.12)' },
  blockOn: { backgroundColor: colors.text },
  cta: { height: 30, justifyContent: 'center', marginTop: 4 },
  enter: { fontFamily: fonts.display, fontSize: 20, color: colors.red, letterSpacing: 5 },
  loading: { fontFamily: fonts.mono, fontSize: 13, color: colors.textDim, letterSpacing: 4 },
  flash: { ...fillAbs, backgroundColor: '#fff' },
});


