import { useCallback } from 'react';

import { useModalController } from '@/shared/lib/modal';

import {
  ChoiceQuestionDialogContent,
  type ChoiceQuestionDialogData,
} from '../ui/choice-question-dialog-content';

export function usePresentChoiceQuestionDialog() {
  const modal = useModalController();

  return useCallback(
    (payload: ChoiceQuestionDialogData) => {
      const presentResult = modal.present({
        debugLabel: 'choice-question',
        presentation: 'dialog',
        render: () => <ChoiceQuestionDialogContent payload={payload} />,
      });

      return presentResult.didPresent;
    },
    [modal]
  );
}
