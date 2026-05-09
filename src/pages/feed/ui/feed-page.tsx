import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  type ViewToken,
  View,
} from 'react-native';

import {
  findVideoListItemIndex,
  type VideoListItem,
} from '@/entities/video';
import {
  clearPendingRestoreVideoId,
  getPendingRestoreVideoId,
} from '@/features/feed-session';
import {
  createTailRequestGate,
  useFeedSource,
} from '@/features/feed-source';
import { toast } from '@/shared/lib/toast';
import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { EditorialTitle, MetaLabel } from '@/shared/ui/editorial-paper';
import { MediaFeatureCard } from '@/widgets/media-feature-card';
import { createVideoMediaFeatureCardProps } from './media-feature-card-props';
import { buildFeedRestoreScrollParams } from './restore-scroll';
import { scheduleFeedRestore } from './restore-scheduler';

function FeedListHeader({ itemCount }: { itemCount: number }) {
  return (
    <View style={{ gap: 4 }}>
      <MetaLabel>{`Reading room · ${itemCount} clips loaded`}</MetaLabel>
      <EditorialTitle variant="display">Feed</EditorialTitle>
    </View>
  );
}

function FeedStatePanel({
  title,
  body,
  actionLabel,
  isLoading = false,
  onActionPress,
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  isLoading?: boolean;
  onActionPress?: () => void;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
        paddingVertical: 52,
        gap: 12,
      }}
    >
      {isLoading ? <ActivityIndicator color="rgba(28,26,23,0.94)" /> : null}
      <EditorialTitle
        style={{
          fontSize: 24,
          lineHeight: 30,
          textAlign: 'center',
        }}
        variant="title"
      >
        {title}
      </EditorialTitle>
      {body ? (
        <Text
          style={{
            fontSize: 14,
            lineHeight: 22,
            textAlign: 'center',
            color: 'rgba(28,26,23,0.72)',
          }}
        >
          {body}
        </Text>
      ) : null}
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onActionPress}
          style={({ pressed }) => ({
            marginTop: 4,
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 999,
            backgroundColor: pressed ? 'rgba(28,26,23,0.88)' : 'rgba(28,26,23,0.94)',
          })}
        >
          <Text
            style={{
              color: '#FBF7EE',
              fontSize: 13,
              fontWeight: '700',
              letterSpacing: 0.3,
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function FeedPage() {
  const router = useRouter();
  const { tokens } = useEditorialPaperTheme();
  const listRef = useRef<FlatList<VideoListItem>>(null);
  const restoreTargetVideoIdRef = useRef<string | null>(null);
  const tailRequestGateRef = useRef(createTailRequestGate());
  const visibleItemIdsRef = useRef<Set<string>>(new Set());
  const itemsRef = useRef<VideoListItem[]>([]);
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 50,
  });
  const lastInitialErrorToastRef = useRef<unknown>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [restoreTargetVideoId, setRestoreTargetVideoId] = useState<string | null>(null);
  const {
    error,
    isExtending,
    isInitialLoading,
    refresh,
    requestMore,
    items,
  } = useFeedSource();

  useEffect(() => {
    if (!error || items.length > 0) {
      lastInitialErrorToastRef.current = null;
      return;
    }

    if (lastInitialErrorToastRef.current === error) {
      return;
    }

    lastInitialErrorToastRef.current = error;
    toast.show({
      kind: 'error',
      title: '加载失败',
    });
  }, [error, items.length]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    restoreTargetVideoIdRef.current = restoreTargetVideoId;
  }, [restoreTargetVideoId]);

  useFocusEffect(
    useCallback(() => {
      const pendingRestoreVideoId = getPendingRestoreVideoId();
      if (pendingRestoreVideoId) {
        setRestoreTargetVideoId(pendingRestoreVideoId);
      }
    }, [])
  );

  useEffect(() => {
    if (!restoreTargetVideoId) {
      return;
    }

    if (visibleItemIdsRef.current.has(restoreTargetVideoId)) {
      clearPendingRestoreVideoId();
      setRestoreTargetVideoId(null);
      return;
    }

    const restoreIndex = findVideoListItemIndex(items, restoreTargetVideoId);
    if (restoreIndex < 0) {
      return;
    }

    const task = scheduleFeedRestore(() => {
      listRef.current?.scrollToIndex(buildFeedRestoreScrollParams(restoreIndex));
    });

    return () => {
      task.cancel();
    };
  }, [items, restoreTargetVideoId]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } catch {
      toast.show({
        kind: 'error',
        title: '刷新失败',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const handleOpenVideo = useCallback(
    (item: VideoListItem) => {
      router.navigate(`/video/${item.videoId}` as never);
    },
    [router]
  );

  const renderEmptyState = () => {
    if (isInitialLoading) {
      return <FeedStatePanel isLoading title="Loading video feed..." />;
    }

    if (error) {
      return <FeedStatePanel title="加载失败" />;
    }

    return (
      <FeedStatePanel
        actionLabel="Refresh"
        body="The feed is empty right now. Pull to refresh or try again."
        onActionPress={() => {
          void handleRefresh();
        }}
        title="No clips yet"
      />
    );
  };

  const requestMoreForTail = useCallback((tailVideoId: string | null) => {
    const tailRequestGate = tailRequestGateRef.current;

    if (tailVideoId === null || !tailRequestGate.canStart(tailVideoId)) {
      return;
    }

    tailRequestGate.markStarted(tailVideoId);
    void Promise.resolve(requestMore())
      .then(() => {
        tailRequestGate.markSucceeded(tailVideoId);
      })
      .catch(() => undefined)
      .finally(() => {
        tailRequestGate.markSettled(tailVideoId);
      });
  }, [requestMore]);

  const requestMoreForCurrentTail = useCallback(() => {
    const tailVideoId = itemsRef.current[itemsRef.current.length - 1]?.videoId ?? null;
    requestMoreForTail(tailVideoId);
  }, [requestMoreForTail]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<VideoListItem>[] }) => {
      visibleItemIdsRef.current = new Set(
        viewableItems
          .filter((item) => item.isViewable && item.item?.videoId)
          .map((item) => item.item.videoId)
      );

      const nextRestoreTarget = restoreTargetVideoIdRef.current;
      if (nextRestoreTarget && visibleItemIdsRef.current.has(nextRestoreTarget)) {
        clearPendingRestoreVideoId();
        setRestoreTargetVideoId(null);
      }

      const tailVideoId = itemsRef.current[itemsRef.current.length - 1]?.videoId ?? null;
      if (!tailVideoId || !visibleItemIdsRef.current.has(tailVideoId)) {
        return;
      }

      requestMoreForTail(tailVideoId);
    }
  );

  return (
    <>
      <StatusBar style="dark" />
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => item.videoId}
        renderItem={({ item }) => (
          <MediaFeatureCard
            {...createVideoMediaFeatureCardProps(item)}
            onPress={() => {
              handleOpenVideo(item);
            }}
          />
        )}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: tokens.spacing.pageX,
          paddingTop: tokens.spacing.pageTop,
          paddingBottom: tokens.spacing.xxl,
          gap: tokens.spacing.lg,
        }}
        style={{ flex: 1, backgroundColor: tokens.color.background }}
        ListHeaderComponent={<FeedListHeader itemCount={items.length} />}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          items.length > 0 && isExtending ? (
            <View
              style={{
                alignItems: 'center',
                paddingTop: tokens.spacing.md,
              }}
            >
              <ActivityIndicator color={tokens.color.accent} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void handleRefresh();
            }}
            tintColor={tokens.color.accent}
          />
        }
        onScrollToIndexFailed={({ index }) => {
          if (!restoreTargetVideoIdRef.current) {
            return;
          }

          setTimeout(() => {
            listRef.current?.scrollToIndex(buildFeedRestoreScrollParams(index));
          }, 60);
        }}
        onEndReached={requestMoreForCurrentTail}
        onEndReachedThreshold={0.2}
        viewabilityConfig={viewabilityConfigRef.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
      />
    </>
  );
}
