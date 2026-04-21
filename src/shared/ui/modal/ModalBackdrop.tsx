import { Pressable, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  MODAL_BACKDROP_COLOR,
  MODAL_BACKDROP_ENTER_DURATION_MS,
  MODAL_BACKDROP_EXIT_DURATION_MS,
  MODAL_BACKDROP_TARGET_OPACITY,
} from './modal-design';

type ModalBackdropProps = {
  visible: boolean;
  onPress: () => void;
};

export function ModalBackdrop({
  visible,
  onPress,
}: ModalBackdropProps) {
  const [isRendered, setIsRendered] = useState(visible);
  const opacity = useSharedValue(visible ? MODAL_BACKDROP_TARGET_OPACITY : 0);

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      opacity.value = withTiming(MODAL_BACKDROP_TARGET_OPACITY, {
        duration: MODAL_BACKDROP_ENTER_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    opacity.value = withTiming(
      0,
      {
        duration: MODAL_BACKDROP_EXIT_DURATION_MS,
        easing: Easing.in(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
        }
      }
    );
  }, [opacity, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!isRendered) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: MODAL_BACKDROP_COLOR,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={StyleSheet.absoluteFillObject}
      />
    </Animated.View>
  );
}
