import {
  findVideoListItemIndex,
  type VideoListItem,
} from '@/entities/video';

export type VideoDetailRouteTarget = {
  entryIndex: number;
  entryVideoId: string | null;
  sessionKey: string;
};

type ResolveVideoDetailRouteTargetArgs = {
  items: VideoListItem[];
  routeVideoId: string | null;
};

export function resolveVideoDetailRouteTarget({
  items,
  routeVideoId,
}: ResolveVideoDetailRouteTargetArgs): VideoDetailRouteTarget {
  const targetIndex = findVideoListItemIndex(items, routeVideoId);
  const entryIndex = targetIndex >= 0 ? targetIndex : 0;

  return {
    entryIndex,
    entryVideoId: items[entryIndex]?.videoId ?? null,
    sessionKey: `route:${routeVideoId ?? '__default__'}`,
  };
}
