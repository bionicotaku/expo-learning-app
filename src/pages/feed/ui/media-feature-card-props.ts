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

export function createVideoMediaFeatureCardProps(item: VideoListItem): MediaFeatureCardProps {
  return {
    title: item.title,
    statsLabel: `${formatViewCount(item.viewCount)} · ${formatDuration(item.durationSeconds)}`,
    tagLabel: item.tags[0] ?? 'ENGLISH STUDY',
    coverImageUrl: item.coverImageUrl ?? null,
    fallbackTone: resolveFallbackTone(item.videoId),
    accessibilityLabel: `Open video: ${item.title}`,
  };
}
