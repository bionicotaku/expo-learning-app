export type TranscriptSemanticElementDto = {
  base_form: string;
  coarse_id: number | null;
  dictionary: string;
  reason: string;
};

export type TranscriptTokenDto = {
  end: number;
  explanation: string;
  index: number;
  semantic_element: TranscriptSemanticElementDto;
  start: number;
  text: string;
};

export type TranscriptSentenceDto = {
  end: number;
  explanation: string;
  index: number;
  start: number;
  text: string;
  tokens: TranscriptTokenDto[];
};

export type TranscriptResponseDto = {
  sentences: TranscriptSentenceDto[];
};
