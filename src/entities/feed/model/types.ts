export type FeedItem = {
  videoId: string;
  title: string;
  description: string;
  videoUrl: string;
  coverImageUrl?: string | null;
  durationSeconds: number;
  favoriteCount: number;
  likeCount: number;
  viewCount: number;
  tags: string[];
};

export type FeedResponse = {
  items: FeedItem[];
};
