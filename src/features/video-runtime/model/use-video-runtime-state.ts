import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

import {
  resolveEffectiveVideoRuntimeFlags,
} from './resolve-effective-video-runtime-flags';
import { useVideoRuntimeStore } from './video-runtime-store';

type UseVideoRuntimeStateInput = {
  baseIsFavorited: boolean;
  baseIsLiked: boolean;
  videoId: string;
};

export type UseVideoRuntimeStateResult = {
  isFavorited: boolean;
  isLiked: boolean;
  setFavorited: (next: boolean) => void;
  setLiked: (next: boolean) => void;
  toggleFavorited: () => void;
  toggleLiked: () => void;
};

export function useVideoRuntimeState({
  baseIsFavorited,
  baseIsLiked,
  videoId,
}: UseVideoRuntimeStateInput): UseVideoRuntimeStateResult {
  const baseFlags = useMemo(
    () => ({
      isLiked: baseIsLiked,
      isFavorited: baseIsFavorited,
    }),
    [baseIsFavorited, baseIsLiked]
  );
  const { isFavorited, isLiked } = useVideoRuntimeStore(
    useShallow((state) =>
      resolveEffectiveVideoRuntimeFlags(
        baseFlags,
        state.overridesByVideoId[videoId]
      )
    )
  );
  const setFlags = useVideoRuntimeStore((state) => state.setFlags);

  const setLiked = useCallback(
    (next: boolean) => {
      setFlags(videoId, { isLiked: next }, baseFlags);
    },
    [baseFlags, setFlags, videoId]
  );

  const setFavorited = useCallback(
    (next: boolean) => {
      setFlags(videoId, { isFavorited: next }, baseFlags);
    },
    [baseFlags, setFlags, videoId]
  );

  const toggleLiked = useCallback(() => {
    setLiked(!isLiked);
  }, [isLiked, setLiked]);

  const toggleFavorited = useCallback(() => {
    setFavorited(!isFavorited);
  }, [isFavorited, setFavorited]);

  return useMemo(
    () => ({
      isLiked,
      isFavorited,
      setLiked,
      setFavorited,
      toggleLiked,
      toggleFavorited,
    }),
    [
      isFavorited,
      isLiked,
      setFavorited,
      setLiked,
      toggleFavorited,
      toggleLiked,
    ]
  );
}
