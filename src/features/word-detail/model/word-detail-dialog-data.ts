import type { TranscriptToken } from '@/entities/transcript';

import type { WordDetailDialogData } from '../ui/word-detail-dialog-content';

export function createWordDetailDialogDataFromTranscriptToken(
  token: TranscriptToken
): WordDetailDialogData {
  return {
    title: token.text,
    subtitle: token.semanticElement.baseForm,
    sections: [
      {
        id: 'context',
        title: '上下文释义',
        body: token.explanation,
      },
      {
        id: 'dictionary',
        title: '字典释义',
        body: token.semanticElement.dictionary,
      },
    ],
  };
}
