import { useEvent, useEventListener } from 'expo';
import { SymbolView } from 'expo-symbols';
import { useVideoPlayer } from 'expo-video';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { toast } from '@/shared/lib/toast';
import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import {
  EditorialTitle,
  MetaLabel,
} from '@/shared/ui/editorial-paper';

export type WordDetailDialogSection = {
  id: string;
  title: string;
  body: string;
};

export type WordDetailSentenceAudio = {
  endMs: number;
  startMs: number;
  videoUrl: string;
};

export type WordDetailDialogData = {
  title: string;
  subtitle?: string;
  sentenceAudio?: WordDetailSentenceAudio;
  sections: WordDetailDialogSection[];
};

type WordDetailDialogContentProps = {
  payload: WordDetailDialogData;
};

function WordDetailSection({
  body,
  title,
}: {
  body: string;
  title: string;
}) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <View
      style={{
        gap: tokens.spacing.sm,
        paddingVertical: tokens.spacing.xs,
      }}
    >
      <MetaLabel>{title}</MetaLabel>
      <Text
        selectable
        style={{
          color: tokens.color.inkSoft,
          fontSize: 14,
          fontWeight: '500',
          lineHeight: 23,
        }}
      >
        {body}
      </Text>
    </View>
  );
}

function WordDetailSentenceAudioPlayer({
  playRequestToken,
  sentenceAudio,
}: {
  playRequestToken: number;
  sentenceAudio: WordDetailSentenceAudio;
}) {
  const source = useMemo(
    () => ({
      contentType: 'hls' as const,
      uri: sentenceAudio.videoUrl,
    }),
    [sentenceAudio.videoUrl]
  );
  const player = useVideoPlayer(source, (instance) => {
    instance.loop = false;
    instance.muted = false;
    instance.timeUpdateEventInterval = 0.1;
  });
  const { status } = useEvent(player, 'statusChange', {
    status: player.status,
    error: undefined,
  });
  const startSeconds = Math.max(0, sentenceAudio.startMs / 1000);
  const endSeconds = Math.max(startSeconds, sentenceAudio.endMs / 1000);
  const lastErrorToastRequestRef = useRef(0);
  const showAudioErrorToast = useCallback(
    (requestToken: number) => {
      if (
        requestToken <= 0 ||
        lastErrorToastRequestRef.current === requestToken
      ) {
        return;
      }

      lastErrorToastRequestRef.current = requestToken;
      toast.show({
        kind: 'error',
        title: '音频加载失败',
      });
    },
    []
  );

  useEffect(() => {
    if (playRequestToken <= 0) {
      return;
    }

    if (status === 'error') {
      showAudioErrorToast(playRequestToken);
      return;
    }

    if (status !== 'readyToPlay') {
      return;
    }

    try {
      player.currentTime = startSeconds;
      player.play();
    } catch {
      showAudioErrorToast(playRequestToken);
    }
  }, [playRequestToken, player, showAudioErrorToast, startSeconds, status]);

  useEventListener(player, 'timeUpdate', (payload) => {
    if (playRequestToken <= 0 || payload.currentTime < endSeconds) {
      return;
    }

    player.pause();
    player.currentTime = startSeconds;
  });

  return null;
}

