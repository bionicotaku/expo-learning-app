import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { createQueryClient } from '@/shared/lib/react-query/query-client';
import {
  EditorialPaperThemeProvider,
  getEditorialPaperFontSources,
} from '@/shared/theme/editorial-paper';

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore duplicate calls during fast refresh.
});

export default function RootLayout() {
  const [queryClient] = useState(() => createQueryClient());
  const fontSources = useMemo(() => getEditorialPaperFontSources(), []);
  const [fontsLoaded, fontError] = useFonts(fontSources);

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <EditorialPaperThemeProvider fontsLoaded={fontsLoaded}>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </EditorialPaperThemeProvider>
    </GestureHandlerRootView>
  );
}
