import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ParallaxImage } from '@/components/fx/ParallaxImage';
import { Reveal } from '@/components/fx/Reveal';
import { Section, SectionTitle } from '@/components/ui/Section';
import { services } from '@/constants/content';
import { colors, fonts, images } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

type Props = { onNavigate: (id: string) => void; onSectionLayout: (id: string, y: number) => void };

export function Services({ onNavigate, onSectionLayout }: Props) {
  return (
    <Section
      id="servicos"
      onSectionLayout={onSectionLayout}
      background={<ParallaxImage source={images.servicos} opacity={0.8} speed={0.15} />}>
      <SectionTitle kicker="SERVIÇOS" title="O que fazemos" />
      <View style={styles.list}>
        {services.map((service, i) => (
          <Reveal key={service.id} delay={i * 70}>
            <ServiceRow index={i + 1} title={service.title} text={service.text} onPress={() => onNavigate('agendar')} />
          </Reveal>
        ))}
      </View>
    </Section>
  );
}

function ServiceRow({ index, title, text, onPress }: { index: number; title: string; text: string; onPress: () => void }) {
  const { isMobile, scale } = useLayout();
  const [hover, setHover] = useState(false);
  const sweep = useSharedValue(0);

  const set = (v: boolean) => {
    setHover(v);
    sweep.value = withTiming(v ? 1 : 0, { duration: 320, easing: Easing.out(Easing.cubic) });
  };
  const fill = useAnimatedStyle(() => ({ width: `${sweep.value * 100}%` }));
  const arrow = useAnimatedStyle(() => ({ transform: [{ translateX: sweep.value * 10 }], opacity: 0.35 + sweep.value * 0.65 }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. Agendar uma visita`}
      onHoverIn={() => set(true)}
      onHoverOut={() => set(false)}
      onPressIn={() => set(true)}
      onPressOut={() => set(false)}
      onPress={onPress}
      style={[styles.row, { paddingVertical: isMobile ? 22 : 30, paddingHorizontal: isMobile ? 6 : 20 }]}>
      <Animated.View pointerEvents="none" style={[styles.fill, fill]} />
      <Text style={[styles.index, hover && { color: colors.red }]}>{`${index}.`}</Text>
      <View style={{ flex: 1, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 8 : 40 }}>
        <Text
          style={[
            styles.title,
            { fontSize: Math.round((isMobile ? 26 : 38) * Math.min(scale, 1.2)), flex: isMobile ? undefined : 1.2 },
          ]}>
          {title}
        </Text>
        <Text style={[styles.text, { flex: isMobile ? undefined : 1 }]}>{text}</Text>
      </View>
      <Animated.Text style={[styles.arrow, arrow]}>{'->'}</Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { borderTopWidth: 1, borderTopColor: colors.line },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    overflow: 'hidden',
  },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.06)' },
  index: { fontFamily: fonts.mono, fontSize: 16, color: colors.textDim, width: 34 },
  title: { fontFamily: fonts.display, color: colors.text, letterSpacing: 0.5 },
  text: { fontFamily: fonts.mono, fontSize: 14, lineHeight: 22, color: colors.textDim, maxWidth: 440 },
  arrow: { fontFamily: fonts.display, fontSize: 22, color: colors.red },
});
