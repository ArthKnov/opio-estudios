import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { GlitchLogo } from '@/components/fx/GlitchLogo';
import { GlitchText } from '@/components/fx/GlitchText';
import { Marquee } from '@/components/fx/Marquee';
import { ParallaxImage } from '@/components/fx/ParallaxImage';
import { Reveal } from '@/components/fx/Reveal';
import { PixelButton } from '@/components/ui/PixelButton';
import { Section } from '@/components/ui/Section';
import { brand, services } from '@/constants/content';
import { colors, fonts, images, layout } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

type Props = { onNavigate: (id: string) => void; onSectionLayout: (id: string, y: number) => void };

export function Hero({ onNavigate, onSectionLayout }: Props) {
  const { width, height, isMobile, scale } = useLayout();
  const logoSize = Math.round(Math.min(width * (isMobile ? 0.52 : 0.3), height * 0.3, 330));
  const titleSize = Math.round(Math.min(isMobile ? width * 0.115 : 84, 96));

  return (
    <View>
      <Section
        id="inicio"
        onSectionLayout={onSectionLayout}
        background={
          <>
            <ParallaxImage source={images.fundo02} opacity={0.7} speed={0.12} />
            <ScrollCue />
          </>
        }
        style={{ minHeight: Math.max(560, height - 56), justifyContent: 'center', paddingTop: layout.navHeight + 28, paddingBottom: 96 }}>
        <View style={styles.center}>
          <Reveal delay={0} distance={20}>
            <Text style={styles.kicker}>{isMobile ? '// PRODUÇÃO MUSICAL // SÃO PAULO' : '//  ESTÚDIO DE PRODUÇÃO MUSICAL  //  SÃO PAULO'}</Text>
          </Reveal>

          <Reveal delay={150} distance={0} style={{ marginVertical: isMobile ? 26 : 34 }}>
            <GlitchLogo size={logoSize} />
          </Reveal>

          <Reveal delay={300}>
            <View style={{ alignItems: 'center' }}>
              <GlitchText
                accessibilityRole="header"
                interval={[1800, 4200]}
                intensity={6}
                style={{
                  fontFamily: fonts.display,
                  color: colors.text,
                  fontSize: titleSize,
                  lineHeight: titleSize * 1.08,
                  letterSpacing: 2,
                  textAlign: 'center',
                }}>
                {brand.name}
              </GlitchText>
            </View>
          </Reveal>

          <Reveal delay={480}>
            <Text style={[styles.tagline, { fontSize: Math.round((isMobile ? 15 : 17) * Math.min(scale, 1.2)) }]}>
              {brand.tagline}
            </Text>
          </Reveal>

          <Reveal delay={640} style={styles.actions}>
            <PixelButton label="Agendar visita" variant="red" size="lg" onPress={() => onNavigate('agendar')} />
            <PixelButton label="Conhecer os estúdios" size="lg" onPress={() => onNavigate('estudios')} />
          </Reveal>
        </View>
      </Section>
      <Marquee items={services.map((s) => s.title)} />
    </View>
  );
}

function ScrollCue() {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    t.value = withRepeat(
      withSequence(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.quad) })),
      -1,
    );
  }, [reduced, t]);
  const line = useAnimatedStyle(() => ({ transform: [{ scaleY: 0.35 + t.value * 0.65 }], opacity: 0.4 + t.value * 0.6 }));

  return (
    <View pointerEvents="none" style={styles.cue}>
      <Text style={styles.cueText}>ROLE</Text>
      <Animated.View style={[styles.cueLine, line]} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingBottom: 30 },
  kicker: { fontFamily: fonts.mono, fontSize: 12, color: colors.textDim, letterSpacing: 3, textAlign: 'center' },
  tagline: { fontFamily: fonts.mono, color: colors.textDim, textAlign: 'center', marginTop: 22, maxWidth: 560, lineHeight: 26 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 34, justifyContent: 'center', alignSelf: 'center' },
  cue: { position: 'absolute', bottom: 18, alignSelf: 'center', alignItems: 'center', gap: 8, zIndex: 3 },
  cueText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 4, color: colors.textFaint },
  cueLine: { width: 1, height: 34, backgroundColor: colors.red },
});


