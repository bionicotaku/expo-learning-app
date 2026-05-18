import { useCallback } from 'react';

import { useModalController } from '@/shared/lib/modal';

import { ChoiceQuestionSetDialogContent } from '../ui/choice-question-set-dialog-content';
import type { ChoiceQuestionSetDialogData } from './types';

export function usePresentChoiceQuestionSetDialog() {
  const modal = useModalController();

  return useCallback(
    (payload: ChoiceQuestionSetDialogData) => {
      const presentResult = modal.present({
        debugLabel: 'choice-question-set',
        dismissOnBackdropPress: false,
        presentation: 'dialog',
        render: ({ dismiss }) => (
          <ChoiceQuestionSetDialogContent onDismiss={dismiss} payload={payload} />
        ),
      });

      return presentResult.didPresent;
    },
    [modal]
  );
}

export function usePresentChoiceQuestionSetDialogAndWait() {
  const modal = useModalController();

  return useCallback(
    (payload: ChoiceQuestionSetDialogData) =>
      new Promise<boolean>((resolve) => {
        const presentResult = modal.present({
          debugLabel: 'choice-question-set',
          dismissOnBackdropPress: false,
          presentation: 'dialog',
          onDidDismiss: () => {
            resolve(true);
          },
          render: ({ dismiss }) => (
            <ChoiceQuestionSetDialogContent onDismiss={dismiss} payload={payload} />
          ),
        });

        if (!presentResult.didPresent) {
          resolve(false);
        }
      }),
    [modal]
  );
}
