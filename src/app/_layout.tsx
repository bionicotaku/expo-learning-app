import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Animated, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  LAUNCH_SCREEN_FADE_DURATION_MS,
  LAUNCH_SCREEN_MINIMUM_VISIBLE_MS,
  createInitialLaunchBootstrapState,
  reduceLaunchBootstrapState,
} from '@/shared/lib/startup/launch-bootstrap';
import { createQueryClient } from '@/shared/lib/react-query/query-client';
import {
  EditorialPaperThemeProvider,
  editorialPaperLightTokens,
} from '@/shared/theme/editorial-paper';
import { ModalHost } from '@/shared/ui/modal';
import { LaunchScreen } from '@/shared/ui/startup';
import { ToastHost } from '@/shared/ui/toast';

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore duplicate calls during fast refresh.
});

const FULLSCREEN_VIDEO_ROUTE_SINGULAR_ID = 'fullscreen-video';

export default function RootLayout() {
  const [queryClient] = useState(() => createQueryClient());
  const [bootstrapState, dispatch] = useReducer(
    reduceLaunchBootstrapState,
    undefined,
    createInitialLaunchBootstrapState
  );
  const launchOpacity = useRef(new Animated.Value(1)).current;
  const didLayoutLaunchScreen = useRef(false);
  const requestedNativeHide = useRef(false);

  useEffect(() => {
    if (!bootstrapState.nativeHideRequested || requestedNativeHide.current) {
      return;
    }

    requestedNativeHide.current = true;

    void SplashScreen.hideAsync()
      .catch(() => {
        // Ignore duplicate hide attempts during fast refresh.
      })
      .finally(() => {
        dispatch({ type: 'native-splash-hidden' });
      });
  }, [bootstrapState.nativeHideRequested]);

  useEffect(() => {
    if (
      !bootstrapState.nativeHideRequested ||
      bootstrapState.minimumDurationComplete
    ) {
      return;
    }

    const timeoutId = setTimeout(() => {
      dispatch({ type: 'minimum-duration-complete' });
    }, LAUNCH_SCREEN_MINIMUM_VISIBLE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    bootstrapState.minimumDurationComplete,
    bootstrapState.nativeHideRequested,
  ]);

  useEffect(() => {
    if (
      !bootstrapState.minimumDurationComplete ||
      bootstrapState.exitAnimationComplete
    ) {
      return;
    }

    Animated.timing(launchOpacity, {
      toValue: 0,
      duration: LAUNCH_SCREEN_FADE_DURATION_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        dispatch({ type: 'exit-animation-complete' });
      }
    });
  }, [
    bootstrapState.exitAnimationComplete,
    bootstrapState.minimumDurationComplete,
    launchOpacity,
  ]);

  const handleLaunchScreenLayout = useCallback(() => {
    if (didLayoutLaunchScreen.current) {
      return;
    }

    didLayoutLaunchScreen.current = true;
    dispatch({ type: 'js-launch-painted' });
  }, []);

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor: editorialPaperLightTokens.color.background,
      }}
    >
      <EditorialPaperThemeProvider>
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: editorialPaperLightTokens.color.background,
          }}
        >
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ animation: 'fade' }} />
              <Stack.Screen
                name="(tabs)"
                options={{
                  animation: 'fade',
                  animationTypeForReplace: 'push',
                }}
              />
              <Stack.Screen
                name="video/[videoId]"
                dangerouslySingular={() => FULLSCREEN_VIDEO_ROUTE_SINGULAR_ID}
              />
            </Stack>
            {Platform.OS !== 'web' ? <ToastHost /> : null}
            <ModalHost />
          </QueryClientProvider>
        </Animated.View>

        {bootstrapState.jsLaunchVisible ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: launchOpacity,
            }}
          >
            <LaunchScreen onFirstLayout={handleLaunchScreenLayout} />
          </Animated.View>
        ) : null}
      </EditorialPaperThemeProvider>
    </GestureHandlerRootView>
  );
}
