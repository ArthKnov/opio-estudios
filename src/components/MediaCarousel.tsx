import { Image, type ImageSource } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import type { MediaItem } from '@/constants/content';
import { colors, fonts } from '@/constants/theme';

type Props = { media: MediaItem[]; label: string };

/** Carrossel de fotos e videos (um slide por vez, com paginacao, setas e indicador). */
export function MediaCarousel({ media, label }: Props) {
  const scroller = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!width) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(Math.max(0, Math.min(media.length - 1, next)));
  };
  const goTo = (i: number) => {
    const target = (i + media.length) % media.length;
    setIndex(target);
    scroller.current?.scrollTo({ x: target * width, animated: true });
  };

  return (
    <View style={styles.wrap}>
      <View onLayout={onLayout} style={styles.frame}>
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          accessibilityLabel={label}
          style={StyleSheet.absoluteFill}>
          {media.map((item, i) => (
            <View key={i} style={{ width: width || 1, height: '100%' }}>
              {item.type === 'image' ? (
                <Image source={item.source} contentFit="cover" accessibilityLabel={item.alt} style={styles.fill} transition={300} />
              ) : (
                <VideoSlide source={item.source} poster={item.poster} active={i === index} />
              )}
            </View>
          ))}
        </ScrollView>

        {/* cantos estilo "viewfinder" */}
        <View pointerEvents="none" style={[styles.corner, styles.tl]} />
        <View pointerEvents="none" style={[styles.corner, styles.tr]} />
        <View pointerEvents="none" style={[styles.corner, styles.bl]} />
        <View pointerEvents="none" style={[styles.corner, styles.br]} />

        <View pointerEvents="none" style={styles.counter}>
          <Text style={styles.counterText}>{`${String(index + 1).padStart(2, '0')} / ${String(media.length).padStart(2, '0')}`}</Text>
          {media[index]?.type === 'video' ? <Text style={styles.rec}>{'● REC'}</Text> : null}
        </View>

        <View style={styles.arrows}>
          <ArrowButton dir="prev" onPress={() => goTo(index - 1)} />
          <ArrowButton dir="next" onPress={() => goTo(index + 1)} />
        </View>
      </View>

      <View style={styles.dots}>
        {media.map((_, i) => (
          <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Ir para o item ${i + 1}`} onPress={() => goTo(i)} hitSlop={8}>
            <View style={[styles.dot, i === index && styles.dotOn]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function VideoSlide({ source, poster, active }: { source: number; poster: ImageSource | number; active: boolean }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (active) player.play();
    else player.pause();
  }, [active, player]);

  return (
    <View style={styles.fill}>
      <Image source={poster} contentFit="cover" style={styles.fill} />
      <VideoView player={player} contentFit="cover" nativeControls={false} style={StyleSheet.absoluteFill} />
    </View>
  );
}

function ArrowButton({ dir, onPress }: { dir: 'prev' | 'next'; onPress: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dir === 'prev' ? 'Anterior' : 'Próximo'}
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={[styles.arrow, hover && { backgroundColor: colors.text }]}>
      <Text style={[styles.arrowText, hover && { color: colors.bg }]}>{dir === 'prev' ? '<' : '>'}</Text>
    </Pressable>
  );
}

const CORNER = 18;

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  frame: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  fill: { width: '100%', height: '100%' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: colors.text },
  tl: { top: 10, left: 10, borderTopWidth: 1, borderLeftWidth: 1 },
  tr: { top: 10, right: 10, borderTopWidth: 1, borderRightWidth: 1 },
  bl: { bottom: 10, left: 10, borderBottomWidth: 1, borderLeftWidth: 1 },
  br: { bottom: 10, right: 10, borderBottomWidth: 1, borderRightWidth: 1 },
  counter: { position: 'absolute', top: 20, left: 26, flexDirection: 'row', gap: 12, alignItems: 'center' },
  counterText: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 2, color: colors.text, textShadowColor: '#000', textShadowRadius: 6 },
  rec: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: colors.red, textShadowColor: '#000', textShadowRadius: 6 },
  arrows: { position: 'absolute', right: 22, bottom: 22, flexDirection: 'row', gap: 8 },
  arrow: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: 'rgba(5,7,7,0.6)',
  },
  arrowText: { fontFamily: fonts.display, fontSize: 20, color: colors.text },
  dots: { flexDirection: 'row', gap: 8, marginTop: 14, justifyContent: 'center' },
  dot: { width: 18, height: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotOn: { backgroundColor: colors.red },
});

