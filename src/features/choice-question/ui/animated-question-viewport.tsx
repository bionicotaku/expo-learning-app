import { useState, type ReactNode } from 'react';
import { type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const QUESTION_VIEWPORT_HEIGHT_DURATIONS_MS = {
  answerReveal: 200,
  questionSwitch: 200,
} as const;
const viewportEasing = Easing.out(Easing.cubic);

export type AnimatedQuestionViewportHeightProfile =
  keyof typeof QUESTION_VIEWPORT_HEIGHT_DURATIONS_MS;

export function AnimatedQuestionViewport({
  children,
  heightAnimationProfile = 'answerReveal',
}: {
  children: ReactNode;
  heightAnimationProfile?: AnimatedQuestionViewportHeightProfile;
}) {
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const hasMeasuredHeight = measuredHeight > 0;
  const viewportHeight = useSharedValue(0);

  const viewportAnimatedStyle = useAnimatedStyle(() => {
    if (!hasMeasuredHeight) {
      return {};
    }

    return {
      height: viewportHeight.value,
    };
  });

  function handleViewportLayout(event: LayoutChangeEvent) {
    const nextHeight = event.nativeEvent.layout.height;

    if (nextHeight <= 0 || nextHeight === measuredHeight) {
      return;
    }

    const hasPreviousHeight = measuredHeight > 0;
    const heightAnimationDurationMs =
      QUESTION_VIEWPORT_HEIGHT_DURATIONS_MS[heightAnimationProfile];

    setMeasuredHeight(nextHeight);

    if (!hasPreviousHeight) {
      viewportHeight.value = nextHeight;
      return;
    }

    viewportHeight.value = withTiming(nextHeight, {
      duration: heightAnimationDurationMs,
      easing: viewportEasing,
    });
  }

  return (
    <Animated.View
      style={[
        {
          overflow: hasMeasuredHeight ? 'hidden' : 'visible',
        },
        viewportAnimatedStyle,
      ]}
    >
      <Animated.View onLayout={handleViewportLayout}>{children}</Animated.View>
    </Animated.View>
  );
}
