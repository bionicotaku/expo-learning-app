import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  type ViewToken,
  View,
} from 'react-native';

import type { FeedItem } from '@/entities/feed';
import {
  clearPendingRestoreVideoId,
  getPendingRestoreVideoId,
} from '@/features/feed-session';
import {
  findFeedItemIndex,
  flattenFeedPages,
  refreshFeedSource,
  useFeedInfiniteQuery,
} from '@/features/feed-pagination';
import { useEditorialPaperTheme } from '@/shared/theme/editorial-paper';
import { EditorialTitle, MetaLabel } from '@/shared/ui/editorial-paper';
import { MediaFeatureCard } from '@/widgets/media-feature-card';
import { getFeedListLoadingState } from './loading-state';
import { createFeedMediaFeatureCardProps } from './media-feature-card-props';
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

export function FeedPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tokens } = useEditorialPaperTheme();
  const listRef = useRef<FlatList<FeedItem>>(null);
  const restoreTargetVideoIdRef = useRef<string | null>(null);
  const visibleItemIdsRef = useRef<Set<string>>(new Set());
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 50,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [restoreTargetVideoId, setRestoreTargetVideoId] = useState<string | null>(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useFeedInfiniteQuery();
  const items = useMemo(() => flattenFeedPages(data), [data]);
  const loadingState = getFeedListLoadingState({
    itemCount: items.length,
    isPending,
    isFetchingNextPage,
  });

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

    const restoreIndex = findFeedItemIndex(items, restoreTargetVideoId);
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
      await refreshFeedSource(queryClient);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const handleOpenVideo = useCallback(
    (item: FeedItem) => {
      router.push(`/video/${item.id}` as never);
    },
    [router]
  );

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<FeedItem>[] }) => {
      visibleItemIdsRef.current = new Set(
        viewableItems
          .filter((item) => item.isViewable && item.item?.id)
          .map((item) => item.item.id)
      );

      const nextRestoreTarget = restoreTargetVideoIdRef.current;
      if (!nextRestoreTarget || !visibleItemIdsRef.current.has(nextRestoreTarget)) {
        return;
      }

      clearPendingRestoreVideoId();
      setRestoreTargetVideoId(null);
    }
  );

  return (
    <>
      <StatusBar style="dark" />
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MediaFeatureCard
            {...createFeedMediaFeatureCardProps(item)}
            onPress={() => {
              handleOpenVideo(item);
            }}
          />
        )}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: tokens.spacing.pageX,
          paddingTop: tokens.spacing.pageTop,
          paddingBottom: tokens.spacing.pageBottomWithTab,
          gap: tokens.spacing.lg,
        }}
        style={{ flex: 1, backgroundColor: tokens.color.background }}
        ListHeaderComponent={<FeedListHeader itemCount={items.length} />}
        ListFooterComponent={
          loadingState.showFooterLoader ? (
            <View
              style={{
                paddingTop: tokens.spacing.md,
                paddingBottom: tokens.spacing.xl,
                alignItems: 'center',
                gap: tokens.spacing.sm,
              }}
            >
              <ActivityIndicator color={tokens.color.accent} />
              <MetaLabel uppercase={false}>Loading clips…</MetaLabel>
            </View>
          ) : (
            <View style={{ height: tokens.spacing.xs }} />
          )
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
        onEndReachedThreshold={0.5}
        onEndReached={handleEndReached}
        onScrollToIndexFailed={({ index }) => {
          if (!restoreTargetVideoIdRef.current) {
            return;
          }

          setTimeout(() => {
            listRef.current?.scrollToIndex(buildFeedRestoreScrollParams(index));
          }, 60);
        }}
        viewabilityConfig={viewabilityConfigRef.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
      />
    </>
  );
}
