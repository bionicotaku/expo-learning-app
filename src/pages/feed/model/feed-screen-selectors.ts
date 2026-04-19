import type { FeedItem } from '@/entities/feed';
import type {
  FeedLoadingTailItem,
  VideoFeedOverlayModel,
  VideoFeedRenderItem,
} from '@/widgets/video-feed/model';
import { isFeedLoadingTailItem } from '@/widgets/video-feed/model';

const appendingTitle = 'Loading next page...';
const appendingSubtitle = 'Simulated 3 second network delay';
const mutedHint = 'Tap anywhere to unmute';

export function createFeedLoadingTailItem(loadedCount: number): FeedLoadingTailItem {
  return {
    id: `feed-loading-tail-${loadedCount}`,
    kind: 'loading-tail',
  };
}

export function buildFeedScreenItems(
  items: FeedItem[],
  isFetchingNextPage: boolean
): VideoFeedRenderItem[] {
  if (!isFetchingNextPage) {
    return items;
  }

  return [...items, createFeedLoadingTailItem(items.length)];
}

export function getFeedDebugLabel(activeIndex: number, loadedCount: number): string {
  if (loadedCount === 0) {
    return '0 / 0';
  }

  return `${activeIndex + 1} / ${loadedCount}`;
}

export function getFeedOverlayModel(
  item: VideoFeedRenderItem,
  isMuted: boolean
): VideoFeedOverlayModel {
  if (isFeedLoadingTailItem(item)) {
    return {
      title: appendingTitle,
      subtitle: appendingSubtitle,
      hint: null,
    };
  }

  return {
    title: item.title,
    subtitle: item.subtitle,
    hint: isMuted ? mutedHint : null,
  };
}
