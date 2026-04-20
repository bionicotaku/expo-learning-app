import { memo, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector, Pressable, type GestureType } from 'react-native-gesture-handler';

import {
  resolveFullscreenHoldZone,
  resolveFullscreenTapZone,
  type FullscreenHoldZone,
  type FullscreenTapZone,
} from '@/features/video-playback';
import type { FullscreenActivePlayerSurfaceState } from '../model/active-player-controller';
import {
  type RowPlaybackSeekBarStore,
  type RowPlaybackSeekBarStoreSnapshot,
} from '../model/row-playback-seek-bar-store';
import {
  resolveSeekBarControlLaneFrame,
  resolveSeekBarRailMetrics,
  seekBarDragActivationDistance,
  seekBarTapMaxDistance,
  seekBarTapMaxDurationMs,
} from '../model/seek-bar-layout';
import { resolveSeekBarTargetFromRailX } from '../model/seek-bar-target';
import { RowPlaybackSeekBarOverlay } from './row-playback-seek-bar-overlay';

const backgroundDoubleTapMaxDelayMs = 250;
const backgroundLongPressMinDurationMs = 320;
const backgroundGestureMaxDistance = 20;

type RowPlaybackInteractionLayerProps = {
  accessibilityLabel: string;
  bottomInset: number;
  onDoubleTap: (zone: FullscreenTapZone) => void;
  onHoldEnd: () => void;
  onHoldStart: (zone: FullscreenHoldZone) => void;
  onSingleTap: () => void;
  seekBarStore: RowPlaybackSeekBarStore;
  shouldEnableBackgroundGestures: boolean;
  surfaceState: FullscreenActivePlayerSurfaceState | null;
  width: number;
};

type BackgroundGestureRegionProps = {
  accessibilityLabel: string;
  bottom: number;
  onDoubleTap: (zone: FullscreenTapZone) => void;
  onHoldEnd: () => void;
  onHoldStart: (zone: FullscreenHoldZone) => void;
  onSingleTap: () => void;
  width: number;
};

type SeekBarControlLaneProps = {
  bottomInset: number;
  bufferedRatio: number;
  displayCurrentTime: number;
  displayRatio: number;
  displayTotalDuration: number;
  isInteractive: boolean;
  isScrubbing: boolean;
  railGesture?: GestureType | null;
  shouldRender: boolean;
  width: number;
};

function BackgroundGestureRegion({
  accessibilityLabel,
  bottom,
  onDoubleTap,
  onHoldEnd,
  onHoldStart,
  onSingleTap,
  width,
}: BackgroundGestureRegionProps) {
  const didActivateHoldRef = useRef(false);
  const gesture = useMemo(() => {
    const doubleTap = Gesture.Tap()
      .runOnJS(true)
      .numberOfTaps(2)
      .maxDuration(220)
      .maxDelay(backgroundDoubleTapMaxDelayMs)
      .maxDistance(backgroundGestureMaxDistance)
      .onEnd((event, success) => {
        if (success) {
          onDoubleTap(resolveFullscreenTapZone(event.x, width));
        }
      });

    const longPress = Gesture.LongPress()
      .runOnJS(true)
      .minDuration(backgroundLongPressMinDurationMs)
      .maxDistance(backgroundGestureMaxDistance)
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
          left: 0,
          right: 0,
          top: 0,
          bottom,
        }}
      />
    </GestureDetector>
  );
}

function SeekBarControlLane({
  bottomInset,
  bufferedRatio,
  displayCurrentTime,
  displayRatio,
  displayTotalDuration,
  isInteractive,
  isScrubbing,
  railGesture,
  shouldRender,
  width,
}: SeekBarControlLaneProps) {
  if (!shouldRender) {
    return null;
  }

  return (
    <RowPlaybackSeekBarOverlay
      bottomInset={bottomInset}
      bufferedRatio={bufferedRatio}
      displayCurrentTime={displayCurrentTime}
      displayRatio={displayRatio}
      displayTotalDuration={displayTotalDuration}
      isInteractive={isInteractive}
      isScrubbing={isScrubbing}
      railGesture={railGesture}
      width={width}
    />
  );
}

