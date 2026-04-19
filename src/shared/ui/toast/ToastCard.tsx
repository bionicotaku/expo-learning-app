import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { ToastId, ToastRecord } from '@/shared/lib/toast/types';

import {
  shouldDismissToastGesture,
  TOAST_BACKGROUND_OPACITY,
  TOAST_BLUR_INTENSITY,
  TOAST_BORDER_RADIUS,
  TOAST_CONTAINER_MIN_HEIGHT,
  TOAST_CONTAINER_PADDING_HORIZONTAL,
  TOAST_CONTAINER_PADDING_VERTICAL,
  TOAST_ENTER_DURATION_MS,
  TOAST_ENTER_SCALE,
  TOAST_ENTER_TRANSLATE_Y,
  TOAST_EXIT_DURATION_MS,
  TOAST_EXIT_TRANSLATE_Y,
  TOAST_HORIZONTAL_MARGIN,
  TOAST_ICON_OPACITY,
  TOAST_ICON_PADDING,
  TOAST_ICON_SIZE,
  TOAST_MESSAGE_MAX_LINES,
  TOAST_MESSAGE_OPACITY,
  TOAST_TITLE_MAX_LINES,
  TOAST_TITLE_OPACITY,
  TOAST_TYPE_COLORS,
  TOAST_TYPE_ICONS,
  withToastAlpha,
} from './toast-design';

type ToastCardProps = {
  record: ToastRecord;
  stackIndex: number;
  onVisible: (id: ToastId) => void;
  onDismissRequest: (id: ToastId) => void;
  onRemove: (id: ToastId) => void;
};

export function ToastCard({
  record,
  stackIndex,
  onVisible,
  onDismissRequest,
  onRemove,
}: ToastCardProps) {
  const { width } = useWindowDimensions();
  const visibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateY = useSharedValue(TOAST_ENTER_TRANSLATE_Y);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(TOAST_ENTER_SCALE);

  const typeColor = TOAST_TYPE_COLORS[record.kind];
  const iconName = TOAST_TYPE_ICONS[
    record.kind
  ] as keyof typeof MaterialIcons.glyphMap;
  const cardWidth = width - TOAST_HORIZONTAL_MARGIN * 2;

  useEffect(() => {
    return () => {
      if (visibilityTimerRef.current) {
        clearTimeout(visibilityTimerRef.current);
      }

      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }

      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (record.phase !== 'entering') {
      return;
    }

    opacity.value = withTiming(1, {
      duration: TOAST_ENTER_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    translateY.value = withTiming(0, {
      duration: TOAST_ENTER_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(1, {
      duration: TOAST_ENTER_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });

    visibilityTimerRef.current = setTimeout(() => {
      onVisible(record.id);
    }, TOAST_ENTER_DURATION_MS);

    return () => {
      if (visibilityTimerRef.current) {
        clearTimeout(visibilityTimerRef.current);
        visibilityTimerRef.current = null;
      }
    };
  }, [onVisible, opacity, record.id, record.phase, scale, translateY]);

  useEffect(() => {
    if (record.phase !== 'visible') {
      return;
    }

    autoDismissTimerRef.current = setTimeout(() => {
      onDismissRequest(record.id);
    }, record.durationMs);

    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = null;
      }
    };
  }, [onDismissRequest, record.durationMs, record.id, record.phase]);

  useEffect(() => {
    if (record.phase !== 'exiting') {
      return;
    }

    opacity.value = withTiming(0, {
      duration: TOAST_EXIT_DURATION_MS,
      easing: Easing.in(Easing.cubic),
    });
    translateY.value = withTiming(
      Math.min(translateY.value - 18, TOAST_EXIT_TRANSLATE_Y),
      {
        duration: TOAST_EXIT_DURATION_MS,
        easing: Easing.in(Easing.cubic),
      }
    );

    dismissTimerRef.current = setTimeout(() => {
      onRemove(record.id);
    }, TOAST_EXIT_DURATION_MS);

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [onRemove, opacity, record.id, record.phase, translateY]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(record.phase !== 'exiting')
        .onUpdate((event) => {
          if (event.translationY < 0) {
            translateY.value = event.translationY;
          }
        })
        .onEnd((event) => {
          if (
            shouldDismissToastGesture({
              translationY: event.translationY,
              velocityY: event.velocityY,
            })
          ) {
            runOnJS(onDismissRequest)(record.id);
            return;
          }

          translateY.value = withTiming(0, {
            duration: 180,
            easing: Easing.out(Easing.cubic),
          });
        }),
    [onDismissRequest, record.id, record.phase, translateY]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        layout={LinearTransition.duration(TOAST_ENTER_DURATION_MS)}
        style={[
          animatedStyle,
          {
            width: cardWidth,
            zIndex: 100 - stackIndex,
          },
        ]}
      >
        <BlurView
          tint="light"
          intensity={TOAST_BLUR_INTENSITY}
          style={{
            width: '100%',
            overflow: 'hidden',
            borderRadius: TOAST_BORDER_RADIUS,
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: withToastAlpha(typeColor, TOAST_BACKGROUND_OPACITY),
            }}
          />

          <View
            style={{
              minHeight: TOAST_CONTAINER_MIN_HEIGHT,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: TOAST_CONTAINER_PADDING_HORIZONTAL,
              paddingVertical: TOAST_CONTAINER_PADDING_VERTICAL,
            }}
          >
            <View
              style={{
                width: TOAST_ICON_SIZE + TOAST_ICON_PADDING,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons
                name={iconName}
                size={TOAST_ICON_SIZE}
                color={typeColor}
                style={{
                  opacity: TOAST_ICON_OPACITY,
                }}
              />
            </View>

            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                numberOfLines={TOAST_TITLE_MAX_LINES}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: 16,
                  lineHeight: 21,
                  fontWeight: '600',
                  color: withToastAlpha(typeColor, TOAST_TITLE_OPACITY),
                }}
              >
                {record.title}
              </Text>

              {record.message ? (
                <Text
                  numberOfLines={TOAST_MESSAGE_MAX_LINES}
                  style={{
                    width: '100%',
                    marginTop: 2,
                    textAlign: 'center',
                    fontSize: 14,
                    lineHeight: 18,
                    fontWeight: '500',
                    color: withToastAlpha(typeColor, TOAST_MESSAGE_OPACITY),
                  }}
                >
                  {record.message}
                </Text>
              ) : null}
            </View>

            <View
              style={{
                width: TOAST_ICON_SIZE + TOAST_ICON_PADDING,
              }}
            />
          </View>
        </BlurView>
      </Animated.View>
    </GestureDetector>
  );
}
