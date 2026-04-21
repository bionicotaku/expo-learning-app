import type {
  TranscriptResponseDto,
  TranscriptSemanticElementDto,
  TranscriptSentenceDto,
  TranscriptTokenDto,
} from './dto';
import type {
  Transcript,
  TranscriptSemanticElement,
  TranscriptSentence,
  TranscriptToken,
} from './types';

export function mapTranscriptSemanticElementDtoToDomain(
  semanticElement: TranscriptSemanticElementDto
): TranscriptSemanticElement {
  return {
    baseForm: semanticElement.base_form,
    coarseId: semanticElement.coarse_id,
    dictionary: semanticElement.dictionary,
    reason: semanticElement.reason,
  };
}

export function mapTranscriptTokenDtoToDomain(token: TranscriptTokenDto): TranscriptToken {
  return {
    end: token.end,
    explanation: token.explanation,
    index: token.index,
    semanticElement: mapTranscriptSemanticElementDtoToDomain(token.semantic_element),
    start: token.start,
    text: token.text,
  };
}

export function mapTranscriptSentenceDtoToDomain(
  sentence: TranscriptSentenceDto
): TranscriptSentence {
  return {
    end: sentence.end,
    explanation: sentence.explanation,
    index: sentence.index,
    start: sentence.start,
    text: sentence.text,
    tokens: sentence.tokens.map(mapTranscriptTokenDtoToDomain),
  };
}

export function mapTranscriptDtoToDomain(dto: TranscriptResponseDto): Transcript {
  return {
    sentences: dto.sentences.map(mapTranscriptSentenceDtoToDomain),
  };
}
