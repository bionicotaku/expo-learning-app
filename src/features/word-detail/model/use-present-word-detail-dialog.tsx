import { useCallback } from 'react';

import { useModalController } from '@/shared/lib/modal';

import {
  WordDetailDialogContent,
  type WordDetailDialogPayload,
} from '../ui/word-detail-dialog-content';

export function usePresentWordDetailDialog() {
  const modal = useModalController();

  return useCallback(
    (payload: WordDetailDialogPayload) => {
      modal.present({
        debugLabel: 'word-detail',
        presentation: 'dialog',
        render: () => <WordDetailDialogContent payload={payload} />,
      });
    },
    [modal]
  );
}
