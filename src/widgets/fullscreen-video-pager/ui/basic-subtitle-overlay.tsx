import { memo, useRef, useSyncExternalStore } from 'react';
import { Text, View } from 'react-native';

import type { Transcript } from '@/entities/transcript';
import { resolveCurrentTranscriptSentence } from '../model/current-transcript-sentence';
import { fullscreenVideoOverlayTheme } from '../model/fullscreen-video-overlay-theme';
import type { RowPlaybackSeekBarStore } from '../model/row-playback-seek-bar-store';

type BasicSubtitleOverlayProps = {
  maxTextWidth: number;
  seekBarStore: RowPlaybackSeekBarStore;
  shouldReserveSpace: boolean;
  transcript: Transcript | null;
};

const subtitleLineCount = 2;

function BasicSubtitleOverlayComponent({
  maxTextWidth,
  seekBarStore,
  shouldReserveSpace,
  transcript,
}: BasicSubtitleOverlayProps) {
  const previousSentenceIndexRef = useRef<number | null>(null);
  const previousTranscriptRef = useRef<Transcript | null>(null);
  const storeSnapshot = useSyncExternalStore(
    seekBarStore.subscribe,
    seekBarStore.getSnapshot,
    seekBarStore.getSnapshot
  );

  if (previousTranscriptRef.current !== transcript) {
    previousTranscriptRef.current = transcript;
    previousSentenceIndexRef.current = null;
  }

  if (!shouldReserveSpace) {
    return null;
  }

  const subtitleHeight =
    fullscreenVideoOverlayTheme.subtitleText.lineHeight * subtitleLineCount;
  const currentTimeMs =
    storeSnapshot.progressSnapshot === null
      ? Number.NaN
      : storeSnapshot.progressSnapshot.currentTimeSeconds * 1000;
  const currentSentence =
    transcript === null
      ? null
      : resolveCurrentTranscriptSentence({
          currentTimeMs,
          previousIndex: previousSentenceIndexRef.current,
          sentences: transcript.sentences,
        });
  previousSentenceIndexRef.current = currentSentence?.index ?? null;
  const subtitleText = currentSentence?.sentence.text ?? ' ';
  const hasSubtitleText = currentSentence !== null;

  return (
    <View
      pointerEvents="none"
      style={{
        width: maxTextWidth,
        height: subtitleHeight,
        justifyContent: 'flex-end',
      }}
    >
      <Text
        allowFontScaling={false}
        numberOfLines={2}
        selectable={false}
        style={{
          width: maxTextWidth,
          fontSize: fullscreenVideoOverlayTheme.subtitleText.fontSize,
          lineHeight: fullscreenVideoOverlayTheme.subtitleText.lineHeight,
          fontWeight: '700',
          color: 'rgba(251,247,238,0.98)',
          opacity: hasSubtitleText ? 1 : 0,
          textShadowColor: 'rgba(17,13,10,0.34)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        }}
      >
        {subtitleText}
      </Text>
    </View>
  );
}

export const BasicSubtitleOverlay = memo(BasicSubtitleOverlayComponent);
