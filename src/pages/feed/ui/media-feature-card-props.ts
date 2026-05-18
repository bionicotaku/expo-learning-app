import type { VideoListItem } from '@/entities/video';
import type {
  MediaFeatureCardFallbackTone,
  MediaFeatureCardProps,
} from '@/widgets/media-feature-card';

const fallbackTones: readonly MediaFeatureCardFallbackTone[] = [
  'peach',
  'butter',
  'sage',
  'lavender',
  'sky',
  'rose',
] as const;

const learningUnitTagLabelMaxLength = 40;
const defaultTagLabel = 'ENGLISH STUDY';

function resolveStableIndex(videoId: string) {
  const trailingNumber = videoId.match(/(\d+)$/)?.[1];

  if (trailingNumber) {
    return Number.parseInt(trailingNumber, 10) - 1;
  }

  let hash = 0;

  for (let index = 0; index < videoId.length; index += 1) {
    hash = (hash * 31 + videoId.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function formatDuration(durationSeconds: number) {
  const totalSeconds = Math.max(0, Math.floor(durationSeconds));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatViewCount(viewCount: number) {
  if (viewCount < 1000) {
    return String(viewCount);
  }

  return `${(Math.round(viewCount / 100) / 10).toFixed(1)}k`;
}

function resolveFallbackTone(videoId: string): MediaFeatureCardFallbackTone {
  const stableIndex = resolveStableIndex(videoId);
  return fallbackTones[((stableIndex % fallbackTones.length) + fallbackTones.length) % fallbackTones.length];
}

function truncateLongLearningUnitText(text: string) {
  if (text.length <= learningUnitTagLabelMaxLength) {
    return text;
  }

  return `${text.slice(0, learningUnitTagLabelMaxLength - 3)}...`;
}

function resolveLearningUnitTagLabel(item: VideoListItem) {
  const unitTexts = item.learningUnits
    .map((unit) => unit.text.trim())
    .filter((text) => text.length > 0);

  if (unitTexts.length === 0) {
    return defaultTagLabel;
  }

  let label = '';

  for (const text of unitTexts) {
    const nextLabel = label.length === 0 ? text : `${label}, ${text}`;

    if (nextLabel.length <= learningUnitTagLabelMaxLength) {
      label = nextLabel;
      continue;
    }

    if (label.length === 0) {
      return truncateLongLearningUnitText(text);
    }

    return `${label}...`;
  }

  return label;
}

export function createVideoMediaFeatureCardProps(item: VideoListItem): MediaFeatureCardProps {
  return {
    title: item.title,
    statsLabel: `${formatViewCount(item.viewCount)} · ${formatDuration(item.durationSeconds)}`,
    tagLabel: resolveLearningUnitTagLabel(item),
    coverImageUrl: item.coverImageUrl ?? null,
    fallbackTone: resolveFallbackTone(item.videoId),
    accessibilityLabel: `Open video: ${item.title}`,
  };
}
