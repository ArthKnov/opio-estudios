import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Reveal } from '@/components/fx/Reveal';
import { PixelButton } from '@/components/ui/PixelButton';
import { Section, SectionTitle } from '@/components/ui/Section';
import { location, studios } from '@/constants/content';
import { colors, fonts, images } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

type Props = { onSectionLayout: (id: string, y: number) => void };

// Posicao da ponta do pin na arte original (576x1024), em fracao.
const PIN = { x: 0.771, y: 0.549 };
const ART_RATIO = 1024 / 576;

export function Location({ onSectionLayout }: Props) {
  const { isMobile } = useLayout();
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  // Posicao do pin considerando o "cover" centralizado da imagem dentro do cartao.
  const artH = box.w * ART_RATIO;
  const pinX = box.w * PIN.x;
  const pinY = artH * PIN.y - (artH - box.h) / 2;
  const salaB = studios[1];

  return (
    <Section id="localizacao" onSectionLayout={onSectionLayout}>
      <SectionTitle kicker="LOCALIZAÇÃO" title="Onde estamos" />
      <Reveal>
        <View onLayout={onLayout} style={[styles.card, { height: isMobile ? 560 : 520 }]}>
          <Image source={images.mapa} contentFit="cover" style={StyleSheet.absoluteFill} />
          <LinearGradient
            pointerEvents="none"
            colors={isMobile ? ['rgba(5,7,7,0)', 'rgba(5,7,7,0.2)', 'rgba(5,7,7,0.95)'] : ['rgba(5,7,7,0.92)', 'rgba(5,7,7,0.5)', 'rgba(5,7,7,0)']}
            start={isMobile ? { x: 0.5, y: 0.25 } : { x: 0, y: 0.5 }}
            end={isMobile ? { x: 0.5, y: 1 } : { x: 0.75, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          {box.w > 0 ? <PinPulse x={pinX} y={pinY} /> : null}

          <View style={[styles.panel, isMobile ? styles.panelMobile : styles.panelDesktop]}>
            <Text style={styles.kicker}>SALA A · SEDE</Text>
            <Text style={[styles.address, { fontSize: isMobile ? 26 : 34 }]}>{location.address}</Text>
            <View style={styles.actions}>
              <PixelButton label="Abrir no Google Maps" variant="red" href={location.mapsUrl} />
            </View>
            <View style={styles.divider} />
            <Text style={styles.kicker}>SALA B</Text>
            <Text style={styles.addressSmall}>{salaB.address}</Text>
            <View style={styles.actions}>
              <PixelButton label="Ver Sala B no mapa" href={salaB.mapsUrl} />
            </View>
          </View>
        </View>
      </Reveal>
    </Section>
  );
}

function PinPulse({ x, y }: { x: number; y: number }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    t.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }), -1);
  }, [reduced, t]);

  const ring = useAnimatedStyle(() => ({
    opacity: 0.8 * (1 - t.value),
    transform: [{ scale: 0.3 + t.value * 2.4 }],
  }));
  const ring2 = useAnimatedStyle(() => {
    const p = (t.value + 0.5) % 1;
    return { opacity: 0.8 * (1 - p), transform: [{ scale: 0.3 + p * 2.4 }] };
  });

  return (
    <View pointerEvents="none" style={[styles.pulseWrap, { left: x - 40, top: y - 40 }]}>
      <Animated.View style={[styles.ring, ring]} />
      <Animated.View style={[styles.ring, ring2]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: colors.surface, overflow: 'hidden' },
  panel: { position: 'absolute', gap: 4 },
  panelDesktop: { left: 44, top: 44, bottom: 44, justifyContent: 'center', maxWidth: 440 },
  panelMobile: { left: 22, right: 22, bottom: 24 },
  kicker: { fontFamily: fonts.mono, fontSize: 12, color: colors.yellow, letterSpacing: 3 },
  address: { fontFamily: fonts.display, color: colors.text, lineHeight: 38, marginTop: 6 },
  addressSmall: { fontFamily: fonts.display, color: colors.text, fontSize: 20, marginTop: 6 },
  actions: { marginTop: 16 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 22 },
  pulseWrap: { position: 'absolute', width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.yellow },
});
