import { useCallback, useMemo, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';

import { useVideoRuntimeState } from '@/features/video-runtime';
import { toast } from '@/shared/lib/toast';

import {
  setVideoFavorited,
  setVideoLiked,
} from '../api/video-engagement-repository';
import { resolveEffectiveEngagementCount } from './engagement-count';

type UseVideoEngagementStateInput = {
  baseFavoriteCount: number;
  baseIsFavorited: boolean;
  baseIsLiked: boolean;
  baseLikeCount: number;
  isEnabled: boolean;
  videoId: string;
};

export type UseVideoEngagementStateResult = {
  favoriteCount: number;
  isFavoritePending: boolean;
  isFavorited: boolean;
  isLikePending: boolean;
  isLiked: boolean;
  likeCount: number;
  setFavorited: (target: boolean) => Promise<void>;
  setLiked: (target: boolean) => Promise<void>;
};

function getLikeFailureTitle(target: boolean) {
  return target ? '点赞失败' : '取消点赞失败';
}

function getFavoriteFailureTitle(target: boolean) {
  return target ? '收藏失败' : '取消收藏失败';
}

export function useVideoEngagementState({
  baseFavoriteCount,
  baseIsFavorited,
  baseIsLiked,
  baseLikeCount,
  isEnabled,
  videoId,
}: UseVideoEngagementStateInput): UseVideoEngagementStateResult {
  const likePendingRef = useRef(false);
  const favoritePendingRef = useRef(false);
  const runtimeState = useVideoRuntimeState({
    baseIsFavorited,
    baseIsLiked,
    videoId,
  });
  const likeMutation = useMutation({
    mutationFn: (target: boolean) => setVideoLiked(videoId, target),
  });
  const favoriteMutation = useMutation({
    mutationFn: (target: boolean) => setVideoFavorited(videoId, target),
  });
  const likeCount = resolveEffectiveEngagementCount({
    baseCount: baseLikeCount,
    baseIsActive: baseIsLiked,
    effectiveIsActive: runtimeState.isLiked,
  });
  const favoriteCount = resolveEffectiveEngagementCount({
    baseCount: baseFavoriteCount,
    baseIsActive: baseIsFavorited,
    effectiveIsActive: runtimeState.isFavorited,
  });

  const setLiked = useCallback(async (target: boolean) => {
    if (!isEnabled || likePendingRef.current || target === runtimeState.isLiked) {
      return;
    }

    const previousIsLiked = runtimeState.isLiked;
    likePendingRef.current = true;
    runtimeState.setLiked(target);

    try {
      await likeMutation.mutateAsync(target);
    } catch {
      runtimeState.setLiked(previousIsLiked);
      toast.show({
        kind: 'error',
        title: getLikeFailureTitle(target),
      });
    } finally {
      likePendingRef.current = false;
    }
  }, [isEnabled, likeMutation, runtimeState]);

  const setFavorited = useCallback(async (target: boolean) => {
    if (
      !isEnabled ||
      favoritePendingRef.current ||
      target === runtimeState.isFavorited
    ) {
      return;
    }

    const previousIsFavorited = runtimeState.isFavorited;
    favoritePendingRef.current = true;
    runtimeState.setFavorited(target);

    try {
      await favoriteMutation.mutateAsync(target);
    } catch {
      runtimeState.setFavorited(previousIsFavorited);
      toast.show({
        kind: 'error',
        title: getFavoriteFailureTitle(target),
      });
    } finally {
      favoritePendingRef.current = false;
    }
  }, [favoriteMutation, isEnabled, runtimeState]);

  return useMemo(
    () => ({
      favoriteCount,
      isFavoritePending: favoriteMutation.isPending,
      isFavorited: runtimeState.isFavorited,
      isLikePending: likeMutation.isPending,
      isLiked: runtimeState.isLiked,
      likeCount,
      setFavorited,
      setLiked,
    }),
    [
      favoriteCount,
      favoriteMutation.isPending,
      likeCount,
      likeMutation.isPending,
      runtimeState.isFavorited,
      runtimeState.isLiked,
      setFavorited,
      setLiked,
    ]
  );
}