function WordDetailSentenceAudioButton({
  sentenceAudio,
}: {
  sentenceAudio: WordDetailSentenceAudio;
}) {
  const { tokens } = useEditorialPaperTheme();
  const [isPlayerMounted, setIsPlayerMounted] = useState(false);
  const [playRequestToken, setPlayRequestToken] = useState(0);
  const isAudioPlayable =
    sentenceAudio.videoUrl.length > 0 && sentenceAudio.endMs > sentenceAudio.startMs;
  const handlePress = useCallback(() => {
    if (!isAudioPlayable) {
      return;
    }

    setIsPlayerMounted(true);
    setPlayRequestToken((currentToken) => currentToken + 1);
  }, [isAudioPlayable]);

  return (
    <>
      <Pressable
        accessibilityLabel="播放本句音频"
        accessibilityRole="button"
        accessibilityState={{ disabled: !isAudioPlayable }}
        disabled={!isAudioPlayable}
        onPress={handlePress}
        style={({ pressed }) => ({
          width: 30,
          height: 30,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: tokens.radius.pill,
          backgroundColor: 'rgba(255,255,255,0.42)',
          opacity: !isAudioPlayable ? 0.48 : pressed ? 0.72 : 1,
        })}
      >
        <SymbolView
          fallback={
            <Text
              selectable={false}
              style={{
                color: tokens.color.inkMute,
                fontSize: 15,
                fontWeight: '800',
                lineHeight: 18,
              }}
            >
              ▶
            </Text>
          }
          name={{ ios: 'speaker.wave.2.fill' }}
          size={16}
          tintColor={tokens.color.inkMute}
          type="hierarchical"
          weight="semibold"
        />
      </Pressable>
      {isPlayerMounted ? (
        <WordDetailSentenceAudioPlayer
          playRequestToken={playRequestToken}
          sentenceAudio={sentenceAudio}
        />
      ) : null}
    </>
  );
}

function WordDetailFavoriteButton() {
  const { tokens } = useEditorialPaperTheme();
  const [isFavorited, setIsFavorited] = useState(false);
  const handlePress = useCallback(() => {
    setIsFavorited((currentValue) => !currentValue);
  }, []);

  return (
    <Pressable
      accessibilityLabel={isFavorited ? '取消收藏单词' : '收藏单词'}
      accessibilityRole="button"
      accessibilityState={{ selected: isFavorited }}
      onPress={handlePress}
      style={({ pressed }) => ({
        position: 'absolute',
        top: 0,
        right: 0,
        width: 34,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: tokens.radius.pill,
        backgroundColor: isFavorited
          ? 'rgba(232,181,63,0.18)'
          : 'rgba(255,255,255,0.42)',
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <SymbolView
        fallback={
          <Text
            selectable={false}
            style={{
              color: isFavorited ? '#D99B1F' : tokens.color.inkMute,
              fontSize: 17,
              fontWeight: '800',
              lineHeight: 20,
            }}
          >
            {isFavorited ? '★' : '☆'}
          </Text>
        }
        name={{ ios: isFavorited ? 'star.fill' : 'star' }}
        size={18}
        tintColor={isFavorited ? '#D99B1F' : tokens.color.inkMute}
        type="hierarchical"
        weight="semibold"
      />
    </Pressable>
  );
}

export function WordDetailDialogContent({
  payload,
}: WordDetailDialogContentProps) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <View style={{ gap: tokens.spacing.lg }}>
      <View
        style={{
          gap: tokens.spacing.xs,
          paddingRight: 44,
          position: 'relative',
        }}
      >
        <WordDetailFavoriteButton />
        <EditorialTitle
          selectable
          style={{
            fontSize: 34,
            lineHeight: 38,
            letterSpacing: -0.6,
          }}
          variant="title"
        >
          {payload.title}
        </EditorialTitle>
        {payload.subtitle ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: tokens.spacing.sm,
            }}
          >
            <Text
              selectable
              style={{
                color: tokens.color.inkMute,
                flexShrink: 1,
                fontSize: 14,
                fontWeight: '700',
                lineHeight: 18,
              }}
            >
              {payload.subtitle}
            </Text>
            {payload.sentenceAudio ? (
              <WordDetailSentenceAudioButton
                sentenceAudio={payload.sentenceAudio}
              />
            ) : null}
          </View>
        ) : null}
      </View>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: 380 }}
        contentContainerStyle={{
          gap: tokens.spacing.md,
        }}
      >
        {payload.sections.map((section) => (
          <WordDetailSection
            key={section.id}
            title={section.title}
            body={section.body}
          />
        ))}
      </ScrollView>
    </View>
  );
}
