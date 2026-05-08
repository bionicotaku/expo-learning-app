import type { TranscriptToken } from '@/entities/transcript';

const leadingPunctuationPattern = /^[,.;:!?)\]}]/;

export function getTranscriptTokenTrailingText(
  _token: TranscriptToken,
  nextToken: TranscriptToken | null
): string {
  if (!nextToken || leadingPunctuationPattern.test(nextToken.text)) {
    return '';
  }

  return ' ';
}
