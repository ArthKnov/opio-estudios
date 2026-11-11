import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, fonts } from '@/constants/theme';

type Props = { items: readonly string[]; speed?: number; size?: number };

/** Faixa de texto infinita (ticker) em fonte pixel. */
export function Marquee({ items, speed = 55, size = 15 }: Props) {
  const reduced = useReducedMotion();
  const [rowWidth, setRowWidth] = useState(0);
  const x = useSharedValue(0);

  useEffect(() => {
    if (!rowWidth || reduced) return;
    x.value = 0;
    x.value = withRepeat(withTiming(-rowWidth, { duration: (rowWidth / speed) * 1000, easing: Easing.linear }), -1);
    return () => cancelAnimation(x);
  }, [rowWidth, speed, reduced, x]);

  const animated = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const row = (
    <View style={styles.row}>
      {items.map((item, i) => (
        <View key={`${item}-${i}`} style={styles.item}>
          <Text style={[styles.text, { fontSize: size }]}>{item}</Text>
          <Text style={[styles.sep, { fontSize: size }]}>{'//'}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.track, animated]}>
        <View onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}>{row}</View>
        {row}
        {row}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(5,7,7,0.7)',
    paddingVertical: 14,
  },
  track: { flexDirection: 'row', width: 'auto' as unknown as number },
  row: { flexDirection: 'row' },
  item: { flexDirection: 'row', alignItems: 'center' },
  text: { fontFamily: fonts.display, color: colors.text, textTransform: 'uppercase', letterSpacing: 2, paddingHorizontal: 22 },
  sep: { fontFamily: fonts.mono, color: colors.red },
});
