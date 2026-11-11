import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { PixelButton } from '@/components/ui/PixelButton';
import { navItems } from '@/constants/content';
import { fillAbs, colors, fonts, images, layout } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

type Props = {
  visible: boolean;
  onNavigate: (id: string) => void;
};

/** Barra superior fixa: links no desktop, menu em tela cheia no mobile. */
export function Nav({ visible, onNavigate }: Props) {
  const { width, gutter } = useLayout();
  const isMobile = width < 1080; // abaixo disso usa o menu em tela cheia
  const [open, setOpen] = useState(false);
  const show = useSharedValue(0);
  const menu = useSharedValue(0);

  useEffect(() => {
    show.value = withDelay(visible ? 250 : 0, withTiming(visible ? 1 : 0, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [visible, show]);

  useEffect(() => {
    menu.value = withTiming(open ? 1 : 0, { duration: 380, easing: Easing.out(Easing.cubic) });
  }, [open, menu]);

  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  const barStyle = useAnimatedStyle(() => ({
    opacity: show.value,
    transform: [{ translateY: (1 - show.value) * -layout.navHeight }],
  }));
  const menuStyle = useAnimatedStyle(() => ({ opacity: menu.value }));
  const bar1 = useAnimatedStyle(() => ({ transform: [{ translateY: (menu.value - 1) * 5 }, { rotate: `${menu.value * 45}deg` }] }));
  const bar2 = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - menu.value) * 5 }, { rotate: `${menu.value * -45}deg` }] }));

  const go = (id: string) => {
    setOpen(false);
    // pequena folga para o menu fechar antes de rolar
    setTimeout(() => onNavigate(id), open ? 120 : 0);
  };

  return (
    <>
      <Animated.View
        style={[
          styles.bar,
          { paddingHorizontal: gutter > 40 ? 40 : gutter },
          Platform.OS === 'web' ? ({ backdropFilter: 'blur(12px)' } as object) : null,
          barStyle,
        ]}
        pointerEvents={visible ? 'auto' : 'none'}>
        <Pressable accessibilityRole="link" accessibilityLabel="Ir para o inicio" onPress={() => go('inicio')} style={styles.brand}>
          <Image source={images.logo} contentFit="contain" style={styles.brandLogo} />
          <Text style={styles.brandText}>ØPIO ESTÚDIOS</Text>
        </Pressable>

        {isMobile ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={open ? 'Fechar menu' : 'Abrir menu'}
            onPress={() => setOpen((v) => !v)}
            hitSlop={12}
            style={styles.burger}>
            <Animated.View style={[styles.burgerBar, bar1]} />
            <Animated.View style={[styles.burgerBar, bar2]} />
          </Pressable>
        ) : (
          <View style={styles.links}>
            {navItems.map((item) => (
              <NavLink key={item.id} label={item.label} onPress={() => go(item.id)} />
            ))}
            <PixelButton label="Agendar visita" variant="red" arrow={false} onPress={() => go('agendar')} />
          </View>
        )}
      </Animated.View>

      {isMobile ? (
        <Animated.View style={[styles.overlay, menuStyle]} pointerEvents={open ? 'auto' : 'none'}>
          <Image source={images.fundo02} contentFit="cover" style={[StyleSheet.absoluteFill, { opacity: 0.5 }]} />
          <View style={styles.menuList}>
            {navItems.map((item, i) => (
              <Pressable key={item.id} accessibilityRole="link" onPress={() => go(item.id)} style={styles.menuItem}>
                <Text style={styles.menuIndex}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </Pressable>
            ))}
            <View style={{ marginTop: 28 }}>
              <PixelButton label="Agendar visita" variant="red" size="lg" onPress={() => go('agendar')} />
            </View>
          </View>
        </Animated.View>
      ) : null}
    </>
  );
}

function NavLink({ label, onPress }: { label: string; onPress: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={styles.link}>
      <Text style={[styles.linkText, hover && { color: colors.text }]}>{label}</Text>
      <View style={[styles.underline, { width: hover ? '100%' : '0%', backgroundColor: colors.red }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: layout.navHeight,
    zIndex: 700,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(5,7,7,0.74)',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandLogo: { width: 36, height: 36 },
  brandText: { fontFamily: fonts.display, fontSize: 18, color: colors.text, letterSpacing: 2 },
  links: { flexDirection: 'row', alignItems: 'center', gap: 28 },
  link: { paddingVertical: 8 },
  linkText: { fontFamily: fonts.mono, fontSize: 13, color: colors.textDim, letterSpacing: 2, textTransform: 'uppercase' },
  underline: { height: 1, marginTop: 4 },
  burger: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', gap: 7 },
  burgerBar: { width: 26, height: 2, backgroundColor: colors.text, position: 'absolute' },
  overlay: {
    ...fillAbs,
    zIndex: 650,
    backgroundColor: 'rgba(5,7,7,0.97)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  menuList: { gap: 6 },
  menuItem: { flexDirection: 'row', alignItems: 'baseline', gap: 14, paddingVertical: 10 },
  menuIndex: { fontFamily: fonts.mono, fontSize: 13, color: colors.red },
  menuLabel: { fontFamily: fonts.display, fontSize: 40, color: colors.text, textTransform: 'uppercase', letterSpacing: 1 },
});



