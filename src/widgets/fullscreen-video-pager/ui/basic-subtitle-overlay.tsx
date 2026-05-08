import { memo, useRef, useSyncExternalStore } from 'react';
import { Text, View, type GestureResponderEvent } from 'react-native';

import type { Transcript, TranscriptToken } from '@/entities/transcript';
import { resolveCurrentTranscriptSentence } from '../model/current-transcript-sentence';
import { fullscreenVideoOverlayTheme } from '../model/fullscreen-video-overlay-theme';
import type { RowPlaybackSeekBarStore } from '../model/row-playback-seek-bar-store';
import { getTranscriptTokenTrailingText } from '../model/transcript-token-display';

type BasicSubtitleOverlayProps = {
  maxTextWidth: number;
  onTokenPress?: (token: TranscriptToken) => void;
  seekBarStore: RowPlaybackSeekBarStore;
  transcript: Transcript | null;
};

function BasicSubtitleOverlayComponent({
  maxTextWidth,
  onTokenPress,
  seekBarStore,
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

  if (currentSentence === null) {
    return null;
  }
  const currentTokens = currentSentence.sentence.tokens;
  const shouldRenderTokens = currentTokens.length > 0;

  const handleTokenPress = (token: TranscriptToken, event: GestureResponderEvent) => {
    event.stopPropagation?.();
    onTokenPress?.(token);
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        width: maxTextWidth,
        minHeight: fullscreenVideoOverlayTheme.subtitleText.lineHeight,
        justifyContent: 'flex-end',
      }}
    >
      <Text
        allowFontScaling={false}
        selectable={false}
        style={{
          width: maxTextWidth,
          fontSize: fullscreenVideoOverlayTheme.subtitleText.fontSize,
          lineHeight: fullscreenVideoOverlayTheme.subtitleText.lineHeight,
          fontWeight: '500',
          color: 'rgba(246,242,232,0.9)',
          textShadowColor: 'rgba(12,9,7,0.22)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }}
      >
        {shouldRenderTokens
          ? currentTokens.map((token, index) => {
              const nextToken = currentTokens[index + 1] ?? null;
              const trailingText = getTranscriptTokenTrailingText(token, nextToken);
              const tokenText = `${token.text}${trailingText}`;
              const canPressToken =
                !!onTokenPress && token.semanticElement.coarseId !== null;

              return (
                <Text
                  key={`${token.index}:${token.start}:${token.end}`}
                  onPress={
                    canPressToken
                      ? (event) => {
                          handleTokenPress(token, event);
                        }
                      : undefined
                  }
                >
                  {tokenText}
                </Text>
              );
            })
          : currentSentence.sentence.text}
      </Text>
    </View>
  );
}

export const BasicSubtitleOverlay = memo(BasicSubtitleOverlayComponent);
