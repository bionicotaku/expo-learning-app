import type { TranscriptToken } from '@/entities/transcript';

import type {
  WordDetailDialogAudio,
  WordDetailDialogData,
} from '../ui/word-detail-dialog-content';

export function createWordDetailDialogDataFromTranscriptToken(
  token: TranscriptToken,
  audio?: WordDetailDialogAudio
): WordDetailDialogData {
  return {
    title: token.text,
    subtitle: token.semanticElement.baseForm,
    ...(audio ? { audio } : {}),
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
