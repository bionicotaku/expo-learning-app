import { memo, useMemo, useRef, useSyncExternalStore } from 'react';
import { Text, View, type GestureResponderEvent } from 'react-native';

import type { Transcript, TranscriptToken } from '@/entities/transcript';
import type { SubtitleDisplayMode } from '@/features/playback-settings';
import { resolveCurrentTranscriptSentence } from '../model/current-transcript-sentence';
import { resolveCurrentTranscriptToken } from '../model/current-transcript-token';
import { fullscreenVideoOverlayTheme } from '../model/fullscreen-video-overlay-theme';
import type { RowPlaybackSeekBarStore } from '../model/row-playback-seek-bar-store';
import { getTranscriptTokenTrailingText } from '../model/transcript-token-display';

type BasicSubtitleOverlayProps = {
  displayMode: SubtitleDisplayMode;
  maxTextWidth: number;
  onTokenPress?: (token: TranscriptToken) => void;
  seekBarStore: RowPlaybackSeekBarStore;
  transcript: Transcript;
};

const activeSubtitleTokenStyle = {
  color: 'rgba(255,226,135,0.98)',
  textShadowColor: 'rgba(74,44,0,0.42)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 3,
} as const;

function BasicSubtitleOverlayComponent({
  displayMode,
  maxTextWidth,
  onTokenPress,
  seekBarStore,
  transcript,
}: BasicSubtitleOverlayProps) {
  const previousSentenceIndexRef = useRef<number | null>(null);
  const previousTokenIndexRef = useRef<number | null>(null);
  const previousTranscriptRef = useRef<Transcript | null>(null);
  const storeSnapshot = useSyncExternalStore(
    seekBarStore.subscribe,
    seekBarStore.getSnapshot,
    seekBarStore.getSnapshot
  );

  if (previousTranscriptRef.current !== transcript) {
    previousTranscriptRef.current = transcript;
    previousSentenceIndexRef.current = null;
    previousTokenIndexRef.current = null;
  }

  const currentTimeMs =
    storeSnapshot.progressSnapshot === null
      ? Number.NaN
      : storeSnapshot.progressSnapshot.currentTimeSeconds * 1000;
  const currentSentence = resolveCurrentTranscriptSentence({
    currentTimeMs,
    previousIndex: previousSentenceIndexRef.current,
    sentences: transcript.sentences,
  });
  previousSentenceIndexRef.current = currentSentence?.index ?? null;

  const currentSentenceValue = currentSentence?.sentence ?? null;
  const currentTokens = currentSentenceValue?.tokens ?? [];
  const shouldRenderTokens = currentTokens.length > 0;
  const shouldRenderExplanation =
    displayMode === 'bilingual' &&
    currentSentenceValue !== null &&
    currentSentenceValue.explanation.length > 0;
  const currentToken = shouldRenderTokens
    ? resolveCurrentTranscriptToken({
        currentTimeMs,
        previousIndex: previousTokenIndexRef.current,
        tokens: currentTokens,
      })
    : null;
  previousTokenIndexRef.current = currentToken?.index ?? null;

  const handleTokenPress = (token: TranscriptToken, event: GestureResponderEvent) => {
    event.stopPropagation?.();
    onTokenPress?.(token);
  };
  const canPressToken = !!onTokenPress;
  const tokenDisplayParts = useMemo(() => {
    if (currentSentenceValue === null || currentSentenceValue.tokens.length === 0) {
      return [];
    }

    return currentSentenceValue.tokens.map((token, index) => {
      const nextToken = currentSentenceValue.tokens[index + 1] ?? null;
      const trailingText = getTranscriptTokenTrailingText(token, nextToken);

      return {
        canPress: canPressToken,
        key: `${token.index}:${token.start}:${token.end}`,
        text: `${token.text}${trailingText}`,
        token,
      };
    });
  }, [canPressToken, currentSentenceValue]);

  if (currentSentence === null) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        width: maxTextWidth,
        minHeight: fullscreenVideoOverlayTheme.subtitleText.lineHeight,
        justifyContent: 'flex-end',
        gap: 5,
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
          ? tokenDisplayParts.map((part, index) => {
              const isActiveToken = currentToken?.index === index;

              return (
                <Text
                  key={part.key}
                  onPress={
                    part.canPress
                      ? (event) => {
                          handleTokenPress(part.token, event);
                        }
                      : undefined
                  }
                  style={isActiveToken ? activeSubtitleTokenStyle : undefined}
                >
                  {part.text}
                </Text>
              );
            })
          : currentSentence.sentence.text}
      </Text>
      {shouldRenderExplanation ? (
        <Text
          allowFontScaling={false}
          selectable={false}
          style={{
            width: maxTextWidth,
            fontSize: 15,
            lineHeight: 19,
            fontWeight: '400',
            color: 'rgba(232,226,213,0.82)',
            textShadowColor: 'rgba(12,9,7,0.18)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {currentSentenceValue?.explanation}
        </Text>
      ) : null}
    </View>
  );
}

export const BasicSubtitleOverlay = memo(BasicSubtitleOverlayComponent);
