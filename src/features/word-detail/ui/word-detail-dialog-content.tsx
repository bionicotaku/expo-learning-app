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

export type WordDetailAudioClip = {
  endMs: number;
  startMs: number;
};

export type WordDetailDialogAudio = {
  sentence?: WordDetailAudioClip;
  videoUrl: string;
  word?: WordDetailAudioClip;
};

export type WordDetailDialogData = {
  title: string;
  subtitle?: string;
  audio?: WordDetailDialogAudio;
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

type WordDetailAudioPlayRequest = {
  clip: WordDetailAudioClip;
  token: number;
};

function isPlayableAudioClip(
  videoUrl: string,
  clip: WordDetailAudioClip | undefined
): clip is WordDetailAudioClip {
  return Boolean(clip && videoUrl.length > 0 && clip.endMs > clip.startMs);
}

function WordDetailHeadlessAudioPlayer({
  playRequest,
  videoUrl,
}: {
  playRequest: WordDetailAudioPlayRequest;
  videoUrl: string;
}) {
  const source = useMemo(
    () => ({
      contentType: 'hls' as const,
      uri: videoUrl,
    }),
    [videoUrl]
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
  const startSeconds = Math.max(0, playRequest.clip.startMs / 1000);
  const endSeconds = Math.max(startSeconds, playRequest.clip.endMs / 1000);
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
    if (status === 'error') {
      showAudioErrorToast(playRequest.token);
      return;
    }

    if (status !== 'readyToPlay') {
      return;
    }

    try {
      player.currentTime = startSeconds;
      player.play();
    } catch {
      showAudioErrorToast(playRequest.token);
    }
  }, [playRequest.token, player, showAudioErrorToast, startSeconds, status]);

  useEventListener(player, 'timeUpdate', (payload) => {
    if (payload.currentTime < endSeconds) {
      return;
    }

    player.pause();
    player.currentTime = startSeconds;
  });

  return null;
}

function WordDetailAudioButton({
  accessibilityLabel,
  badgeLabel,
  disabled,
  onPress,
}: {
  accessibilityLabel: string;
  badgeLabel: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: tokens.radius.pill,
        backgroundColor: 'rgba(255,255,255,0.42)',
        opacity: disabled ? 0.48 : pressed ? 0.72 : 1,
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
      <Text
        selectable={false}
        style={{
          position: 'absolute',
          right: 2,
          bottom: 2,
          minWidth: 12,
          height: 12,
          overflow: 'hidden',
          borderRadius: 6,
          backgroundColor: 'rgba(28,26,23,0.78)',
          color: tokens.color.surface,
          fontSize: 8,
          fontWeight: '800',
          lineHeight: 12,
          textAlign: 'center',
        }}
      >
        {badgeLabel}
      </Text>
    </Pressable>
  );
}

function WordDetailAudioControls({
  audio,
}: {
  audio: WordDetailDialogAudio;
}) {
  const { tokens } = useEditorialPaperTheme();
  const [isPlayerMounted, setIsPlayerMounted] = useState(false);
  const [playRequest, setPlayRequest] =
    useState<WordDetailAudioPlayRequest | null>(null);
  const wordClip = isPlayableAudioClip(audio.videoUrl, audio.word)
    ? audio.word
    : null;
  const sentenceClip = isPlayableAudioClip(audio.videoUrl, audio.sentence)
    ? audio.sentence
    : null;
  const handlePlayClip = useCallback((clip: WordDetailAudioClip) => {
    setIsPlayerMounted(true);
    setPlayRequest((currentRequest) => ({
      clip,
      token: (currentRequest?.token ?? 0) + 1,
    }));
  }, []);

  if (!wordClip && !sentenceClip) {
    return null;
  }

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          gap: tokens.spacing.xs,
        }}
      >
        {wordClip ? (
          <WordDetailAudioButton
            accessibilityLabel="播放单词音频"
            badgeLabel="词"
            onPress={() => {
              handlePlayClip(wordClip);
            }}
          />
        ) : null}
        {sentenceClip ? (
          <WordDetailAudioButton
            accessibilityLabel="播放本句音频"
            badgeLabel="句"
            onPress={() => {
              handlePlayClip(sentenceClip);
            }}
          />
        ) : null}
      </View>
      {isPlayerMounted && playRequest ? (
        <WordDetailHeadlessAudioPlayer
          playRequest={playRequest}
          videoUrl={audio.videoUrl}
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
            {payload.audio ? (
              <WordDetailAudioControls audio={payload.audio} />
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
