import type { FeedItem } from '@/entities/feed';

import type { VideoListItem } from './types';

export function mapFeedItemToVideoListItem(item: FeedItem): VideoListItem {
  return {
    videoId: item.videoId,
    title: item.title,
    description: item.description,
    videoUrl: item.videoUrl,
    coverImageUrl: item.coverImageUrl ?? null,
    durationSeconds: item.durationSeconds,
    favoriteCount: item.favoriteCount,
    likeCount: item.likeCount,
    viewCount: item.viewCount,
    tags: item.tags,
  };
}
