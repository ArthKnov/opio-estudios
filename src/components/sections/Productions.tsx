import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { ParallaxImage } from '@/components/fx/ParallaxImage';
import { Reveal } from '@/components/fx/Reveal';
import { GlitchText } from '@/components/fx/GlitchText';
import { SpotifyEmbed } from '@/components/SpotifyEmbed';
import { PixelButton } from '@/components/ui/PixelButton';
import { Section } from '@/components/ui/Section';
import { production } from '@/constants/content';
import { colors, fonts, images } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

type Props = { onSectionLayout: (id: string, y: number) => void };

export function Productions({ onSectionLayout }: Props) {
  const { isMobile, width, scale } = useLayout();
  const row = !isMobile;
  const titleSize = Math.round((isMobile ? 64 : 96) * Math.min(scale, 1.25));

  return (
    <Section id="producoes" onSectionLayout={onSectionLayout} background={<ParallaxImage source={images.fundo02} opacity={0.55} position="left" />}>
      <View style={{ flexDirection: row ? 'row' : 'column', gap: isMobile ? 34 : 72, alignItems: row ? 'center' : 'stretch' }}>
        <Reveal from={row ? 'left' : 'up'} style={{ width: row ? undefined : '100%', flex: row ? 5 : undefined, maxWidth: row ? 420 : undefined, alignSelf: isMobile ? 'center' : undefined }}>
          <View style={[styles.art, { aspectRatio: isMobile ? 4 / 5 : 9 / 16, maxWidth: isMobile ? Math.min(width - 44, 460) : undefined }]}>
            <Image source={images.producoes} contentFit="cover" contentPosition={isMobile ? 'bottom' : 'center'} style={StyleSheet.absoluteFill} />
            <View pointerEvents="none" style={[styles.tag, { left: 18 }]}>
              <Text style={styles.tagText}>PRODUÇÃO ØPIO</Text>
            </View>
          </View>
        </Reveal>

        <View style={{ flex: row ? 6 : undefined }}>
          <Reveal>
            <Text style={styles.kicker}>..PRODUÇÕES</Text>
          </Reveal>
          <Reveal delay={100}>
            <GlitchText
              accessibilityRole="header"
              intensity={7}
              interval={[1800, 3800]}
              style={{ fontFamily: fonts.display, fontSize: titleSize, lineHeight: titleSize * 1.05, color: colors.text, letterSpacing: 2 }}>
              {production.title}
            </GlitchText>
          </Reveal>
          <Reveal delay={200}>
            <Text style={styles.text}>{production.text}</Text>
          </Reveal>
          <Reveal delay={280} style={{ marginTop: 28 }}>
            <SpotifyEmbed trackId={production.spotifyTrackId} height={232} />
          </Reveal>
          <Reveal delay={340} style={{ marginTop: 22 }}>
            <PixelButton label="Ouvir no Spotify" variant="red" href={production.spotifyUrl} />
          </Reveal>
        </View>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  art: { width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', alignSelf: 'center' },
  tag: { position: 'absolute', top: 18, backgroundColor: colors.red, paddingVertical: 4, paddingHorizontal: 8 },
  tagText: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: colors.bg },
  kicker: { fontFamily: fonts.mono, fontSize: 14, color: colors.red, letterSpacing: 3, marginBottom: 10 },
  text: { fontFamily: fonts.mono, fontSize: 15, lineHeight: 26, color: colors.textDim, marginTop: 22, maxWidth: 520 },
});



