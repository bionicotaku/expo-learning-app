import type { FeedItem, FeedLearningUnit, FeedResponse } from '../model/types';
import {
  mockClipCount,
  resolveMockClipAssetBySequenceNumber,
  type MockClipAsset,
} from '@/entities/video/model/mock-clip-catalog';

type FetchMockFeedOptions = {
  delayMs?: number;
};

type SeededClipAsset = MockClipAsset & {
  videoId: string;
};

const mockFeedLearningUnitsByClipNumber: Record<number, readonly FeedLearningUnit[]> = {
  1: [
    {
      coarse_unit_id: 89008,
      text: 'give',
      role: 'near_future',
      is_primary: true,
      evidence_sentence_index: 15,
      evidence_span_index: 1,
      evidence_start_ms: 31493,
      evidence_end_ms: 31670,
    },
    {
      coarse_unit_id: 138446,
      text: 'sacred',
      role: 'new_now',
      is_primary: false,
      evidence_sentence_index: 14,
      evidence_span_index: 17,
      evidence_start_ms: 17621,
      evidence_end_ms: 30899,
    },
    {
      coarse_unit_id: 72360,
      text: 'earlier',
      role: 'new_now',
      is_primary: false,
      evidence_sentence_index: 13,
      evidence_span_index: 5,
      evidence_start_ms: 16659,
      evidence_end_ms: 16868,
    },
    {
      coarse_unit_id: 37192,
      text: 'acupuncture',
      role: 'soft_review',
      is_primary: false,
      evidence_sentence_index: 27,
      evidence_span_index: 7,
      evidence_start_ms: 69032,
      evidence_end_ms: 75044,
    },
    {
      coarse_unit_id: 109520,
      text: 'massage',
      role: 'hard_review',
      is_primary: false,
      evidence_sentence_index: 27,
      evidence_span_index: 9,
      evidence_start_ms: 69032,
      evidence_end_ms: 75044,
    },
  ],
  2: [
    {
      coarse_unit_id: 101652,
      text: 'job',
      role: 'soft_review',
      is_primary: true,
      evidence_sentence_index: 47,
      evidence_span_index: 5,
      evidence_start_ms: 121996,
      evidence_end_ms: 123602,
    },
    {
      coarse_unit_id: 133435,
      text: 'really',
      role: 'hard_review',
      is_primary: false,
      evidence_sentence_index: 39,
      evidence_span_index: 0,
      evidence_start_ms: 104106,
      evidence_end_ms: 104250,
    },
    {
      coarse_unit_id: 75647,
      text: 'ever',
      role: 'hard_review',
      is_primary: false,
      evidence_sentence_index: 19,
      evidence_span_index: 5,
      evidence_start_ms: 52758,
      evidence_end_ms: 54392,
    },
    {
      coarse_unit_id: 166480,
      text: 'wait',
      role: 'hard_review',
      is_primary: false,
      evidence_sentence_index: 0,
      evidence_span_index: 0,
      evidence_start_ms: 16,
      evidence_end_ms: 225,
    },
    {
      coarse_unit_id: 44429,
      text: 'bad',
      role: 'new_now',
      is_primary: false,
      evidence_sentence_index: 17,
      evidence_span_index: 14,
      evidence_start_ms: 50675,
      evidence_end_ms: 50915,
    },
  ],
  3: [
    {
      coarse_unit_id: 115271,
      text: 'need',
      role: 'hard_review',
      is_primary: true,
      evidence_sentence_index: 69,
      evidence_span_index: 1,
      evidence_start_ms: 143942,
      evidence_end_ms: 144263,
    },
    {
      coarse_unit_id: 40985,
      text: 'any',
      role: 'hard_review',
      is_primary: false,
      evidence_sentence_index: 68,
      evidence_span_index: 9,
      evidence_start_ms: 142785,
      evidence_end_ms: 142930,
    },
    {
      coarse_unit_id: 102119,
      text: 'Just',
      role: 'new_now',
      is_primary: false,
      evidence_sentence_index: 29,
      evidence_span_index: 0,
      evidence_start_ms: 81643,
      evidence_end_ms: 84326,
    },
    {
      coarse_unit_id: 65928,
      text: 'dead',
      role: 'soft_review',
      is_primary: false,
      evidence_sentence_index: 10,
      evidence_span_index: 6,
      evidence_start_ms: 22520,
      evidence_end_ms: 22761,
    },
    {
      coarse_unit_id: 169540,
      text: 'work',
      role: 'hard_review',
      is_primary: false,
      evidence_sentence_index: 18,
      evidence_span_index: 2,
      evidence_start_ms: 54762,
      evidence_end_ms: 55115,
    },
  ],
  4: [
    {
      coarse_unit_id: 79053,
      text: 'feel',
      role: 'near_future',
      is_primary: true,
      evidence_sentence_index: 26,
      evidence_span_index: 1,
      evidence_start_ms: 41452,
      evidence_end_ms: 41580,
    },
    {
      coarse_unit_id: 115842,
      text: 'news',
      role: 'new_now',
      is_primary: false,
      evidence_sentence_index: 29,
      evidence_span_index: 5,
      evidence_start_ms: 46816,
      evidence_end_ms: 49851,
    },
    {
      coarse_unit_id: 155491,
      text: 'tell',
      role: 'near_future',
      is_primary: false,
      evidence_sentence_index: 8,
      evidence_span_index: 1,
      evidence_start_ms: 15410,
      evidence_end_ms: 15586,
    },
    {
      coarse_unit_id: 123410,
      text: 'people',
      role: 'near_future',
      is_primary: false,
      evidence_sentence_index: 22,
      evidence_span_index: 7,
      evidence_start_ms: 34847,
      evidence_end_ms: 35249,
    },
    {
      coarse_unit_id: 146255,
      text: 'so',
      role: 'hard_review',
      is_primary: false,
      evidence_sentence_index: 21,
      evidence_span_index: 7,
      evidence_start_ms: 30782,
      evidence_end_ms: 30975,
    },
  ],
  5: [
    {
      coarse_unit_id: 102680,
      text: 'kind of',
      role: 'new_now',
      is_primary: true,
      evidence_sentence_index: 3,
      evidence_span_index: 24,
      evidence_start_ms: 11189,
      evidence_end_ms: 22348,
    },
    {
      coarse_unit_id: 105000,
      text: 'leprosy',
      role: 'soft_review',
      is_primary: false,
      evidence_sentence_index: 42,
      evidence_span_index: 1,
      evidence_start_ms: 145121,
      evidence_end_ms: 145618,
    },
    {
      coarse_unit_id: 35923,
      text: 'a little bit',
      role: 'near_future',
      is_primary: false,
      evidence_sentence_index: 18,
      evidence_span_index: 7,
      evidence_start_ms: 73672,
      evidence_end_ms: 83831,
    },
    {
      coarse_unit_id: 44395,
      text: 'bacteria',
      role: 'near_future',
      is_primary: false,
      evidence_sentence_index: 43,
      evidence_span_index: 1,
      evidence_start_ms: 148986,
      evidence_end_ms: 149708,
    },
    {
      coarse_unit_id: 160022,
      text: 'troops',
      role: 'soft_review',
      is_primary: false,
      evidence_sentence_index: 18,
      evidence_span_index: 4,
      evidence_start_ms: 73672,
      evidence_end_ms: 83831,
    },
  ],
  6: [
    {
      coarse_unit_id: 76864,
      text: 'fact',
      role: 'hard_review',
      is_primary: true,
      evidence_sentence_index: 13,
      evidence_span_index: 1,
      evidence_start_ms: 44410,
      evidence_end_ms: 44908,
    },
    {
      coarse_unit_id: 115808,
      text: 'new',
      role: 'soft_review',
      is_primary: false,
      evidence_sentence_index: 54,
      evidence_span_index: 2,
      evidence_start_ms: 98164,
      evidence_end_ms: 98292,
    },
    {
      coarse_unit_id: 90731,
      text: 'green',
      role: 'soft_review',
      is_primary: false,
      evidence_sentence_index: 23,
      evidence_span_index: 7,
      evidence_start_ms: 57352,
      evidence_end_ms: 57560,
    },
    {
      coarse_unit_id: 105510,
      text: 'light',
      role: 'new_now',
      is_primary: false,
      evidence_sentence_index: 23,
      evidence_span_index: 3,
      evidence_start_ms: 56372,
      evidence_end_ms: 56613,
    },
    {
      coarse_unit_id: 136560,
      text: 'ridiculous',
      role: 'near_future',
      is_primary: false,
      evidence_sentence_index: 5,
      evidence_span_index: 28,
      evidence_start_ms: 19002,
      evidence_end_ms: 30609,
    },
  ],
  7: [
    {
      coarse_unit_id: 118612,
      text: 'one',
      role: 'hard_review',
      is_primary: true,
      evidence_sentence_index: 4,
      evidence_span_index: 1,
      evidence_start_ms: 10083,
      evidence_end_ms: 10196,
    },
    {
      coarse_unit_id: 38862,
      text: 'all',
      role: 'new_now',
      is_primary: false,
      evidence_sentence_index: 5,
      evidence_span_index: 1,
      evidence_start_ms: 10949,
      evidence_end_ms: 11045,
    },
    {
      coarse_unit_id: 129008,
      text: 'pretty',
      role: 'near_future',
      is_primary: false,
      evidence_sentence_index: 19,
      evidence_span_index: 5,
      evidence_start_ms: 35959,
      evidence_end_ms: 37955,
    },
    {
      coarse_unit_id: 164284,
      text: 'uterus',
      role: 'new_now',
      is_primary: false,
      evidence_sentence_index: 40,
      evidence_span_index: 1,
      evidence_start_ms: 108668,
      evidence_end_ms: 110932,
    },
    {
      coarse_unit_id: 88656,
      text: 'got',
      role: 'soft_review',
      is_primary: false,
      evidence_sentence_index: 28,
      evidence_span_index: 1,
      evidence_start_ms: 70148,
      evidence_end_ms: 72940,
    },
  ],
  8: [
    {
      coarse_unit_id: 115271,
      text: 'need',
      role: 'new_now',
      is_primary: true,
      evidence_sentence_index: 13,
      evidence_span_index: 10,
      evidence_start_ms: 24135,
      evidence_end_ms: 24312,
    },
    {
      coarse_unit_id: 38860,
      text: 'all',
      role: 'near_future',
      is_primary: false,
      evidence_sentence_index: 25,
      evidence_span_index: 1,
      evidence_start_ms: 56297,
      evidence_end_ms: 56457,
    },
    {
      coarse_unit_id: 89507,
      text: 'go',
      role: 'hard_review',
      is_primary: false,
      evidence_sentence_index: 34,
      evidence_span_index: 5,
      evidence_start_ms: 119897,
      evidence_end_ms: 120026,
    },
    {
      coarse_unit_id: 157409,
      text: 'time',
      role: 'hard_review',
      is_primary: false,
      evidence_sentence_index: 14,
      evidence_span_index: 1,
      evidence_start_ms: 26432,
      evidence_end_ms: 27074,
    },
    {
      coarse_unit_id: 22037,
      text: 'Monday',
      role: 'near_future',
      is_primary: false,
      evidence_sentence_index: 19,
      evidence_span_index: 3,
      evidence_start_ms: 36933,
      evidence_end_ms: 37350,
    },
  ],
};

