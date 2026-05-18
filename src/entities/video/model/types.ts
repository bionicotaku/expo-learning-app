import type { FeedLearningUnitRole } from '@/entities/feed';

export type VideoLearningUnit = {
  coarseUnitId: number;
  text: string;
  role: FeedLearningUnitRole;
  isPrimary: boolean;
  evidenceSentenceIndex: number;
  evidenceSpanIndex: number;
  evidenceStartMs: number;
  evidenceEndMs: number;
};

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
  recommendationRunId: string;
  learningUnits: VideoLearningUnit[];
};
