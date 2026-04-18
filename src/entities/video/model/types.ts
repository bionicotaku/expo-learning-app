export type VideoAsset = {
  assetId: string;
  uri: string;
  defaultTitle: string;
  defaultSubtitle: string;
};

export type FeedVideoItem = {
  id: string;
  kind: 'video';
  assetId: string;
  uri: string;
  title: string;
  subtitle: string;
  page: number;
  indexInFeed: number;
};

export type LoadingSentinelItem = {
  id: string;
  kind: 'loading-sentinel';
};

export type FeedListItem = FeedVideoItem | LoadingSentinelItem;

export function isFeedVideoItem(item: FeedListItem): item is FeedVideoItem {
  return item.kind === 'video';
}