const mockClipDurationSecondsByClipNumber: Record<number, number> = {
  1: 76,
  2: 180,
  3: 174,
  4: 163,
  5: 163,
  6: 159,
  7: 160,
  8: 163,
};

const titleLeadPool = [
  'How office small talk softens a direct request',
  'A quick example of awkward humor turning natural',
  'What this reaction clip teaches about spoken rhythm',
  'A subtle way native speakers hedge bad news',
  'How frustration sounds in casual workplace English',
  'A short listening clip about tone and understatement',
  'Why this line lands differently in real conversation',
  'A practical phrase hidden inside a comic exchange',
] as const;

const descriptionLeadPool = [
  'Short scene focused on stress, reaction, and conversational tone.',
  'Useful clip for hearing how short replies change the mood of a room.',
  'Natural workplace dialogue with clear emotional shifts and timing.',
  'Compact example of how people soften, dodge, or redirect a tense moment.',
  'Listening-first sample with strong cues for phrasing and emphasis.',
  'A good study clip for reading tone through pauses and delivery.',
] as const;

const mockBatchSize = mockClipCount;

let nextMockFeedSequenceStart = 0;

function sleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

function hashString(value: string): number {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return Math.abs(hash >>> 0);
}

function buildTitle(asset: SeededClipAsset): string {
  const seed = hashString(asset.videoId);
  const titleLead = titleLeadPool[seed % titleLeadPool.length];
  return `${titleLead} · Clip ${asset.clipNumber}`;
}

