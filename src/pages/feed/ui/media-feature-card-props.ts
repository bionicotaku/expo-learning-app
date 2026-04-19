import type { FeedItem } from '@/entities/feed';
import type { MediaFeatureCardProps, MediaFeatureCardTone } from '@/widgets/media-feature-card';

const cardTags = [
  'PHRASAL VERB',
  'LISTENING CUE',
  'ACCENT NOTE',
  'COMMON PATTERN',
  'CASUAL EXPRESSION',
  'USEFUL LINE',
] as const;

const cardTones: readonly MediaFeatureCardTone[] = [
  'peach',
  'butter',
  'sage',
  'lavender',
  'sky',
  'rose',
] as const;

function buildCardDuration(index: number) {
  const minutes = 1 + (index % 3);
  const seconds = 12 + ((index * 7) % 42);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function buildCardViews(index: number) {
  return `${(7.8 + ((index * 4.9) % 18)).toFixed(1)}k`;
}

function buildCardTag(index: number) {
  return cardTags[index % cardTags.length];
}

function buildCardTone(index: number) {
  return cardTones[index % cardTones.length];
}

export function createFeedMediaFeatureCardProps(item: FeedItem): MediaFeatureCardProps {
  return {
    title: item.title,
    statsLabel: `${buildCardViews(item.indexInFeed)} · ${buildCardDuration(item.indexInFeed)}`,
    tagLabel: buildCardTag(item.indexInFeed),
    tone: buildCardTone(item.indexInFeed),
    accessibilityLabel: `Open video: ${item.title}`,
  };
}
