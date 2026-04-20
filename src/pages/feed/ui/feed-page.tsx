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

import type { FeedItem } from '@/entities/feed';
import {
  clearPendingRestoreVideoId,
  getPendingRestoreVideoId,
} from '@/features/feed-session';
import {
  findFeedItemIndex,
  useFeedSource,
} from '@/features/feed-source';
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

function FeedStatePanel({
  title,
  body,
  actionLabel,
  onActionPress,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
        gap: 12,
      }}
    >
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
  const listRef = useRef<FlatList<FeedItem>>(null);
  const restoreTargetVideoIdRef = useRef<string | null>(null);
  const lastRequestedTailVideoIdRef = useRef<string | null>(null);
  const visibleItemIdsRef = useRef<Set<string>>(new Set());
  const itemsRef = useRef<FeedItem[]>([]);
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 50,
  });
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
  const loadingState = getFeedListLoadingState({
    isPending: isInitialLoading,
    hasItems: items.length > 0,
    hasError: Boolean(error),
    isExtending,
  });

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
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const handleOpenVideo = useCallback(
    (item: FeedItem) => {
      router.navigate(`/video/${item.videoId}` as never);
    },
    [router]
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<FeedItem>[] }) => {
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

      if (tailVideoId === lastRequestedTailVideoIdRef.current) {
        return;
      }

      lastRequestedTailVideoIdRef.current = tailVideoId;
      void requestMore();
    }
  );

  if (loadingState.kind === 'initial-loading') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: tokens.color.background,
          justifyContent: 'center',
          alignItems: 'center',
          gap: tokens.spacing.md,
        }}
      >
        <StatusBar style="dark" />
        <ActivityIndicator color={tokens.color.accent} />
        <MetaLabel uppercase={false}>Loading video feed…</MetaLabel>
      </View>
    );
  }

  if (loadingState.kind === 'error') {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <StatusBar style="dark" />
        <FeedStatePanel
          actionLabel="Retry"
          body="The feed snapshot could not be loaded. Try the request again."
          onActionPress={() => {
            void refresh();
          }}
          title="Feed unavailable"
        />
      </View>
    );
  }

  if (loadingState.kind === 'empty') {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.color.background }}>
        <StatusBar style="dark" />
        <FeedStatePanel
          actionLabel="Refresh"
          body="The feed is empty right now. Pull to refresh or try again."
          onActionPress={() => {
            void refresh();
          }}
          title="No clips yet"
        />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item) => item.videoId}
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
          paddingBottom: tokens.spacing.xxl,
          gap: tokens.spacing.lg,
        }}
        style={{ flex: 1, backgroundColor: tokens.color.background }}
        ListHeaderComponent={<FeedListHeader itemCount={items.length} />}
        ListFooterComponent={
          loadingState.kind === 'success' && loadingState.showFooterLoader ? (
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
        viewabilityConfig={viewabilityConfigRef.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
      />
    </>
  );
}
