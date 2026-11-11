import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';

import { GlitchText } from '@/components/fx/GlitchText';
import { Reveal } from '@/components/fx/Reveal';
import { colors, fonts, layout } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

type SectionProps = {
  id: string;
  children: ReactNode;
  background?: ReactNode;
  onSectionLayout?: (id: string, y: number) => void;
  style?: StyleProp<ViewStyle>;
  fullHeight?: boolean;
};

/** Secao com fundo opcional e conteudo centralizado (largura maxima + gutter responsivo). */
export function Section({ id, children, background, onSectionLayout, style, fullHeight }: SectionProps) {
  const { gutter, isMobile, height } = useLayout();
  const handleLayout = (e: LayoutChangeEvent) => onSectionLayout?.(id, e.nativeEvent.layout.y);

  return (
    <View
      nativeID={id}
      onLayout={handleLayout}
      style={[
        styles.section,
        { paddingVertical: isMobile ? 84 : 128, paddingHorizontal: gutter },
        fullHeight ? { minHeight: height } : null,
        style,
      ]}>
      {background}
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

type TitleProps = { kicker: string; title: string; align?: 'left' | 'center' };

/** Titulo de secao no padrao da arte: "..KICKER" pequeno + titulo grande em pixel com glitch. */
export function SectionTitle({ kicker, title, align = 'left' }: TitleProps) {
  const { isMobile, scale } = useLayout();
  return (
    <View style={{ alignItems: align === 'center' ? 'center' : 'flex-start', marginBottom: isMobile ? 34 : 54 }}>
      <Reveal>
        <Text style={styles.kicker}>{`..${kicker}`}</Text>
      </Reveal>
      <Reveal delay={120}>
        <GlitchText
          accessibilityRole="header"
          style={{
            fontFamily: fonts.display,
            color: colors.text,
            textTransform: 'uppercase',
            fontSize: Math.round((isMobile ? 38 : 56) * scale * (isMobile ? 1 : 0.9)),
            lineHeight: Math.round((isMobile ? 44 : 62) * scale * (isMobile ? 1 : 0.9)),
            letterSpacing: 1,
          }}>
          {title}
        </GlitchText>
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { position: 'relative', overflow: 'hidden' },
  inner: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', zIndex: 2 },
  kicker: { fontFamily: fonts.mono, fontSize: 14, color: colors.red, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10 },
});
