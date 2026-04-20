import type { VideoRuntimeOverride } from './video-runtime-store';

export type VideoRuntimeBaseFlags = {
  isFavorited: boolean;
  isLiked: boolean;
};

export type EffectiveVideoRuntimeFlags = {
  isFavorited: boolean;
  isLiked: boolean;
};

export function resolveEffectiveVideoRuntimeFlags(
  baseFlags: VideoRuntimeBaseFlags,
  runtimeOverride: VideoRuntimeOverride | undefined
): EffectiveVideoRuntimeFlags {
  return {
    isLiked: runtimeOverride?.isLiked ?? baseFlags.isLiked,
    isFavorited: runtimeOverride?.isFavorited ?? baseFlags.isFavorited,
  };
}
