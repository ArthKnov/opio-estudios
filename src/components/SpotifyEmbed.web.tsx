import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';

/** Player oficial do Spotify (embed) via iframe na web. */
export function SpotifyEmbed({ trackId, height = 152 }: { trackId: string; height?: number }) {
  return (
    <View style={[styles.wrap, { height }]}>
      <iframe
        title="Spotify: FECIT"
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
        width="100%"
        height={height}
        style={{ border: 0, display: 'block', colorScheme: 'normal' }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', backgroundColor: colors.surface, overflow: 'hidden', borderRadius: 12 },
});
