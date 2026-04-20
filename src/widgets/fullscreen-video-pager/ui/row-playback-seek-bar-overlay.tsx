import { memo } from 'react';
import { Text, View } from 'react-native';
import { GestureDetector, type GestureType } from 'react-native-gesture-handler';

import {
  resolveSeekBarControlLaneFrame,
  resolveSeekBarRailMetrics,
  seekBarLabelWidth,
  seekBarActiveThumbDiameter,
  seekBarRailHeight,
  seekBarThumbDiameter,
} from '../model/seek-bar-layout';

type RowPlaybackSeekBarOverlayProps = {
  bottomInset: number;
  bufferedRatio: number;
  displayCurrentTime: number;
  displayRatio: number;
  displayTotalDuration: number;
  isInteractive: boolean;
  isScrubbing: boolean;
  railGesture?: GestureType | null;
  width: number;
};

function formatSeekBarTime(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function RowPlaybackSeekBarOverlayComponent({
  bottomInset,
  bufferedRatio,
  displayCurrentTime,
  displayRatio,
  displayTotalDuration,
  isInteractive,
  isScrubbing,
  railGesture,
  width,
}: RowPlaybackSeekBarOverlayProps) {
  const controlLaneFrame = resolveSeekBarControlLaneFrame({
    bottomInset,
    width,
  });
  const { railWidth } = resolveSeekBarRailMetrics(width);
  const thumbSize = isScrubbing ? seekBarActiveThumbDiameter : seekBarThumbDiameter;
  const bufferedWidth = railWidth * Math.max(0, Math.min(1, bufferedRatio));
  const playedWidth = railWidth * Math.max(0, Math.min(1, displayRatio));
  const thumbLeft = Math.max(0, Math.min(railWidth - thumbSize, playedWidth - thumbSize / 2));
  const railContent = (
    <View
      style={{
        flex: 1,
        height: controlLaneFrame.height,
        justifyContent: 'center',
        opacity: isInteractive ? 1 : 0.86,
      }}
    >
      <View
        style={{
          height: seekBarRailHeight,
          borderRadius: 999,
          backgroundColor: 'rgba(251,247,238,0.20)',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: bufferedWidth,
            borderRadius: 999,
            backgroundColor: 'rgba(251,247,238,0.34)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: playedWidth,
            borderRadius: 999,
            backgroundColor: 'rgba(251,247,238,0.94)',
          }}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          left: thumbLeft,
          top: (controlLaneFrame.height - thumbSize) / 2,
          width: thumbSize,
          height: thumbSize,
          borderRadius: thumbSize / 2,
          backgroundColor: 'rgba(251,247,238,0.98)',
          shadowColor: 'rgba(17,13,10,0.28)',
          shadowOffset: { width: 1, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 2,
        }}
      />
    </View>
  );

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: controlLaneFrame.left,
        right: controlLaneFrame.right,
        bottom: controlLaneFrame.bottom,
        height: controlLaneFrame.height,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text
        pointerEvents="none"
        selectable={false}
        style={{
          width: seekBarLabelWidth,
          fontSize: 12,
          lineHeight: 16,
          fontWeight: '600',
          color: 'rgba(251,247,238,0.96)',
          fontVariant: ['tabular-nums'],
          textShadowColor: 'rgba(17,13,10,0.22)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }}
      >
        {formatSeekBarTime(displayCurrentTime)}
      </Text>

      {railGesture ? (
        <GestureDetector gesture={railGesture}>{railContent}</GestureDetector>
      ) : (
        railContent
      )}

      <Text
        pointerEvents="none"
        selectable={false}
        style={{
          width: seekBarLabelWidth,
          fontSize: 12,
          lineHeight: 16,
          fontWeight: '500',
          color: 'rgba(251,247,238,0.74)',
          fontVariant: ['tabular-nums'],
          textAlign: 'right',
          textShadowColor: 'rgba(17,13,10,0.18)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }}
      >
        {formatSeekBarTime(displayTotalDuration)}
      </Text>
    </View>
  );
}

export const RowPlaybackSeekBarOverlay = memo(RowPlaybackSeekBarOverlayComponent);
