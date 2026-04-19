import type { FeedItem } from '@/entities/feed';

export type FeedLoadingTailItem = {
  id: string;
  kind: 'loading-tail';
};

export type VideoFeedRenderItem = FeedItem | FeedLoadingTailItem;

export type VideoFeedOverlayModel = {
  title: string;
  subtitle: string;
  hint: string | null;
};

export function isFeedLoadingTailItem(
  item: VideoFeedRenderItem
): item is FeedLoadingTailItem {
  return item.kind === 'loading-tail';
}

export function isVideoFeedItem(item: VideoFeedRenderItem): item is FeedItem {
  return item.kind === 'feed-item';
}
