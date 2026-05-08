import { ApiError } from '@/shared/api';

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

async function parseTranscriptAssetResponse(
  response: Response,
  transcriptUrl: string
): Promise<TranscriptResponseDto> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch (error) {
    throw new ApiError(`Transcript asset payload was not valid JSON for ${transcriptUrl}`, {
      cause: error,
      code: 'TRANSCRIPT_ASSET_FETCH_FAILED',
      retryable: false,
      status: response.status,
    });
  }

  if (!isTranscriptResponseDto(payload)) {
    throw new ApiError(`Transcript asset payload was missing sentences for ${transcriptUrl}`, {
      code: 'TRANSCRIPT_ASSET_FETCH_FAILED',
      retryable: false,
      status: response.status,
    });
  }

  return payload;
}

export async function fetchTranscriptAsset(transcriptUrl: string): Promise<Transcript> {
  let response: Response;

  try {
    response = await fetch(transcriptUrl);
  } catch (error) {
    throw new ApiError(`Failed to fetch transcript asset ${transcriptUrl}`, {
      cause: error,
      code: 'TRANSCRIPT_ASSET_FETCH_FAILED',
      retryable: true,
    });
  }

  if (!response.ok) {
    throw new ApiError(`Failed to fetch transcript asset ${transcriptUrl}`, {
      code: 'TRANSCRIPT_ASSET_FETCH_FAILED',
      retryable: response.status >= 500,
      status: response.status,
    });
  }

  const dto = await parseTranscriptAssetResponse(response, transcriptUrl);
  return mapTranscriptDtoToDomain(dto);
}
