export type VideoListItem = {
  videoId: string;
  title: string;
  description: string;
  videoUrl: string;
  coverImageUrl?: string | null;
  durationSeconds: number;
  viewCount: number;
  tags: string[];
  isLiked: boolean;
  isFavorited: boolean;
};
