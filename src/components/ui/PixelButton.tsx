import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, fonts } from '@/constants/theme';

type Props = {
  label: string;
  onPress?: () => void;
  /** Abre um link externo (https, mailto, tel). */
  href?: string;
  variant?: 'outline' | 'solid' | 'red';
  size?: 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  arrow?: boolean;
};

/** Botao retangular estilo "pixel" com preenchimento em varredura no hover/press. */
export function PixelButton({ label, onPress, href, variant = 'outline', size = 'md', disabled, loading, style, arrow = true }: Props) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const fill = useSharedValue(0);
  const scale = useSharedValue(1);

  const accent = variant === 'red' ? colors.red : colors.text;
  const solid = variant === 'solid';
  const engaged = (hovered || pressed) && !disabled;

  const sweep = (to: number) => {
    fill.value = withTiming(to, { duration: 260, easing: Easing.out(Easing.cubic) });
  };

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
    if (href) {
      Linking.openURL(href).catch(() => {});
      return;
    }
    onPress?.();
  };

  const textColor = solid ? (engaged ? accent : colors.bg) : engaged ? colors.bg : accent;
  const pad = size === 'lg' ? { paddingVertical: 18, paddingHorizontal: 28 } : { paddingVertical: 13, paddingHorizontal: 20 };

  return (
    <Animated.View style={[{ alignSelf: 'flex-start', opacity: disabled ? 0.45 : 1 }, style, scaleStyle]}>
      <Pressable
        accessibilityRole={href ? 'link' : 'button'}
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled, busy: !!loading }}
        onHoverIn={() => {
          setHovered(true);
          sweep(1);
        }}
        onHoverOut={() => {
          setHovered(false);
          if (!pressed) sweep(0);
        }}
        onPressIn={() => {
          setPressed(true);
          scale.value = withTiming(0.97, { duration: 90 });
          sweep(1);
        }}
        onPressOut={() => {
          setPressed(false);
          scale.value = withTiming(1, { duration: 140 });
          if (!hovered) sweep(0);
        }}
        onPress={handlePress}
        style={[styles.btn, pad, { borderColor: accent, backgroundColor: solid ? accent : 'transparent' }]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.fill, { backgroundColor: solid ? colors.bg : accent }, fillStyle]}
        />
        <View style={styles.content}>
          {loading ? <ActivityIndicator size="small" color={textColor} /> : null}
          <Text style={[styles.label, { color: textColor }, size === 'lg' && { fontSize: 18 }]}>{label}</Text>
          {arrow && !loading ? <Text style={[styles.label, { color: textColor }]}>{'->'}</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: { borderWidth: 1, overflow: 'hidden', justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontFamily: fonts.display, fontSize: 16, letterSpacing: 1.5, textTransform: 'uppercase' },
});
