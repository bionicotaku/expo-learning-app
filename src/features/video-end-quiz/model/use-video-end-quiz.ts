import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { usePresentChoiceQuestionSetDialogAndWait } from '@/features/choice-question';

import { createVideoEndQuizController } from './video-end-quiz';

export function useVideoEndQuiz() {
  const queryClient = useQueryClient();
  const presentChoiceQuestionSetDialogAndWait =
    usePresentChoiceQuestionSetDialogAndWait();

  return useMemo(
    () =>
      createVideoEndQuizController({
        queryClient,
        presentChoiceQuestionSetDialogAndWait,
      }),
    [presentChoiceQuestionSetDialogAndWait, queryClient]
  );
}
