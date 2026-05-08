import { ApiError, fetchJsonResource, type FetchJsonResourceOptions } from '@/shared/api';

import type { TranscriptResponseDto } from '../model/dto';
import { mapTranscriptDtoToDomain } from '../model/mappers';
import type { Transcript } from '../model/types';

function isTranscriptResponseDto(value: unknown): value is TranscriptResponseDto {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sentences' in value &&
    Array.isArray((value as TranscriptResponseDto).sentences)
  );
}

function validateTranscriptAssetResponse(
  payload: unknown,
  transcriptUrl: string
): TranscriptResponseDto {
  if (!isTranscriptResponseDto(payload)) {
    throw new ApiError(`Transcript asset payload was missing sentences for ${transcriptUrl}`, {
      code: 'TRANSCRIPT_ASSET_FETCH_FAILED',
      retryable: false,
    });
  }

  return payload;
}

export async function fetchTranscriptAsset(
  transcriptUrl: string,
  options?: FetchJsonResourceOptions
): Promise<Transcript> {
  const payload = await fetchJsonResource<unknown>(transcriptUrl, {
    ...options,
    failureCode: 'TRANSCRIPT_ASSET_FETCH_FAILED',
  });
  const dto = validateTranscriptAssetResponse(payload, transcriptUrl);
  return mapTranscriptDtoToDomain(dto);
}
