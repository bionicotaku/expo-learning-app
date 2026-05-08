export function getVideoMetaQueryKey(videoId: string) {
  return ['video-meta', videoId] as const;
}

export function getTranscriptAssetQueryKey(transcriptUrl: string) {
  return ['transcript-asset', transcriptUrl] as const;
}
