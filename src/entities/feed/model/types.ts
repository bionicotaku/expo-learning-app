export type FeedItem = {
  id: string;
  kind: 'feed-item';
  assetId: string;
  uri: string;
  title: string;
  subtitle: string;
  page: number;
  indexInFeed: number;
};

export type FeedPageResult = {
  items: FeedItem[];
  nextOffset: number;
  hasMore: boolean;
};
