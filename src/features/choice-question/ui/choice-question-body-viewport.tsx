import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ScrollView,
  type LayoutChangeEvent,
  View,
} from 'react-native';
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

export type ChoiceQuestionBodyViewportHeightProfile =
  keyof typeof QUESTION_VIEWPORT_HEIGHT_DURATIONS_MS;

function resolveViewportTargetHeight({
  contentHeight,
  contentMaxHeight,
}: {
  contentHeight: number;
  contentMaxHeight: number;
}) {
  if (contentHeight <= 0) {
    return 0;
  }

  if (!Number.isFinite(contentMaxHeight)) {
    return contentHeight;
  }

  return Math.min(contentHeight, contentMaxHeight);
}

export function ChoiceQuestionBodyViewport({
  children,
  contentMaxHeight,
  footer,
  footerGap = 0,
  heightAnimationProfile = 'answerReveal',
  transitionKey,
}: {
  children: ReactNode;
  contentMaxHeight: number;
  footer?: ReactNode;
  footerGap?: number;
  heightAnimationProfile?: ChoiceQuestionBodyViewportHeightProfile;
  transitionKey: string;
}) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const [hasMeasuredHeight, setHasMeasuredHeight] = useState(false);
  const viewportHeight = useSharedValue(0);
  const resolvedContentMaxHeight = Number.isFinite(contentMaxHeight)
    ? Math.max(0, contentMaxHeight)
    : Number.POSITIVE_INFINITY;
  const hasFooter = footer !== null && footer !== undefined;
  const resolvedFooterGap = hasFooter && footerHeight > 0 ? footerGap : 0;
  const footerSpace = hasFooter ? footerHeight + resolvedFooterGap : 0;
  const totalContentHeight = contentHeight + footerSpace;
  const scrollContentMaxHeight = Number.isFinite(resolvedContentMaxHeight)
    ? Math.max(0, resolvedContentMaxHeight - footerSpace)
    : Number.POSITIVE_INFINITY;
  const targetHeight = resolveViewportTargetHeight({
    contentHeight: totalContentHeight,
    contentMaxHeight: resolvedContentMaxHeight,
  });
  const isScrollable =
    Number.isFinite(resolvedContentMaxHeight) &&
    contentHeight > scrollContentMaxHeight;
  const scrollViewMaxHeight = Number.isFinite(scrollContentMaxHeight)
    ? scrollContentMaxHeight
    : undefined;

  useEffect(() => {
    scrollViewRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  }, [transitionKey]);

  useEffect(() => {
    if (hasFooter) {
      return;
    }

    setFooterHeight(0);
  }, [hasFooter]);

  useEffect(() => {
    if (targetHeight <= 0) {
      return;
    }

    if (!hasMeasuredHeight) {
      viewportHeight.value = targetHeight;
      setHasMeasuredHeight(true);
      return;
    }

    viewportHeight.value = withTiming(targetHeight, {
      duration: QUESTION_VIEWPORT_HEIGHT_DURATIONS_MS[heightAnimationProfile],
      easing: viewportEasing,
    });
  }, [
    hasMeasuredHeight,
    heightAnimationProfile,
    targetHeight,
    viewportHeight,
  ]);

  const viewportAnimatedStyle = useAnimatedStyle(() => {
    if (!hasMeasuredHeight) {
      return {};
    }

    return {
      height: viewportHeight.value,
    };
  });

  function handleContentLayout(event: LayoutChangeEvent) {
    const nextHeight = event.nativeEvent.layout.height;

    if (nextHeight <= 0 || nextHeight === contentHeight) {
      return;
    }

    setContentHeight(nextHeight);
  }

  function handleFooterLayout(event: LayoutChangeEvent) {
    const nextHeight = event.nativeEvent.layout.height;

    if (nextHeight <= 0 || nextHeight === footerHeight) {
      return;
    }

    setFooterHeight(nextHeight);
  }

  return (
    <Animated.View
      style={[
        {
          overflow: hasMeasuredHeight ? 'hidden' : 'visible',
        },
        viewportAnimatedStyle,
      ]}
      testID="choice-question-body-viewport"
    >
      <ScrollView
        bounces={isScrollable}
        ref={scrollViewRef}
        scrollEnabled={isScrollable}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={{
          maxHeight: scrollViewMaxHeight,
        }}
        testID="choice-question-body-scroll"
      >
        <Animated.View
          onLayout={handleContentLayout}
          testID="choice-question-body-content"
        >
          {children}
        </Animated.View>
      </ScrollView>
      {hasFooter ? (
        <View
          onLayout={handleFooterLayout}
          style={{
            marginTop: resolvedFooterGap,
          }}
          testID="choice-question-body-footer"
        >
          {footer}
        </View>
      ) : null}
    </Animated.View>
  );
}