function buildDescription(asset: SeededClipAsset): string {
  const seed = hashString(`${asset.videoId}:description`);
  const lead = descriptionLeadPool[seed % descriptionLeadPool.length];
  return `${lead} The scene stays short enough for repeat listening without losing context.`;
}

function buildDurationSeconds(asset: SeededClipAsset): number {
  return mockClipDurationSecondsByClipNumber[asset.clipNumber] ?? 0;
}

function buildViewCount(asset: SeededClipAsset): number {
  const seed = hashString(`${asset.videoId}:views`);
  return 6200 + (seed % 18800);
}

function buildEngagementCount(videoId: string, salt: string): number {
  return 8000 + (hashString(`${videoId}:${salt}`) % 4001);
}

function createVideoId(itemNumber: number) {
  return `00000000-0000-4000-8000-${String(itemNumber).padStart(12, '0')}`;
}

function resolveClipAsset(itemNumber: number): MockClipAsset {
  return resolveMockClipAssetBySequenceNumber(itemNumber);
}

function buildRecommendationRunId(sequenceStart: number) {
  return `00000000-0000-4000-8000-${sequenceStart.toString(16).padStart(12, '0')}`;
}

function cloneMockFeedLearningUnits(clipNumber: number): FeedLearningUnit[] {
  const learningUnits = mockFeedLearningUnitsByClipNumber[clipNumber];

  if (!learningUnits) {
    return [];
  }

  return learningUnits.map((unit) => ({ ...unit }));
}

