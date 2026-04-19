import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';

import { createLaunchScreenDesign } from './launch-screen-design';

type LaunchScreenProps = {
  onFirstLayout?: (event: LayoutChangeEvent) => void;
};

export function LaunchScreen({ onFirstLayout }: LaunchScreenProps) {
  const { tokens } = useEditorialPaperTheme();
  const design = useMemo(() => createLaunchScreenDesign(tokens), [tokens]);
  const motionProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(motionProgress, {
          toValue: 1,
          duration: design.motion.loopDurationMs / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(motionProgress, {
          toValue: 0,
          duration: design.motion.loopDurationMs / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [design.motion.loopDurationMs, motionProgress]);

  const symbolScale = motionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [design.motion.minimumScale, design.motion.maximumScale],
  });
  const innerOpacity = motionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      design.motion.minimumInnerOpacity,
      design.motion.maximumInnerOpacity,
    ],
  });
  const radialHighlightOpacity = motionProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.52, 0.72],
  });

  return (
    <View
      onLayout={onFirstLayout}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: design.backgroundColor,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 168,
          height: 168,
          borderRadius: 84,
          backgroundColor: design.radialHighlightColor,
          opacity: radialHighlightOpacity,
        }}
      />

      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          gap: design.spacing.symbolToWordmark,
        }}
      >
        <Animated.View
          style={{
            width: design.symbol.width,
            height: design.symbol.height,
            transform: [{ scale: symbolScale }],
          }}
        >
          <View
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 30,
              borderCurve: 'continuous',
              backgroundColor: design.symbol.outerColor,
              borderWidth: 1,
              borderColor: design.symbol.outerBorderColor,
              boxShadow: design.symbol.outerShadow,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: -4,
              left: (design.symbol.width - design.symbol.notchSize) / 2,
              width: design.symbol.notchSize,
              height: design.symbol.notchSize,
              borderRadius: design.symbol.notchSize / 2,
              backgroundColor: design.backgroundColor,
            }}
          />
          <Animated.View
            style={{
              position: 'absolute',
              top: 24,
              left: (design.symbol.width - design.symbol.innerWidth) / 2,
              width: design.symbol.innerWidth,
              height: design.symbol.innerHeight,
              borderRadius: 14,
              borderCurve: 'continuous',
              backgroundColor: design.symbol.innerColor,
              opacity: innerOpacity,
            }}
          />
        </Animated.View>

        <Text
          style={{
            color: design.wordmark.color,
            fontFamily: design.wordmark.fontFamily,
            fontSize: design.wordmark.fontSize,
            lineHeight: design.wordmark.lineHeight,
            fontWeight: '500',
            letterSpacing: design.wordmark.letterSpacing,
          }}
        >
          {design.wordmark.label}
        </Text>
      </View>
    </View>
  );
}
