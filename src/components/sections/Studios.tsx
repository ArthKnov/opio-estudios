import { StyleSheet, Text, View } from 'react-native';

import { MediaCarousel } from '@/components/MediaCarousel';
import { ParallaxImage } from '@/components/fx/ParallaxImage';
import { Reveal } from '@/components/fx/Reveal';
import { PixelButton } from '@/components/ui/PixelButton';
import { Section, SectionTitle } from '@/components/ui/Section';
import { studios, type Studio } from '@/constants/content';
import { colors, fonts, images } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

type Props = { onNavigate: (id: string) => void; onSectionLayout: (id: string, y: number) => void };

export function Studios({ onNavigate, onSectionLayout }: Props) {
  const { isMobile } = useLayout();
  return (
    <Section
      id="estudios"
      onSectionLayout={onSectionLayout}
      background={<ParallaxImage source={images.fundo03} opacity={0.9} />}>
      <SectionTitle kicker="ESTÚDIOS" title="Nossas salas" />
      <View style={{ gap: isMobile ? 84 : 120 }}>
        {studios.map((studio, i) => (
          <StudioRow key={studio.id} studio={studio} flip={i % 2 === 1} onNavigate={onNavigate} />
        ))}
      </View>
    </Section>
  );
}

function StudioRow({ studio, flip, onNavigate }: { studio: Studio; flip: boolean; onNavigate: (id: string) => void }) {
  const { isMobile, isDesktop, scale } = useLayout();
  const row = !isMobile;
  const [lead, ...rest] = studio.paragraphs;

  return (
    <View
      style={{
        flexDirection: row ? (flip ? 'row-reverse' : 'row') : 'column',
        gap: isMobile ? 28 : isDesktop ? 72 : 44,
        alignItems: row ? 'center' : 'stretch',
      }}>
      <Reveal from={flip ? 'right' : 'left'} style={{ flex: row ? 5 : undefined, width: row ? undefined : '100%', maxWidth: row ? 520 : undefined }}>
        <MediaCarousel media={studio.media} label={`Fotos e vídeos da ${studio.title}`} />
      </Reveal>

      <View style={{ flex: row ? 6 : undefined, width: row ? undefined : '100%' }}>
        <Reveal>
          <View style={styles.headRow}>
            <Text style={styles.index}>{studio.index}</Text>
            <Text style={styles.kicker}>{studio.kicker}</Text>
          </View>
        </Reveal>
        <Reveal delay={90}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { fontSize: Math.round((isMobile ? 46 : 60) * Math.min(scale, 1.25)), lineHeight: Math.round((isMobile ? 50 : 64) * Math.min(scale, 1.25)) }]}>
            {studio.title}
          </Text>
        </Reveal>
        <Reveal delay={160}>
          <View style={styles.address}>
            <View style={styles.pin} />
            <Text style={styles.addressText}>{studio.address}</Text>
          </View>
        </Reveal>
        <Reveal delay={220}>
          <Text style={[styles.lead, { fontSize: isMobile ? 18 : 20 }]}>{lead}</Text>
          {rest.map((p) => (
            <Text key={p} style={styles.body}>
              {p}
            </Text>
          ))}
          <Text style={styles.cta}>{studio.cta}</Text>
        </Reveal>
        <Reveal delay={280}>
          <View style={styles.tags}>
            {studio.hashtags.map((tag) => (
              <Text key={tag} style={styles.tag}>{`#${tag}`}</Text>
            ))}
          </View>
        </Reveal>
        <Reveal delay={340}>
          <View style={styles.actions}>
            <PixelButton label="Agendar visita" variant="red" onPress={() => onNavigate('agendar')} />
            <PixelButton label="Como chegar" href={studio.mapsUrl} />
            <PixelButton label="Post original" href={studio.postUrl} />
          </View>
        </Reveal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 6 },
  index: { fontFamily: fonts.mono, fontSize: 13, color: colors.red, letterSpacing: 2 },
  kicker: { fontFamily: fonts.mono, fontSize: 12, color: colors.textDim, letterSpacing: 3, textTransform: 'uppercase' },
  title: { fontFamily: fonts.display, color: colors.text, textTransform: 'uppercase', letterSpacing: 1 },
  address: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, marginBottom: 22 },
  pin: { width: 9, height: 9, backgroundColor: colors.yellow },
  addressText: { fontFamily: fonts.mono, fontSize: 13, color: colors.text, letterSpacing: 1 },
  lead: { fontFamily: fonts.display, color: colors.text, lineHeight: 28, marginBottom: 14 },
  body: { fontFamily: fonts.mono, fontSize: 14, lineHeight: 24, color: colors.textDim, marginBottom: 14, maxWidth: 620 },
  cta: { fontFamily: fonts.monoMedium, fontSize: 14, lineHeight: 22, color: colors.text, marginBottom: 6, maxWidth: 620 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14, marginBottom: 26 },
  tag: { fontFamily: fonts.mono, fontSize: 12, color: colors.red, letterSpacing: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
