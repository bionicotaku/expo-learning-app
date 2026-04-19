import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { createQueryClient } from '@/shared/lib/react-query/query-client';

export default function RootLayout() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
