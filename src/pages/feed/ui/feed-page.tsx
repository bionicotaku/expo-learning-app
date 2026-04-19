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

function buildCardViews(index: number) {
  return `${(7.8 + ((index * 4.9) % 18)).toFixed(1)}k`;
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
          padding: 10,
          gap: 14,
        }}
      >
        <View
          style={{
            minHeight: 196,
            borderRadius: tokens.radius.cardMd,
            borderCurve: 'continuous',
            overflow: 'hidden',
            backgroundColor: buildCardTone(item.indexInFeed),
            position: 'relative',
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: 14,
              top: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 11,
              paddingVertical: 6,
              borderRadius: 999,
              backgroundColor: 'rgba(251,247,238,0.6)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 10px rgba(28,26,23,0.12)',
              alignSelf: 'flex-start',
            }}
          >
            <Text
              style={{
                color: tokens.color.ink,
                fontSize: 12,
                lineHeight: 12,
                fontWeight: '700',
                transform: [{ translateY: 0.8 }],
              }}
            >
              ▶
            </Text>
            <Text
              style={{
                color: tokens.color.ink,
                fontSize: 10,
                lineHeight: 12,
                fontWeight: '700',
                letterSpacing: 0.4,
              }}
            >
              {`${buildCardViews(item.indexInFeed)} · ${buildCardDuration(item.indexInFeed)}`}
            </Text>
          </View>

          <View
            style={{
              position: 'absolute',
              left: 14,
              bottom: 14,
              paddingHorizontal: 11,
              paddingVertical: 8,
              borderRadius: 18,
              backgroundColor: 'rgba(251,247,238,0.6)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.36), 0 5px 12px rgba(28,26,23,0.1)',
              alignSelf: 'flex-start',
              maxWidth: '74%',
            }}
          >
            <Text
              numberOfLines={2}
              style={{
                color: tokens.color.ink,
                fontSize: 10.5,
                lineHeight: 13,
                fontWeight: '700',
                letterSpacing: 0.2,
              }}
            >
              {buildCardTag(item.indexInFeed)}
            </Text>
          </View>

          <View
            style={{
              position: 'absolute',
              right: 14,
              bottom: 14,
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(251,247,238,0.6)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.38), 0 6px 14px rgba(28,26,23,0.14)',
            }}
          >
            <Text
              style={{
                color: tokens.color.ink,
                fontSize: 16,
                lineHeight: 16,
                fontWeight: '700',
                marginLeft: 2,
                transform: [{ translateY: 0.7 }],
              }}
            >
              ▶
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 10, paddingBottom: 8 }}>
          <EditorialTitle
            variant="title"
            numberOfLines={2}
            style={{
              fontSize: 21,
              lineHeight: 25,
              letterSpacing: -0.45,
            }}
          >
            {item.title}
          </EditorialTitle>
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
