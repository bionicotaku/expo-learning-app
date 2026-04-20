import { create } from 'zustand';

import type { VideoRuntimeBaseFlags } from './resolve-effective-video-runtime-flags';
import {
  resolveNextVideoRuntimeOverride,
  type VideoRuntimeNextFlags,
} from './resolve-next-video-runtime-override';

export type VideoRuntimeOverride = {
  isLiked?: boolean;
  isFavorited?: boolean;
};

export type VideoRuntimeSource = 'feed' | 'history';

export type VideoSourceMembership = Record<VideoRuntimeSource, Record<string, true>>;

export type VideoRuntimeState = {
  acceptFetchedIds: (source: VideoRuntimeSource, videoIds: readonly string[]) => void;
  overridesByVideoId: Record<string, VideoRuntimeOverride>;
  replaceSourceSnapshot: (source: VideoRuntimeSource, videoIds: readonly string[]) => void;
  sourceVideoIds: VideoSourceMembership;
  setFlags: (
    videoId: string,
    nextFlags: VideoRuntimeNextFlags,
    baseFlags: VideoRuntimeBaseFlags
  ) => void;
  clearAll: () => void;
};

const videoRuntimeSources: readonly VideoRuntimeSource[] = ['feed', 'history'];

function createEmptySourceMembership(): VideoSourceMembership {
  return {
    feed: {},
    history: {},
  };
}

function areVideoRuntimeOverridesEqual(
  left: VideoRuntimeOverride | undefined,
  right: VideoRuntimeOverride | undefined
) {
  return (
    left?.isLiked === right?.isLiked &&
    left?.isFavorited === right?.isFavorited
  );
}

function normalizeSourceVideoIds(videoIds: readonly string[]) {
  const normalizedIds: Record<string, true> = {};

  for (const videoId of videoIds) {
    normalizedIds[videoId] = true;
  }

  return normalizedIds;
}

function areSourceMembershipEntriesEqual(
  left: Record<string, true>,
  right: Record<string, true>
) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => right[key] === true);
}

function isVideoIdPresentInOtherSources(
  sourceVideoIds: VideoSourceMembership,
  source: VideoRuntimeSource,
  videoId: string
) {
  return videoRuntimeSources.some(
    (candidateSource) =>
      candidateSource !== source && sourceVideoIds[candidateSource][videoId] === true
  );
}

export const useVideoRuntimeStore = create<VideoRuntimeState>()((set) => ({
  acceptFetchedIds: (source, videoIds) => {
    set((state) => {
      if (videoIds.length === 0) {
        return state;
      }

      const nextSourceIds = normalizeSourceVideoIds(videoIds);
      const currentSourceIds = state.sourceVideoIds[source];
      let didChange = false;
      const nextOverridesByVideoId = {
        ...state.overridesByVideoId,
      };
      let nextSourceVideoIds = state.sourceVideoIds;

      for (const videoId of Object.keys(nextSourceIds)) {
        if (!(videoId in currentSourceIds)) {
          if (nextSourceVideoIds === state.sourceVideoIds) {
            nextSourceVideoIds = {
              ...state.sourceVideoIds,
              [source]: {
                ...currentSourceIds,
              },
            };
          }

          nextSourceVideoIds[source][videoId] = true;
          didChange = true;
        }
      }

      for (const videoId of Object.keys(nextSourceIds)) {
        if (!(videoId in nextOverridesByVideoId)) {
          continue;
        }

        delete nextOverridesByVideoId[videoId];
        didChange = true;
      }

      if (!didChange) {
        return state;
      }

      return {
        overridesByVideoId: nextOverridesByVideoId,
        sourceVideoIds: nextSourceVideoIds,
      };
    });
  },
  overridesByVideoId: {},
  replaceSourceSnapshot: (source, videoIds) => {
    set((state) => {
      const currentSourceIds = state.sourceVideoIds[source];
      const nextSourceIds = normalizeSourceVideoIds(videoIds);
      let didChange = false;
      const nextOverridesByVideoId = {
        ...state.overridesByVideoId,
      };

      for (const videoId of Object.keys(currentSourceIds)) {
        if (isVideoIdPresentInOtherSources(state.sourceVideoIds, source, videoId)) {
          continue;
        }

        if (!(videoId in nextOverridesByVideoId)) {
          continue;
        }

        delete nextOverridesByVideoId[videoId];
        didChange = true;
      }

      for (const videoId of Object.keys(nextSourceIds)) {
        if (!(videoId in nextOverridesByVideoId)) {
          continue;
        }

        delete nextOverridesByVideoId[videoId];
        didChange = true;
      }

      if (areSourceMembershipEntriesEqual(currentSourceIds, nextSourceIds) && !didChange) {
        return state;
      }

      return {
        overridesByVideoId: nextOverridesByVideoId,
        sourceVideoIds: {
          ...state.sourceVideoIds,
          [source]: nextSourceIds,
        },
      };
    });
  },
  sourceVideoIds: createEmptySourceMembership(),
  setFlags: (videoId, nextFlags, baseFlags) => {
    set((state) => {
      const currentOverride = state.overridesByVideoId[videoId];
      const nextOverride = resolveNextVideoRuntimeOverride(
        baseFlags,
        currentOverride,
        nextFlags
      );

      if (areVideoRuntimeOverridesEqual(currentOverride, nextOverride)) {
        return state;
      }

      const nextOverridesByVideoId = {
        ...state.overridesByVideoId,
      };

      if (nextOverride) {
        nextOverridesByVideoId[videoId] = nextOverride;
      } else {
        delete nextOverridesByVideoId[videoId];
      }

      return {
        overridesByVideoId: nextOverridesByVideoId,
      };
    });
  },
  clearAll: () => {
    set({
      overridesByVideoId: {},
      sourceVideoIds: createEmptySourceMembership(),
    });
  },
}));
