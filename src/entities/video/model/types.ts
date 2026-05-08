export type VideoListItem = {
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
