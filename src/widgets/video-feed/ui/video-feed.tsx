import { useEffect, useRef, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/shared/theme/colors';

import type {
  VideoFeedOverlayModel,
  VideoFeedRenderItem,
} from '../model/types';
import { VideoFeedLoadingCard } from './video-feed-loading-card';
import { VideoFeedList } from './video-feed-list';
import { VideoFeedOverlay } from './video-feed-overlay';

const audioToastDurationMs = 700;
const initialTitle = 'Loading first page...';
const initialSubtitle = 'Building the first 10 mock feed items';

type VideoFeedProps = {
  activeIndex: number;
  activeItemId: string | null;
  debugLabel: string;
  isInitialLoading: boolean;
  isMuted: boolean;
  items: VideoFeedRenderItem[];
  overlayModel: VideoFeedOverlayModel | null;
  setActiveItem: (itemId: string, index: number) => void;
  toggleMuted: () => void;
};

export function VideoFeed({
  activeIndex,
  activeItemId,
  debugLabel,
  isInitialLoading,
  isMuted,
  items,
  overlayModel,
  setActiveItem,
  toggleMuted,
}: VideoFeedProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const audioToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [audioToastLabel, setAudioToastLabel] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioToastTimeoutRef.current) {
        clearTimeout(audioToastTimeoutRef.current);
      }
    };
  }, []);

  const showAudioToast = (nextMutedValue: boolean) => {
    if (audioToastTimeoutRef.current) {
      clearTimeout(audioToastTimeoutRef.current);
    }

    setAudioToastLabel(nextMutedValue ? 'Muted' : 'Sound On');
    audioToastTimeoutRef.current = setTimeout(() => {
      setAudioToastLabel(null);
    }, audioToastDurationMs);
  };

  const handleToggleMuted = () => {
    const nextMutedValue = !isMuted;
    toggleMuted();
    showAudioToast(nextMutedValue);
  };

  if (isInitialLoading && items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <VideoFeedLoadingCard
          width={width}
          height={height}
          title={initialTitle}
          subtitle={initialSubtitle}
        />
        <VideoFeedOverlay
          audioToastLabel={null}
          debugLabel="0 / 0"
          insets={insets}
          overlayModel={null}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <VideoFeedList
        activeIndex={activeIndex}
        activeItemId={activeItemId}
        height={height}
        isMuted={isMuted}
        items={items}
        onToggleMuted={handleToggleMuted}
        onViewableItemChange={setActiveItem}
        width={width}
      />

      <VideoFeedOverlay
        audioToastLabel={audioToastLabel}
        debugLabel={debugLabel}
        insets={insets}
        overlayModel={overlayModel}
      />
    </View>
  );
}
