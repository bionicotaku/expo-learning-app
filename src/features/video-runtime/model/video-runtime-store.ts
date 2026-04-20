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

export type VideoRuntimeState = {
  acceptSourceTruth: (videoIds: readonly string[]) => void;
  overridesByVideoId: Record<string, VideoRuntimeOverride>;
  setFlags: (
    videoId: string,
    nextFlags: VideoRuntimeNextFlags,
    baseFlags: VideoRuntimeBaseFlags
  ) => void;
  clearAll: () => void;
};

function areVideoRuntimeOverridesEqual(
  left: VideoRuntimeOverride | undefined,
  right: VideoRuntimeOverride | undefined
) {
  return (
    left?.isLiked === right?.isLiked &&
    left?.isFavorited === right?.isFavorited
  );
}

export const useVideoRuntimeStore = create<VideoRuntimeState>()((set) => ({
  acceptSourceTruth: (videoIds) => {
    set((state) => {
      if (videoIds.length === 0) {
        return state;
      }

      let didChange = false;
      const nextOverridesByVideoId = {
        ...state.overridesByVideoId,
      };

      for (const videoId of videoIds) {
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
      };
    });
  },
  overridesByVideoId: {},
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
    });
  },
}));
