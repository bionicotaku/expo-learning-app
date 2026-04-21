import type { FeedItem, FeedResponse } from '../model/types';
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

const tagPool = [
  'PHRASAL VERB',
  'LISTENING CUE',
  'ACCENT NOTE',
  'COMMON PATTERN',
  'CASUAL EXPRESSION',
  'USEFUL LINE',
  'WORKPLACE ENGLISH',
  'NATURAL REACTION',
  'TONE SHIFT',
  'SPEAKING RHYTHM',
] as const;

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
  const seed = hashString(`${asset.videoId}:duration`);
  return 54 + (seed % 132);
}

function buildViewCount(asset: SeededClipAsset): number {
  const seed = hashString(`${asset.videoId}:views`);
  return 6200 + (seed % 18800);
}

function buildTags(asset: SeededClipAsset): string[] {
  const seed = hashString(`${asset.videoId}:tags`);
  const firstTag = tagPool[seed % tagPool.length];
  const secondTag = tagPool[(seed + asset.clipNumber + 3) % tagPool.length];

  if (firstTag === secondTag) {
    return [firstTag];
  }

  return [firstTag, secondTag];
}

function buildUserBoolean(asset: SeededClipAsset, salt: string): boolean {
  const seed = hashString(`${asset.videoId}:${salt}`);
  return seed % 2 === 0;
}

function createVideoId(itemNumber: number) {
  return `the-office-health-care-video-${itemNumber}`;
}

function resolveClipAsset(itemNumber: number): MockClipAsset {
  return resolveMockClipAssetBySequenceNumber(itemNumber);
}

function createMockFeedItem(itemNumber: number): FeedItem {
  const asset = resolveClipAsset(itemNumber);
  const videoId = createVideoId(itemNumber);
  const seededAsset: SeededClipAsset = {
    ...asset,
    videoId,
  };

  return {
    videoId,
    title: buildTitle(seededAsset),
    description: buildDescription(seededAsset),
    videoUrl: asset.videoUrl,
    coverImageUrl: asset.coverImageUrl,
    durationSeconds: buildDurationSeconds(seededAsset),
    viewCount: buildViewCount(seededAsset),
    tags: buildTags(seededAsset),
    isLiked: buildUserBoolean(seededAsset, 'liked'),
    isFavorited: buildUserBoolean(seededAsset, 'favorited'),
  };
}

export function createMockFeedResponse(sequenceStart = 0): FeedResponse {
  return {
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
