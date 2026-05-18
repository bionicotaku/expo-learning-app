export type FeedLearningUnitRole =
  | 'hard_review'
  | 'new_now'
  | 'soft_review'
  | 'near_future';

export type FeedLearningUnit = {
  coarse_unit_id: number;
  text: string;
  role: FeedLearningUnitRole;
  is_primary: boolean;
  evidence_sentence_index: number;
  evidence_span_index: number;
  evidence_start_ms: number;
  evidence_end_ms: number;
};

export type FeedItem = {
  video_id: string;
  title: string;
  description: string;
  video_url: string;
  cover_image_url: string | null;
  duration_seconds: number;
  favorite_count: number;
  like_count: number;
  view_count: number;
  learning_units: FeedLearningUnit[];
};

export type FeedResponse = {
  recommendation_run_id: string;
  items: FeedItem[];
};
