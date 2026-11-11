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
  const titleSize = Math.round((isMobile ? 64 : 96) * Math.min(scale, 1.25));

  const content = (
    <>
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
      <Reveal delay={280} style={isMobile ? styles.playerMobile : styles.player}>
        {/* No celular o formato alto do Spotify coloca o nome da faixa abaixo da capa,
            em vez de espremê-lo ao lado dela. */}
        <SpotifyEmbed trackId={production.spotifyTrackId} height={isMobile ? 352 : 152} />
      </Reveal>
      <Reveal delay={340} style={{ marginTop: 22 }}>
        <PixelButton label="Ouvir no Spotify" variant="red" href={production.spotifyUrl} />
      </Reveal>
    </>
  );

  return (
    <Section id="producoes" onSectionLayout={onSectionLayout} background={<ParallaxImage source={images.fundo02} opacity={0.55} position="left" />}>
      {isMobile ? (
        <View style={[styles.art, { maxWidth: Math.min(width - 44, 460) }]}>
          <Image source={images.producoes} contentFit="cover" contentPosition="bottom" style={styles.artImage} />
          <View pointerEvents="none" style={styles.tag}>
            <Text style={styles.tagText}>PRODUÇÃO ØPIO</Text>
          </View>
          <View style={styles.artBody}>{content}</View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 72, alignItems: 'center' }}>
          <Reveal from="left" style={{ flex: 5, maxWidth: 420 }}>
            <View style={[styles.art, { aspectRatio: 9 / 16 }]}>
              <Image source={images.producoes} contentFit="cover" contentPosition="center" style={StyleSheet.absoluteFill} />
              <View pointerEvents="none" style={styles.tag}>
                <Text style={styles.tagText}>PRODUÇÃO ØPIO</Text>
              </View>
            </View>
          </Reveal>
          <View style={{ flex: 6 }}>{content}</View>
        </View>
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  art: { width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', alignSelf: 'center' },
  artImage: { width: '100%', aspectRatio: 4 / 3 },
  artBody: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 26 },
  player: { marginTop: 28 },
  playerMobile: { marginTop: 24, marginHorizontal: -20 },
  tag: { position: 'absolute', top: 18, left: 18, backgroundColor: colors.red, paddingVertical: 4, paddingHorizontal: 8 },
  tagText: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: colors.bg },
  kicker: { fontFamily: fonts.mono, fontSize: 14, color: colors.red, letterSpacing: 3, marginBottom: 10 },
  text: { fontFamily: fonts.mono, fontSize: 15, lineHeight: 26, color: colors.textDim, marginTop: 22, maxWidth: 520 },
});



