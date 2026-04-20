import type { VideoRuntimeOverride } from './video-runtime-store';
import type { VideoRuntimeBaseFlags } from './resolve-effective-video-runtime-flags';

export type VideoRuntimeNextFlags = Partial<VideoRuntimeBaseFlags>;

export function resolveNextVideoRuntimeOverride(
  baseFlags: VideoRuntimeBaseFlags,
  currentOverride: VideoRuntimeOverride | undefined,
  nextFlags: VideoRuntimeNextFlags
): VideoRuntimeOverride | undefined {
  const nextOverride: VideoRuntimeOverride = {
    ...(currentOverride ?? {}),
  };

  if (nextFlags.isLiked !== undefined) {
    if (nextFlags.isLiked === baseFlags.isLiked) {
      delete nextOverride.isLiked;
    } else {
      nextOverride.isLiked = nextFlags.isLiked;
    }
  }

  if (nextFlags.isFavorited !== undefined) {
    if (nextFlags.isFavorited === baseFlags.isFavorited) {
      delete nextOverride.isFavorited;
    } else {
      nextOverride.isFavorited = nextFlags.isFavorited;
    }
  }

  return Object.keys(nextOverride).length > 0 ? nextOverride : undefined;
}
