import { Asset } from 'expo-asset';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import { CustomCursor } from '@/components/fx/CustomCursor';
import { Scanlines } from '@/components/fx/Scanlines';
import { ScrollContext } from '@/components/fx/scroll-context';
import { Intro } from '@/components/Intro';
import { Nav } from '@/components/Nav';
import { Contact } from '@/components/sections/Contact';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { Location } from '@/components/sections/Location';
import { Productions } from '@/components/sections/Productions';
import { Services } from '@/components/sections/Services';
import { Studios } from '@/components/sections/Studios';
import { colors, images, layout } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';

/** `?skip` na URL (web) pula a intro: util para desenvolvimento e testes. */
const skipIntro = Platform.OS === 'web' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('skip');

const criticalAssets = [images.logo, images.fundo03];
const lazyAssets = [images.fundo02, images.logoTexture, images.servicos, images.producoes, images.contato, images.mapa];

export default function Home() {
  const { height } = useLayout();
  const [assetsReady, setAssetsReady] = useState(false);
  const [showIntro, setShowIntro] = useState(!skipIntro);
  const [entered, setEntered] = useState(skipIntro);

  const scrollY = useSharedValue(0);
  const viewportH = useSharedValue(height);
  const active = useSharedValue(skipIntro ? 1 : 0);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const sectionY = useRef<Record<string, number>>({});

  useEffect(() => {
    viewportH.value = height;
  }, [height, viewportH]);

  // Pre-carrega o essencial (a intro so libera o clique quando isso terminar) e o restante em segundo plano.
  useEffect(() => {
    let alive = true;
    Asset.loadAsync(criticalAssets)
      .catch(() => {})
      .then(() => {
        if (alive) setAssetsReady(true);
        return Asset.loadAsync(lazyAssets).catch(() => {});
      });
    return () => {
      alive = false;
    };
  }, []);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const onSectionLayout = useCallback((id: string, y: number) => {
    sectionY.current[id] = y;
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      const y = id === 'inicio' ? 0 : Math.max(0, (sectionY.current[id] ?? 0) - layout.navHeight + 1);
      scrollRef.current?.scrollTo({ y, animated: true });
    },
    [scrollRef],
  );

  const ctx = useMemo(() => ({ scrollY, viewportH, active, scrollToSection }), [scrollY, viewportH, active, scrollToSection]);

  const handleStart = useCallback(() => {
    active.value = 1;
    setEntered(true);
  }, [active]);

  return (
    <ScrollContext.Provider value={ctx}>
      <View style={styles.root}>
        <Animated.ScrollView
          ref={scrollRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          scrollEnabled={entered}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ backgroundColor: colors.bg }}
          style={styles.scroll}>
          <Hero onNavigate={scrollToSection} onSectionLayout={onSectionLayout} />
          <Studios onNavigate={scrollToSection} onSectionLayout={onSectionLayout} />
          <Services onNavigate={scrollToSection} onSectionLayout={onSectionLayout} />
          <Productions onSectionLayout={onSectionLayout} />
          <Contact onSectionLayout={onSectionLayout} />
          <Location onSectionLayout={onSectionLayout} />
          <Footer onNavigate={scrollToSection} />
        </Animated.ScrollView>

        <Nav visible={entered} onNavigate={scrollToSection} />

        {showIntro ? <Intro assetsReady={assetsReady} onStart={handleStart} onDone={() => setShowIntro(false)} /> : null}
        <Scanlines />
        <CustomCursor />
      </View>
    </ScrollContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
});
