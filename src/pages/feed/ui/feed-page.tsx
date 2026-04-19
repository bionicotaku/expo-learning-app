import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
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
import {
  EditorialTitle,
  MetaLabel,
  RaisedSurface,
} from '@/shared/ui/editorial-paper';
import { getFeedListLoadingState } from './loading-state';
import { buildFeedRestoreScrollParams } from './restore-scroll';
import { scheduleFeedRestore } from './restore-scheduler';

const cardTones = [
  '#EEDBCF',
  '#E6D9BE',
  '#D7E0C2',
  '#D7D0E7',
  '#D3E5E8',
  '#EACBCF',
] as const;

const cardTags = [
  'PHRASAL VERB',
  'LISTENING CUE',
  'ACCENT NOTE',
  'COMMON PATTERN',
  'CASUAL EXPRESSION',
  'USEFUL LINE',
] as const;

function buildCardDuration(index: number) {
  const minutes = 1 + (index % 3);
  const seconds = 12 + ((index * 7) % 42);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function buildCardTone(index: number) {
  return cardTones[index % cardTones.length];
}

function buildCardTag(index: number) {
  return cardTags[index % cardTags.length];
}

function FeedCard({
  item,
  onPress,
}: {
  item: FeedItem;
  onPress: (item: FeedItem) => void;
}) {
  const { tokens } = useEditorialPaperTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(item)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.95 : 1,
      })}
    >
      <RaisedSurface
        style={{
          padding: tokens.spacing.sm,
          gap: tokens.spacing.md,
        }}
      >
        <View
          style={{
            minHeight: 214,
            borderRadius: tokens.radius.cardMd,
            borderCurve: 'continuous',
            overflow: 'hidden',
            backgroundColor: buildCardTone(item.indexInFeed),
            padding: tokens.spacing.md,
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: tokens.radius.pill,
                borderCurve: 'continuous',
                backgroundColor: 'rgba(251,247,238,0.78)',
                boxShadow: tokens.elevation.soft,
              }}
            >
              <MetaLabel uppercase={false} style={{ color: tokens.color.ink }}>
                {buildCardTag(item.indexInFeed)}
              </MetaLabel>
            </View>

            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: tokens.radius.pill,
                borderCurve: 'continuous',
                backgroundColor: 'rgba(28,26,23,0.08)',
              }}
            >
              <MetaLabel uppercase={false} style={{ color: tokens.color.ink }}>
                {buildCardDuration(item.indexInFeed)}
              </MetaLabel>
            </View>
          </View>

          <View style={{ gap: tokens.spacing.sm }}>
            <MetaLabel uppercase={false} tone="inkSoft">
              {`Page ${item.page} · ${(item.indexInFeed % 5) + 1}/5`}
            </MetaLabel>
            <Text
              selectable
              style={{
                color: tokens.color.ink,
                fontSize: 14,
                lineHeight: 20,
                fontWeight: '600',
                maxWidth: '78%',
              }}
            >
              {item.subtitle}
            </Text>
          </View>
        </View>

        <View style={{ gap: tokens.spacing.xs }}>
          <EditorialTitle variant="title" style={{ fontSize: 28, lineHeight: 30 }}>
            {item.title}
          </EditorialTitle>
          <Text
            selectable
            style={{
              color: tokens.color.inkSoft,
              fontSize: 15,
              lineHeight: 22,
              fontWeight: '500',
            }}
          >
            {`Tap to open the fullscreen reel and keep scrolling through the shared feed source.`}
          </Text>
        </View>
      </RaisedSurface>
    </Pressable>
  );
}

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
        renderItem={({ item }) => <FeedCard item={item} onPress={handleOpenVideo} />}
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