function RowPlaybackInteractionLayerComponent({
  accessibilityLabel,
  bottomInset,
  onDoubleTap,
  onHoldEnd,
  onHoldStart,
  onSingleTap,
  seekBarStore,
  shouldEnableBackgroundGestures,
  surfaceState,
  width,
}: RowPlaybackInteractionLayerProps) {
  const storeSnapshot = useSyncExternalStore<RowPlaybackSeekBarStoreSnapshot>(
    seekBarStore.subscribe,
    seekBarStore.getSnapshot,
    seekBarStore.getSnapshot
  );
  const [draftRatio, setDraftRatio] = useState(0);
  const [draftSeconds, setDraftSeconds] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const progressSnapshotRef = useRef(storeSnapshot.progressSnapshot);
  const seekControllerRef = useRef(storeSnapshot.seekController);
  const draftRatioRef = useRef(0);
  const controlLaneFrame = resolveSeekBarControlLaneFrame({
    bottomInset,
    width,
  });
  const { railWidth } = resolveSeekBarRailMetrics(width);
  const progressSnapshot = storeSnapshot.progressSnapshot;

  useEffect(() => {
    progressSnapshotRef.current = storeSnapshot.progressSnapshot;
  }, [storeSnapshot.progressSnapshot]);

  useEffect(() => {
    seekControllerRef.current = storeSnapshot.seekController;
  }, [storeSnapshot.seekController]);

  useEffect(() => {
    if (surfaceState !== 'ready' && isScrubbing) {
      setIsScrubbing(false);
    }
  }, [isScrubbing, surfaceState]);

  const durationSeconds = progressSnapshot?.durationSeconds ?? 0;
  const bufferedRatio = progressSnapshot?.bufferedRatio ?? 0;
  const playedRatio = progressSnapshot?.playedRatio ?? 0;
  const currentTimeSeconds = progressSnapshot?.currentTimeSeconds ?? 0;
  const hasValidSnapshot =
    !!progressSnapshot &&
    surfaceState !== 'error' &&
    Number.isFinite(durationSeconds) &&
    durationSeconds > 0 &&
    Number.isFinite(playedRatio) &&
    Number.isFinite(bufferedRatio);
  const shouldRenderSeekBar = hasValidSnapshot;
  const isInteractive =
    hasValidSnapshot &&
    surfaceState === 'ready' &&
    railWidth > 0 &&
    !!storeSnapshot.seekController;
  const displayRatio = isScrubbing ? draftRatio : playedRatio;
  const displayCurrentTime = isScrubbing ? draftSeconds : currentTimeSeconds;
  const displayTotalDuration = durationSeconds;

  const resolveTargetFromRailX = useCallback(
    (railX: number) => {
      return resolveSeekBarTargetFromRailX(railX, railWidth, durationSeconds);
    },
    [durationSeconds, railWidth]
  );

  const updateDraftFromRailX = useCallback(
    (railX: number) => {
      const { ratio, targetSeconds } = resolveTargetFromRailX(railX);
      draftRatioRef.current = ratio;
      setDraftRatio(ratio);
      setDraftSeconds(targetSeconds);
    },
    [resolveTargetFromRailX]
  );

  const commitSeek = useCallback(
    (targetSeconds: number) => {
      const fallbackSnapshot = progressSnapshotRef.current;

      if (!seekControllerRef.current) {
        return;
      }

      seekBarStore.applyOptimisticSeek(targetSeconds);
      const didSeek = seekControllerRef.current.seekTo(targetSeconds);
      if (!didSeek) {
        seekBarStore.setProgressSnapshot(fallbackSnapshot);
      }
    },
    [seekBarStore]
  );

  const railGesture = useMemo<GestureType | null>(() => {
    if (!isInteractive) {
      return null;
    }

    const panGesture = Gesture.Pan()
      .minDistance(seekBarDragActivationDistance)
      .runOnJS(true)
      .onStart((event) => {
        setIsScrubbing(true);
        updateDraftFromRailX(event.x);
      })
      .onUpdate((event) => {
        updateDraftFromRailX(event.x);
      })
      .onEnd(() => {
        const targetSeconds = displayTotalDuration * draftRatioRef.current;
        commitSeek(targetSeconds);
      })
      .onFinalize(() => {
        setIsScrubbing(false);
      });

    const tapGesture = Gesture.Tap()
      .maxDistance(seekBarTapMaxDistance)
      .maxDuration(seekBarTapMaxDurationMs)
      .runOnJS(true)
      .onEnd((event, success) => {
        if (!success) {
          return;
        }

        const { targetSeconds } = resolveTargetFromRailX(event.x);
        commitSeek(targetSeconds);
      });

    return Gesture.Exclusive(panGesture, tapGesture) as unknown as GestureType;
  }, [
    commitSeek,
    displayTotalDuration,
    isInteractive,
    resolveTargetFromRailX,
    updateDraftFromRailX,
  ]);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        inset: 0,
      }}
    >
      {shouldEnableBackgroundGestures ? (
        <BackgroundGestureRegion
          accessibilityLabel={accessibilityLabel}
          bottom={controlLaneFrame.top}
          onDoubleTap={onDoubleTap}
          onHoldEnd={onHoldEnd}
          onHoldStart={onHoldStart}
          onSingleTap={onSingleTap}
          width={width}
        />
      ) : null}

      <SeekBarControlLane
        bottomInset={bottomInset}
        bufferedRatio={bufferedRatio}
        displayCurrentTime={displayCurrentTime}
        displayRatio={displayRatio}
        displayTotalDuration={displayTotalDuration}
        isInteractive={isInteractive}
        isScrubbing={isScrubbing}
        railGesture={railGesture}
        shouldRender={shouldRenderSeekBar}
        width={width}
      />
    </View>
  );
}

export const RowPlaybackInteractionLayer = memo(RowPlaybackInteractionLayerComponent);
