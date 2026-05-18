import type { FeedItem, FeedLearningUnit } from '@/entities/feed';

import type { VideoLearningUnit, VideoListItem } from './types';

function mapFeedLearningUnitToVideoLearningUnit(
  unit: FeedLearningUnit
): VideoLearningUnit {
  return {
    coarseUnitId: unit.coarse_unit_id,
    text: unit.text,
    role: unit.role,
    isPrimary: unit.is_primary,
    evidenceSentenceIndex: unit.evidence_sentence_index,
    evidenceSpanIndex: unit.evidence_span_index,
    evidenceStartMs: unit.evidence_start_ms,
    evidenceEndMs: unit.evidence_end_ms,
  };
}

export function mapFeedItemToVideoListItem(
  item: FeedItem,
  recommendationRunId: string
): VideoListItem {
  return {
    videoId: item.video_id,
    title: item.title,
    description: item.description,
    videoUrl: item.video_url,
    coverImageUrl: item.cover_image_url ?? null,
    durationSeconds: item.duration_seconds,
    favoriteCount: item.favorite_count,
    likeCount: item.like_count,
    viewCount: item.view_count,
    recommendationRunId,
    learningUnits: item.learning_units.map(mapFeedLearningUnitToVideoLearningUnit),
  };
}
