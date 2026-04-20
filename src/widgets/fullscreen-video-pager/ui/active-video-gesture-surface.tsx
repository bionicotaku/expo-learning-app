import { memo, useMemo, useRef } from 'react';
import { Gesture, GestureDetector, Pressable } from 'react-native-gesture-handler';

import type {
  FullscreenHoldZone,
  FullscreenTapZone,
} from '@/features/video-playback';
import {
  resolveFullscreenHoldZone,
  resolveFullscreenTapZone,
} from '@/features/video-playback';

const doubleTapMaxDelayMs = 250;
const longPressMinDurationMs = 320;
const gestureMaxDistance = 20;

type ActiveVideoGestureSurfaceProps = {
  accessibilityLabel: string;
  onDoubleTap: (zone: FullscreenTapZone) => void;
  onHoldEnd: () => void;
  onHoldStart: (zone: FullscreenHoldZone) => void;
  onSingleTap: () => void;
  width: number;
};

function ActiveVideoGestureSurfaceComponent({
  accessibilityLabel,
  onDoubleTap,
  onHoldEnd,
  onHoldStart,
  onSingleTap,
  width,
}: ActiveVideoGestureSurfaceProps) {
  const didActivateHoldRef = useRef(false);
  const gesture = useMemo(() => {
    const doubleTap = Gesture.Tap()
      .runOnJS(true)
      .numberOfTaps(2)
      .maxDuration(220)
      .maxDelay(doubleTapMaxDelayMs)
      .maxDistance(gestureMaxDistance)
      .onEnd((event, success) => {
        if (success) {
          onDoubleTap(resolveFullscreenTapZone(event.x, width));
        }
      });

    const longPress = Gesture.LongPress()
      .runOnJS(true)
      .minDuration(longPressMinDurationMs)
      .maxDistance(gestureMaxDistance)
      .onStart((event) => {
        didActivateHoldRef.current = true;
        onHoldStart(resolveFullscreenHoldZone(event.x, width));
      })
      .onFinalize(() => {
        if (!didActivateHoldRef.current) {
          return;
        }

        didActivateHoldRef.current = false;
        onHoldEnd();
      });

    return {
      doubleTap,
      longPress,
      exclusiveGesture: Gesture.Exclusive(longPress, doubleTap),
    };
  }, [onDoubleTap, onHoldEnd, onHoldStart, width]);

  return (
    <GestureDetector gesture={gesture.exclusiveGesture}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={onSingleTap}
        requireExternalGestureToFail={[gesture.longPress, gesture.doubleTap]}
        style={{
          position: 'absolute',
          inset: 0,
        }}
      />
    </GestureDetector>
  );
}

export const ActiveVideoGestureSurface = memo(ActiveVideoGestureSurfaceComponent);
