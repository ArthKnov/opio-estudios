import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { ParallaxImage } from '@/components/fx/ParallaxImage';
import { Reveal } from '@/components/fx/Reveal';
import { ScheduleForm } from '@/components/schedule/ScheduleForm';
import { Section, SectionTitle } from '@/components/ui/Section';
import { brand } from '@/constants/content';
import { colors, fonts, images } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

type Props = { onSectionLayout: (id: string, y: number) => void };

const channels = [
  { label: 'WhatsApp / Telefone', value: brand.phoneDisplay, href: brand.whatsapp },
  { label: 'E-mail', value: brand.email, href: `mailto:${brand.email}` },
  { label: 'Instagram', value: brand.instagramHandle, href: brand.instagram },
];

export function Contact({ onSectionLayout }: Props) {
  const { isMobile, scale } = useLayout();
  return (
    <>
      <Section
        id="contato"
        onSectionLayout={onSectionLayout}
        background={<ParallaxImage source={images.contato} opacity={0.75} speed={0.14} />}>
        <SectionTitle kicker="CONTATO" title="Entre em contato" />
        <View style={styles.list}>
          {channels.map((c, i) => (
            <Reveal key={c.label} delay={i * 80}>
              <Channel {...c} size={Math.round((isMobile ? 22 : 40) * Math.min(scale, 1.2))} />
            </Reveal>
          ))}
        </View>
      </Section>

      <Section id="agendar" onSectionLayout={onSectionLayout} style={{ paddingTop: isMobile ? 20 : 40 }}>
        <Reveal>
          <Text style={styles.kicker}>..AGENDAR</Text>
          <Text style={[styles.h2, { fontSize: isMobile ? 32 : 46 }]}>Agende uma visita</Text>
          <Text style={styles.lead}>
            Escolha o melhor dia e horário, deixe seus dados e receba o convite do Google Meet no seu e-mail para conhecer
            a ØPIO de perto.
          </Text>
        </Reveal>
        <Reveal delay={120} style={{ marginTop: 34 }}>
          <ScheduleForm />
        </Reveal>
      </Section>
    </>
  );
}

function Channel({ label, value, href, size }: { label: string; value: string; href: string; size: number }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${label}: ${value}`}
      onPress={() => Linking.openURL(href).catch(() => {})}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={styles.channel}>
      <Text style={styles.channelLabel}>{label}</Text>
      <View style={styles.channelRow}>
        <Text style={[styles.channelValue, { fontSize: size }, hover && { color: colors.red }]}>{value}</Text>
        <Text style={[styles.channelArrow, hover && { color: colors.red, transform: [{ translateX: 6 }, { translateY: -6 }] }]}>{'↗'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { borderTopWidth: 1, borderTopColor: colors.line },
  channel: { paddingVertical: 22, borderBottomWidth: 1, borderBottomColor: colors.line },
  channelLabel: { fontFamily: fonts.mono, fontSize: 12, color: colors.textDim, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 },
  channelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  channelValue: { fontFamily: fonts.display, color: colors.text, flexShrink: 1 },
  channelArrow: { fontFamily: fonts.display, fontSize: 28, color: colors.textDim },
  kicker: { fontFamily: fonts.mono, fontSize: 14, color: colors.red, letterSpacing: 3, marginBottom: 10 },
  h2: { fontFamily: fonts.display, color: colors.text, textTransform: 'uppercase', letterSpacing: 1 },
  lead: { fontFamily: fonts.mono, fontSize: 15, lineHeight: 26, color: colors.textDim, marginTop: 14, maxWidth: 640 },
});
