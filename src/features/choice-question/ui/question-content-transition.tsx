import { useEffect, useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const CONTENT_CROSSFADE_DURATION_MS = 260;
const contentTransitionEasing = Easing.out(Easing.cubic);

function QuestionContentTransitionFrame({
  incomingContent,
  onTransitionEnd,
  outgoingContent,
}: {
  incomingContent: ReactNode;
  onTransitionEnd?: () => void;
  outgoingContent?: ReactNode | null;
}) {
  const hasOutgoingContent = outgoingContent !== null && outgoingContent !== undefined;
  const incomingOpacity = useSharedValue(hasOutgoingContent ? 0 : 1);
  const previousOpacity = useSharedValue(hasOutgoingContent ? 1 : 0);
  const transitionEndRef = useRef(onTransitionEnd);

  transitionEndRef.current = onTransitionEnd;

  useEffect(() => {
    if (!hasOutgoingContent) {
      incomingOpacity.value = 1;
      previousOpacity.value = 0;
      return;
    }

    previousOpacity.value = withTiming(0, {
      duration: CONTENT_CROSSFADE_DURATION_MS,
      easing: contentTransitionEasing,
    });
    incomingOpacity.value = withTiming(1, {
      duration: CONTENT_CROSSFADE_DURATION_MS,
      easing: contentTransitionEasing,
    });

    const transitionEndTimer = setTimeout(() => {
      transitionEndRef.current?.();
    }, CONTENT_CROSSFADE_DURATION_MS);

    return () => {
      clearTimeout(transitionEndTimer);
    };
  }, [
    hasOutgoingContent,
    incomingOpacity,
    previousOpacity,
  ]);

  const incomingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: incomingOpacity.value,
  }));
  const previousAnimatedStyle = useAnimatedStyle(() => ({
    opacity: previousOpacity.value,
  }));

  return (
    <View style={{ position: 'relative' }}>
      {outgoingContent ? (
        <Animated.View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              right: 0,
              left: 0,
            },
            previousAnimatedStyle,
          ]}
          testID="question-content-previous"
        >
          {outgoingContent}
        </Animated.View>
      ) : null}
      <Animated.View
        style={incomingAnimatedStyle}
        testID="question-content-current"
      >
        {incomingContent}
      </Animated.View>
    </View>
  );
}

export function QuestionContentTransition({
  incomingContent,
  onTransitionEnd,
  outgoingContent,
  transitionKey,
}: {
  incomingContent: ReactNode;
  onTransitionEnd?: () => void;
  outgoingContent?: ReactNode | null;
  transitionKey: string;
}) {
  return (
    <QuestionContentTransitionFrame
      incomingContent={incomingContent}
      key={transitionKey}
      onTransitionEnd={onTransitionEnd}
      outgoingContent={outgoingContent}
    />
  );
}
