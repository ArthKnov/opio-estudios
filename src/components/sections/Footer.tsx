import { Image } from 'expo-image';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { brand, navItems } from '@/constants/content';
import { colors, fonts, images, layout } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

type Props = { onNavigate: (id: string) => void };

export function Footer({ onNavigate }: Props) {
  const { isMobile, gutter } = useLayout();
  return (
    <View style={[styles.wrap, { paddingHorizontal: gutter }]}>
      <View style={[styles.inner, { flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', alignItems: isMobile ? 'flex-start' : 'center' }]}>
        <Pressable onPress={() => onNavigate('inicio')} accessibilityRole="link" accessibilityLabel="Voltar ao topo" style={styles.brand}>
          <Image source={images.logo} contentFit="contain" style={{ width: 54, height: 54 }} />
          <View>
            <Text style={styles.name}>{brand.name}</Text>
            <Text style={styles.small}>{brand.tagline}</Text>
          </View>
        </Pressable>
        <View style={[styles.links, isMobile ? null : { marginLeft: 'auto' }]}>
          {navItems.map((item) => (
            <Pressable key={item.id} accessibilityRole="link" onPress={() => onNavigate(item.id)}>
              <Text style={styles.link}>{item.label}</Text>
            </Pressable>
          ))}
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL(brand.instagram).catch(() => {})}>
            <Text style={[styles.link, { color: colors.red }]}>Instagram</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.copy}>{`© ${new Date().getFullYear()} ØPIO ESTÚDIOS. Todos os direitos reservados.`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 48, paddingBottom: 40, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg },
  inner: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', gap: 28 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  name: { fontFamily: fonts.display, fontSize: 22, color: colors.text, letterSpacing: 2 },
  small: { fontFamily: fonts.mono, fontSize: 12, color: colors.textFaint, marginTop: 4, maxWidth: 280 },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 22, flexShrink: 1 },
  link: { fontFamily: fonts.mono, fontSize: 12, color: colors.textDim, letterSpacing: 2, textTransform: 'uppercase' },
  copy: { fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint, marginTop: 36, width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', letterSpacing: 1 },
});