function createMockFeedItem(itemNumber: number): FeedItem {
  const asset = resolveClipAsset(itemNumber);
  const videoId = createVideoId(itemNumber);
  const seededAsset: SeededClipAsset = {
    ...asset,
    videoId,
  };

  return {
    video_id: videoId,
    title: buildTitle(seededAsset),
    description: buildDescription(seededAsset),
    video_url: asset.videoUrl,
    cover_image_url: asset.coverImageUrl,
    duration_seconds: buildDurationSeconds(seededAsset),
    view_count: buildViewCount(seededAsset),
    like_count: buildEngagementCount(videoId, 'likes'),
    favorite_count: buildEngagementCount(videoId, 'favorites'),
    learning_units: cloneMockFeedLearningUnits(asset.clipNumber),
  };
}

export function createMockFeedResponse(sequenceStart = 0): FeedResponse {
  return {
    recommendation_run_id: buildRecommendationRunId(sequenceStart),
    items: Array.from({ length: mockBatchSize }, (_, index) =>
      createMockFeedItem(sequenceStart + index + 1)
    ),
  };
}

export async function fetchMockFeed({
  delayMs = 0,
}: FetchMockFeedOptions = {}): Promise<FeedResponse> {
  const sequenceStart = nextMockFeedSequenceStart;
  nextMockFeedSequenceStart += mockBatchSize;

  await sleep(delayMs);
  return createMockFeedResponse(sequenceStart);
}

export function resetMockFeedSequence() {
  nextMockFeedSequenceStart = 0;
}
