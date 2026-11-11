import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { fillAbs, colors } from '@/constants/theme';

/** Player oficial do Spotify (embed) via WebView no iOS/Android. */
export function SpotifyEmbed({ trackId, height = 152 }: { trackId: string; height?: number }) {
  return (
    <View style={[styles.wrap, { height }]}>
      <WebView
        source={{ uri: `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0` }}
        style={styles.web}
        originWhitelist={['https://*']}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.red} />
          </View>
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  web: { flex: 1, backgroundColor: 'transparent' },
  loading: { ...fillAbs, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
});


