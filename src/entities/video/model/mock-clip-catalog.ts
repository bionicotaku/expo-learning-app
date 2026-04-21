export type MockClipAsset = {
  clipNumber: number;
  coverImageUrl: string;
  transcriptUrl: string;
  videoUrl: string;
};

const clipLabel =
  'The Office (US) (2005) - S01E03 - Health Care (1080p BluRay x265 Silence)';
const encodedClipLabel = encodeURIComponent(clipLabel).replace(/%2F/g, '/');

const mockClipAssets: readonly MockClipAsset[] = Array.from({ length: 8 }, (_, index) => {
  const clipNumber = index + 1;

  return {
    clipNumber,
    coverImageUrl: `https://storage.googleapis.com/videos2077/test-video/cover/${encodedClipLabel}-clip${clipNumber}.webp`,
    transcriptUrl: `https://storage.googleapis.com/videos2077/test-video/transcript/${encodedClipLabel}-clip${clipNumber}.json`,
    videoUrl: `https://storage.googleapis.com/videos2077/test-video/hls/${clipLabel}-clip${clipNumber}_hls/playlist.m3u8`,
  };
});

export const mockClipCount = mockClipAssets.length;

function parseTrailingSequenceNumber(value: string): number | null {
  const trailingDigits = value.match(/(\d+)$/)?.[1];

  if (!trailingDigits) {
    return null;
  }

  const parsedValue = Number.parseInt(trailingDigits, 10);

  if (!Number.isSafeInteger(parsedValue) || parsedValue < 1) {
    return null;
  }

  return parsedValue;
}

export function resolveMockClipAssetBySequenceNumber(sequenceNumber: number): MockClipAsset {
  if (!Number.isSafeInteger(sequenceNumber) || sequenceNumber < 1) {
    throw new Error('sequenceNumber must be a positive integer');
  }

  return mockClipAssets[(sequenceNumber - 1) % mockClipAssets.length]!;
}

export function resolveMockClipAssetByVideoId(videoId: string): MockClipAsset | null {
  const sequenceNumber = parseTrailingSequenceNumber(videoId);

  if (sequenceNumber === null) {
    return null;
  }

  return resolveMockClipAssetBySequenceNumber(sequenceNumber);
}
