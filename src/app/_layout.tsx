import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import { PixelifySans_400Regular, PixelifySans_700Bold } from '@expo-google-fonts/pixelify-sans';
import { DarkTheme, Slot, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { colors } from '@/constants/theme';
SplashScreen.preventAutoHideAsync().catch(() => {});

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, text: colors.text, border: colors.line, primary: colors.red },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PixelifySans_400Regular,
    PixelifySans_700Bold,
    DMMono_400Regular,
    DMMono_500Medium,
  });
  const ready = loaded || !!error;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Slot />
    </ThemeProvider>
  );
}
