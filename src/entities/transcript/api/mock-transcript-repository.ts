import { ApiError } from '@/shared/api';
import { resolveMockClipAssetByVideoId } from '@/entities/video/model/mock-clip-catalog';

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

async function parseTranscriptResponse(
  response: Response,
  videoId: string
): Promise<TranscriptResponseDto> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch (error) {
    throw new ApiError(`Transcript payload was not valid JSON for ${videoId}`, {
      cause: error,
      code: 'TRANSCRIPT_FETCH_FAILED',
      retryable: false,
      status: response.status,
    });
  }

  if (!isTranscriptResponseDto(payload)) {
    throw new ApiError(`Transcript payload was missing sentences for ${videoId}`, {
      code: 'TRANSCRIPT_FETCH_FAILED',
      retryable: false,
      status: response.status,
    });
  }

  return payload;
}

export async function fetchMockTranscript(videoId: string): Promise<Transcript> {
  const clipAsset = resolveMockClipAssetByVideoId(videoId);

  if (!clipAsset) {
    throw new ApiError(`Transcript was not found for videoId ${videoId}`, {
      code: 'TRANSCRIPT_NOT_FOUND',
      retryable: false,
      status: 404,
    });
  }

  let response: Response;

  try {
    response = await fetch(clipAsset.transcriptUrl);
  } catch (error) {
    throw new ApiError(`Failed to fetch transcript for ${videoId}`, {
      cause: error,
      code: 'TRANSCRIPT_FETCH_FAILED',
      retryable: true,
    });
  }

  if (!response.ok) {
    throw new ApiError(`Failed to fetch transcript for ${videoId}`, {
      code: 'TRANSCRIPT_FETCH_FAILED',
      retryable: response.status >= 500,
      status: response.status,
    });
  }

  const dto = await parseTranscriptResponse(response, videoId);
  return mapTranscriptDtoToDomain(dto);
}
