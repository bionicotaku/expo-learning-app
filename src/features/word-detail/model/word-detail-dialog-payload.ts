import type { TranscriptToken } from '@/entities/transcript';

import type { WordDetailDialogPayload } from '../ui/word-detail-dialog-content';

export function createWordDetailDialogPayloadFromTranscriptToken(
  token: TranscriptToken
): WordDetailDialogPayload {
  return {
    text: token.text,
    explanation: token.explanation,
    semantic_element: {
      base_form: token.semanticElement.baseForm,
      coarse_id: token.semanticElement.coarseId,
      dictionary: token.semanticElement.dictionary,
    },
  };
}
