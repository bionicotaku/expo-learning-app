export type TranscriptSemanticElement = {
  baseForm: string;
  coarseId: number | null;
  dictionary: string;
  reason: string;
};

export type TranscriptToken = {
  end: number;
  explanation: string;
  index: number;
  semanticElement: TranscriptSemanticElement;
  start: number;
  text: string;
};

export type TranscriptSentence = {
  end: number;
  explanation: string;
  index: number;
  start: number;
  text: string;
  tokens: TranscriptToken[];
};

export type Transcript = {
  sentences: TranscriptSentence[];
};
